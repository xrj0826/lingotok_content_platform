/**
 * 优化的时间轴渲染器
 * 解决原有渲染系统的卡死问题，提供高性能的实时渲染
 */

import type { TimelineTrack, TimelineElement, MediaFile } from '@/types/timeline';
import { memoryManager } from './memoryManager';

export interface RenderContext {
  time: number;
  canvasWidth: number;
  canvasHeight: number;
  tracks: TimelineTrack[];
  mediaFiles: MediaFile[];
  backgroundType?: 'color' | 'blur';
  backgroundColor?: string;
  blurIntensity?: number;
}

export interface ActiveElement {
  element: TimelineElement;
  track: TimelineTrack;
  mediaFile: MediaFile | null;
  localTime: number;
}

export interface RenderOptions {
  maxFps?: number;
  enableCache?: boolean;
  cacheSize?: number;
  debugMode?: boolean;
}

/**
 * 优化的时间轴渲染器类
 */
export class OptimizedTimelineRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastRenderTime = 0;
  private frameCache = new Map<string, ImageData>();
  private isRendering = false;
  private renderQueue: (() => void)[] = [];

  // 配置选项
  private options: Required<RenderOptions> = {
    maxFps: 60,
    enableCache: true,
    cacheSize: 50,
    debugMode: false
  };

  // 性能统计
  private stats = {
    frameCount: 0,
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lastFps: 0
  };

  constructor(canvas: HTMLCanvasElement, options: RenderOptions = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = { ...this.options, ...options };

    // 注册内存清理回调
    memoryManager.registerCleanupCallback(() => {
      this.clearCache();
    });

    this.log('渲染器初始化完成');
  }

  /**
   * 开始渲染循环
   */
  startRendering(renderCallback: () => void): void {
    if (this.animationFrameId) {
      this.stopRendering();
    }

    this.log('开始渲染循环');
    const targetFrameTime = 1000 / this.options.maxFps;
    let fpsCounter = 0;
    let fpsStartTime = performance.now();

    const render = (currentTime: number) => {
      // 限制帧率
      if (currentTime - this.lastRenderTime >= targetFrameTime) {
        const frameStartTime = performance.now();

        try {
          renderCallback();
          fpsCounter++;

          // 计算FPS
          if (currentTime - fpsStartTime >= 1000) {
            this.stats.lastFps = Math.round((fpsCounter * 1000) / (currentTime - fpsStartTime));
            fpsCounter = 0;
            fpsStartTime = currentTime;
          }

          this.stats.frameCount++;
          this.stats.renderTime += performance.now() - frameStartTime;
        } catch (error) {
          console.error('[OptimizedTimelineRenderer] 渲染回调执行失败:', error);
        }

        this.lastRenderTime = currentTime;
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  /**
   * 停止渲染循环
   */
  stopRendering(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.log('停止渲染循环');
    }
  }

  /**
   * 渲染指定时间的帧
   */
  async renderFrame(context: RenderContext): Promise<void> {
    if (this.isRendering) {
      // 如果正在渲染，将请求加入队列
      return new Promise<void>((resolve) => {
        this.renderQueue.push(resolve);
      });
    }

    this.isRendering = true;
    const frameStartTime = performance.now();

    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(context);

      // 检查缓存
      if (this.options.enableCache && this.frameCache.has(cacheKey)) {
        const cachedFrame = this.frameCache.get(cacheKey)!;
        this.ctx.putImageData(cachedFrame, 0, 0);
        this.stats.cacheHits++;
        this.log(`缓存命中: ${cacheKey}`);
        return;
      }

      this.stats.cacheMisses++;

      // 清除画布
      this.ctx.clearRect(0, 0, context.canvasWidth, context.canvasHeight);

      // 绘制背景
      await this.renderBackground(context);

      // 获取活动元素
      const activeElements = this.getActiveElements(context);

      // 渲染活动元素
      for (const element of activeElements) {
        await this.renderActiveElement(element, context);
      }

      // 缓存结果
      if (this.options.enableCache && this.frameCache.size < this.options.cacheSize) {
        const imageData = this.ctx.getImageData(0, 0, context.canvasWidth, context.canvasHeight);
        this.frameCache.set(cacheKey, imageData);

        // 添加到内存管理器缓存
        memoryManager.addToCache(`timeline_frame_${cacheKey}`, imageData);
      }

      // 调试信息
      if (this.options.debugMode) {
        this.renderDebugInfo(context, activeElements.length);
      }

    } catch (error) {
      console.error('[OptimizedTimelineRenderer] 渲染失败:', error);
      this.renderErrorMessage(context, error as Error);
    } finally {
      this.isRendering = false;

      // 处理队列中的渲染请求
      const queuedCallbacks = this.renderQueue.splice(0);
      queuedCallbacks.forEach(callback => callback());

      // 更新性能统计
      const renderTime = performance.now() - frameStartTime;
      this.stats.renderTime += renderTime;
    }
  }

  /**
   * 渲染背景
   */
  private async renderBackground(context: RenderContext): Promise<void> {
    const { canvasWidth, canvasHeight, backgroundType = 'color', backgroundColor = '#000000' } = context;

    if (backgroundType === 'blur') {
      await this.renderBlurredBackground(context);
    } else {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  /**
   * 渲染模糊背景
   */
  private async renderBlurredBackground(context: RenderContext): Promise<void> {
    // 简化的模糊背景实现
    // 可以根据需要扩展为真正的模糊效果
    const gradient = this.ctx.createLinearGradient(0, 0, context.canvasWidth, context.canvasHeight);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2a2a2a');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, context.canvasWidth, context.canvasHeight);
  }

  /**
   * 获取活动元素
   */
  private getActiveElements(context: RenderContext): ActiveElement[] {
    const { time, tracks, mediaFiles } = context;
    const activeElements: ActiveElement[] = [];

    for (const track of tracks) {
      if (track.muted) continue;

      for (const element of track.elements) {
        const effectiveStart = element.startTime;
        const effectiveDuration = element.duration - element.trimStart - element.trimEnd;
        const effectiveEnd = effectiveStart + effectiveDuration;

        if (time >= effectiveStart && time < effectiveEnd) {
          const mediaFile = element.mediaId ?
            mediaFiles.find(m => m.id === element.mediaId) || null :
            null;

          const localTime = time - effectiveStart + element.trimStart;

          activeElements.push({
            element,
            track,
            mediaFile,
            localTime
          });
        }
      }
    }

    // 按轨道层级排序
    return this.sortElementsByRenderOrder(activeElements);
  }

  /**
   * 按渲染顺序排序元素
   */
  private sortElementsByRenderOrder(elements: ActiveElement[]): ActiveElement[] {
    return elements.sort((a, b) => {
      // 文本轨道在最上层
      if (a.track.type === 'text' && b.track.type !== 'text') return 1;
      if (b.track.type === 'text' && a.track.type !== 'text') return -1;

      // 音频轨道在最下层（不渲染视觉内容）
      if (a.track.type === 'audio' && b.track.type !== 'audio') return -1;
      if (b.track.type === 'audio' && a.track.type !== 'audio') return 1;

      // 主轨道在其他媒体轨道下方
      if (a.track.isMain && !b.track.isMain) return -1;
      if (b.track.isMain && !a.track.isMain) return 1;

      return 0;
    });
  }

  /**
   * 渲染活动元素
   */
  private async renderActiveElement(activeElement: ActiveElement, context: RenderContext): Promise<void> {
    const { element, mediaFile, localTime } = activeElement;
    const { canvasWidth, canvasHeight } = context;

    if (!mediaFile || element.hidden) return;

    try {
      if (mediaFile.type === 'video') {
        await this.renderVideoElement(mediaFile, localTime, canvasWidth, canvasHeight);
      } else if (mediaFile.type === 'image') {
        await this.renderImageElement(mediaFile, canvasWidth, canvasHeight);
      } else if (element.type === 'text') {
        this.renderTextElement(element, canvasWidth, canvasHeight);
      }
    } catch (error) {
      console.warn('[OptimizedTimelineRenderer] 元素渲染失败:', element.id, error);
    }
  }

  /**
   * 渲染视频元素
   */
  private async renderVideoElement(
    mediaFile: MediaFile,
    localTime: number,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    // 这里应该从视频缓存获取帧
    // 暂时使用占位符实现
    const video = await this.getVideoElement(mediaFile);
    if (!video) return;

    video.currentTime = localTime;

    // 等待视频就绪
    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) {
        resolve();
      } else {
        video.addEventListener('loadeddata', () => resolve(), { once: true });
      }
    });

    // 计算绘制尺寸
    const { drawX, drawY, drawW, drawH } = this.calculateDrawRect(
      video.videoWidth || canvasWidth,
      video.videoHeight || canvasHeight,
      canvasWidth,
      canvasHeight
    );

    this.ctx.drawImage(video, drawX, drawY, drawW, drawH);
  }

  /**
   * 渲染图片元素
   */
  private async renderImageElement(
    mediaFile: MediaFile,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    const img = await this.getImageElement(mediaFile);
    if (!img) return;

    const { drawX, drawY, drawW, drawH } = this.calculateDrawRect(
      img.naturalWidth || canvasWidth,
      img.naturalHeight || canvasHeight,
      canvasWidth,
      canvasHeight
    );

    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  /**
   * 渲染文本元素
   */
  private renderTextElement(
    element: TimelineElement,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    this.ctx.save();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ctx.fillText(
      element.name || 'Text',
      canvasWidth / 2,
      canvasHeight / 2
    );

    this.ctx.restore();
  }

  /**
   * 渲染错误信息
   */
  private renderErrorMessage(context: RenderContext, error: Error): void {
    const { canvasWidth, canvasHeight } = context;

    this.ctx.fillStyle = '#ff4444';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('渲染错误', canvasWidth / 2, canvasHeight / 2 - 20);
    this.ctx.fillText(error.message, canvasWidth / 2, canvasHeight / 2 + 20);
  }

  /**
   * 渲染调试信息
   */
  private renderDebugInfo(context: RenderContext, activeElementCount: number): void {
    const { canvasWidth } = context;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(canvasWidth - 200, 10, 190, 100);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';

    const debugInfo = [
      `FPS: ${this.stats.lastFps}`,
      `Frame: ${this.stats.frameCount}`,
      `Cache: ${this.stats.cacheHits}/${this.stats.cacheHits + this.stats.cacheMisses}`,
      `Elements: ${activeElementCount}`,
      `Time: ${context.time.toFixed(2)}s`
    ];

    debugInfo.forEach((info, index) => {
      this.ctx.fillText(info, canvasWidth - 190, 30 + index * 15);
    });

    this.ctx.restore();
  }

  /**
   * 计算绘制矩形（保持比例，居中显示）
   */
  private calculateDrawRect(
    sourceWidth: number,
    sourceHeight: number,
    canvasWidth: number,
    canvasHeight: number
  ): { drawX: number; drawY: number; drawW: number; drawH: number } {
    const scale = Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
    const drawW = sourceWidth * scale;
    const drawH = sourceHeight * scale;
    const drawX = (canvasWidth - drawW) / 2;
    const drawY = (canvasHeight - drawH) / 2;

    return { drawX, drawY, drawW, drawH };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(context: RenderContext): string {
    const { time, tracks } = context;
    const trackHash = tracks
      .map(t => `${t.id}_${t.elements.length}_${t.muted}`)
      .join('|');
    return `${Math.floor(time * 30)}_${this.hashString(trackHash)}`;
  }

  /**
   * 字符串哈希函数
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 获取视频元素
   */
  private async getVideoElement(mediaFile: MediaFile): Promise<HTMLVideoElement | null> {
    try {
      const video = document.createElement('video');
      video.src = mediaFile.url;
      video.muted = true;
      video.playsInline = true;

      return new Promise((resolve) => {
        video.addEventListener('loadedmetadata', () => resolve(video), { once: true });
        video.addEventListener('error', () => resolve(null), { once: true });
      });
    } catch {
      return null;
    }
  }

  /**
   * 获取图片元素
   */
  private async getImageElement(mediaFile: MediaFile): Promise<HTMLImageElement | null> {
    try {
      const img = document.createElement('img');
      img.src = mediaFile.url;

      return new Promise((resolve) => {
        img.addEventListener('load', () => resolve(img), { once: true });
        img.addEventListener('error', () => resolve(null), { once: true });
      });
    } catch {
      return null;
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    const cacheSize = this.frameCache.size;
    this.frameCache.clear();
    this.log(`清空缓存: ${cacheSize}项`);
  }

  /**
   * 获取性能统计
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * 重置性能统计
   */
  resetStats(): void {
    this.stats = {
      frameCount: 0,
      renderTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastFps: 0
    };
  }

  /**
   * 日志输出
   */
  private log(message: string): void {
    if (this.options.debugMode) {
      console.log(`[OptimizedTimelineRenderer] ${message}`);
    }
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.stopRendering();
    this.clearCache();
    this.renderQueue.length = 0;
    this.log('渲染器已销毁');
  }
}






















