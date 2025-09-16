/**
 * 优化的视频处理器 - 基于技术文档最佳实践
 * 整合当前项目优势和新的优化方案
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFFmpegInstance } from './ffmpegConfig';
import { getFFmpegFromNodeModules } from './ffmpegNodeModulesLoader';
import { createPlayableVideoUrl, revokeVideoUrl } from './videoProcessor';

export interface OptimizedCutOptions {
  startTime: number;
  endTime: number;
  mode: 'fast' | 'precise' | 'timeline';
  outputFormat?: string;
  videoQuality?: number;
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow';
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface OptimizedMergeOptions {
  outputFormat?: string;
  videoQuality?: number;
  useFileList?: boolean;  // 使用concat demuxer
  enableCrossfade?: boolean;
  fadeLength?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/**
 * 优化的视频剪切 - 整合文档最佳实践
 */
export async function optimizedCutVideo(
  file: File,
  options: OptimizedCutOptions
): Promise<string> {
  console.log('🎬 [DEBUG] optimizedCutVideo() 开始执行');
  console.log('📋 [DEBUG] 输入参数:', {
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    fileType: file.type,
    options
  });

  const { startTime, endTime, mode, outputFormat = 'mp4', videoQuality = 23, preset = 'fast' } = options;
  const duration = endTime - startTime;

  console.log('⏱️ [DEBUG] 时间计算:', {
    startTime,
    endTime,
    duration,
    mode,
    outputFormat
  });

  console.log('🔧 [DEBUG] 获取FFmpeg实例（从node_modules）...');
  const ffmpegStartTime = performance.now();

  // 优先使用 node_modules 方式加载
  let ffmpeg: FFmpeg;
  try {
    ffmpeg = await getFFmpegFromNodeModules();
    console.log('✅ [DEBUG] 使用 node_modules 方式成功');
  } catch (nodeModulesError) {
    console.warn('⚠️ [DEBUG] node_modules 方式失败，回退到传统方式:', nodeModulesError);
    ffmpeg = await getFFmpegInstance();
    console.log('✅ [DEBUG] 使用传统方式成功');
  }

  const ffmpegEndTime = performance.now();
  console.log(`✅ [DEBUG] FFmpeg实例获取完成，耗时: ${(ffmpegEndTime - ffmpegStartTime).toFixed(2)}ms`);

  const inputName = `input.${file.name.split('.').pop()}`;
  const outputName = `output.${outputFormat}`;

  console.log('📁 [DEBUG] 文件名配置:', {
    originalName: file.name,
    inputName,
    outputName
  });

  try {
    // 写入输入文件
    console.log('📤 [DEBUG] 开始写入输入文件到FFmpeg内存...');
    const writeStartTime = performance.now();
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    const writeEndTime = performance.now();
    console.log(`✅ [DEBUG] 文件写入完成，耗时: ${(writeEndTime - writeStartTime).toFixed(2)}ms`);

    let ffmpegArgs: string[] = [];

    console.log(`🎯 [DEBUG] 根据模式 "${mode}" 生成FFmpeg命令...`);

    switch (mode) {
      case 'fast':
        console.log('⚡ [DEBUG] 使用快速模式 - 流复制（文档推荐）');
        // 快速剪切 - 流复制（文档推荐）
        ffmpegArgs = [
          '-ss', startTime.toString(),
          '-t', duration.toString(),
          '-i', inputName,
          '-c', 'copy',
          '-avoid_negative_ts', 'make_zero',
          outputName
        ];
        break;

      case 'precise':
        console.log('🎯 [DEBUG] 使用精确模式 - 重新编码（文档优化版）');
        // 精确剪切 - 重新编码（文档优化版）
        ffmpegArgs = [
          '-i', inputName,
          '-ss', startTime.toString(),
          '-t', duration.toString(),
          '-c:v', 'libx264',
          '-crf', videoQuality.toString(),
          '-preset', preset,
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',  // Web播放优化
          '-pix_fmt', 'yuv420p',      // 兼容性优化
          outputName
        ];
        break;

      case 'timeline':
        console.log('📅 [DEBUG] 使用时间轴模式 - 精确到帧');
        // 时间轴模式 - 精确到帧
        ffmpegArgs = [
          '-accurate_seek',           // 精确寻址
          '-ss', startTime.toString(),
          '-i', inputName,
          '-t', duration.toString(),
          '-c:v', 'libx264',
          '-crf', videoQuality.toString(),
          '-preset', preset,
          '-g', '30',                 // GOP大小
          '-keyint_min', '30',        // 最小关键帧间隔
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
          outputName
        ];
        break;
    }

    console.log('📜 [DEBUG] 生成的FFmpeg命令:', ffmpegArgs);
    console.log('📊 [DEBUG] 命令参数统计:', {
      totalArgs: ffmpegArgs.length,
      hasInput: ffmpegArgs.includes('-i'),
      hasOutput: ffmpegArgs.includes(outputName),
      mode,
      estimatedDuration: duration
    });

    // 设置进度回调
    if (options.onProgress) {
      console.log('📈 [DEBUG] 设置进度回调...');
      ffmpeg.on('progress', ({ progress }) => {
        console.log(`⏳ [DEBUG] FFmpeg处理进度: ${Math.round(progress * 100)}%`);
        options.onProgress?.(progress);
      });
    }

    // 检查取消信号
    if (options.signal?.aborted) {
      console.log('❌ [DEBUG] 检测到取消信号，中止操作');
      throw new Error('操作已取消');
    }

    console.log('🚀 [DEBUG] 开始执行FFmpeg命令...');
    const execStartTime = performance.now();

    try {
      await ffmpeg.exec(ffmpegArgs);
      const execEndTime = performance.now();
      console.log(`✅ [DEBUG] FFmpeg命令执行完成，耗时: ${(execEndTime - execStartTime).toFixed(2)}ms`);
    } catch (execError) {
      const execEndTime = performance.now();
      console.error(`💥 [DEBUG] FFmpeg命令执行失败，耗时: ${(execEndTime - execStartTime).toFixed(2)}ms`);
      console.error('🔴 [DEBUG] 执行错误详情:', execError);
      throw execError;
    }

    // 读取结果
    console.log('📖 [DEBUG] 开始读取输出文件...');
    const readStartTime = performance.now();
    const data = await ffmpeg.readFile(outputName);
    const readEndTime = performance.now();
    console.log(`✅ [DEBUG] 文件读取完成，耗时: ${(readEndTime - readStartTime).toFixed(2)}ms`);

    console.log('📊 [DEBUG] 输出文件信息:', {
      dataType: typeof data,
      dataSize: data instanceof Uint8Array ? `${(data.length / 1024 / 1024).toFixed(2)}MB` : 'Unknown',
      outputFormat
    });

    const blob = new Blob([data as Uint8Array], {
      type: `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`
    });

    console.log('🎯 [DEBUG] 创建Blob对象:', {
      blobSize: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
      blobType: blob.type
    });

    console.log('🔗 [DEBUG] 生成播放URL...');
    const urlStartTime = performance.now();
    const result = createPlayableVideoUrl(blob);
    const urlEndTime = performance.now();
    console.log(`✅ [DEBUG] URL生成完成，耗时: ${(urlEndTime - urlStartTime).toFixed(2)}ms`);
    console.log('🎉 [DEBUG] optimizedCutVideo() 成功完成');

    return result;

  } finally {
    // 清理临时文件
    console.log('🧹 [DEBUG] 开始清理临时文件...');
    const cleanupStartTime = performance.now();

    try {
      console.log(`🗑️ [DEBUG] 删除输入文件: ${inputName}`);
      await ffmpeg.deleteFile(inputName);
      console.log(`✅ [DEBUG] 输入文件删除成功: ${inputName}`);

      console.log(`🗑️ [DEBUG] 删除输出文件: ${outputName}`);
      await ffmpeg.deleteFile(outputName);
      console.log(`✅ [DEBUG] 输出文件删除成功: ${outputName}`);

      const cleanupEndTime = performance.now();
      console.log(`🧹 [DEBUG] 文件清理完成，耗时: ${(cleanupEndTime - cleanupStartTime).toFixed(2)}ms`);
    } catch (e) {
      const cleanupEndTime = performance.now();
      console.warn(`⚠️ [DEBUG] 清理临时文件失败，耗时: ${(cleanupEndTime - cleanupStartTime).toFixed(2)}ms`, e);
      console.warn('🔴 [DEBUG] 清理错误详情:', {
        error: e instanceof Error ? e.message : String(e),
        inputName,
        outputName
      });
    }
  }
}

