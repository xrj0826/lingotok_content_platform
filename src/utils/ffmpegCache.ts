/**
 * FFmpeg缓存管理器
 * 实现FFmpeg实例的单例模式和持久化缓存
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { getFFmpegInstance } from './ffmpegConfig';
import { isBrowser } from './isBrowser';

// FFmpeg实例缓存
class FFmpegCacheManager {
  private static instance: FFmpegCacheManager;
  private ffmpegInstance: FFmpeg | null = null;
  private isPreloading: boolean = false;
  private preloadPromise: Promise<FFmpeg> | null = null;
  private lastUsedTimestamp: number = 0;

  // 获取单例
  public static getInstance(): FFmpegCacheManager {
    if (!FFmpegCacheManager.instance) {
      FFmpegCacheManager.instance = new FFmpegCacheManager();
    }
    return FFmpegCacheManager.instance;
  }

  // 获取FFmpeg实例，如果没有则创建
  public async getFFmpeg(): Promise<FFmpeg> {
    // 确保在浏览器环境中
    if (!isBrowser) {
      console.warn('非浏览器环境无法加载FFmpeg');
      throw new Error('FFmpeg只能在浏览器环境中加载');
    }

    // 如果正在预加载中，返回预加载的Promise
    if (this.isPreloading && this.preloadPromise) {
      return this.preloadPromise;
    }

    // 如果已有实例且已加载，直接返回
    if (this.ffmpegInstance?.loaded) {
      this.updateLastUsedTimestamp();
      return this.ffmpegInstance;
    }

    // 创建新实例（静默模式，无日志）
    this.ffmpegInstance = await getFFmpegInstance();
    this.updateLastUsedTimestamp();
    return this.ffmpegInstance;
  }

  // 预加载FFmpeg实例
  public preloadFFmpeg(): Promise<FFmpeg> {
    // 确保在浏览器环境中
    if (!isBrowser) {
      console.warn('非浏览器环境无法预加载FFmpeg');
      return Promise.reject(new Error('FFmpeg只能在浏览器环境中加载'));
    }

    // 如果已经有实例或正在预加载，返回现有的
    if (this.ffmpegInstance?.loaded) {
      return Promise.resolve(this.ffmpegInstance);
    }

    if (this.isPreloading && this.preloadPromise) {
      return this.preloadPromise;
    }

    // 开始预加载（静默模式，无日志）
    this.isPreloading = true;

    this.preloadPromise = getFFmpegInstance()
      .then(ffmpeg => {
        // 成功加载，静默处理
        this.ffmpegInstance = ffmpeg;
        this.updateLastUsedTimestamp();
        return ffmpeg;
      })
      .catch(error => {
        // 加载失败，静默处理
        this.ffmpegInstance = null;
        throw error;
      })
      .finally(() => {
        this.isPreloading = false;
      });

    return this.preloadPromise;
  }

  // 更新最后使用时间戳
  private updateLastUsedTimestamp(): void {
    this.lastUsedTimestamp = Date.now();
  }

  // 获取缓存状态
  public getStatus(): {
    isLoaded: boolean;
    isPreloading: boolean;
    lastUsedTimestamp: number;
  } {
    return {
      isLoaded: !!this.ffmpegInstance?.loaded,
      isPreloading: this.isPreloading,
      lastUsedTimestamp: this.lastUsedTimestamp,
    };
  }
}

// 导出便捷函数
export const getFFmpeg = async (): Promise<FFmpeg> => {
  return FFmpegCacheManager.getInstance().getFFmpeg();
};

export const preloadFFmpeg = (): Promise<FFmpeg> => {
  return FFmpegCacheManager.getInstance().preloadFFmpeg();
};

export const getFFmpegStatus = (): {
  isLoaded: boolean;
  isPreloading: boolean;
  lastUsedTimestamp: number;
} => {
  return FFmpegCacheManager.getInstance().getStatus();
};
