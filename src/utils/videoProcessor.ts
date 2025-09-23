/**
 * 纯前端视频处理工具类
 * 使用MediaRecorder + Canvas实现真实的视频剪切和拼接
 * 同时支持FFmpeg实现更专业的视频处理
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFFmpegInstance, diagnoseSharedArrayBufferSupport } from './ffmpegConfig';
import { getSimpleFFmpegInstance } from './ffmpegConfigSimple';
import { getCorrectFFmpegInstance } from './ffmpegConfigCorrect';
import { logFFmpegDiagnostic } from './ffmpegDiagnostic';
import { applyFFmpegForcedMode, autoApplyForcedModeIfNeeded } from './ffmpegForcedMode';

// 视频剪切选项接口
export interface VideoCutOptions {
  startTime: number;  // 开始时间（秒）
  endTime: number;    // 结束时间（秒）
}

// 视频拼接源接口
export interface VideoSource {
  url: string;        // 视频URL
  startTime?: number; // 开始时间（秒）
  endTime?: number;   // 结束时间（秒）
}

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
 * 获取视频的时长
 * @param videoElement 视频元素
 * @returns Promise包裹的视频时长（秒）
 */
export function getVideoDuration(videoElement: HTMLVideoElement): Promise<number> {
  return new Promise((resolve) => {
    if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
      resolve(videoElement.duration);
    } else {
      const handler = () => {
        videoElement.removeEventListener('loadedmetadata', handler);
        resolve(videoElement.duration);
      };
      videoElement.addEventListener('loadedmetadata', handler);
    }
  });
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
 * 下载跨域视频并转换为本地Blob URL
 */
async function downloadVideoAsBlob(videoUrl: string): Promise<string> {
  try {
    console.log('尝试下载视频:', videoUrl);

    // 尝试直接fetch
    let response: Response;
    try {
      response = await fetch(videoUrl);
    } catch (corsError) {
      console.log('直接访问失败，尝试使用CORS代理');

      // 尝试多个CORS代理服务
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(videoUrl)}`,
        `https://cors-anywhere.herokuapp.com/${videoUrl}`,
        `https://thingproxy.freeboard.io/fetch/${videoUrl}`
      ];

      let lastError: Error | null = null;

      for (const proxyUrl of proxies) {
        try {
          console.log('尝试代理:', proxyUrl);
          response = await fetch(proxyUrl);
          if (response.ok) {
            console.log('代理成功:', proxyUrl);
            break;
          }
        } catch (proxyError) {
          console.warn('代理失败:', proxyUrl, proxyError);
          lastError = proxyError as Error;
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('所有代理都失败了');
      }
    }

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    console.log('视频下载成功，大小:', blob.size, 'bytes');
    return blobUrl;
  } catch (error) {
    console.error('视频下载失败:', error);
    throw error;
  }
}

/**
 * 创建视频元素并处理跨域
 */
async function createVideoElement(videoUrl: string): Promise<HTMLVideoElement> {
  // 首先尝试下载视频为本地Blob
  let finalVideoUrl = videoUrl;
  let isLocalBlob = false;

  try {
    finalVideoUrl = await downloadVideoAsBlob(videoUrl);
    isLocalBlob = true;
    console.log('使用本地Blob URL:', finalVideoUrl);
  } catch (error) {
    console.warn('无法下载视频，尝试直接使用原URL:', error);
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;

    // 如果是本地Blob，不需要设置crossOrigin
    if (!isLocalBlob) {
      video.crossOrigin = 'anonymous';
    }

    video.onloadedmetadata = () => {
      resolve(video);
    };

    video.onerror = () => {
      if (!isLocalBlob) {
        // 如果设置crossOrigin失败，尝试不设置
        const video2 = document.createElement('video');
        video2.muted = true;
        video2.playsInline = true;

        video2.onloadedmetadata = () => {
          resolve(video2);
        };

        video2.onerror = () => {
          reject(new Error('无法加载视频'));
        };

        video2.src = finalVideoUrl;
      } else {
        reject(new Error('无法加载本地Blob视频'));
      }
    };

    video.src = finalVideoUrl;
  });
}

/**
 * 视频剪切 - 使用MediaRecorder实现
 * @param videoUrl 视频URL
 * @param options 剪切选项
 * @returns Promise包裹的剪切后的视频Blob URL
 */