/**
 * 优化的视频拼接 - 使用concat demuxer（文档推荐）
 */
export async function optimizedMergeVideos(
  files: File[],
  options: OptimizedMergeOptions = {}
): Promise<string> {
  const {
    outputFormat = 'mp4',
    videoQuality = 23,
    useFileList = true,
    enableCrossfade = false,
    fadeLength = 1.0
  } = options;

  const ffmpeg = await getFFmpegInstance();
  const inputNames: string[] = [];
  const outputName = `merged.${outputFormat}`;

  try {
    // 准备输入文件
    for (let i = 0; i < files.length; i++) {
      const inputName = `input_${i}.${files[i].name.split('.').pop()}`;
      inputNames.push(inputName);
      await ffmpeg.writeFile(inputName, await fetchFile(files[i]));
    }

    let ffmpegArgs: string[] = [];

    if (useFileList && !enableCrossfade) {
      // 方案一：使用concat demuxer（高效，文档推荐）
      const listFileName = 'filelist.txt';
      const fileListContent = inputNames.map(name => `file '${name}'`).join('\n');

      await ffmpeg.writeFile(
        listFileName,
        new TextEncoder().encode(fileListContent)
      );

      ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', listFileName,
        '-c', 'copy',  // 不重新编码（如果格式相同）
        outputName
      ];

      await ffmpeg.exec(ffmpegArgs);

      // 清理文件列表
      await ffmpeg.deleteFile(listFileName);

    } else {
      // 方案二：使用filter_complex（支持特效）
      const filterInputs = files.map((_, i) => `[${i}:v][${i}:a]`).join('');

      let filterComplex: string;
      if (enableCrossfade && files.length > 1) {
        // 交叉淡化拼接
        filterComplex = buildCrossfadeFilter(files.length, fadeLength);
      } else {
        // 普通拼接
        filterComplex = `${filterInputs}concat=n=${files.length}:v=1:a=1[outv][outa]`;
      }

      ffmpegArgs = [
        ...inputNames.flatMap(name => ['-i', name]),
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-crf', videoQuality.toString(),
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        outputName
      ];

      await ffmpeg.exec(ffmpegArgs);
    }

    // 读取结果
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data as Uint8Array], {
      type: `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`
    });

    return createPlayableVideoUrl(blob);

  } finally {
    // 清理所有临时文件
    for (const inputName of inputNames) {
      try {
        await ffmpeg.deleteFile(inputName);
      } catch (e) {
        console.warn(`清理文件失败 ${inputName}:`, e);
      }
    }
    try {
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      console.warn('清理输出文件失败:', e);
    }
  }
}

