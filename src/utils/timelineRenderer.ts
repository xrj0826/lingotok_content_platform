/**
 * 时间轴渲染器 - 基于OpenCut架构
 * 实现多轨道实时合成和预览
 */

import type { RenderContext, TimelineTrack, TimelineElement, MediaFile, ActiveElement } from '@/types/timeline';
import { videoCache } from './videoCache';

/**
 * 渲染时间轴的指定时间帧
 */
export async function renderTimelineFrame(context: RenderContext): Promise<void> {
  const {
    ctx,
    time,
    canvasWidth,
    canvasHeight,
    tracks,
    mediaFiles,
    backgroundType = 'color',
    backgroundColor = '#000000',
    blurIntensity = 10
  } = context;

  try {
    // 1. 清除画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 2. 绘制背景
    if (backgroundType === "blur") {
      await drawBlurredBackground(ctx, time, tracks, mediaFiles, canvasWidth, canvasHeight, blurIntensity);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 3. 收集所有活动元素
    const activeElements = getActiveElements(time, tracks, mediaFiles);

    // 4. 按轨道层级顺序渲染（实现多轨道合并）
    const sortedActiveElements = sortElementsByRenderOrder(activeElements, tracks);

    // 5. 逐层渲染视频帧
    for (const activeElement of sortedActiveElements) {
      await renderActiveElement(ctx, activeElement, time, canvasWidth, canvasHeight);
    }

  } catch (error) {
    console.error('Timeline rendering failed:', error);

    // 绘制错误提示
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('渲染错误', canvasWidth / 2, canvasHeight / 2);
  }
}

/**
 * 获取指定时间的所有活动元素
 */
function getActiveElements(time: number, tracks: TimelineTrack[], mediaFiles: MediaFile[]): ActiveElement[] {
  const activeElements: ActiveElement[] = [];

  tracks.forEach((track) => {
    if (track.muted) return;

    track.elements.forEach((element) => {
      if (element.hidden) return;

      const effectiveStart = element.startTime;
      const effectiveEnd = element.startTime +
        (element.duration - element.trimStart - element.trimEnd);

      // 检查元素是否在当前时间点活跃
      if (time >= effectiveStart && time < effectiveEnd) {
        const mediaItem = element.mediaId
          ? mediaFiles.find(m => m.id === element.mediaId) || null
          : null;

        activeElements.push({ element, track, mediaItem });
      }
    });
  });

  return activeElements;
}

/**
 * 按渲染顺序排序元素
 */
function sortElementsByRenderOrder(activeElements: ActiveElement[], tracks: TimelineTrack[]): ActiveElement[] {
  return activeElements.sort((a, b) => {
    const trackA = a.track;
    const trackB = b.track;

    // 文本轨道优先级最高（在最上层）
    if (trackA.type === "text" && trackB.type !== "text") return 1;
    if (trackB.type === "text" && trackA.type !== "text") return -1;

    // 音频轨道优先级最低（但不渲染视觉内容）
    if (trackA.type === "audio" && trackB.type !== "audio") return -1;
    if (trackB.type === "audio" && trackA.type !== "audio") return 1;

    // 主轨道在其他媒体轨道之下
    if (trackA.isMain && !trackB.isMain) return -1;
    if (trackB.isMain && !trackA.isMain) return 1;

    // 按轨道在数组中的位置排序
    const indexA = tracks.findIndex(t => t.id === trackA.id);
    const indexB = tracks.findIndex(t => t.id === trackB.id);
    return indexA - indexB;
  });
}

/**
 * 渲染单个活动元素
 */
async function renderActiveElement(
  ctx: CanvasRenderingContext2D,
  activeElement: ActiveElement,
  time: number,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  const { element, track, mediaItem } = activeElement;

  // 跳过音频轨道（不渲染视觉内容）
  if (track.type === "audio") return;

  if (element.type === "media" && mediaItem) {
    await renderMediaElement(ctx, element, mediaItem, time, canvasWidth, canvasHeight);
  } else if (element.type === "text") {
    renderTextElement(ctx, element, time, canvasWidth, canvasHeight);
  }
}

/**
 * 渲染媒体元素（视频/图片）
 */
async function renderMediaElement(
  ctx: CanvasRenderingContext2D,
  element: TimelineElement,
  mediaItem: MediaFile,
  time: number,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  if (mediaItem.type === "video") {
    // 计算在媒体文件中的本地时间
    const localTime = time - element.startTime + element.trimStart;

    try {
      // 从视频缓存获取当前帧
      const frame = await videoCache.getFrameAt(mediaItem.id, mediaItem.file, localTime);
      if (!frame) return;

      // 计算绘制尺寸和位置（contain模式保持比例）
      const mediaW = Math.max(1, mediaItem.width || canvasWidth);
      const mediaH = Math.max(1, mediaItem.height || canvasHeight);
      const containScale = Math.min(canvasWidth / mediaW, canvasHeight / mediaH);
      const drawW = mediaW * containScale;
      const drawH = mediaH * containScale;
      const drawX = (canvasWidth - drawW) / 2;
      const drawY = (canvasHeight - drawH) / 2;

      // 绘制到画布
      ctx.drawImage(frame.canvas, drawX, drawY, drawW, drawH);

    } catch (error) {
      console.error('Failed to render video frame:', error);
      renderErrorPlaceholder(ctx, canvasWidth, canvasHeight, '视频渲染失败');
    }

  } else if (mediaItem.type === "image") {
    try {
      // 渲染图片
      const img = await getImageElement(mediaItem);
      const mediaW = img.naturalWidth || canvasWidth;
      const mediaH = img.naturalHeight || canvasHeight;
      const containScale = Math.min(canvasWidth / mediaW, canvasHeight / mediaH);
      const drawW = mediaW * containScale;
      const drawH = mediaH * containScale;
      const drawX = (canvasWidth - drawW) / 2;
      const drawY = (canvasHeight - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

    } catch (error) {
      console.error('Failed to render image:', error);
      renderErrorPlaceholder(ctx, canvasWidth, canvasHeight, '图片渲染失败');
    }
  }
}

/**
 * 渲染文本元素
 */
function renderTextElement(
  ctx: CanvasRenderingContext2D,
  element: TimelineElement,
  time: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  // 简单的文本渲染实现
  ctx.save();

  // 设置文本样式
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 添加描边效果
  ctx.strokeText(element.name, canvasWidth / 2, canvasHeight / 2);
  ctx.fillText(element.name, canvasWidth / 2, canvasHeight / 2);

  ctx.restore();
}

/**
 * 绘制模糊背景
 */
async function drawBlurredBackground(
  ctx: CanvasRenderingContext2D,
  time: number,
  tracks: TimelineTrack[],
  mediaFiles: MediaFile[],
  canvasWidth: number,
  canvasHeight: number,
  blurIntensity: number = 10
): Promise<void> {
  // 查找主轨道的活动视频元素
  const mainTrack = tracks.find(track => track.isMain && track.type === "media");
  if (!mainTrack) {
    // 没有主轨道，使用纯色背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    return;
  }

  // 查找当前时间的活动元素
  const activeElement = mainTrack.elements.find(element => {
    const effectiveStart = element.startTime;
    const effectiveEnd = element.startTime +
      (element.duration - element.trimStart - element.trimEnd);
    return time >= effectiveStart && time < effectiveEnd;
  });

  if (!activeElement || !activeElement.mediaId) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    return;
  }

  const mediaItem = mediaFiles.find(m => m.id === activeElement.mediaId);
  if (!mediaItem || mediaItem.type !== "video") {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    return;
  }

  try {
    // 获取视频帧
    const localTime = time - activeElement.startTime + activeElement.trimStart;
    const frame = await videoCache.getFrameAt(mediaItem.id, mediaItem.file, localTime);

    if (frame) {
      // 绘制全屏背景
      ctx.save();
      ctx.filter = `blur(${blurIntensity}px)`;
      ctx.drawImage(frame.canvas, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();

      // 添加半透明遮罩
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  } catch (error) {
    console.error('Failed to render blurred background:', error);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

/**
 * 获取图片元素
 */
async function getImageElement(mediaItem: MediaFile): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.crossOrigin = 'anonymous';
    img.src = mediaItem.url;
  });
}

/**
 * 渲染错误占位符
 */
function renderErrorPlaceholder(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  message: string
): void {
  ctx.save();

  // 绘制错误背景
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 绘制错误文本
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, canvasWidth / 2, canvasHeight / 2);

  ctx.restore();
}

/**
 * 创建帧预览
 */
export async function createFramePreview(
  tracks: TimelineTrack[],
  mediaFiles: MediaFile[],
  time: number,
  width: number = 320,
  height: number = 180
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot create canvas context');
  }

  await renderTimelineFrame({
    ctx,
    time,
    canvasWidth: width,
    canvasHeight: height,
    tracks,
    mediaFiles,
    backgroundType: 'color',
    backgroundColor: '#000000'
  });

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * 批量生成预览帧
 */
export async function generateTimelinePreview(
  tracks: TimelineTrack[],
  mediaFiles: MediaFile[],
  duration: number,
  frameCount: number = 10,
  width: number = 160,
  height: number = 90
): Promise<string[]> {
  const previews: string[] = [];
  const interval = duration / frameCount;

  for (let i = 0; i < frameCount; i++) {
    const time = i * interval;
    try {
      const preview = await createFramePreview(tracks, mediaFiles, time, width, height);
      previews.push(preview);
    } catch (error) {
      console.error(`Failed to generate preview for time ${time}:`, error);
      // 添加错误占位符
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderErrorPlaceholder(ctx, width, height, '预览失败');
        previews.push(canvas.toDataURL('image/jpeg', 0.8));
      }
    }
  }

  return previews;
}