export async function cutVideo(videoUrl: string, options: VideoCutOptions): Promise<string> {
  const progressDiv = showProgress('加载视频...');

  try {
    // 创建视频元素
    const video = await createVideoElement(videoUrl);
    updateProgress(progressDiv, '准备剪切...');

    // 创建canvas用于捕获视频帧
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }

    // 设置canvas尺寸
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    // 创建MediaRecorder
    const stream = canvas.captureStream(30); // 30fps
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9' // 使用VP9编码
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        hideProgress(progressDiv);

        if (chunks.length === 0) {
          reject(new Error('没有录制到视频数据'));
          return;
        }

        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = createPlayableVideoUrl(blob);
        console.log('视频剪切完成，大小:', blob.size, 'bytes');
        resolve(url);
      };

      mediaRecorder.onerror = (event) => {
        hideProgress(progressDiv);
        reject(new Error('录制失败'));
      };

      // 开始录制
      mediaRecorder.start(100); // 每100ms一个数据块

      // 设置视频播放位置和时间
      video.currentTime = options.startTime;

      const duration = options.endTime - options.startTime;
      let frameCount = 0;
      const targetFrames = Math.ceil(duration * 30); // 30fps

      updateProgress(progressDiv, `剪切中... (${duration.toFixed(1)}秒)`);

      const drawFrame = () => {
        if (frameCount >= targetFrames) {
          mediaRecorder.stop();
          return;
        }

        // 绘制当前帧到canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        frameCount++;
        const currentTime = options.startTime + (frameCount / 30);

        if (currentTime < options.endTime) {
          video.currentTime = currentTime;
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
        }
      };

      // 等待视频加载到指定位置后开始绘制
      video.onseeked = () => {
        drawFrame();
      };
    });

  } catch (error) {
    hideProgress(progressDiv);
    console.error('视频剪切失败:', error);

    // 如果是CORS错误，提供更详细的错误信息
    if (error instanceof Error && error.message.includes('CORS')) {
      throw new Error('由于跨域限制无法处理此视频。建议：1) 使用本地视频文件 2) 联系管理员配置CORS 3) 使用支持的视频源');
    }

    throw new Error(`视频剪切失败: ${error}`);
  }
}

/**
 * 创建一个简单的错误信息视频（当CORS完全失败时使用）
 */
function createErrorInfoVideo(message: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    // 创建简单的错误信息画面
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 分行显示消息
    const lines = message.split('。');
    lines.forEach((line, index) => {
      if (line.trim()) {
        ctx.fillText(line.trim(), canvas.width / 2, canvas.height / 2 + (index - lines.length / 2) * 30);
      }
    });

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        resolve('');
      }
    }, 'image/jpeg', 0.8);
  });
}

/**
 * 使用FFmpeg进行视频剪切 - 高质量精确剪切
 * @param file 视频文件
 * @param startTime 开始时间(秒)
 * @param endTime 结束时间(秒)
 * @param options 剪切选项
 * @returns Promise包裹的剪切后的视频Blob URL
 */
/**
 * 确保在使用FFmpeg前启用兼容模式
 */
function ensureFFmpegCompatibility() {
  console.log('🔧 启用FFmpeg强制兼容模式');
  // 自动应用强制模式
  applyFFmpegForcedMode();
  return true;
}

export async function cutVideoWithFFmpeg(
  file: File,
  startTime: number,
  endTime: number,
  options: {
    keepOriginalCodec?: boolean;  // 是否保持原始编码(快速但可能不精确)
    enableReEncode?: boolean;     // 是否重新编码(慢但精确)
    outputFormat?: string;        // 输出格式
    videoQuality?: number;        // 视频质量(0-51，数值越小质量越高)
  } = {}
): Promise<string> {
  const progressDiv = showProgress('初始化FFmpeg...');

  try {
    // 获取FFmpeg实例
    updateProgress(progressDiv, '加载FFmpeg核心...');

    // 启用强制兼容模式来解决SharedArrayBuffer问题
    ensureFFmpegCompatibility();
    console.log('✅ 已启用FFmpeg强制兼容模式，跳过环境检查');

    // 尝试显示标准诊断信息，但不影响程序运行
    try {
      logFFmpegDiagnostic();
    } catch (diagErr) {
      console.log('⚠️ 显示诊断信息失败，但不影响功能');
    }

    // 按照文档推荐的方式加载FFmpeg
    let ffmpeg;
    try {
      console.log('🔄 使用文档推荐的FFmpeg配置...');
      ffmpeg = await getCorrectFFmpegInstance();
    } catch (correctError) {
      console.warn('⚠️ 推荐配置失败，尝试简化版配置:', correctError);
      try {
        ffmpeg = await getSimpleFFmpegInstance();
      } catch (simpleError) {
        console.warn('⚠️ 简化版配置失败，尝试原始配置:', simpleError);
        ffmpeg = await getFFmpegInstance();
      }
    }

    updateProgress(progressDiv, '处理视频文件...');

    // 将文件写入FFmpeg文件系统
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const fileName = `input.${fileExtension}`;
    const outputFormat = options.outputFormat || fileExtension;
    const outputName = `output.${outputFormat}`;

    await ffmpeg.writeFile(fileName, await fetchFile(file));

    updateProgress(progressDiv, `剪切视频 (${startTime}s - ${endTime}s)...`);

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

    updateProgress(progressDiv, '执行视频剪切...');
    await ffmpeg.exec(ffmpegArgs);

    updateProgress(progressDiv, '生成结果文件...');

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    hideProgress(progressDiv);
    console.log('FFmpeg视频剪切完成，大小:', blob.size, 'bytes');

    return url;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('FFmpeg视频剪切失败:', error);
    throw new Error(`FFmpeg视频剪切失败: ${error}`);
  }
}

