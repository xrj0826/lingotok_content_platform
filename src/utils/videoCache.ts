/**
 * 视频帧缓存系统 - 基于OpenCut架构
 * 提供高效的视频帧访问和缓存管理
 */

import type { VideoFrame } from '@/types/timeline';

/**
 * 视频Sink数据
 */
interface VideoSinkData {
  videoElement: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  currentFrame: VideoFrame | null;
  lastTime: number;
  duration: number;
  width: number;
  height: number;
  isLoaded: boolean;
  loadPromise: Promise<void> | null;
}

/**
 * 简化的视频缓存实现
 * 使用HTMLVideoElement + Canvas来模拟MediaBunny的功能
 */
export class VideoCache {
  private sinks = new Map<string, VideoSinkData>();
  private maxCacheSize = 100; // 最大缓存帧数
  private frameCache = new Map<string, VideoFrame>(); // 帧缓存

  /**
   * 获取指定时间的视频帧
   */
  async getFrameAt(mediaId: string, file: File, time: number): Promise<VideoFrame | null> {
    try {
      await this.ensureSink(mediaId, file);
      const sinkData = this.sinks.get(mediaId);
      if (!sinkData || !sinkData.isLoaded) return null;

      // 检查缓存
      const cacheKey = `${mediaId}_${time.toFixed(3)}`;
      if (this.frameCache.has(cacheKey)) {
        return this.frameCache.get(cacheKey)!;
      }

      // 跳转到指定时间
      await this.seekTo(sinkData, time);

      // 渲染当前帧到canvas
      const frame = this.renderCurrentFrame(sinkData, time);

      // 缓存帧
      if (frame) {
        this.cacheFrame(cacheKey, frame);
      }

      return frame;
    } catch (error) {
      console.error(`Failed to get frame at time ${time}:`, error);
      return null;
    }
  }

  /**
   * 确保视频Sink已初始化
   */
  private async ensureSink(mediaId: string, file: File): Promise<void> {
    if (this.sinks.has(mediaId)) {
      const sinkData = this.sinks.get(mediaId)!;
      if (sinkData.loadPromise) {
        await sinkData.loadPromise;
      }
      return;
    }

    await this.initializeSink(mediaId, file);
  }

  /**
   * 初始化视频Sink
   */
  private async initializeSink(mediaId: string, file: File): Promise<void> {
    const videoElement = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot create canvas context');
    }

    const sinkData: VideoSinkData = {
      videoElement,
      canvas,
      ctx,
      currentFrame: null,
      lastTime: -1,
      duration: 0,
      width: 0,
      height: 0,
      isLoaded: false,
      loadPromise: null
    };

    this.sinks.set(mediaId, sinkData);

    // 创建加载Promise
    sinkData.loadPromise = new Promise((resolve, reject) => {
      const handleLoadedMetadata = () => {
        sinkData.duration = videoElement.duration;
        sinkData.width = videoElement.videoWidth;
        sinkData.height = videoElement.videoHeight;

        // 设置canvas尺寸
        canvas.width = sinkData.width;
        canvas.height = sinkData.height;

        sinkData.isLoaded = true;

        // 清理事件监听器
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('error', handleError);

        resolve();
      };

      const handleError = (error: any) => {
        console.error('Video loading error:', error);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('error', handleError);
        reject(new Error(`Failed to load video: ${error}`));
      };

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('error', handleError);

      // 设置视频源
      videoElement.crossOrigin = 'anonymous';
      videoElement.preload = 'metadata';
      videoElement.src = URL.createObjectURL(file);
    });

    await sinkData.loadPromise;
  }

  /**
   * 跳转到指定时间
   */
  private async seekTo(sinkData: VideoSinkData, time: number): Promise<void> {
    const { videoElement } = sinkData;

    // 如果时间已经是当前时间，无需跳转
    if (Math.abs(videoElement.currentTime - time) < 0.01) {
      return;
    }

    return new Promise((resolve, reject) => {
      const handleSeeked = () => {
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = (error: any) => {
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('error', handleError);
        reject(new Error(`Seek failed: ${error}`));
      };

      videoElement.addEventListener('seeked', handleSeeked);
      videoElement.addEventListener('error', handleError);

      // 设置超时
      setTimeout(() => {
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('error', handleError);
        resolve(); // 超时也认为成功，继续处理
      }, 1000);

      videoElement.currentTime = Math.max(0, Math.min(time, sinkData.duration));
    });
  }

  /**
   * 渲染当前帧
   */
  private renderCurrentFrame(sinkData: VideoSinkData, time: number): VideoFrame | null {
    const { videoElement, canvas, ctx } = sinkData;

    try {
      // 清除canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制视频帧
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // 创建帧副本
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = canvas.width;
      frameCanvas.height = canvas.height;
      const frameCtx = frameCanvas.getContext('2d');

      if (frameCtx) {
        frameCtx.drawImage(canvas, 0, 0);

        return {
          canvas: frameCanvas,
          time
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to render frame:', error);
      return null;
    }
  }

  /**
   * 缓存帧
   */
  private cacheFrame(key: string, frame: VideoFrame): void {
    // 如果缓存已满，删除最旧的帧
    if (this.frameCache.size >= this.maxCacheSize) {
      const firstKey = this.frameCache.keys().next().value;
      if (firstKey) {
        this.frameCache.delete(firstKey);
      }
    }

    this.frameCache.set(key, frame);
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(mediaId: string, file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  } | null> {
    try {
      await this.ensureSink(mediaId, file);
      const sinkData = this.sinks.get(mediaId);

      if (sinkData && sinkData.isLoaded) {
        return {
          duration: sinkData.duration,
          width: sinkData.width,
          height: sinkData.height
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get video info:', error);
      return null;
    }
  }

  /**
   * 预加载视频帧
   */
  async preloadFrames(mediaId: string, file: File, times: number[]): Promise<void> {
    try {
      await this.ensureSink(mediaId, file);

      for (const time of times) {
        await this.getFrameAt(mediaId, file, time);
      }
    } catch (error) {
      console.error('Failed to preload frames:', error);
    }
  }

  /**
   * 清除指定视频的缓存
   */
  clearVideoCache(mediaId: string): void {
    // 清除帧缓存
    const keysToDelete = Array.from(this.frameCache.keys())
      .filter(key => key.startsWith(`${mediaId}_`));

    keysToDelete.forEach(key => {
      this.frameCache.delete(key);
    });

    // 清除sink
    const sinkData = this.sinks.get(mediaId);
    if (sinkData) {
      // 释放video元素资源
      if (sinkData.videoElement.src) {
        URL.revokeObjectURL(sinkData.videoElement.src);
      }
      this.sinks.delete(mediaId);
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    // 清除所有帧缓存
    this.frameCache.clear();

    // 清除所有sinks
    this.sinks.forEach((sinkData, mediaId) => {
      if (sinkData.videoElement.src) {
        URL.revokeObjectURL(sinkData.videoElement.src);
      }
    });
    this.sinks.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    sinkCount: number;
    frameCount: number;
    memoryUsage: string;
  } {
    const frameCount = this.frameCache.size;
    const sinkCount = this.sinks.size;

    // 估算内存使用量
    let memoryUsage = 0;
    this.frameCache.forEach(frame => {
      memoryUsage += frame.canvas.width * frame.canvas.height * 4; // RGBA
    });

    return {
      sinkCount,
      frameCount,
      memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)} MB`
    };
  }
}

// 创建全局实例
export const videoCache = new VideoCache();
