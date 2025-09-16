/**
 * 高级视频处理器 - 基于OpenCut架构
 * 实现时间轴的多轨道视频合并和导出
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFFmpegInstance } from './ffmpegConfig';
import { renderTimelineFrame } from './timelineRenderer';
import { videoCache } from './videoCache';
import type {
  TimelineTrack,
  MediaFile,
  ExportOptions,
  ExportResult,
  ProjectSettings
} from '@/types/timeline';

/**
 * 基于时间轴的视频导出
 */
export async function exportTimelineProject(
  tracks: TimelineTrack[],
  mediaFiles: MediaFile[],
  projectSettings: ProjectSettings,
  options: ExportOptions
): Promise<ExportResult> {
  const { format, quality, fps, includeAudio, onProgress, onCancel } = options;

  try {
    console.log('🚀 开始导出时间轴项目...');

    // 1. 创建渲染画布
    const canvas = document.createElement('canvas');
    canvas.width = projectSettings.canvasSize.width;
    canvas.height = projectSettings.canvasSize.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot create canvas context');
    }

    // 2. 初始化FFmpeg
    const ffmpeg = await getFFmpegInstance();

    // 3. 计算导出参数
    const exportFps = fps || projectSettings.fps;
    const duration = projectSettings.duration || calculateTimelineDuration(tracks);
    const totalFrames = Math.ceil(duration * exportFps);

    console.log(`📊 导出参数: ${canvas.width}x${canvas.height} @ ${exportFps}fps, 总时长: ${duration}s, 总帧数: ${totalFrames}`);

    // 4. 渲染所有帧并写入FFmpeg
    const tempFrames: string[] = [];

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (onCancel && onCancel()) {
        throw new Error('Export cancelled by user');
      }

      const time = frameIndex / exportFps;

      // 渲染当前时间点的帧
      await renderTimelineFrame({
        ctx,
        time,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        tracks,
        mediaFiles,
        backgroundType: projectSettings.backgroundType,
        backgroundColor: projectSettings.backgroundColor,
        blurIntensity: projectSettings.blurIntensity,
        projectCanvasSize: projectSettings.canvasSize,
      });

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
      const videoProgress = includeAudio
        ? 0.1 + (frameIndex / totalFrames) * 0.7  // 视频部分占70%
        : (frameIndex / totalFrames);
      onProgress?.(videoProgress);
    }

    console.log('✅ 所有帧渲染完成');

    // 5. 处理音频（如果需要）
    let audioFileName: string | null = null;
    if (includeAudio) {
      onProgress?.(0.8);
      audioFileName = await extractTimelineAudio(ffmpeg, tracks, mediaFiles, duration);
      onProgress?.(0.9);
    }

    // 6. 合成最终视频
    const outputFileName = `output.${format}`;
    await combineFramesAndAudio(ffmpeg, tempFrames, audioFileName, outputFileName, {
      format,
      quality,
      fps: exportFps,
      duration
    });

    // 7. 读取输出文件
    const outputData = await ffmpeg.readFile(outputFileName) as Uint8Array;

    // 8. 清理临时文件
    for (const frameFile of tempFrames) {
      try {
        await ffmpeg.deleteFile(frameFile);
      } catch (e) {
        console.warn(`Failed to delete temp frame: ${frameFile}`);
      }
    }

    if (audioFileName) {
      try {
        await ffmpeg.deleteFile(audioFileName);
      } catch (e) {
        console.warn(`Failed to delete temp audio: ${audioFileName}`);
      }
    }

    try {
      await ffmpeg.deleteFile(outputFileName);
    } catch (e) {
      console.warn(`Failed to delete output file: ${outputFileName}`);
    }

    onProgress?.(1.0);
    console.log('✅ 视频导出完成');

    return {
      success: true,
      buffer: outputData.buffer
    };

  } catch (error) {
    console.error('❌ 视频导出失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 计算时间轴总时长
 */
function calculateTimelineDuration(tracks: TimelineTrack[]): number {
  let maxDuration = 0;

  tracks.forEach(track => {
    track.elements.forEach(element => {
      const elementEnd = element.startTime +
        (element.duration - element.trimStart - element.trimEnd);
      maxDuration = Math.max(maxDuration, elementEnd);
    });
  });

  return maxDuration;
}

/**
 * 提取时间轴音频
 */
async function extractTimelineAudio(
  ffmpeg: FFmpeg,
  tracks: TimelineTrack[],
  mediaFiles: MediaFile[],
  duration: number
): Promise<string | null> {
  console.log('🎵 开始提取时间轴音频...');

  // 收集所有音频元素
  const audioElements: Array<{
    file: File;
    startTime: number;
    duration: number;
    trimStart: number;
    trimEnd: number;
    trackMuted: boolean;
  }> = [];

  // 遍历所有轨道收集音频
  for (const track of tracks) {
    if (track.muted) continue;

    for (const element of track.elements) {
      if (element.type === "media" && element.mediaId) {
        const mediaFile = mediaFiles.find(m => m.id === element.mediaId);
        if (mediaFile && (mediaFile.type === "video" || mediaFile.type === "audio")) {
          audioElements.push({
            file: mediaFile.file,
            startTime: element.startTime,
            duration: element.duration,
            trimStart: element.trimStart,
            trimEnd: element.trimEnd,
            trackMuted: track.muted || false,
          });
        }
      }
    }
  }

  if (audioElements.length === 0) {
    console.log('ℹ️ 没有找到音频元素');
    return null;
  }

  // 写入所有音频文件
  const inputFiles: string[] = [];
  for (let i = 0; i < audioElements.length; i++) {
    const audioFile = `audio_input_${i}.${audioElements[i].file.name.split('.').pop() || 'mp4'}`;
    await ffmpeg.writeFile(audioFile, await fetchFile(audioElements[i].file));
    inputFiles.push(audioFile);
  }

  // 创建FFmpeg复合滤镜进行音频混合
  const filterInputs: string[] = [];
  for (let i = 0; i < audioElements.length; i++) {
    const element = audioElements[i];
    const actualStart = element.trimStart;
    const actualDuration = element.duration - element.trimStart - element.trimEnd;

    // 音频裁剪和时间定位滤镜
    filterInputs.push(
      `[${i}:a]atrim=start=${actualStart}:duration=${actualDuration},asetpts=PTS-STARTPTS,adelay=${element.startTime * 1000}|${element.startTime * 1000}[audio_${i}]`
    );
  }

  // 音频混合滤镜
  const mixFilter = audioElements.length === 1
    ? `[audio_0]aresample=44100,aformat=sample_fmts=s16:channel_layouts=stereo[out]`
    : `${filterInputs.map((_, i) => `[audio_${i}]`).join("")}amix=inputs=${audioElements.length}:duration=longest:dropout_transition=2,aresample=44100,aformat=sample_fmts=s16:channel_layouts=stereo[out]`;

  const complexFilter = [...filterInputs, mixFilter].join(";");

  // 执行FFmpeg音频处理
  const outputAudioFile = 'timeline_audio.wav';
  await ffmpeg.exec([
    ...inputFiles.flatMap(f => ["-i", f]),
    "-filter_complex", complexFilter,
    "-map", "[out]",
    "-f", "wav",
    "-t", `${duration}`, // 限制输出时长
    outputAudioFile
  ]);

  // 清理输入文件
  for (const inputFile of inputFiles) {
    try {
      await ffmpeg.deleteFile(inputFile);
    } catch (e) {
      console.warn(`Failed to delete audio input: ${inputFile}`);
    }
  }

  console.log('✅ 音频提取完成');
  return outputAudioFile;
}

/**
 * 合成帧和音频
 */
async function combineFramesAndAudio(
  ffmpeg: FFmpeg,
  frameFiles: string[],
  audioFileName: string | null,
  outputFileName: string,
  options: {
    format: string;
    quality: string;
    fps: number;
    duration: number;
  }
): Promise<void> {
  console.log('🎬 开始合成视频和音频...');

  const { format, quality, fps, duration } = options;

  // 质量映射
  const qualityMap = {
    low: { crf: 28, bitrate: '1M' },
    medium: { crf: 23, bitrate: '2M' },
    high: { crf: 18, bitrate: '4M' }
  };

  const qualitySettings = qualityMap[quality as keyof typeof qualityMap] || qualityMap.medium;

  let ffmpegArgs: string[] = [];

  // 输入帧序列
  ffmpegArgs.push(
    '-framerate', `${fps}`,
    '-i', 'frame_%06d.png'
  );

  // 如果有音频，添加音频输入
  if (audioFileName) {
    ffmpegArgs.push('-i', audioFileName);
  }

  // 视频编码设置
  if (format === 'webm') {
    ffmpegArgs.push(
      '-c:v', 'libvpx-vp9',
      '-crf', `${qualitySettings.crf}`,
      '-b:v', qualitySettings.bitrate
    );
  } else {
    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-crf', `${qualitySettings.crf}`,
      '-preset', 'medium',
      '-pix_fmt', 'yuv420p'
    );
  }

  // 音频编码设置（如果有音频）
  if (audioFileName) {
    if (format === 'webm') {
      ffmpegArgs.push('-c:a', 'libopus', '-b:a', '128k');
    } else {
      ffmpegArgs.push('-c:a', 'aac', '-b:a', '128k');
    }

    // 音视频同步
    ffmpegArgs.push('-shortest');
  } else {
    ffmpegArgs.push('-an'); // 无音频
  }

  // 其他设置
  ffmpegArgs.push(
    '-t', `${duration}`, // 限制输出时长
    '-movflags', '+faststart', // 优化web播放
    '-f', format,
    outputFileName
  );

  await ffmpeg.exec(ffmpegArgs);
  console.log('✅ 视频合成完成');
}

/**
 * 时间轴视频合并 - 支持多轨道叠加
 */
export async function mergeTimelineVideos(
  tracks: TimelineTrack[],
  mediaFiles: MediaFile[],
  options: {
    outputFormat?: string;
    quality?: string;
    resolution?: string;
    fps?: number;
    includeAudio?: boolean;
    backgroundType?: 'color' | 'blur';
    backgroundColor?: string;
    blurIntensity?: number;
  } = {}
): Promise<string> {
  console.log('🎬 开始时间轴视频合并...');

  const {
    outputFormat = 'mp4',
    quality = 'medium',
    resolution = '1920x1080',
    fps = 30,
    includeAudio = true,
    backgroundType = 'color',
    backgroundColor = '#000000',
    blurIntensity = 10
  } = options;

  // 解析分辨率
  const [width, height] = resolution.split('x').map(Number);

  // 创建项目设置
  const projectSettings: ProjectSettings = {
    name: 'Merged Video',
    canvasSize: { width, height },
    fps,
    duration: calculateTimelineDuration(tracks),
    backgroundType,
    backgroundColor,
    blurIntensity
  };

  // 使用导出功能
  const result = await exportTimelineProject(tracks, mediaFiles, projectSettings, {
    format: outputFormat as 'mp4' | 'webm',
    quality: quality as 'low' | 'medium' | 'high',
    fps,
    includeAudio,
    onProgress: (progress) => {
      console.log(`🔄 合并进度: ${Math.round(progress * 100)}%`);
    }
  });

  if (!result.success || !result.buffer) {
    throw new Error(result.error || '视频合并失败');
  }

  // 创建Blob URL
  const blob = new Blob([result.buffer], {
    type: outputFormat === 'webm' ? 'video/webm' : 'video/mp4'
  });

  const url = URL.createObjectURL(blob);
  console.log('✅ 时间轴视频合并完成');

  return url;
}

/**
 * 精确视频剪切 - 基于时间轴元素
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
  console.log('✂️ 开始时间轴视频剪切...');

  // 创建简单的时间轴结构
  const mediaId = `media_${Date.now()}`;
  const mediaFile: MediaFile = {
    id: mediaId,
    name: file.name,
    type: 'video',
    file,
    url: URL.createObjectURL(file),
    duration: endTime - startTime
  };

  const track: TimelineTrack = {
    id: 'track_1',
    name: 'Main Track',
    type: 'media',
    muted: false,
    isMain: true,
    elements: [{
      id: 'element_1',
      type: 'media',
      name: 'Cut Video',
      startTime: 0,
      duration: endTime - startTime,
      trimStart: startTime,
      trimEnd: 0,
      mediaId: mediaId
    }]
  };

  const projectSettings: ProjectSettings = {
    name: 'Cut Video',
    canvasSize: { width: 1920, height: 1080 },
    fps: 30,
    duration: endTime - startTime,
    backgroundType: 'color',
    backgroundColor: '#000000'
  };

  try {
    const result = await exportTimelineProject([track], [mediaFile], projectSettings, {
      format: options.outputFormat === 'webm' ? 'webm' : 'mp4',
      quality: 'medium',
      fps: 30,
      includeAudio: true
    });

    if (!result.success || !result.buffer) {
      throw new Error(result.error || '视频剪切失败');
    }

    const blob = new Blob([result.buffer], {
      type: options.outputFormat === 'webm' ? 'video/webm' : 'video/mp4'
    });

    console.log('✅ 时间轴视频剪切完成');
    return URL.createObjectURL(blob);

  } finally {
    // 清理资源
    URL.revokeObjectURL(mediaFile.url);
  }
}