/**
 * 使用FFmpeg提取视频帧 - 智能关键帧提取
 * @param file 视频文件
 * @param options 提取选项
 * @returns Promise包裹的Base64图片数组
 */
export async function extractVideoFrames(
  file: File,
  options: {
    frameCount?: number;              // 提取帧数
    size?: string;                   // 帧大小 如 "320x240"
    format?: 'png' | 'jpg' | 'webp'; // 输出格式
    quality?: number;                // 质量(1-31, 越小质量越高)
    extractMode?: 'uniform' | 'keyframe' | 'scene'; // 提取模式
    startTime?: number;              // 开始时间(秒)
    endTime?: number;                // 结束时间(秒)
    interval?: number;               // 提取间隔(秒)
  } = {}
): Promise<string[]> {
  const progressDiv = showProgress('提取视频帧...');

  try {
    // 获取FFmpeg实例
    updateProgress(progressDiv, '加载FFmpeg核心...');
    const ffmpeg = await getFFmpegInstance();

    // 设置默认参数
    const frameCount = options.frameCount || 20;
    const size = options.size || "320x240";
    const format = options.format || 'png';
    const quality = options.quality || 2;
    const extractMode = options.extractMode || 'uniform';
    const startTime = options.startTime || 0;

    const fileName = `input.${file.name.split('.').pop()}`;
    await ffmpeg.writeFile(fileName, await fetchFile(file));

    updateProgress(progressDiv, `提取${frameCount}帧图片...`);

    let ffmpegArgs: string[] = [];

    // 根据提取模式构建不同的命令
    switch (extractMode) {
      case 'keyframe':
        // 提取关键帧
        ffmpegArgs = [
          '-skip_frame', 'nokey',     // 只处理关键帧
          '-i', fileName,
          '-vsync', 'vfr',            // 可变帧率
          '-vframes', `${frameCount}`,
          '-s', size,
          '-q:v', `${quality}`,
          `keyframe-%03d.${format}`
        ];
        break;

      case 'scene':
        // 场景检测提取
        ffmpegArgs = [
          '-i', fileName,
          '-vf', `select='gt(scene,0.3)',scale=${size}`, // 场景变化阈值0.3
          '-vframes', `${frameCount}`,
          '-q:v', `${quality}`,
          `scene-%03d.${format}`
        ];
        break;

      default: // uniform
        // 均匀提取
        if (options.interval) {
          // 按时间间隔提取
          ffmpegArgs = [
            '-i', fileName,
            '-vf', `fps=1/${options.interval},scale=${size}`,
            '-vframes', `${frameCount}`,
            '-q:v', `${quality}`,
            `uniform-%03d.${format}`
          ];
        } else {
          // 按数量均匀分布提取
          if (options.endTime) {
            const duration = options.endTime - startTime;
            const interval = duration / frameCount;
            ffmpegArgs = [
              '-ss', `${startTime}`,
              '-i', fileName,
              '-vf', `fps=1/${interval},scale=${size}`,
              '-t', `${duration}`,
              '-q:v', `${quality}`,
              `uniform-%03d.${format}`
            ];
          } else {
            ffmpegArgs = [
              '-ss', `${startTime}`,
              '-i', fileName,
              '-vf', `select='not(mod(n\\,${Math.floor(30 * frameCount / frameCount)}))',scale=${size}`,
              '-vframes', `${frameCount}`,
              '-q:v', `${quality}`,
              `uniform-%03d.${format}`
            ];
          }
        }
        break;
    }

    await ffmpeg.exec(ffmpegArgs);

    const frames: string[] = [];
    const prefix = extractMode === 'keyframe' ? 'keyframe' :
      extractMode === 'scene' ? 'scene' : 'uniform';

    for (let i = 1; i <= frameCount; i++) {
      try {
        const frameFileName = `${prefix}-${i.toString().padStart(3, '0')}.${format}`;
        const frameData = await ffmpeg.readFile(frameFileName);
        const base64 = arrayBufferToBase64((frameData as Uint8Array).buffer as ArrayBuffer);
        frames.push(`data:image/${format === 'jpg' ? 'jpeg' : format};base64,${base64}`);
      } catch (err) {
        // 如果某一帧不存在就跳过
        console.warn(`Frame ${i} not found, skipping...`);
        break;
      }
    }

    hideProgress(progressDiv);
    console.log(`成功提取${frames.length}帧图片`);

    return frames;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('提取视频帧失败:', error);
    throw new Error(`提取视频帧失败: ${error}`);
  }
}

