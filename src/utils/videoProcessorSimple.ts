/**
 * 精简版视频处理工具
 * 只包含视频剪切和合并功能
 * 使用本地FFmpeg文件，基于掘金文章方法实现
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFFmpegInstance } from './ffmpegConfig';

/**
 * 创建一个可播放的视频Blob URL
 * @param blob 视频Blob对象 
 * @returns 可播放的URL
 */
export function createPlayableVideoUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * 释放视频URL占用的内存
 * @param url 视频URL
 */
export function revokeVideoUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * 显示处理进度
 */
function showProgress(message: string): HTMLDivElement {
  const progressDiv = document.createElement('div');
  progressDiv.style.position = 'fixed';
  progressDiv.style.bottom = '20px';
  progressDiv.style.right = '20px';
  progressDiv.style.padding = '10px 15px';
  progressDiv.style.background = 'rgba(0, 0, 0, 0.8)';
  progressDiv.style.color = 'white';
  progressDiv.style.borderRadius = '8px';
  progressDiv.style.zIndex = '10000';
  progressDiv.style.fontFamily = 'Arial, sans-serif';
  progressDiv.style.fontSize = '14px';
  progressDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
  progressDiv.textContent = message;
  document.body.appendChild(progressDiv);
  return progressDiv;
}

/**
 * 隐藏处理进度
 */
function hideProgress(progressDiv: HTMLDivElement) {
  if (progressDiv.parentElement) {
    progressDiv.parentElement.removeChild(progressDiv);
  }
}

/**
 * 更新进度显示
 */
function updateProgress(progressDiv: HTMLDivElement, message: string) {
  progressDiv.textContent = message;
}

/**
 * 视频剪切 - 使用FFmpeg实现高质量剪切
 * @param file 视频文件
 * @param startTime 开始时间(秒)
 * @param endTime 结束时间(秒)
 * @param options 剪切选项
 * @returns Promise包裹的剪切后的视频Blob URL
 */
