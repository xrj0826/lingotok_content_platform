/**
 * FFmpeg配置工具
 * 使用本地文件，避免CORS和网络问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

import { validateSharedArrayBufferSupport, getSharedArrayBufferSuggestions } from './sharedArrayBufferValidator';

/**
 * 检查SharedArrayBuffer是否可用
 */
function checkSharedArrayBufferSupport(): boolean {
  // 使用验证工具进行检查 - 仅在控制台输出日志
  const isSupported = validateSharedArrayBufferSupport({
    logToConsole: true,
    logLevel: process.env.NODE_ENV === 'development' ? 'verbose' : 'minimal',
    throwOnError: false
  });

  // 允许在开发环境中绕过检查
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isSupported && isDevelopment) {
    console.log('⚠️ 开发环境：强制允许FFmpeg运行，即使SharedArrayBuffer不可用');

    // 在开发环境中提供更详细的Nginx配置提示
    console.log('💡 Nginx配置提示:');
    console.log(`   确保nginx.conf包含以下头部:`);
    console.log(`   add_header Cross-Origin-Embedder-Policy "require-corp" always;`);
    console.log(`   add_header Cross-Origin-Opener-Policy "same-origin" always;`);

    return true;
  }

  return isSupported;
}

/**
 * 获取或创建FFmpeg实例
 */
export async function getFFmpegInstance(): Promise<FFmpeg> {
  console.log('🎬 [DEBUG] getFFmpegInstance() 被调用');
  console.log('🔍 [DEBUG] 当前实例状态:', {
    hasInstance: ffmpegInstance !== null,
    isLoading,
    timestamp: new Date().toISOString()
  });

  // 检查SharedArrayBuffer支持 - 仅在控制台输出
  console.log('🔍 [DEBUG] 开始检查SharedArrayBuffer支持...');
  if (!checkSharedArrayBufferSupport()) {
    // 仅记录错误，不影响用户体验
    console.warn('⚠️ [DEBUG] SharedArrayBuffer检查警告：功能可能受限');

    // 在生产环境下，如果绝对需要此功能，则抛出错误
    // 在开发环境下，允许继续运行，便于调试
    if (process.env.NODE_ENV !== 'development') {
      console.error('💥 [DEBUG] SharedArrayBuffer在生产环境必须可用');
      throw new Error('SharedArrayBuffer不可用。请确保正确配置了Nginx头部。');
    }
  }
  console.log('✅ [DEBUG] SharedArrayBuffer检查完成');

  if (ffmpegInstance) {
    console.log('✅ [DEBUG] 返回已存在的FFmpeg实例');
    return ffmpegInstance;
  }

  if (isLoading) {
    console.log('⏳ [DEBUG] 检测到正在加载中，等待加载完成...');
    let waitCount = 0;
    // 等待加载完成
    while (isLoading) {
      waitCount++;
      console.log(`⏱️ [DEBUG] 等待加载... (${waitCount})`);
      await new Promise(resolve => setTimeout(resolve, 100));

      if (waitCount > 300) { // 30秒超时
        console.error('💥 [DEBUG] 等待FFmpeg加载超时');
        throw new Error('FFmpeg加载超时');
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

    console.log('🔄 [DEBUG] 开始加载FFmpeg核心文件...');

    // 检查所有文件是否可访问
    const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'];
    console.log('🔍 [DEBUG] 需要检查的文件:', files);

    for (const file of files) {
      try {
        console.log(`🔍 [DEBUG] 检查文件: ${file}`);
        const testStartTime = performance.now();
        const testResponse = await fetch(`${localBaseURL}/${file}`);
        const testEndTime = performance.now();

        if (!testResponse.ok) {
          console.error(`❌ [DEBUG] ${file} 访问失败: ${testResponse.status} (${testResponse.statusText})`);
          throw new Error(`${file} 访问失败: ${testResponse.status}`);
        }
        const size = testResponse.headers.get('content-length');
        console.log(`✅ [DEBUG] ${file} 可访问 ${size ? `(${Math.round(Number(size) / 1024)}KB)` : ''} 耗时: ${(testEndTime - testStartTime).toFixed(2)}ms`);
      } catch (error) {
        console.error(`❌ [DEBUG] ${file} 访问失败:`, error);
        throw error;
      }
    }

    // 使用toBlobURL正确处理文件，这是文档推荐的方式
    console.log('🔧 [DEBUG] 转换文件为Blob URL...');
    const blobStartTime = performance.now();

    const loadConfig = {
      coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`/ffmpeg/ffmpeg-core.worker.js`, 'text/javascript'),
    };

    const blobEndTime = performance.now();
    console.log(`✅ [DEBUG] Blob URL转换完成，耗时: ${(blobEndTime - blobStartTime).toFixed(2)}ms`);

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

    // 添加超时处理
    const loadPromise = ffmpegInstance.load(loadConfig);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('FFmpeg加载超时 (30秒)')), 30000);
    });

    console.log('⏳ 开始加载FFmpeg，最多等待30秒...');
    await Promise.race([loadPromise, timeoutPromise]);

    console.log('✅ FFmpeg本地文件加载成功');
    return ffmpegInstance;
  } catch (error) {
    console.error('FFmpeg本地文件加载失败:', error);

    // 检查是否是SharedArrayBuffer相关错误
    if (error instanceof Error && error.message.includes('SharedArrayBuffer')) {
      throw new Error('SharedArrayBuffer不可用，请检查跨域隔离配置。确保在vite.config.ts中设置了正确的CORS头部。');
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

      const backupLoadPromise = ffmpegInstance!.load(backupConfig);
      const backupTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('CDN加载超时 (30秒)')), 30000);
      });

      await Promise.race([backupLoadPromise, backupTimeoutPromise]);
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

