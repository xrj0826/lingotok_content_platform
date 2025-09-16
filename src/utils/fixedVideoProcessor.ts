/**
 * 修复视频剪切结尾黑屏问题的处理器
 * 专门解决包含视频结尾1秒导致黑屏的问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFFmpegInstance } from './ffmpegConfig';
import { createPlayableVideoUrl } from './videoProcessor';

export interface FixedCutOptions {
  startTime: number;
  endTime: number;
  mode: 'safe' | 'precise' | 'auto';
  outputFormat?: string;
  videoQuality?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/**
 * 获取视频的真实时长和元数据
 */
async function getVideoMetadata(ffmpeg: FFmpeg, inputName: string): Promise<{
  duration: number;
  fps: number;
  hasVideo: boolean;
  hasAudio: boolean;
}> {
  console.log('🔍 [DEBUG] 获取视频元数据...');

  try {
    // 使用 ffprobe 获取视频信息
    await ffmpeg.exec([
      '-i', inputName,
      '-f', 'null',
      '-'
    ]);
  } catch (error) {
    // FFmpeg 会输出错误信息，但这是正常的，我们需要从错误信息中提取元数据
    console.log('📊 [DEBUG] 从FFmpeg输出中解析元数据');
  }

  // 由于无法直接获取 FFmpeg 的输出，我们使用默认值并添加安全边界
  return {
    duration: 0, // 将在调用处动态计算
    fps: 30,
    hasVideo: true,
    hasAudio: true
  };
}

/**
 * 计算安全的剪切时间范围
 */
function calculateSafeTimeRange(
  startTime: number,
  endTime: number,
  videoDuration: number
): { safeStartTime: number; safeEndTime: number; adjustedDuration: number } {
  console.log('🛡️ [DEBUG] 计算安全时间范围:', { startTime, endTime, videoDuration });

  // 添加小的缓冲区以避免边界问题
  const SAFETY_BUFFER = 0.1; // 100ms 安全缓冲
  const MIN_DURATION = 0.1;   // 最小剪切时长

  let safeStartTime = Math.max(0, startTime);
  let safeEndTime = Math.min(videoDuration - SAFETY_BUFFER, endTime);

  // 如果结束时间非常接近视频结尾，提前一点结束
  if (endTime > videoDuration - 1.0) {
    console.log('⚠️ [DEBUG] 检测到剪切包含视频结尾，调整结束时间');
    safeEndTime = Math.max(videoDuration - 1.0, startTime + MIN_DURATION);
  }

  // 确保剪切时长合理
  if (safeEndTime - safeStartTime < MIN_DURATION) {
    safeEndTime = safeStartTime + MIN_DURATION;
    if (safeEndTime > videoDuration - SAFETY_BUFFER) {
      safeStartTime = Math.max(0, videoDuration - SAFETY_BUFFER - MIN_DURATION);
      safeEndTime = videoDuration - SAFETY_BUFFER;
    }
  }

  const adjustedDuration = safeEndTime - safeStartTime;

  console.log('✅ [DEBUG] 安全时间范围计算完成:', {
    original: { startTime, endTime, duration: endTime - startTime },
    safe: { safeStartTime, safeEndTime, adjustedDuration },
    adjustments: {
      startAdjusted: safeStartTime !== startTime,
      endAdjusted: safeEndTime !== endTime,
      durationChange: adjustedDuration - (endTime - startTime)
    }
  });

  return { safeStartTime, safeEndTime, adjustedDuration };
}

/**
 * 修复版本的视频剪切
 */