export async function cutVideo(
  file: File,
  startTime: number,
  endTime: number,
  options: {
    fastMode?: boolean;        // 快速模式（保持原始编码）
    outputFormat?: string;     // 输出格式
    videoQuality?: number;     // 视频质量(0-51，数值越小质量越高)
  } = {}
): Promise<string> {
  const progressDiv = showProgress('初始化FFmpeg...');

  try {
    // 获取FFmpeg实例
    updateProgress(progressDiv, '加载FFmpeg核心...');
    const ffmpeg = await getFFmpegInstance();

    updateProgress(progressDiv, '处理视频文件...');

    // 设置参数
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const outputFormat = options.outputFormat || fileExtension;
    const fastMode = options.fastMode !== false; // 默认使用快速模式
    const videoQuality = options.videoQuality || 23;

    // 文件名
    const fileName = `input.${fileExtension}`;
    const outputName = `output.${outputFormat}`;

    await ffmpeg.writeFile(fileName, await fetchFile(file));

    const duration = endTime - startTime;
    updateProgress(progressDiv, `剪切视频 (${startTime}s - ${endTime}s)...`);

    // 构建FFmpeg命令
    let ffmpegArgs: string[] = [];

    if (fastMode) {
      // 快速模式 - 保持原始编码
      ffmpegArgs = [
        '-ss', `${startTime}`,
        '-t', `${duration}`,
        '-i', fileName,
        '-c', 'copy',               // 复制编码，不重新编码
        '-avoid_negative_ts', 'make_zero',
        outputName
      ];
    } else {
      // 高质量模式 - 重新编码
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

    await ffmpeg.exec(ffmpegArgs);

    updateProgress(progressDiv, '生成结果文件...');

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    hideProgress(progressDiv);
    console.log('视频剪切完成，大小:', blob.size, 'bytes');

    return url;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('视频剪切失败:', error);
    throw new Error(`视频剪切失败: ${error}`);
  }
}

/**
 * 视频合并 - 使用FFmpeg合并多个视频文件
 * @param files 视频文件数组
 * @param options 合并选项
 * @returns Promise包裹的合并后的视频Blob URL
 */
export async function mergeVideos(
  files: File[],
  options: {
    outputFormat?: string;          // 输出格式
    videoQuality?: number;          // 视频质量
    resolution?: string;            // 输出分辨率 如 "1920x1080"
    enableCrossfade?: boolean;      // 是否启用交叉淡入淡出
    fadeLength?: number;            // 淡入淡出长度(秒)
  } = {}
): Promise<string> {
  if (files.length === 0) {
    throw new Error('没有提供视频文件');
  }

  if (files.length === 1) {
    // 单个文件直接返回其Blob URL
    return createPlayableVideoUrl(files[0]);
  }

  const progressDiv = showProgress('初始化FFmpeg...');

  try {
    updateProgress(progressDiv, '加载FFmpeg核心...');
    const ffmpeg = await getFFmpegInstance();

    updateProgress(progressDiv, '准备视频文件...');

    // 设置默认参数
    const outputFormat = options.outputFormat || 'mp4';
    const videoQuality = options.videoQuality || 23;

    // 写入所有输入文件
    const inputFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop() || 'mp4';
      const fileName = `input${i}.${extension}`;
      inputFiles.push(fileName);

      updateProgress(progressDiv, `写入文件 ${i + 1}/${files.length}...`);
      await ffmpeg.writeFile(fileName, await fetchFile(file));
    }

    updateProgress(progressDiv, '执行视频合并...');

    const outputName = `output.${outputFormat}`;
    let ffmpegArgs: string[] = [];

    if (options.enableCrossfade && files.length > 1) {
      // 使用复杂滤波器实现交叉淡入淡出效果
      const fadeLength = options.fadeLength || 1; // 默认1秒淡入淡出

      // 构建输入参数
      let inputs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        inputs.push('-i', inputFiles[i]);
      }

      // 构建滤波器链
      let filterComplex = '';
      for (let i = 0; i < files.length; i++) {
        if (options.resolution) {
          filterComplex += `[${i}:v]scale=${options.resolution}[v${i}];`;
        } else {
          filterComplex += `[${i}:v]null[v${i}];`;
        }
      }

      // 添加交叉淡入淡出
      for (let i = 0; i < files.length - 1; i++) {
        if (i === 0) {
          filterComplex += `[v${i}][v${i + 1}]xfade=transition=fade:duration=${fadeLength}:offset=5[vout${i}];`;
        } else if (i === files.length - 2) {
          filterComplex += `[vout${i - 1}][v${i + 1}]xfade=transition=fade:duration=${fadeLength}:offset=${(i + 1) * 5}[vout${i}];`;
        } else {
          filterComplex += `[vout${i - 1}][v${i + 1}]xfade=transition=fade:duration=${fadeLength}:offset=${(i + 1) * 5}[vout${i}];`;
        }
      }

      ffmpegArgs = [
        ...inputs,
        '-filter_complex', filterComplex,
        '-map', `[vout${files.length - 2}]`,
        '-c:v', 'libx264',
        '-crf', `${videoQuality}`,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        outputName
      ];
    } else {
      // 简单的顺序合并
      // 创建concat文件列表
      const concatContent = inputFiles.map(file => `file '${file}'`).join('\n');
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c:v', 'libx264',
        '-crf', `${videoQuality}`,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart'
      ];

      // 如果指定了分辨率，添加缩放滤波器
      if (options.resolution) {
        ffmpegArgs.push('-vf', `scale=${options.resolution}`);
      }

      ffmpegArgs.push(outputName);
    }

    await ffmpeg.exec(ffmpegArgs);

    updateProgress(progressDiv, '生成结果文件...');

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    hideProgress(progressDiv);
    console.log('视频合并完成，大小:', blob.size, 'bytes');

    return url;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('视频合并失败:', error);
    throw new Error(`视频合并失败: ${error}`);
  }
}



