/**
 * 视频转换 - 格式转换、分辨率调整、帧率调整等
 * @param file 视频文件
 * @param options 转换选项
 * @returns Promise包裹的转换后的视频Blob URL
 */
export async function convertVideo(
  file: File,
  options: {
    outputFormat?: string;           // 输出格式
    resolution?: string;             // 分辨率 如 "1920x1080"
    frameRate?: number;              // 帧率
    videoBitrate?: string;           // 视频比特率 如 "1000k"
    audioBitrate?: string;           // 音频比特率 如 "128k"
    videoCodec?: string;             // 视频编码器
    audioCodec?: string;             // 音频编码器
    quality?: number;                // 视频质量 (0-51)
    speed?: number;                  // 播放速度 (0.5-2.0)
    rotate?: number;                 // 旋转角度 (0, 90, 180, 270)
    enableHardwareAccel?: boolean;   // 启用硬件加速
  } = {}
): Promise<string> {
  const progressDiv = showProgress('初始化视频转换...');

  try {
    updateProgress(progressDiv, '加载FFmpeg核心...');
    const ffmpeg = await getFFmpegInstance();

    updateProgress(progressDiv, '分析输入文件...');

    // 设置默认参数
    const outputFormat = options.outputFormat || 'mp4';
    const videoCodec = options.videoCodec || 'libx264';
    const audioCodec = options.audioCodec || 'aac';
    const quality = options.quality || 23;

    // 写入输入文件
    const inputName = `input.${file.name.split('.').pop()}`;
    const outputName = `output.${outputFormat}`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    updateProgress(progressDiv, '执行视频转换...');

    // 构建FFmpeg命令
    let ffmpegArgs: string[] = ['-i', inputName];

    // 构建视频滤波器
    let videoFilters: string[] = [];

    // 分辨率调整
    if (options.resolution) {
      videoFilters.push(`scale=${options.resolution}`);
    }

    // 帧率调整
    if (options.frameRate) {
      videoFilters.push(`fps=${options.frameRate}`);
    }

    // 播放速度调整
    if (options.speed && options.speed !== 1.0) {
      videoFilters.push(`setpts=${1 / options.speed}*PTS`);
      // 同时调整音频速度
      ffmpegArgs.push('-filter:a', `atempo=${options.speed}`);
    }

    // 旋转
    if (options.rotate) {
      switch (options.rotate) {
        case 90:
          videoFilters.push('transpose=1');
          break;
        case 180:
          videoFilters.push('transpose=2,transpose=2');
          break;
        case 270:
          videoFilters.push('transpose=2');
          break;
      }
    }

    // 应用视频滤波器
    if (videoFilters.length > 0) {
      ffmpegArgs.push('-vf', videoFilters.join(','));
    }

    // 视频编码设置
    ffmpegArgs.push('-c:v', videoCodec);

    if (options.videoBitrate) {
      ffmpegArgs.push('-b:v', options.videoBitrate);
    } else {
      ffmpegArgs.push('-crf', `${quality}`);
    }

    // 音频编码设置
    ffmpegArgs.push('-c:a', audioCodec);
    if (options.audioBitrate) {
      ffmpegArgs.push('-b:a', options.audioBitrate);
    }

    // 优化设置
    ffmpegArgs.push('-movflags', '+faststart');

    // 硬件加速(如果支持)
    if (options.enableHardwareAccel) {
      ffmpegArgs.unshift('-hwaccel', 'auto');
    }

    ffmpegArgs.push(outputName);

    await ffmpeg.exec(ffmpegArgs);

    updateProgress(progressDiv, '生成转换结果...');

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    hideProgress(progressDiv);
    console.log('视频转换完成，大小:', blob.size, 'bytes');

    return url;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('视频转换失败:', error);
    throw new Error(`视频转换失败: ${error}`);
  }
}