/**
 * 构建交叉淡化滤镜
 */
function buildCrossfadeFilter(videoCount: number, fadeLength: number): string {
  if (videoCount < 2) {
    return '[0:v][0:a]concat=n=1:v=1:a=1[outv][outa]';
  }

  let filter = '';
  let currentVideo = '[0:v]';
  let currentAudio = '[0:a]';

  for (let i = 1; i < videoCount; i++) {
    const videoLabel = `[v${i}]`;
    const audioLabel = `[a${i}]`;

    filter += `${currentVideo}[${i}:v]blend=all_expr='if(gte(T,${fadeLength}),A,B)':shortest=1${videoLabel};`;
    filter += `${currentAudio}[${i}:a]acrossfade=d=${fadeLength}${audioLabel};`;

    currentVideo = videoLabel;
    currentAudio = audioLabel;
  }

  filter += `${currentVideo}copy[outv];${currentAudio}copy[outa]`;
  return filter;
}

/**
 * 获取视频信息 - 优化版
 */
export async function getOptimizedVideoInfo(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
}> {
  const ffmpeg = await getFFmpegInstance();
  const inputName = `probe.${file.name.split('.').pop()}`;

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // 使用ffprobe获取详细信息
    const output = await ffmpeg.exec([
      '-i', inputName,
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams'
    ]);

    // 解析输出（需要根据实际FFmpeg输出格式调整）
    // 这里返回默认值，实际项目中需要解析JSON输出
    return {
      duration: 0,
      width: 1920,
      height: 1080,
      fps: 30,
      bitrate: 5000000,
      codec: 'h264'
    };

  } finally {
    try {
      await ffmpeg.deleteFile(inputName);
    } catch (e) {
      console.warn('清理探测文件失败:', e);
    }
  }
}

/**
 * 内存优化工具
 */
export class VideoMemoryManager {
  private static instance: VideoMemoryManager;
  private urlCache = new Set<string>();

  static getInstance(): VideoMemoryManager {
    if (!VideoMemoryManager.instance) {
      VideoMemoryManager.instance = new VideoMemoryManager();
    }
    return VideoMemoryManager.instance;
  }

  trackUrl(url: string): void {
    this.urlCache.add(url);
  }

  cleanupUrl(url: string): void {
    if (this.urlCache.has(url)) {
      revokeVideoUrl(url);
      this.urlCache.delete(url);
    }
  }

  cleanupAll(): void {
    this.urlCache.forEach(url => revokeVideoUrl(url));
    this.urlCache.clear();
  }

  getMemoryUsage(): { urlCount: number } {
    return {
      urlCount: this.urlCache.size
    };
  }
}

export const memoryManager = VideoMemoryManager.getInstance();
