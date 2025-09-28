/**
 * FFmpeg缓存管理器
 * 实现FFmpeg实例的单例模式和持久化缓存
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { getFFmpegInstance } from './ffmpegConfig';
import { isBrowser } from './isBrowser';

// 缓存键名
const FFMPEG_LOADED_FLAG = 'ffmpeg_initialized_flag';
const FFMPEG_LOAD_TIMESTAMP = 'ffmpeg_load_timestamp'; // 加载时间戳
const FFMPEG_SESSION_ID = 'ffmpeg_session_id'; // 会话ID
const FFMPEG_CACHE_VERSION = 'v1'; // 缓存版本，用于在需要时强制刷新缓存

// FFmpeg实例缓存
class FFmpegCacheManager {
  private static instance: FFmpegCacheManager;
  private ffmpegInstance: FFmpeg | null = null;
  private isPreloading: boolean = false;
  private preloadPromise: Promise<FFmpeg> | null = null;
  private lastUsedTimestamp: number = 0;
  private sessionLoaded: boolean = false;

  // 获取单例
  public static getInstance(): FFmpegCacheManager {
    if (!FFmpegCacheManager.instance) {
      FFmpegCacheManager.instance = new FFmpegCacheManager();
    }
    return FFmpegCacheManager.instance;
  }

  // 生成唯一的会话ID
  private generateSessionId(): string {
    return `ffmpeg-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // 获取或创建会话ID
  private getOrCreateSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem(FFMPEG_SESSION_ID);
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem(FFMPEG_SESSION_ID, sessionId);
      }
      return sessionId;
    } catch (e) {
      console.warn('无法访问sessionStorage，创建临时会话ID:', e);
      return this.generateSessionId();
    }
  }

  // 增强版会话检查 - 检查多个存储位置以提高可靠性
  private checkSessionLoaded(): boolean {
    if (this.sessionLoaded) return true;

    try {
      // 首先检查内存中的状态
      if (this.ffmpegInstance?.loaded) {
        this.sessionLoaded = true;
        return true;
      }

      // 检查sessionStorage - 针对当前浏览器标签
      const sessionFlag = sessionStorage.getItem(FFMPEG_LOADED_FLAG) === 'true';

      // 检查localStorage - 针对跨标签共享
      const localFlag = localStorage.getItem(FFMPEG_LOADED_FLAG) === 'true';

      // 检查加载时间戳，判断是否过期（缓存有效期24小时）
      const loadTimestamp = parseInt(localStorage.getItem(FFMPEG_LOAD_TIMESTAMP) || '0', 10);
      const isTimestampValid = (Date.now() - loadTimestamp) < 24 * 60 * 60 * 1000;

      // 版本检查，确保使用正确的缓存版本
      const cacheVersion = localStorage.getItem('ffmpeg_cache_version');
      const isVersionValid = cacheVersion === FFMPEG_CACHE_VERSION;

      // 综合判断是否已加载
      this.sessionLoaded = (sessionFlag || (localFlag && isTimestampValid && isVersionValid));

      if (this.sessionLoaded) {
        console.log('📋 [FFmpegCache] 缓存状态检查:', {
          memoryLoaded: !!this.ffmpegInstance?.loaded,
          sessionFlag,
          localFlag,
          loadTimestamp: new Date(loadTimestamp).toLocaleString(),
          isTimestampValid,
          cacheVersion,
          isVersionValid
        });
      }

      return this.sessionLoaded;
    } catch (e) {
      console.warn('无法访问存储:', e);
      return false;
    }
  }

  // 增强版标记已加载 - 同时更新多个存储位置
  private markSessionLoaded(): void {
    this.sessionLoaded = true;
    const currentTime = Date.now();

    try {
      // 记录到sessionStorage（当前标签页）
      sessionStorage.setItem(FFMPEG_LOADED_FLAG, 'true');

      // 记录到localStorage（跨标签页共享）
      localStorage.setItem(FFMPEG_LOADED_FLAG, 'true');
      localStorage.setItem(FFMPEG_LOAD_TIMESTAMP, currentTime.toString());
      localStorage.setItem('ffmpeg_cache_version', FFMPEG_CACHE_VERSION);

      console.log('💾 [FFmpegCache] 已标记FFmpeg加载状态，时间:', new Date(currentTime).toLocaleString());
    } catch (e) {
      console.warn('无法写入存储:', e);
    }
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
      console.log('🔄 正在预加载FFmpeg，等待完成...');
      return this.preloadPromise;
    }

    // 如果已有实例且已加载，直接返回
    if (this.ffmpegInstance?.loaded) {
      console.log('✅ 使用已加载的FFmpeg实例');
      this.updateLastUsedTimestamp();
      return this.ffmpegInstance;
    }

    // 检查是否已在当前会话中加载过
    const wasLoadedInSession = this.checkSessionLoaded();
    if (wasLoadedInSession) {
      console.log('🔍 检测到FFmpeg已在此会话中加载过，使用全新实例避免重新加载');
    }

    // 创建新实例（静默模式，无日志）
    this.ffmpegInstance = await getFFmpegInstance(wasLoadedInSession);
    this.updateLastUsedTimestamp();

    // 标记已加载
    this.markSessionLoaded();

    return this.ffmpegInstance;
  }

  // 预加载FFmpeg实例（增强版）
  public preloadFFmpeg(): Promise<FFmpeg> {
    // 确保在浏览器环境中
    if (!isBrowser) {
      console.warn('⚠️ [FFmpegCache] 非浏览器环境无法预加载FFmpeg');
      return Promise.reject(new Error('FFmpeg只能在浏览器环境中加载'));
    }

    // 如果已经有实例或正在预加载，返回现有的
    if (this.ffmpegInstance?.loaded) {
      console.log('✅ [FFmpegCache] FFmpeg已加载，无需预加载');
      this.updateLastUsedTimestamp();
      return Promise.resolve(this.ffmpegInstance);
    }

    if (this.isPreloading && this.preloadPromise) {
      console.log('🔄 [FFmpegCache] FFmpeg正在预加载中，返回现有Promise');
      return this.preloadPromise;
    }

    // 检查是否已在当前会话中加载过
    const wasLoadedInSession = this.checkSessionLoaded();

    // 记录会话ID，用于调试跟踪
    const sessionId = this.getOrCreateSessionId();
    const loadStartTime = performance.now();

    console.log(`🚀 [FFmpegCache] 开始预加载FFmpeg (会话ID: ${sessionId})...`);

    if (wasLoadedInSession) {
      console.log('🔍 [FFmpegCache] 检测到FFmpeg已在此会话中加载过，使用快速模式加载');
    }

    // 标记正在预加载
    this.isPreloading = true;

    // 创建具有超时监控和进度反馈的预加载过程
    this.preloadPromise = new Promise<FFmpeg>((resolve, reject) => {
      // 设置加载超时监控（但不中断加载）
      const loadingInterval = setInterval(() => {
        const elapsed = Math.round((performance.now() - loadStartTime) / 1000);
        console.log(`⏱️ [FFmpegCache] FFmpeg加载进行中 - 已耗时${elapsed}秒...`);
      }, 5000); // 每5秒输出一次加载状态

      // 实际执行加载过程
      getFFmpegInstance(wasLoadedInSession)
        .then(ffmpeg => {
          clearInterval(loadingInterval);

          const loadTime = (performance.now() - loadStartTime) / 1000;
          console.log(`✅ [FFmpegCache] FFmpeg预加载成功! 用时: ${loadTime.toFixed(2)}秒`);

          // 更新实例和状态
          this.ffmpegInstance = ffmpeg;
          this.updateLastUsedTimestamp();
          this.markSessionLoaded(); // 标记已加载

          resolve(ffmpeg);
        })
        .catch(error => {
          clearInterval(loadingInterval);
          console.error('❌ [FFmpegCache] FFmpeg预加载失败:', error);
          this.ffmpegInstance = null;
          reject(error);
        })
        .finally(() => {
          this.isPreloading = false;
        });
    });

    return this.preloadPromise;
  }

  // 更新最后使用时间戳
  private updateLastUsedTimestamp(): void {
    this.lastUsedTimestamp = Date.now();
  }

  // 获取增强版缓存状态
  public getStatus(): {
    isLoaded: boolean;
    isPreloading: boolean;
    lastUsedTimestamp: number;
    sessionLoaded: boolean;
    sessionId?: string;
    cacheInfo?: {
      sessionStorage: boolean;
      localStorage: boolean;
      loadTimestamp?: number;
      cacheVersion?: string;
      isValid: boolean;
    };
  } {
    // 获取详细的缓存信息
    let cacheInfo;
    try {
      const sessionFlag = sessionStorage.getItem(FFMPEG_LOADED_FLAG) === 'true';
      const localFlag = localStorage.getItem(FFMPEG_LOADED_FLAG) === 'true';
      const loadTimestamp = parseInt(localStorage.getItem(FFMPEG_LOAD_TIMESTAMP) || '0', 10);
      const isTimestampValid = (Date.now() - loadTimestamp) < 24 * 60 * 60 * 1000;
      const cacheVersion = localStorage.getItem('ffmpeg_cache_version');
      const isVersionValid = cacheVersion === FFMPEG_CACHE_VERSION;

      cacheInfo = {
        sessionStorage: sessionFlag,
        localStorage: localFlag,
        loadTimestamp: loadTimestamp || undefined,
        cacheVersion: cacheVersion || undefined,
        isValid: sessionFlag || (localFlag && isTimestampValid && isVersionValid)
      };
    } catch (e) {
      console.warn('获取缓存信息失败:', e);
    }

    let sessionId;
    try {
      sessionId = sessionStorage.getItem(FFMPEG_SESSION_ID) || undefined;
    } catch (e) {
      // 忽略错误
    }

    return {
      isLoaded: !!this.ffmpegInstance?.loaded,
      isPreloading: this.isPreloading,
      lastUsedTimestamp: this.lastUsedTimestamp,
      sessionLoaded: this.sessionLoaded,
      sessionId,
      cacheInfo
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

export const getFFmpegStatus = () => {
  return FFmpegCacheManager.getInstance().getStatus();
};