/**
 * 创建视频缩略图 - 生成视频的预览图
 * @param file 视频文件
 * @param options 缩略图选项
 * @returns Promise包裹的缩略图base64数组
 */
export async function createVideoThumbnails(
  file: File,
  options: {
    count?: number;                  // 缩略图数量
    size?: string;                   // 尺寸 如 "160x90"
    format?: 'png' | 'jpg' | 'webp'; // 格式
    quality?: number;                // 质量
    timestamps?: number[];           // 指定时间点(秒)
  } = {}
): Promise<string[]> {
  const progressDiv = showProgress('生成视频缩略图...');

  try {
    updateProgress(progressDiv, '加载FFmpeg核心...');
    const ffmpeg = await getFFmpegInstance();

    // 设置默认参数
    const count = options.count || 5;
    const size = options.size || "160x90";
    const format = options.format || 'jpg';
    const quality = options.quality || 3;

    const fileName = `input.${file.name.split('.').pop()}`;
    await ffmpeg.writeFile(fileName, await fetchFile(file));

    updateProgress(progressDiv, `生成${count}个缩略图...`);

    const thumbnails: string[] = [];

    if (options.timestamps && options.timestamps.length > 0) {
      // 按指定时间点生成
      for (let i = 0; i < options.timestamps.length; i++) {
        const timestamp = options.timestamps[i];
        const thumbName = `thumb-${i}.${format}`;

        await ffmpeg.exec([
          '-ss', `${timestamp}`,
          '-i', fileName,
          '-vframes', '1',
          '-s', size,
          '-q:v', `${quality}`,
          thumbName
        ]);

        try {
          const thumbData = await ffmpeg.readFile(thumbName);
          const base64 = arrayBufferToBase64((thumbData as Uint8Array).buffer as ArrayBuffer);
          thumbnails.push(`data:image/${format === 'jpg' ? 'jpeg' : format};base64,${base64}`);
        } catch (err) {
          console.warn(`无法生成时间点 ${timestamp}s 的缩略图`);
        }
      }
    } else {
      // 均匀分布生成
      await ffmpeg.exec([
        '-i', fileName,
        '-vf', `select='not(mod(n\\,${Math.floor(30 * 60 / count)}))',scale=${size}`,
        '-vframes', `${count}`,
        '-q:v', `${quality}`,
        `thumb-%03d.${format}`
      ]);

      for (let i = 1; i <= count; i++) {
        try {
          const thumbName = `thumb-${i.toString().padStart(3, '0')}.${format}`;
          const thumbData = await ffmpeg.readFile(thumbName);
          const base64 = arrayBufferToBase64((thumbData as Uint8Array).buffer as ArrayBuffer);
          thumbnails.push(`data:image/${format === 'jpg' ? 'jpeg' : format};base64,${base64}`);
        } catch (err) {
          console.warn(`缩略图 ${i} 生成失败`);
          break;
        }
      }
    }

    hideProgress(progressDiv);
    console.log(`成功生成${thumbnails.length}个缩略图`);

    return thumbnails;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('生成缩略图失败:', error);
    throw new Error(`生成缩略图失败: ${error}`);
  }
}

// 辅助函数：ArrayBuffer转Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const length = uint8Array.byteLength;
  const table = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
  ];

  let base64Str = "";
  let i: number;

  for (i = 0; length - i >= 3; i += 3) {
    const num1 = uint8Array[i];
    const num2 = uint8Array[i + 1];
    const num3 = uint8Array[i + 2];
    base64Str +=
      table[num1 >>> 2] +
      table[((num1 & 0b11) << 4) | (num2 >>> 4)] +
      table[((num2 & 0b1111) << 2) | (num3 >>> 6)] +
      table[num3 & 0b111111];
  }

  const lastByte = length - i;
  if (lastByte === 1) {
    const lastNum1 = uint8Array[i];
    base64Str +=
      table[lastNum1 >>> 2] + table[(lastNum1 & 0b11) << 4] + "==";
  } else if (lastByte === 2) {
    const lastNum1 = uint8Array[i];
    const lastNum2 = uint8Array[i + 1];
    base64Str +=
      table[lastNum1 >>> 2] +
      table[((lastNum1 & 0b11) << 4) | (lastNum2 >>> 4)] +
      table[(lastNum2 & 0b1111) << 2] +
      "=";
  }

  return base64Str;
}

