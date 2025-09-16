/**
 * 懒加载FFmpeg处理器 - 避免初始化时立即加载
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import arrayBufferToBase64 from './arrayBufferToBase64';

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';
const baseURL = '/ffmpeg';

// FFmpeg实例状态
let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * 懒加载FFmpeg实例
 */
async function lazyLoadFFmpeg(): Promise<FFmpeg> {
  if (!isBrowser) {
    throw new Error('FFmpeg 只能在浏览器环境中运行');
  }

  // 如果已有实例且已加载，直接返回
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  // 如果正在加载，返回加载Promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // 开始加载
  isLoading = true;
  loadPromise = performFFmpegLoad();

  try {
    const instance = await loadPromise;
    return instance;
  } finally {
    isLoading = false;
    loadPromise = null;
  }
}

/**
 * 执行FFmpeg加载
 */
async function performFFmpegLoad(): Promise<FFmpeg> {
  console.log('[LazyFFmpeg] 开始加载FFmpeg...');

  const ffmpeg = new FFmpeg();

  // 设置最小化日志
  ffmpeg.on('log', ({ type, message }) => {
    if (type === 'fferr') {
      console.warn('[FFmpeg]', message);
    }
  });

  // 创建超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 20000); // 20秒超时

  try {
    // 并行加载所有资源
    const [coreURL, wasmURL, workerURL] = await Promise.all([
      toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    ]);

    console.log('[LazyFFmpeg] 资源URL生成完成，开始加载核心...');

    // 加载FFmpeg核心
    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    });

    clearTimeout(timeoutId);
    console.log('[LazyFFmpeg] FFmpeg加载成功');

    ffmpegInstance = ffmpeg;
    return ffmpeg;

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[LazyFFmpeg] 加载失败:', error);

    if (controller.signal.aborted) {
      throw new Error('FFmpeg加载超时，请检查网络连接或刷新页面重试');
    }

    throw new Error(`FFmpeg加载失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 视频剪切 - 懒加载版本
 */
export async function cutVideoWithFFmpeg(
  file: File,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    console.log('[LazyFFmpeg] 开始视频剪切...');
    onProgress?.(10); // 开始进度

    const ffmpeg = await lazyLoadFFmpeg();
    onProgress?.(30); // FFmpeg加载完成

    const inputName = `input_${Date.now()}.${file.name.split('.').pop() || 'mp4'}`;
    const outputName = `output_${Date.now()}.${file.name.split('.').pop() || 'mp4'}`;

    console.log('[LazyFFmpeg] 写入文件到FFmpeg文件系统...');
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    onProgress?.(50); // 文件写入完成

    console.log('[LazyFFmpeg] 执行剪切命令...');
    await ffmpeg.exec([
      '-ss', `${startTime}`,
      '-t', `${endTime - startTime}`,
      '-i', inputName,
      '-c', 'copy', // 使用copy避免重编码
      '-avoid_negative_ts', 'make_zero',
      '-y',
      outputName
    ]);
    onProgress?.(80); // 剪切完成

    console.log('[LazyFFmpeg] 读取输出文件...');
    const data = await ffmpeg.readFile(outputName) as Uint8Array;

    // 清理文件
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    onProgress?.(100); // 完成

    const blob = new Blob([data.buffer], { type: file.type });
    console.log('[LazyFFmpeg] 剪切完成，输出大小:', blob.size, 'bytes');

    return blob;

  } catch (error) {
    console.error('[LazyFFmpeg] 剪切失败:', error);
    throw error;
  }
}

/**
 * 多视频拼接 - 懒加载版本（使用 concat demuxer）
 */
export async function concatVideosWithFFmpeg(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  if (!files || files.length === 0) {
    throw new Error('请提供至少一个视频文件');
  }

  if (files.length === 1) {
    return files[0];
  }

  try {
    onProgress?.(10);
    const ffmpeg = await lazyLoadFFmpeg();
    onProgress?.(20);

    const inputNames: string[] = [];
    // 写入所有输入文件
    for (let i = 0; i < files.length; i++) {
      const ext = files[i].name.split('.').pop() || 'mp4';
      const inputName = `input_${i}.${ext}`;
      inputNames.push(inputName);
      await ffmpeg.writeFile(inputName, await fetchFile(files[i]));
    }
    onProgress?.(50);

    // 生成 concat 列表文件
    const concatList = inputNames.map(name => `file '${name}'`).join('\n');
    await ffmpeg.writeFile('concat_list.txt', new TextEncoder().encode(concatList));

    const outputName = `concat_${Date.now()}.${files[0].name.split('.').pop() || 'mp4'}`;

    // 执行拼接（不重编码，要求所有输入编解码参数一致）
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat_list.txt',
      '-c', 'copy',
      '-y',
      outputName
    ]);
    onProgress?.(80);

    const data = await ffmpeg.readFile(outputName) as Uint8Array;

    // 清理文件
    for (const name of inputNames) {
      await ffmpeg.deleteFile(name);
    }
    await ffmpeg.deleteFile('concat_list.txt');
    await ffmpeg.deleteFile(outputName);

    onProgress?.(100);
    return new Blob([data.buffer], { type: files[0].type || 'video/mp4' });
  } catch (error) {
    console.error('[LazyFFmpeg] 视频拼接失败:', error);
    throw error;
  }
}

/**
 * 视频帧提取 - 懒加载版本
 */
export async function getVideoFrames(
  file: File,
  duration: number,
  maxFrames: number = 10, // 减少默认帧数
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const frames: string[] = [];

  try {
    console.log('[LazyFFmpeg] 开始提取视频帧...');
    onProgress?.(10);

    const ffmpeg = await lazyLoadFFmpeg();
    onProgress?.(30);

    const inputName = `frames_${Date.now()}.${file.name.split('.').pop() || 'mp4'}`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));
    onProgress?.(50);

    // 简化帧提取 - 减少计算复杂度
    const step = Math.max(1, Math.floor(duration / maxFrames));
    const actualFrames = Math.min(maxFrames, Math.floor(duration / step));

    console.log('[LazyFFmpeg] 帧提取参数:', { step, actualFrames, duration });

    await ffmpeg.exec([
      '-i', inputName,
      '-vf', `fps=1/${step}`, // 使用更简单的帧率控制
      '-frames:v', `${actualFrames}`,
      '-s', '88x50',
      'frame_%02d.png'
    ]);
    onProgress?.(80);

    // 读取帧
    for (let i = 1; i <= actualFrames; i++) {
      try {
        const frameFile = `frame_${i.toString().padStart(2, '0')}.png`;
        const data = await ffmpeg.readFile(frameFile) as Uint8Array;
        frames.push(arrayBufferToBase64(data.buffer));
        await ffmpeg.deleteFile(frameFile);
      } catch (frameError) {
        console.warn(`[LazyFFmpeg] 读取帧 ${i} 失败:`, frameError);
        break;
      }
    }

    await ffmpeg.deleteFile(inputName);
    onProgress?.(100);

    console.log(`[LazyFFmpeg] 成功提取 ${frames.length} 帧`);
    return frames;

  } catch (error) {
    console.error('[LazyFFmpeg] 提取帧失败:', error);
    throw error;
  }
}

/**
 * 检查FFmpeg可用性 - 不立即加载
 */
export function checkFFmpegSupport(): boolean {
  return isBrowser && 'WebAssembly' in window;
}

/**
 * 预加载FFmpeg - 可选的预热功能
 */
export async function preloadFFmpeg(): Promise<boolean> {
  try {
    await lazyLoadFFmpeg();
    return true;
  } catch (error) {
    console.error('[LazyFFmpeg] 预加载失败:', error);
    return false;
  }
}

/**
 * 重置FFmpeg实例
 */
export function resetFFmpeg(): void {
  ffmpegInstance = null;
  isLoading = false;
  loadPromise = null;
  console.log('[LazyFFmpeg] FFmpeg实例已重置');
}

/**
 * 时间转换工具
 */
export function timeToSec(time: string): number {
  const parts = time.split(':');
  const hour = Number(parts[0]);
  const min = Number(parts[1]);
  const sec = Number(parts[2]);
  return hour * 3600 + min * 60 + sec;
}



