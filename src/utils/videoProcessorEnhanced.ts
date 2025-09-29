/**
 * 增强版视频处理工具
 * 整合FFmpegOperationManager确保视频处理操作排队执行
 * 使用共享FFmpeg实例避免重复加载
 */

import { executeFFmpegOperation } from './ffmpegOperationManager';
import {
  cutVideoWithFFmpeg as originalCutVideoWithFFmpeg,
  mergeVideosWithFFmpeg as originalMergeVideosWithFFmpeg,
  createPlayableVideoUrl,
  revokeVideoUrl
} from './videoProcessor';
import { getSharedFFmpegInstance } from './ffmpegSharedInstance';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

// 定义增强版剪切选项接口
export interface EnhancedVideoCutOptions {
  startTime: number;
  endTime: number;
  keepOriginalCodec?: boolean;
  enableReEncode?: boolean;
  outputFormat?: string;
  videoQuality?: number;
}

/**
 * 增强版FFmpeg视频剪切 - 使用共享FFmpeg实例
 * @param file 视频文件
 * @param options 剪切选项
 * @returns 剪切后的视频Blob URL
 */
export async function cutVideoWithFFmpeg(
  file: File,
  options: EnhancedVideoCutOptions
): Promise<string> {
  // 通过操作管理器执行剪切，确保等待FFmpeg加载完成
  return executeFFmpegOperation(async () => {
    console.log('🎬 开始执行视频剪切 (使用共享FFmpeg实例)');

    // 获取共享FFmpeg实例
    const ffmpeg = await getSharedFFmpegInstance();

    // 执行剪切操作
    return directCutVideoWithFFmpeg(
      ffmpeg,
      file,
      options.startTime,
      options.endTime,
      {
        keepOriginalCodec: options.keepOriginalCodec,
        enableReEncode: options.enableReEncode,
        outputFormat: options.outputFormat,
        videoQuality: options.videoQuality
      }
    );
  });
}

/**
 * 直接使用FFmpeg实例进行视频剪切
 * 避免重复加载FFmpeg
 */