/**
 * 使用FFmpeg合并多个视频文件 - 专业级视频合并
 * @param files 视频文件数组
 * @param options 合并选项
 * @returns Promise包裹的合并后的视频Blob URL
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
  if (files.length === 0) {
    throw new Error('没有提供视频文件');
  }

  if (files.length === 1) {
    // 单个文件直接返回其Blob URL
    return createPlayableVideoUrl(files[0]);
  }

  const progressDiv = showProgress('初始化FFmpeg...');

  try {
    // 启用强制兼容模式
    ensureFFmpegCompatibility();

    updateProgress(progressDiv, '加载FFmpeg核心...');

    // 使用与视频剪切相同的FFmpeg加载策略
    let ffmpeg;
    try {
      console.log('🔄 视频合并：使用文档推荐的FFmpeg配置...');
      ffmpeg = await getCorrectFFmpegInstance();
    } catch (correctError) {
      console.warn('⚠️ 推荐配置失败，尝试简化版配置:', correctError);
      try {
        ffmpeg = await getSimpleFFmpegInstance();
      } catch (simpleError) {
        console.warn('⚠️ 简化版配置失败，尝试原始配置:', simpleError);
        ffmpeg = await getFFmpegInstance();
      }
    }

    // 确保FFmpeg已正确加载
    if (!ffmpeg.loaded) {
      throw new Error('FFmpeg实例获取成功但未正确加载，请检查环境配置');
    }

    console.log('✅ FFmpeg实例已加载，可以开始视频合并');

    updateProgress(progressDiv, '准备视频文件...');

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

      updateProgress(progressDiv, `写入文件 ${i + 1}/${files.length}...`);
      await ffmpeg.writeFile(fileName, await fetchFile(file));
    }

    updateProgress(progressDiv, '创建合并配置...');

    // 创建concat文件列表
    const concatContent = inputFiles.map(file => `file '${file}'`).join('\n');
    await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

    updateProgress(progressDiv, '执行视频合并...');

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

    await ffmpeg.exec(ffmpegArgs);

    updateProgress(progressDiv, '生成结果文件...');

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    hideProgress(progressDiv);
    console.log('FFmpeg视频合并完成，大小:', blob.size, 'bytes');

    return url;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('FFmpeg视频合并失败:', error);
    throw new Error(`FFmpeg视频合并失败: ${error}`);
  }
}

/**
 * 拼接多个视频 - 使用Canvas实现（兼容性好但质量有限）
 * @param sources 视频源数组
 * @returns Promise包裹的拼接后的视频Blob URL
 */
