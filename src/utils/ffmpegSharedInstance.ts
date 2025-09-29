/**
 * FFmpeg共享实例管理器
 * 确保整个应用程序使用同一个FFmpeg实例，避免重复加载
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { isBrowser } from './isBrowser';

// 全局单例FFmpeg实例
let sharedFFmpegInstance: FFmpeg | null = null;
let isLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;
let isInitialized = false;

// 缓存状态键名
const FFMPEG_LOADED_KEY = 'ffmpeg_shared_loaded';
const FFMPEG_BLOB_URLS_KEY = 'ffmpeg_blob_urls';
const FFMPEG_CACHE_VERSION = 'v3'; // 增加版本号，用于在需要时强制刷新缓存

/**
 * 检查是否已经初始化过FFmpeg
 */
function checkInitialized(): boolean {
  if (isInitialized) return true;

  try {
    // 检查localStorage中的标记
    const loadedFlag = localStorage.getItem(FFMPEG_LOADED_KEY) === FFMPEG_CACHE_VERSION;
    if (loadedFlag) {
      isInitialized = true;
      return true;
    }
  } catch (e) {
    console.warn('无法访问localStorage:', e);
  }

  return false;
}

/**
 * 标记FFmpeg已初始化
 */
function markInitialized(): void {
  isInitialized = true;
  try {
    localStorage.setItem(FFMPEG_LOADED_KEY, FFMPEG_CACHE_VERSION);
  } catch (e) {
    console.warn('无法写入localStorage:', e);
  }
}

/**
 * 获取缓存的BlobURLs
 */
function getCachedBlobURLs(): { coreURL: string; wasmURL: string; workerURL: string } | null {
  try {
    const cachedData = localStorage.getItem(FFMPEG_BLOB_URLS_KEY);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (e) {
    console.warn('无法读取缓存的BlobURLs:', e);
  }
  return null;
}

/**
 * 缓存BlobURLs
 */
function cacheBlobURLs(urls: { coreURL: string; wasmURL: string; workerURL: string }): void {
  try {
    localStorage.setItem(FFMPEG_BLOB_URLS_KEY, JSON.stringify(urls));
  } catch (e) {
    console.warn('无法缓存BlobURLs:', e);
  }
}

/**
 * 获取或创建共享的FFmpeg实例
 * @returns FFmpeg实例
 */
export async function getSharedFFmpegInstance(): Promise<FFmpeg> {
  // 如果已经有实例且已加载，直接返回
  if (sharedFFmpegInstance?.loaded) {
    console.log('✅ [SharedFFmpeg] 返回已加载的FFmpeg实例');
    return sharedFFmpegInstance;
  }

  // 如果正在加载中，返回加载Promise
  if (isLoading && loadPromise) {
    console.log('⏳ [SharedFFmpeg] FFmpeg正在加载中，等待完成...');
    return loadPromise;
  }

  // 开始新的加载流程
  console.log('🚀 [SharedFFmpeg] 开始加载FFmpeg...');
  isLoading = true;

  // 创建加载Promise
  loadPromise = new Promise<FFmpeg>(async (resolve, reject) => {
    try {
      // 创建新的FFmpeg实例
      const ffmpeg = new FFmpeg();

      // 构建基础URL
      const basePath = window.location.origin;
      const ffmpegBasePath = `${basePath}/ffmpeg`;

      // 始终使用直接路径，不使用BlobURL
      // 这样可以避免BlobURL加载失败的问题
      console.log('🔄 [SharedFFmpeg] 使用直接路径加载FFmpeg');
      const loadConfig = {
        coreURL: `${ffmpegBasePath}/ffmpeg-core.js`,
        wasmURL: `${ffmpegBasePath}/ffmpeg-core.wasm`,
        workerURL: `${ffmpegBasePath}/ffmpeg-core.worker.js`,
      };

      // 加载FFmpeg
      console.log('⏳ [SharedFFmpeg] 开始加载FFmpeg核心文件...');
      await ffmpeg.load(loadConfig);

      // 保存实例并标记已初始化
      sharedFFmpegInstance = ffmpeg;
      markInitialized();

      console.log('✅ [SharedFFmpeg] FFmpeg加载成功!');
      resolve(ffmpeg);
    } catch (error) {
      console.error('❌ [SharedFFmpeg] FFmpeg加载失败:', error);

      // 清理状态，允许下次重试
      isLoading = false;
      loadPromise = null;

      reject(error);
    } finally {
      isLoading = false;
    }
  });

  return loadPromise;
}

/**
 * 预加载FFmpeg - 在应用启动时调用
 */
export function preloadSharedFFmpeg(): Promise<FFmpeg> {
  if (!isBrowser) {
    console.warn('⚠️ [SharedFFmpeg] 非浏览器环境，跳过预加载');
    return Promise.reject(new Error('非浏览器环境'));
  }

  console.log('🚀 [SharedFFmpeg] 开始预加载FFmpeg...');
  return getSharedFFmpegInstance();
}

/**
 * 获取FFmpeg加载状态
 */
export function getSharedFFmpegStatus(): {
  isLoaded: boolean;
  isLoading: boolean;
  isInitialized: boolean;
} {
  return {
    isLoaded: !!sharedFFmpegInstance?.loaded,
    isLoading,
    isInitialized
  };
}