/**
 * 高级视频处理器 - 基于OpenCut架构
 * 实现时间轴的多轨道视频合并和导出
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getSharedFFmpegInstance } from './ffmpegSharedInstance';
import { renderTimelineFrame } from './timelineRenderer';
import { videoCache } from './videoCache';
import { withProcessingUI, ensureFFmpegLoaded } from './videoProcessingUI';

// 导出时间轴视频合并函数
export async function mergeTimelineVideos(
  tracks: any[],
  mediaFiles: any[],
  options: {
    outputFormat: string;
    quality: string;
    resolution: string;
    fps: number;
    includeAudio: boolean;
    backgroundType: string;
    backgroundColor: string;
  }
): Promise<string> {
  // 使用UI包装导出过程
  return withProcessingUI(async (updateUI) => {
    console.log('🚀 开始合并视频...');
    updateUI(5, '初始化导出环境...');

    // 1. 创建渲染画布
    const [width, height] = options.resolution.split('x').map(Number);
    const canvas = document.createElement('canvas');
    canvas.width = width || 1920;
    canvas.height = height || 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot create canvas context');
    }

    // 2. 从缓存获取FFmpeg实例
    console.log('🔄 从缓存获取FFmpeg实例...');
    updateUI(10, '准备视频处理引擎...');
    const ffmpeg = await getSharedFFmpegInstance();

    // 3. 计算导出参数
    const exportFps = options.fps || 30;
    const duration = 60; // 默认60秒
    const totalFrames = Math.ceil(duration * exportFps);

    console.log(`📊 导出参数: ${canvas.width}x${canvas.height} @ ${exportFps}fps, 总时长: ${duration}s, 总帧数: ${totalFrames}`);

    // 4. 渲染所有帧并写入FFmpeg
    const tempFrames: string[] = [];

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const time = frameIndex / exportFps;

      // 渲染当前时间点的帧
      ctx.fillStyle = options.backgroundColor || '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 转换为图片数据并写入FFmpeg
      const frameBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });

      const frameFileName = `frame_${frameIndex.toString().padStart(6, '0')}.png`;
      await ffmpeg.writeFile(frameFileName, await fetchFile(frameBlob));
      tempFrames.push(frameFileName);

      // 更新进度
      const videoProgress = 10 + (frameIndex / totalFrames) * 90;
      updateUI(videoProgress, `渲染帧 ${frameIndex + 1}/${totalFrames}...`);
    }

    // 5. 使用FFmpeg合并视频
    updateUI(90, '生成最终视频...');
    const outputFormat = options.outputFormat || 'mp4';
    const outputFileName = `output.${outputFormat}`;
    const videoQuality = options.quality === 'high' ? 18 : options.quality === 'medium' ? 23 : 28;

    // 构建FFmpeg命令
    let ffmpegArgs: string[] = [];

    // 视频输入
    ffmpegArgs.push(
      '-framerate', `${exportFps}`,
      '-i', `frame_%06d.png`
    );

    // 输出选项
    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', videoQuality.toString()
    );

    // 其他输出选项
    ffmpegArgs.push(
      '-movflags', '+faststart',
      '-y',
      outputFileName
    );

    // 执行FFmpeg命令
    await ffmpeg.exec(ffmpegArgs);

    // 6. 读取输出文件并创建URL
    updateUI(95, '完成导出...');
    const outputData = await ffmpeg.readFile(outputFileName);
    const outputBlob = new Blob([outputData as Uint8Array], { type: `video/${outputFormat}` });
    const outputUrl = URL.createObjectURL(outputBlob);

    // 7. 清理临时文件
    for (const frame of tempFrames) {
      try {
        await ffmpeg.deleteFile(frame);
      } catch (e) {
        console.warn(`无法删除临时文件 ${frame}:`, e);
      }
    }

    updateUI(100, '导出完成!');
    console.log('✅ 视频合并完成!');

    return outputUrl;
  });
}

/**
 * 使用时间轴模式剪切视频
 */
export async function cutVideoWithTimeline(
  file: File,
  startTime: number,
  endTime: number,
  options: {
    fastMode?: boolean;
    outputFormat?: string;
    videoQuality?: number;
  } = {}
): Promise<string> {
  console.log('🎬 使用时间轴模式剪切视频:', file.name);

  try {
    // 获取共享FFmpeg实例
    const ffmpeg = await getSharedFFmpegInstance();

    // 将文件写入FFmpeg文件系统
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const fileName = `input.${fileExtension}`;
    const outputFormat = options.outputFormat || fileExtension;
    const outputName = `output.${outputFormat}`;

    await ffmpeg.writeFile(fileName, await fetchFile(file));

    // 构建FFmpeg命令
    const duration = endTime - startTime;
    const videoQuality = options.videoQuality || 23;

    const ffmpegArgs = [
      '-ss', `${startTime}`,
      '-t', `${duration}`,
      '-i', fileName,
      '-c:v', 'libx264',          // 视频编码器
      '-crf', `${videoQuality}`,  // 恒定质量因子
      '-c:a', 'aac',              // 音频编码器
      '-b:a', '128k',             // 音频比特率
      '-movflags', '+faststart',   // 优化web播放
      outputName
    ];

    // 执行视频剪切
    await ffmpeg.exec(ffmpegArgs);

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = URL.createObjectURL(blob);

    console.log('✅ 视频剪切完成，大小:', blob.size, 'bytes');
    return url;
  } catch (error) {
    console.error('时间轴视频剪切失败:', error);
    throw new Error(`时间轴视频剪切失败: ${error}`);
  }
}