export async function concatVideos(sources: VideoSource[]): Promise<string> {
  if (sources.length === 0) {
    throw new Error('没有提供视频源');
  }

  if (sources.length === 1) {
    const source = sources[0];
    if (source.startTime !== undefined && source.endTime !== undefined) {
      return cutVideo(source.url, {
        startTime: source.startTime,
        endTime: source.endTime
      });
    }
  }

  const progressDiv = showProgress('加载视频资源...');

  try {
    // 加载所有视频
    const videos: HTMLVideoElement[] = [];
    for (let i = 0; i < sources.length; i++) {
      updateProgress(progressDiv, `加载视频 ${i + 1}/${sources.length}...`);
      const video = await createVideoElement(sources[i].url);
      videos.push(video);
    }

    updateProgress(progressDiv, '准备拼接...');

    // 创建canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }

    // 使用第一个视频的尺寸
    canvas.width = videos[0].videoWidth || 640;
    canvas.height = videos[0].videoHeight || 360;

    // 创建MediaRecorder
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        hideProgress(progressDiv);

        if (chunks.length === 0) {
          reject(new Error('没有录制到视频数据'));
          return;
        }

        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = createPlayableVideoUrl(blob);
        console.log('视频拼接完成，大小:', blob.size, 'bytes');
        resolve(url);
      };

      mediaRecorder.onerror = () => {
        hideProgress(progressDiv);
        reject(new Error('录制失败'));
      };

      // 开始录制
      mediaRecorder.start(100);

      let currentVideoIndex = 0;
      let frameCount = 0;

      const processNextSegment = async () => {
        if (currentVideoIndex >= sources.length) {
          mediaRecorder.stop();
          return;
        }

        const source = sources[currentVideoIndex];
        const video = videos[currentVideoIndex];
        const startTime = source.startTime || 0;
        const endTime = source.endTime || video.duration;
        const duration = endTime - startTime;
        const targetFrames = Math.ceil(duration * 30);

        updateProgress(progressDiv, `拼接片段 ${currentVideoIndex + 1}/${sources.length}...`);

        video.currentTime = startTime;

        const drawSegmentFrame = () => {
          if (frameCount >= targetFrames) {
            frameCount = 0;
            currentVideoIndex++;
            processNextSegment();
            return;
          }

          // 绘制当前帧
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          frameCount++;
          const currentTime = startTime + (frameCount / 30);

          if (currentTime < endTime) {
            video.currentTime = currentTime;
            requestAnimationFrame(drawSegmentFrame);
          } else {
            frameCount = 0;
            currentVideoIndex++;
            processNextSegment();
          }
        };

        video.onseeked = () => {
          drawSegmentFrame();
        };
      };

      processNextSegment();
    });

  } catch (error) {
    hideProgress(progressDiv);
    console.error('视频拼接失败:', error);

    // 如果是CORS错误，提供更详细的错误信息
    if (error instanceof Error && error.message.includes('CORS')) {
      throw new Error('由于跨域限制无法处理此视频。建议：1) 使用本地视频文件 2) 联系管理员配置CORS 3) 使用支持的视频源');
    }

    throw new Error(`视频拼接失败: ${error}`);
  }
}

/**
 * 从视频中提取音频 - 使用FFmpeg
 * @param file 视频文件
 * @param options 提取选项
 * @returns Promise包裹的音频Blob URL
 */