async function directCutVideoWithFFmpeg(
  ffmpeg: FFmpeg,
  file: File,
  startTime: number,
  endTime: number,
  options: {
    keepOriginalCodec?: boolean;
    enableReEncode?: boolean;
    outputFormat?: string;
    videoQuality?: number;
  } = {}
): Promise<string> {
  console.log('✂️ 直接使用共享FFmpeg实例执行剪切');

  try {
    // 将文件写入FFmpeg文件系统
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const fileName = `input.${fileExtension}`;
    const outputFormat = options.outputFormat || fileExtension;
    const outputName = `output.${outputFormat}`;

    await ffmpeg.writeFile(fileName, await fetchFile(file));

    // 构建FFmpeg命令
    const duration = endTime - startTime;
    let ffmpegArgs: string[] = [];

    if (options.keepOriginalCodec || !options.enableReEncode) {
      // 快速剪切模式 - 保持原始编码
      ffmpegArgs = [
        '-ss', `${startTime}`,
        '-t', `${duration}`,
        '-i', fileName,
        '-c', 'copy',               // 复制编码，不重新编码
        '-avoid_negative_ts', 'make_zero',
        outputName
      ];
    } else {
      // 精确剪切模式 - 重新编码
      const videoQuality = options.videoQuality || 23;
      ffmpegArgs = [
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
    }

    // 执行视频剪切
    await ffmpeg.exec(ffmpegArgs);

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    console.log('✅ 视频剪切完成，大小:', blob.size, 'bytes');
    return url;
  } catch (error) {
    console.error('❌ 视频剪切失败:', error);
    throw new Error(`视频剪切失败: ${error}`);
  }
}

/**
 * 增强版FFmpeg视频合并 - 使用共享FFmpeg实例
 * @param files 视频文件数组
 * @param options 合并选项
 * @returns 合并后的视频Blob URL
 */
export async function mergeVideosWithFFmpeg(
  files: File[],
  options: {
    outputFormat?: string;          // 输出格式
    videoCodec?: string;           // 视频编码器
    audioCodec?: string;           // 音频编码器
    videoQuality?: number;         // 视频质量
    audioQuality?: string;         // 音频质量
    enableCrossfade?: boolean;     // 是否启用交叉淡入淡出
    fadeLength?: number;           // 淡入淡出长度(秒)
    resolution?: string;           // 输出分辨率 如 "1920x1080"
  } = {}
): Promise<string> {
  // 通过操作管理器执行合并，确保等待FFmpeg加载完成
  return executeFFmpegOperation(async () => {
    console.log('🎬 开始执行视频合并 (使用共享FFmpeg实例)');

    // 获取共享FFmpeg实例
    const ffmpeg = await getSharedFFmpegInstance();

    // 执行合并操作
    return directMergeVideosWithFFmpeg(ffmpeg, files, options);
  });
}

/**
 * 直接使用FFmpeg实例进行视频合并
 * 避免重复加载FFmpeg
 */
async function directMergeVideosWithFFmpeg(
  ffmpeg: FFmpeg,
  files: File[],
  options: {
    outputFormat?: string;
    videoCodec?: string;
    audioCodec?: string;
    videoQuality?: number;
    audioQuality?: string;
    enableCrossfade?: boolean;
    fadeLength?: number;
    resolution?: string;
  } = {}
): Promise<string> {
  if (files.length === 0) {
    throw new Error('没有提供视频文件');
  }

  if (files.length === 1) {
    // 单个文件直接返回其Blob URL
    return createPlayableVideoUrl(files[0]);
  }

  try {
    console.log('🔄 直接使用共享FFmpeg实例执行合并');

    // 设置默认参数
    const outputFormat = options.outputFormat || 'mp4';
    const videoCodec = options.videoCodec || 'libx264';
    const audioCodec = options.audioCodec || 'aac';
    const videoQuality = options.videoQuality || 23;
    const audioQuality = options.audioQuality || '128k';

    // 写入所有输入文件
    const inputFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop() || 'mp4';
      const fileName = `input${i}.${extension}`;
      inputFiles.push(fileName);

      await ffmpeg.writeFile(fileName, await fetchFile(file));
    }

    // 创建concat文件列表
    const concatContent = inputFiles.map(file => `file '${file}'`).join('\n');
    await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

    const outputName = `output.${outputFormat}`;
    let ffmpegArgs: string[] = [];

    if (options.enableCrossfade && files.length > 1) {
      // 使用复杂滤波器实现交叉淡入淡出效果
      const fadeLength = options.fadeLength || 1; // 默认1秒淡入淡出

      // 构建复杂的滤波器链
      let filterComplex = '';
      let inputs: string[] = [];

      for (let i = 0; i < files.length; i++) {
        inputs.push('-i', inputFiles[i]);

        if (i === 0) {
          filterComplex += `[0:v]scale=${options.resolution || '-1:-1'}[v0];`;
        } else if (i === files.length - 1) {
          filterComplex += `[${i}:v]scale=${options.resolution || '-1:-1'}[v${i}];`;
          filterComplex += `[v${i - 1}][v${i}]xfade=transition=fade:duration=${fadeLength}:offset=${i * 5 - fadeLength}[v${i}fade];`;
        } else {
          filterComplex += `[${i}:v]scale=${options.resolution || '-1:-1'}[v${i}];`;
          if (i === 1) {
            filterComplex += `[v0][v${i}]xfade=transition=fade:duration=${fadeLength}:offset=${5 - fadeLength}[v${i}fade];`;
          } else {
            filterComplex += `[v${i - 1}fade][v${i}]xfade=transition=fade:duration=${fadeLength}:offset=${i * 5 - fadeLength}[v${i}fade];`;
          }
        }
      }

      ffmpegArgs = [
        ...inputs,
        '-filter_complex', filterComplex,
        '-map', `[v${files.length - 1}fade]`,
        '-c:v', videoCodec,
        '-crf', `${videoQuality}`,
        '-c:a', audioCodec,
        '-b:a', audioQuality,
        '-movflags', '+faststart',
        outputName
      ];
    } else {
      // 简单的顺序合并
      ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c:v', videoCodec,
        '-crf', `${videoQuality}`,
        '-c:a', audioCodec,
        '-b:a', audioQuality,
        '-movflags', '+faststart'
      ];

      // 如果指定了分辨率，添加缩放滤波器
      if (options.resolution) {
        ffmpegArgs.push('-vf', `scale=${options.resolution}`);
      }

      ffmpegArgs.push(outputName);
    }

    // 执行合并命令
    await ffmpeg.exec(ffmpegArgs);

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    console.log('✅ 视频合并完成，大小:', blob.size, 'bytes');
    return url;
  } catch (error) {
    console.error('❌ 视频合并失败:', error);
    throw new Error(`视频合并失败: ${error}`);
  }
}

// 重导出其他需要的函数
export { createPlayableVideoUrl, revokeVideoUrl };