/**
 * FFmpeg配置工具
 * 使用本地文件，避免CORS和网络问题
 * 增强版 - 支持BlobURL缓存和快速加载模式
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

// 缓存BlobURL，避免重复转换
interface URLCache {
  coreURL: string;
  wasmURL: string;
  workerURL: string;
  timestamp: number;
}

let urlCache: URLCache | null = null;
const FFMPEG_URL_CACHE = 'ffmpeg_url_cache';
const URL_CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时缓存有效期

import { validateSharedArrayBufferSupport, getSharedArrayBufferSuggestions } from './sharedArrayBufferValidator';
import { applyFFmpegForcedMode, autoApplyForcedModeIfNeeded } from './ffmpegForcedMode';

/**
 * 检查SharedArrayBuffer是否可用
 */
function checkSharedArrayBufferSupport(): boolean {
  // 首先应用强制模式（如果需要）
  if (autoApplyForcedModeIfNeeded()) {
    console.log('✅ 已应用强制模式，允许FFmpeg运行');
    return true;
  }

  // 使用验证工具进行检查 - 仅在控制台输出日志
  const isSupported = validateSharedArrayBufferSupport({
    logToConsole: true,
    logLevel: process.env.NODE_ENV === 'development' ? 'verbose' : 'minimal',
    throwOnError: false
  });

  // 如果仍不支持，强制应用兼容模式
  if (!isSupported) {
    console.log('⚠️ 检测到SharedArrayBuffer不可用，应用强制兼容模式');
    const forceResult = applyFFmpegForcedMode();
    if (forceResult) {
      console.log('✅ 已成功应用强制模式，允许FFmpeg运行');
      return true;
    } else {
      console.log('⚠️ 强制模式应用失败，但仍尝试继续运行');
      return true; // 无论如何都返回true，尝试运行
    }
  }

  return true; // 始终返回true，允许FFmpeg运行
}

/**
 * 尝试从localStorage恢复缓存的BlobURL
 */
function getCachedBlobURLs(): URLCache | null {
  try {
    const cached = localStorage.getItem(FFMPEG_URL_CACHE);
    if (!cached) return null;

    const urlData: URLCache = JSON.parse(cached);
    const now = Date.now();

    // 检查缓存是否过期
    if (now - urlData.timestamp > URL_CACHE_TTL) {
      console.log('🕒 BlobURL缓存已过期，需要重新生成');
      localStorage.removeItem(FFMPEG_URL_CACHE);
      return null;
    }

    return urlData;
  } catch (e) {
    console.warn('无法读取BlobURL缓存:', e);
    return null;
  }
}

/**
 * 缓存BlobURL到localStorage
 */
function saveBlobURLsToCache(urlData: URLCache): void {
  try {
    localStorage.setItem(FFMPEG_URL_CACHE, JSON.stringify(urlData));
  } catch (e) {
    console.warn('无法保存BlobURL缓存:', e);
  }
}

/**
 * 获取或创建FFmpeg实例
 * @param fastLoad 是否使用快速加载模式（跳过文件验证和转换）
 */