export async function extractAudioFromVideo(
  file: File,
  options: {
    outputFormat?: 'mp3' | 'wav' | 'aac' | 'ogg';  // 输出音频格式
    audioQuality?: string;                           // 音频质量 如 '128k', '256k'
    startTime?: number;                             // 开始时间(秒)
    endTime?: number;                               // 结束时间(秒)
    sampleRate?: number;                            // 采样率 如 44100, 48000
    channels?: number;                              // 声道数 1=单声道, 2=立体声
  } = {}
): Promise<string> {
  const progressDiv = showProgress('初始化FFmpeg...');

  try {
    updateProgress(progressDiv, '加载FFmpeg核心...');
    const ffmpeg = await getFFmpegInstance();

    updateProgress(progressDiv, '处理视频文件...');

    // 设置默认参数
    const outputFormat = options.outputFormat || 'mp3';
    const audioQuality = options.audioQuality || '128k';
    const sampleRate = options.sampleRate || 44100;
    const channels = options.channels || 2;

    // 写入输入文件
    const inputName = `input.${file.name.split('.').pop()}`;
    const outputName = `output.${outputFormat}`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    updateProgress(progressDiv, '提取音频...');

    // 构建FFmpeg命令
    let ffmpegArgs: string[] = [];

    if (options.startTime !== undefined || options.endTime !== undefined) {
      // 如果指定了时间范围
      if (options.startTime !== undefined) {
        ffmpegArgs.push('-ss', `${options.startTime}`);
      }
      if (options.endTime !== undefined && options.startTime !== undefined) {
        ffmpegArgs.push('-t', `${options.endTime - options.startTime}`);
      }
    }

    ffmpegArgs.push('-i', inputName);

    // 设置音频编码参数
    switch (outputFormat) {
      case 'mp3':
        ffmpegArgs.push('-codec:a', 'libmp3lame');
        ffmpegArgs.push('-b:a', audioQuality);
        break;
      case 'wav':
        ffmpegArgs.push('-codec:a', 'pcm_s16le');
        break;
      case 'aac':
        ffmpegArgs.push('-codec:a', 'aac');
        ffmpegArgs.push('-b:a', audioQuality);
        break;
      case 'ogg':
        ffmpegArgs.push('-codec:a', 'libvorbis');
        ffmpegArgs.push('-b:a', audioQuality);
        break;
    }

    // 设置采样率和声道
    ffmpegArgs.push('-ar', `${sampleRate}`);
    ffmpegArgs.push('-ac', `${channels}`);

    // 只提取音频，不要视频
    ffmpegArgs.push('-vn');

    ffmpegArgs.push(outputName);

    await ffmpeg.exec(ffmpegArgs);

    updateProgress(progressDiv, '生成音频文件...');

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `audio/${outputFormat === 'ogg' ? 'ogg' : outputFormat}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = URL.createObjectURL(blob);

    hideProgress(progressDiv);
    console.log('音频提取完成，大小:', blob.size, 'bytes');

    return url;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('音频提取失败:', error);
    throw new Error(`音频提取失败: ${error}`);
  }
}

/**
 * 为视频添加音频轨道 - 使用FFmpeg
 * @param videoFile 视频文件
 * @param audioFile 音频文件  
 * @param options 合成选项
 * @returns Promise包裹的合成后的视频Blob URL
 */
export async function addAudioToVideo(
  videoFile: File,
  audioFile: File,
  options: {
    outputFormat?: string;        // 输出格式
    videoCodec?: string;         // 视频编码器
    audioCodec?: string;         // 音频编码器
    audioVolume?: number;        // 音频音量 (0.0-2.0)
    replaceOriginalAudio?: boolean; // 是否替换原音频
    audioDelay?: number;         // 音频延迟(秒)
  } = {}
): Promise<string> {
  const progressDiv = showProgress('初始化FFmpeg...');

  try {
    updateProgress(progressDiv, '加载FFmpeg核心...');
    const ffmpeg = await getFFmpegInstance();

    updateProgress(progressDiv, '处理输入文件...');

    // 设置默认参数
    const outputFormat = options.outputFormat || 'mp4';
    const videoCodec = options.videoCodec || 'libx264';
    const audioCodec = options.audioCodec || 'aac';
    const audioVolume = options.audioVolume || 1.0;
    const audioDelay = options.audioDelay || 0;

    // 写入输入文件
    const videoName = `video.${videoFile.name.split('.').pop()}`;
    const audioName = `audio.${audioFile.name.split('.').pop()}`;
    const outputName = `output.${outputFormat}`;

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(audioName, await fetchFile(audioFile));

    updateProgress(progressDiv, '合成音视频...');

    // 构建FFmpeg命令
    let ffmpegArgs: string[] = ['-i', videoName, '-i', audioName];

    if (options.replaceOriginalAudio) {
      // 替换原音频
      ffmpegArgs.push('-c:v', 'copy');  // 复制视频流
      if (audioDelay !== 0) {
        ffmpegArgs.push('-filter:a', `adelay=${audioDelay * 1000}|${audioDelay * 1000},volume=${audioVolume}`);
      } else {
        ffmpegArgs.push('-filter:a', `volume=${audioVolume}`);
      }
      ffmpegArgs.push('-c:a', audioCodec);
      ffmpegArgs.push('-map', '0:v:0');  // 使用第一个输入的视频
      ffmpegArgs.push('-map', '1:a:0');  // 使用第二个输入的音频
    } else {
      // 混合原音频和新音频
      let filterComplex = '';
      if (audioDelay !== 0) {
        filterComplex = `[1:a]adelay=${audioDelay * 1000}|${audioDelay * 1000},volume=${audioVolume}[a1];[0:a][a1]amix=inputs=2[aout]`;
      } else {
        filterComplex = `[1:a]volume=${audioVolume}[a1];[0:a][a1]amix=inputs=2[aout]`;
      }

      ffmpegArgs.push('-filter_complex', filterComplex);
      ffmpegArgs.push('-map', '0:v:0');
      ffmpegArgs.push('-map', '[aout]');
      ffmpegArgs.push('-c:v', videoCodec);
      ffmpegArgs.push('-c:a', audioCodec);
    }

    ffmpegArgs.push('-movflags', '+faststart');
    ffmpegArgs.push(outputName);

    await ffmpeg.exec(ffmpegArgs);

    updateProgress(progressDiv, '生成结果文件...');

    // 读取输出文件
    const data = await ffmpeg.readFile(outputName);
    const mimeType = `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`;
    const blob = new Blob([data as Uint8Array], { type: mimeType });
    const url = createPlayableVideoUrl(blob);

    hideProgress(progressDiv);
    console.log('音视频合成完成，大小:', blob.size, 'bytes');

    return url;
  } catch (error) {
    hideProgress(progressDiv);
    console.error('音视频合成失败:', error);
    throw new Error(`音视频合成失败: ${error}`);
  }
}