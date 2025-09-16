/**
 * 现代化FFmpeg视频处理工具
 * 基于文档重新实现，不引用线上资源，使用pnpm
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import arrayBufferToBase64 from './arrayBufferToBase64';

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';
// 使用本地的FFmpeg核心文件
const baseURL = '/ffmpeg';

// 全局FFmpeg实例
let globalFFmpeg: FFmpeg | null = null;

/**
 * 获取或创建FFmpeg实例 - 添加超时保护
 */
async function getFFmpegInstance(): Promise<FFmpeg> {
  if (!isBrowser) {
    throw new Error('FFmpeg 只能在浏览器环境中运行');
  }

  // 如果已有实例且已加载，直接返回
  if (globalFFmpeg && globalFFmpeg.loaded) {
    console.log('[FFmpeg] 使用已有实例');
    return globalFFmpeg;
  }

  // 创建新实例
  const ffmpeg = new FFmpeg();

  console.log('[FFmpeg] 开始初始化FFmpeg...');

  // 如果未加载，则加载 FFmpeg - 添加超时保护
  if (!ffmpeg.loaded) {
    try {
      // 创建超时保护
      const loadWithTimeout = Promise.race([
        ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('FFmpeg加载超时（30秒），可能是网络问题或文件损坏'));
          }, 30000);
        })
      ]);

      await loadWithTimeout;
      console.log('[FFmpeg] 加载成功');
      globalFFmpeg = ffmpeg;
    } catch (loadError) {
      console.error('[FFmpeg] 加载失败:', loadError);
      // 清理失败的实例
      globalFFmpeg = null;
      throw new Error(`FFmpeg 加载失败: ${loadError instanceof Error ? loadError.message : String(loadError)}`);
    }
  }

  return ffmpeg;
}

/**
 * 上传视频文件到FFmpeg文件系统
 * @param file 视频文件
 * @returns 文件信息
 */
export async function uploadVideoToFFmpeg(file: File): Promise<{ name: string, videoUrl: string }> {
  const ffmpeg = await getFFmpegInstance();

  // 获取文件数据
  const orgFileBuffer = await file.arrayBuffer();

  // 将视频数据写入FFmpeg内存
  await ffmpeg.writeFile(file.name, await fetchFile(new Blob([orgFileBuffer])));

  // 将视频数据转为URL
  const videoUrl = URL.createObjectURL(new Blob([orgFileBuffer]));

  return { name: file.name, videoUrl };
}

/**
 * 获取视频帧 - 基于文档方法
 * @param file 视频文件
 * @param duration 视频时长
 * @param maxFrames 最大帧数
 * @returns Promise<string[]> Base64图片数组
 */
export async function getVideoFrames(
  file: File,
  duration: number,
  maxFrames: number = 20
): Promise<string[]> {
  const frames: string[] = [];

  try {
    const ffmpeg = await getFFmpegInstance();
    const { name } = file;

    // 将文件写入FFmpeg文件系统
    await ffmpeg.writeFile(name, await fetchFile(file));

    // 计算每秒需要抽的帧数
    const step = Math.ceil(maxFrames / duration);
    const allNum = Math.floor(step * duration);

    console.log('[FFmpeg] 帧提取参数:', { step, allNum, duration });

    // 执行FFmpeg命令提取帧
    await ffmpeg.exec([
      '-i', name,
      '-r', `${step}`,
      '-ss', '0',
      '-vframes', `${allNum}`,
      '-f', 'image2',
      '-s', '88*50',
      'image-%02d.png'
    ]);

    // 读取生成的帧
    for (let i = 0; i < allNum; i++) {
      try {
        let temp = i + 1;
        const frameFile = `image-${temp.toString().padStart(2, '0')}.png`;
        const data = await ffmpeg.readFile(frameFile) as Uint8Array;
        frames.push(arrayBufferToBase64(data.buffer));

        // 清理帧文件
        await ffmpeg.deleteFile(frameFile);
      } catch (frameError) {
        console.warn(`[FFmpeg] 读取帧 ${i + 1} 失败:`, frameError);
        break;
      }
    }

    // 清理输入文件
    await ffmpeg.deleteFile(name);

    console.log(`[FFmpeg] 成功提取 ${frames.length} 帧`);
    return frames;

  } catch (error) {
    console.error('[FFmpeg] 提取帧失败:', error);
    throw error;
  }
}

/**
 * 视频剪切 - 基于文档方法
 * @param file 视频文件
 * @param startTime 开始时间(秒)
 * @param endTime 结束时间(秒)
 * @returns Promise<Blob> 剪切后的视频Blob
 */
export async function cutVideoWithFFmpeg(
  file: File,
  startTime: number,
  endTime: number
): Promise<Blob> {
  try {
    const ffmpeg = await getFFmpegInstance();
    const inputName = file.name;
    const outputName = `cut_${Date.now()}.${file.name.split('.').pop() || 'mp4'}`;

    console.log('[FFmpeg] 开始剪切视频:', { inputName, startTime, endTime, duration: endTime - startTime });

    // 将文件写入FFmpeg文件系统
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // 执行剪切命令 - 使用文档推荐的参数
    await ffmpeg.exec([
      '-ss', `${startTime}`,              // 开始时间
      '-t', `${endTime - startTime}`,     // 持续时间
      '-i', inputName,                    // 输入文件
      '-vcodec', 'copy',                  // 视频编码器(copy表示不重新编码，速度快)
      '-acodec', 'copy',                  // 音频编码器(copy表示不重新编码)
      '-avoid_negative_ts', 'make_zero',  // 避免负时间戳
      outputName                          // 输出文件
    ]);

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName) as Uint8Array;
    const blob = new Blob([data.buffer], { type: file.type });

    // 清理文件
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    console.log('[FFmpeg] 剪切完成，输出大小:', blob.size, 'bytes');
    return blob;

  } catch (error) {
    console.error('[FFmpeg] 剪切失败:', error);
    throw new Error(`视频剪切失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 时间字符串转秒数
 * @param time 时间字符串 HH:mm:ss.SSS
 * @returns 秒数
 */
export function timeToSec(time: string): number {
  const parts = time.split(':');
  const hour = Number(parts[0]);
  const min = Number(parts[1]);
  const sec = Number(parts[2]);

  return hour * 3600 + min * 60 + sec;
}

/**
 * 检查FFmpeg是否可用
 */
export async function checkFFmpegAvailability(): Promise<boolean> {
  try {
    const ffmpeg = await getFFmpegInstance();
    return ffmpeg.loaded;
  } catch (error) {
    console.error('[FFmpeg] 检查可用性失败:', error);
    return false;
  }
}