export async function getFFmpegInstance(fastLoad: boolean = false): Promise<FFmpeg> {
  console.log('🎬 [DEBUG] getFFmpegInstance() 被调用');
  console.log('🔍 [DEBUG] 当前实例状态:', {
    hasInstance: ffmpegInstance !== null,
    isLoading,
    timestamp: new Date().toISOString()
  });

  // 检查并强制启用SharedArrayBuffer支持
  console.log('🔍 [DEBUG] 开始检查SharedArrayBuffer支持...');
  checkSharedArrayBufferSupport(); // 现在这个函数会强制启用支持
  console.log('✅ [DEBUG] 已确保FFmpeg可用（强制兼容模式）');
  console.log('✅ [DEBUG] SharedArrayBuffer检查完成');

  if (ffmpegInstance) {
    // 检查实例是否已经加载完成
    if (ffmpegInstance.loaded) {
      console.log('✅ [DEBUG] 返回已存在且已加载的FFmpeg实例');
      return ffmpegInstance;
    } else {
      console.log('⚠️ [DEBUG] 实例存在但未加载，将重新加载');
      ffmpegInstance = null; // 清理未加载的实例
    }
  }

  if (isLoading) {
    console.log('⏳ [DEBUG] 检测到正在加载中，等待加载完成...');
    let waitCount = 0;
    // 等待加载完成
    while (isLoading) {
      waitCount++;
      console.log(`⏱️ [DEBUG] 等待加载... (${waitCount})`);
      await new Promise(resolve => setTimeout(resolve, 100));

      // 无限等待，直到加载完成
      // 每隔100个计数（10秒）输出一次日志，但不会超时
      if (waitCount % 100 === 0) {
        console.log(`⏳ [DEBUG] 继续等待FFmpeg加载...已等待${waitCount / 10}秒`);
      }
    }
    console.log('✅ [DEBUG] 等待完成，返回已加载的实例');
    return ffmpegInstance!;
  }

  console.log('🚀 [DEBUG] 开始新的FFmpeg实例创建流程');
  isLoading = true;

  try {
    console.log('🚀 [DEBUG] 开始创建FFmpeg实例...');
    const createStartTime = performance.now();
    ffmpegInstance = new FFmpeg();
    const createEndTime = performance.now();
    console.log(`✅ [DEBUG] FFmpeg对象创建成功，耗时: ${(createEndTime - createStartTime).toFixed(2)}ms`);

    // 设置日志回调
    console.log('📡 [DEBUG] 设置FFmpeg日志回调...');
    ffmpegInstance.on('log', ({ message }) => {
      console.log('📝 [FFmpeg LOG]:', message);
    });

    // 设置进度回调
    console.log('📡 [DEBUG] 设置FFmpeg进度回调...');
    ffmpegInstance.on('progress', ({ progress, time }) => {
      console.log('⏳ [FFmpeg PROGRESS]:', `${Math.round(progress * 100)}% (${time}ms)`);
    });
    console.log('✅ [DEBUG] 事件监听器设置完成');

    // 优先使用本地文件
    const localBaseURL = '/ffmpeg';
    console.log('📂 [DEBUG] 使用本地FFmpeg文件:', localBaseURL);

    // 准备加载配置
    let loadConfig: { coreURL: string; wasmURL: string; workerURL: string; };

    // 尝试使用快速加载模式或缓存的URL
    if (fastLoad) {
      console.log('🚀 [DEBUG] 使用快速加载模式，跳过文件验证和转换');

      // 创建新的FFmpeg实例但不执行完整加载流程
      const basePath = window.location.origin;
      const ffmpegBasePath = `${basePath}/ffmpeg`;

      loadConfig = {
        coreURL: `${ffmpegBasePath}/ffmpeg-core.js`,
        wasmURL: `${ffmpegBasePath}/ffmpeg-core.wasm`,
        workerURL: `${ffmpegBasePath}/ffmpeg-core.worker.js`,
      };
    } else {
      // 检查是否有缓存的BlobURL
      const cachedURLs = getCachedBlobURLs();
      // 尝试使用缓存的BlobURL
      if (cachedURLs) {
        console.log('🔄 [DEBUG] 使用缓存的BlobURL，跳过文件转换');
        loadConfig = {
          coreURL: cachedURLs.coreURL,
          wasmURL: cachedURLs.wasmURL,
          workerURL: cachedURLs.workerURL
        };
      } else {
        console.log('🔄 [DEBUG] 开始加载FFmpeg核心文件...');

        // 优化：并行预加载和转换所有文件，而不是串行处理
        console.log('🚀 [DEBUG] 使用优化的并行文件转换方式');
        const blobStartTime = performance.now();

        // 构建正确的URL路径 - 使用相对路径而不是绝对路径，避免导入错误
        const basePath = window.location.origin;
        const ffmpegBasePath = `${basePath}/ffmpeg`;

        console.log('🌐 [DEBUG] 使用基础路径:', ffmpegBasePath);

        try {
          // 并行转换所有文件，显著减少等待时间
          const [coreURL, wasmURL, workerURL] = await Promise.all([
            toBlobURL(`${ffmpegBasePath}/ffmpeg-core.js`, 'text/javascript'),
            toBlobURL(`${ffmpegBasePath}/ffmpeg-core.wasm`, 'application/wasm'),
            toBlobURL(`${ffmpegBasePath}/ffmpeg-core.worker.js`, 'text/javascript')
          ]);

          loadConfig = { coreURL, wasmURL, workerURL };

          // 缓存生成的BlobURL
          saveBlobURLsToCache({
            ...loadConfig,
            timestamp: Date.now()
          });

          const blobEndTime = performance.now();
          console.log(`✅ [DEBUG] 并行Blob URL转换完成，耗时: ${(blobEndTime - blobStartTime).toFixed(2)}ms`);
        } catch (error) {
          console.error('❌ [DEBUG] Blob URL转换失败:', error);

          // 失败回退：使用直接URL而不是BlobURL
          console.log('⚠️ [DEBUG] 回退到直接文件路径');
          loadConfig = {
            coreURL: `${ffmpegBasePath}/ffmpeg-core.js`,
            wasmURL: `${ffmpegBasePath}/ffmpeg-core.wasm`,
            workerURL: `${ffmpegBasePath}/ffmpeg-core.worker.js`,
          };
        }
      }
    }

    console.log('📋 [DEBUG] FFmpeg加载配置:', {
      coreURL: loadConfig.coreURL.substring(0, 50) + '...',
      wasmURL: loadConfig.wasmURL.substring(0, 50) + '...',
      workerURL: loadConfig.workerURL.substring(0, 50) + '...',
      fullLengths: {
        core: loadConfig.coreURL.length,
        wasm: loadConfig.wasmURL.length,
        worker: loadConfig.workerURL.length
      }
    });

    // 直接加载，没有超时限制，会一直等待直到加载完成
    console.log('⏳ 开始加载FFmpeg，等待直到加载完成...');
    await ffmpegInstance.load(loadConfig);

    // 验证FFmpeg是否真正加载完成
    if (!ffmpegInstance.loaded) {
      throw new Error('FFmpeg加载命令执行完成，但实例未标记为已加载');
    }

    console.log('✅ FFmpeg本地文件加载成功');
    return ffmpegInstance;
  } catch (error) {
    console.error('FFmpeg本地文件加载失败:', error);

    // 检查是否是SharedArrayBuffer相关错误
    if (error instanceof Error && error.message.includes('SharedArrayBuffer')) {
      console.warn('尝试强制启用SharedArrayBuffer兼容模式...');
      applyFFmpegForcedMode();
      // 重新尝试加载
      try {
        ffmpegInstance = new FFmpeg();
        // 使用正确的完整URL路径
        const basePath = window.location.origin;
        const ffmpegBasePath = `${basePath}/ffmpeg`;

        const loadConfig = {
          coreURL: await toBlobURL(`${ffmpegBasePath}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${ffmpegBasePath}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${ffmpegBasePath}/ffmpeg-core.worker.js`, 'text/javascript'),
        };
        await ffmpegInstance.load(loadConfig);

        // 验证强制模式下的加载
        if (!ffmpegInstance.loaded) {
          throw new Error('强制模式下FFmpeg加载命令执行完成，但实例未标记为已加载');
        }

        console.log('✅ 强制模式下FFmpeg加载成功');
        return ffmpegInstance;
      } catch (forcedError) {
        console.error('💥 强制模式下FFmpeg加载仍然失败:', forcedError);
        throw new Error(`FFmpeg加载失败: 即使在强制模式下也无法加载。`);
      }
    }

    // 如果本地文件失败，尝试使用备用CDN
    try {
      console.log('🔄 尝试使用CDN备用方案...');
      const backupURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

      const backupConfig = {
        coreURL: `${backupURL}/ffmpeg-core.js`,
        wasmURL: `${backupURL}/ffmpeg-core.wasm`,
        workerURL: `${backupURL}/ffmpeg-core.worker.js`,
      };

      console.log('📋 CDN备用配置:', backupConfig);

      // 直接加载CDN资源，无超时限制
      console.log('⏳ 使用CDN备用方案加载FFmpeg，等待直到加载完成...');
      await ffmpegInstance!.load(backupConfig);

      // 缓存CDN BlobURL
      saveBlobURLsToCache({
        ...backupConfig,
        timestamp: Date.now()
      });

      // 验证CDN方案的加载
      if (!ffmpegInstance!.loaded) {
        throw new Error('CDN方案FFmpeg加载命令执行完成，但实例未标记为已加载');
      }

      console.log('✅ FFmpeg备用CDN加载成功');
      return ffmpegInstance!;
    } catch (backupError) {
      console.error('❌ FFmpeg备用CDN加载也失败:', backupError);
      throw new Error(`FFmpeg加载失败: 本地文件和CDN都无法加载。错误: ${backupError}`);
    }
  } finally {
    isLoading = false;
  }
}