export async function cutVideoFixed(
  file: File,
  options: FixedCutOptions
): Promise<string> {
  console.log('🎬 [DEBUG] cutVideoFixed() 开始执行');
  console.log('📋 [DEBUG] 输入参数:', {
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    options
  });

  const { startTime, endTime, mode, outputFormat = 'mp4', videoQuality = 23 } = options;

  // 先获取视频时长
  const video = document.createElement('video');
  const videoDuration = await new Promise<number>((resolve, reject) => {
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => {
      reject(new Error('无法获取视频时长'));
    };
    video.src = URL.createObjectURL(file);
  });

  URL.revokeObjectURL(video.src);
  console.log('📏 [DEBUG] 视频时长:', videoDuration);

  const ffmpeg = await getFFmpegInstance();
  const inputName = `input.${file.name.split('.').pop()}`;
  const outputName = `output.${outputFormat}`;

  // 计算安全时间范围
  const { safeStartTime, safeEndTime, adjustedDuration } = calculateSafeTimeRange(
    startTime,
    endTime,
    videoDuration
  );

  try {
    // 写入输入文件
    console.log('📤 [DEBUG] 写入输入文件...');
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // 获取视频元数据
    const metadata = await getVideoMetadata(ffmpeg, inputName);
    console.log('📊 [DEBUG] 视频元数据:', metadata);

    // 根据模式选择剪切策略
    let ffmpegArgs: string[] = [];

    switch (mode) {
      case 'safe':
        console.log('🛡️ [DEBUG] 使用安全模式 - 重新编码确保精确');
        // 安全模式：重新编码，确保精确剪切
        ffmpegArgs = [
          '-i', inputName,
          '-ss', safeStartTime.toString(),
          '-t', adjustedDuration.toString(),
          '-c:v', 'libx264',
          '-crf', videoQuality.toString(),
          '-preset', 'medium',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
          '-pix_fmt', 'yuv420p',
          // 添加滤镜确保视频完整性
          '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
          // 强制关键帧
          '-force_key_frames', `expr:gte(t,n_forced*${adjustedDuration})`,
          outputName
        ];
        break;

      case 'precise':
        console.log('🎯 [DEBUG] 使用精确模式 - 精确到帧');
        // 精确模式：使用精确寻址
        ffmpegArgs = [
          '-accurate_seek',
          '-ss', safeStartTime.toString(),
          '-i', inputName,
          '-t', adjustedDuration.toString(),
          '-c:v', 'libx264',
          '-crf', videoQuality.toString(),
          '-preset', 'slow',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
          // 确保GOP结构完整
          '-g', '30',
          '-keyint_min', '30',
          '-sc_threshold', '0',
          outputName
        ];
        break;

      case 'auto':
      default:
        console.log('🤖 [DEBUG] 使用自动模式 - 智能选择策略');

        // 如果剪切包含视频结尾，使用安全模式
        if (endTime > videoDuration - 1.0) {
          console.log('⚠️ [DEBUG] 检测到结尾剪切，使用安全重编码模式');
          ffmpegArgs = [
            '-i', inputName,
            '-ss', safeStartTime.toString(),
            '-t', adjustedDuration.toString(),
            '-c:v', 'libx264',
            '-crf', '18', // 更高质量
            '-preset', 'medium',
            '-c:a', 'aac',
            '-b:a', '192k', // 更高音质
            '-movflags', '+faststart',
            '-pix_fmt', 'yuv420p',
            // 添加视频滤镜确保完整性
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30',
            // 音频滤镜确保音频完整
            '-af', 'aformat=sample_fmts=fltp:sample_rates=44100',
            outputName
          ];
        } else {
          // 其他情况使用快速模式但添加安全参数
          console.log('⚡ [DEBUG] 使用优化快速模式');
          ffmpegArgs = [
            '-ss', safeStartTime.toString(),
            '-i', inputName,
            '-t', adjustedDuration.toString(),
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-avoid_negative_ts', 'make_zero',
            // 添加安全参数
            '-fflags', '+genpts',
            outputName
          ];
        }
        break;
    }

    console.log('📜 [DEBUG] 生成的FFmpeg命令:', ffmpegArgs);

    // 设置进度回调
    if (options.onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        console.log(`⏳ [DEBUG] 处理进度: ${Math.round(progress * 100)}%`);
        options.onProgress?.(progress);
      });
    }

    // 检查取消信号
    if (options.signal?.aborted) {
      throw new Error('操作已取消');
    }

    console.log('🚀 [DEBUG] 开始执行FFmpeg命令...');
    const execStartTime = performance.now();

    await ffmpeg.exec(ffmpegArgs);

    const execEndTime = performance.now();
    console.log(`✅ [DEBUG] 命令执行完成，耗时: ${(execEndTime - execStartTime).toFixed(2)}ms`);

    // 读取结果
    console.log('📖 [DEBUG] 读取输出文件...');
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data as Uint8Array], {
      type: `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`
    });

    console.log('📊 [DEBUG] 输出文件信息:', {
      size: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
      type: blob.type,
      originalDuration: endTime - startTime,
      safeDuration: adjustedDuration
    });

    const result = createPlayableVideoUrl(blob);
    console.log('🎉 [DEBUG] 修复版视频剪切完成');

    return result;

  } finally {
    // 清理临时文件
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      console.warn('⚠️ [DEBUG] 清理文件失败:', e);
    }
  }
}

/**
 * 智能视频剪切 - 自动检测并修复结尾问题
 */
export async function smartCutVideo(
  file: File,
  startTime: number,
  endTime: number,
  options: {
    outputFormat?: string;
    videoQuality?: number;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
  } = {}
): Promise<string> {
  console.log('🧠 [DEBUG] smartCutVideo() 开始智能剪切');

  // 获取视频时长
  const video = document.createElement('video');
  const videoDuration = await new Promise<number>((resolve, reject) => {
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => reject(new Error('无法获取视频时长'));
    video.src = URL.createObjectURL(file);
  });
  URL.revokeObjectURL(video.src);

  // 智能选择模式
  let mode: 'safe' | 'precise' | 'auto' = 'auto';

  if (endTime > videoDuration - 1.0) {
    console.log('🛡️ [DEBUG] 检测到结尾剪切，使用安全模式');
    mode = 'safe';
  } else if (endTime - startTime < 2.0) {
    console.log('🎯 [DEBUG] 检测到短片段剪切，使用精确模式');
    mode = 'precise';
  }

  return cutVideoFixed(file, {
    startTime,
    endTime,
    mode,
    ...options
  });
}

/**
 * 检测视频是否可能存在结尾问题
 */
export async function detectEndingIssues(
  file: File,
  startTime: number,
  endTime: number
): Promise<{
  hasEndingIssue: boolean;
  videoDuration: number;
  recommendations: string[];
}> {
  console.log('🔍 [DEBUG] 检测视频结尾问题...');

  const video = document.createElement('video');
  const videoDuration = await new Promise<number>((resolve, reject) => {
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => reject(new Error('无法获取视频时长'));
    video.src = URL.createObjectURL(file);
  });
  URL.revokeObjectURL(video.src);

  const hasEndingIssue = endTime > videoDuration - 1.0;
  const recommendations: string[] = [];

  if (hasEndingIssue) {
    recommendations.push('检测到剪切包含视频结尾，建议使用安全模式');
    recommendations.push(`建议将结束时间调整为 ${(videoDuration - 1.0).toFixed(1)}s 以避免黑屏`);
    recommendations.push('或使用智能剪切功能自动处理');
  }

  if (endTime - startTime < 1.0) {
    recommendations.push('剪切片段较短，建议使用精确模式确保质量');
  }

  return {
    hasEndingIssue,
    videoDuration,
    recommendations
  };
}
