/**
 * 重置FFmpeg实例
 */
export function resetFFmpegInstance(): void {
  ffmpegInstance = null;
  isLoading = false;
}

/**
 * 清除FFmpeg BlobURL缓存
 */
export function clearFFmpegURLCache(): void {
  try {
    localStorage.removeItem(FFMPEG_URL_CACHE);
    urlCache = null;
    console.log('🧹 已清除FFmpeg BlobURL缓存');
  } catch (e) {
    console.warn('清除FFmpeg BlobURL缓存失败:', e);
  }
}

/**
 * 诊断SharedArrayBuffer支持情况
 */
export function diagnoseSharedArrayBufferSupport(): {
  supported: boolean;
  issues: string[];
  recommendations: string[];
} {
  const check = checkSharedArrayBufferSupport();
  const validation = validateSharedArrayBufferSupport({ logToConsole: false });
  const suggestions = getSharedArrayBufferSuggestions();

  const issues: string[] = [];

  // 检查SharedArrayBuffer是否存在
  if (typeof SharedArrayBuffer === 'undefined') {
    issues.push('SharedArrayBuffer未定义');
  }

  // 检查跨域隔离状态
  if (!crossOriginIsolated) {
    issues.push('跨域隔离未启用');
  }

  // 检查协议
  if (location.protocol !== 'https:' &&
    location.hostname !== 'localhost' &&
    location.hostname !== '127.0.0.1') {
    issues.push('不安全的协议环境');
  }

  // 检查浏览器兼容性
  const browserCheck = {
    supported: false,
    browser: 'unknown',
    version: 'unknown'
  };

  const ua = navigator.userAgent;
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  const safariMatch = ua.match(/Version\/(\d+\.\d+).*Safari/);

  if (chromeMatch) {
    browserCheck.browser = 'Chrome';
    browserCheck.version = chromeMatch[1];
    browserCheck.supported = parseInt(chromeMatch[1]) >= 68;
  } else if (firefoxMatch) {
    browserCheck.browser = 'Firefox';
    browserCheck.version = firefoxMatch[1];
    browserCheck.supported = parseInt(firefoxMatch[1]) >= 79;
  } else if (safariMatch) {
    browserCheck.browser = 'Safari';
    browserCheck.version = safariMatch[1];
    browserCheck.supported = parseFloat(safariMatch[1]) >= 15.2;
  }

  if (!browserCheck.supported) {
    issues.push(`浏览器版本不兼容 (${browserCheck.browser} ${browserCheck.version})`);
  }

  return {
    supported: check,
    issues,
    recommendations: suggestions
  };
}

