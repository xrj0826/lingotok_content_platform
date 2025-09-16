/**
 * FFmpeg CORS 问题解决方案
 * 基于 CSDN 文章和实际测试的完整解决方案
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// 特殊的 FFmpeg 实例，专门处理 CORS 问题
let corsWorkaroundInstance: FFmpeg | null = null;

/**
 * 使用 CORS 绕过技术初始化 FFmpeg
 * 解决 "Cross-Origin-Resource-Policy" 问题
 */
export async function initFFmpegWithCorsWorkaround(): Promise<FFmpeg> {
  console.log('[CORS解决方案] 开始初始化 FFmpeg，绕过 CORS 限制...');

  if (corsWorkaroundInstance && corsWorkaroundInstance.loaded) {
    console.log('[CORS解决方案] 使用已有实例');
    return corsWorkaroundInstance;
  }

  const ffmpeg = new FFmpeg();

  // 设置日志监听
  ffmpeg.on('log', ({ type, message }) => {
    if (type === 'fferr') {
      console.error('[FFmpeg CORS]', message);
    } else {
      console.log('[FFmpeg CORS]', message);
    }
  });

  try {
    console.log('[CORS解决方案] 尝试本地文件直接加载...');

    // 方案1: 直接使用相对路径，让浏览器处理 CORS
    const baseURL = window.location.origin + '/ffmpeg';

    // 创建超时保护
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('[CORS解决方案] 30秒超时'));
      }, 30000);
    });

    // 使用特殊的 fetch 方式获取文件
    const fetchWithCors = async (url: string, type: string) => {
      try {
        console.log(`[CORS解决方案] 获取文件: ${url}`);

        // 尝试不同的获取方式
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors', // 明确指定 CORS 模式
          credentials: 'same-origin',
          headers: {
            'Accept': type
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (fetchError) {
        console.warn(`[CORS解决方案] 直接获取失败，尝试 toBlobURL: ${fetchError}`);

        // 回退到 toBlobURL 方式
        return await toBlobURL(url, type);
      }
    };

    // 获取所有文件的 URL
    const [coreURL, wasmURL, workerURL] = await Promise.all([
      fetchWithCors(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      fetchWithCors(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      fetchWithCors(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    ]);

    console.log('[CORS解决方案] 文件URL获取成功，开始加载 FFmpeg...');

    // 加载 FFmpeg
    const loadPromise = ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    });

    await Promise.race([loadPromise, timeoutPromise]);

    // 验证加载
    if (!ffmpeg.loaded) {
      throw new Error('[CORS解决方案] FFmpeg 未正确加载');
    }

    // 快速功能测试
    console.log('[CORS解决方案] 进行功能验证测试...');
    await ffmpeg.writeFile('cors_test.txt', new Uint8Array([1, 2, 3, 4, 5]));
    const testData = await ffmpeg.readFile('cors_test.txt');
    await ffmpeg.deleteFile('cors_test.txt');

    if (testData.length !== 5) {
      throw new Error('[CORS解决方案] 功能测试失败');
    }

    corsWorkaroundInstance = ffmpeg;
    console.log('✅ [CORS解决方案] FFmpeg 初始化成功！');

    return ffmpeg;

  } catch (error) {
    console.error('❌ [CORS解决方案] 初始化失败:', error);
    throw new Error(`CORS 解决方案失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 检查当前环境的 CORS 和跨域隔离状态
 */
export function checkCorsEnvironment(): {
  crossOriginIsolated: boolean;
  sharedArrayBuffer: boolean;
  secureContext: boolean;
  suggestions: string[];
} {
  const result = {
    crossOriginIsolated: window.crossOriginIsolated === true,
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    secureContext: window.isSecureContext,
    suggestions: [] as string[]
  };

  console.log('[CORS检查] 环境状态:', {
    crossOriginIsolated: result.crossOriginIsolated,
    sharedArrayBuffer: result.sharedArrayBuffer,
    secureContext: result.secureContext,
    location: window.location.href
  });

  if (!result.crossOriginIsolated) {
    result.suggestions.push('🔒 跨域隔离未启用，请重启开发服务器');
    result.suggestions.push('💡 确保使用 npm run dev 或 yarn dev 启动');
    result.suggestions.push('🌐 确保访问地址是 localhost 而不是 IP 地址');
  }

  if (!result.sharedArrayBuffer) {
    result.suggestions.push('⚠️ SharedArrayBuffer 不可用，需要跨域隔离');
  }

  if (!result.secureContext) {
    result.suggestions.push('🔐 需要安全上下文，请使用 HTTPS 或 localhost');
  }

  return result;
}

/**
 * 一键修复 CORS 问题
 */
export async function fixCorsIssues(): Promise<{
  success: boolean;
  message: string;
  ffmpegInstance?: FFmpeg;
}> {
  try {
    console.log('[一键修复] 开始修复 CORS 问题...');

    // 1. 检查环境
    const envCheck = checkCorsEnvironment();

    if (!envCheck.crossOriginIsolated) {
      return {
        success: false,
        message: `环境不支持，请按以下步骤操作：\n${envCheck.suggestions.join('\n')}`
      };
    }

    // 2. 清理旧实例
    if (corsWorkaroundInstance) {
      try {
        corsWorkaroundInstance.terminate?.();
      } catch { }
      corsWorkaroundInstance = null;
    }

    // 3. 初始化 FFmpeg
    const ffmpegInstance = await initFFmpegWithCorsWorkaround();

    return {
      success: true,
      message: '✅ CORS 问题已解决，FFmpeg 可以正常使用！',
      ffmpegInstance
    };

  } catch (error) {
    return {
      success: false,
      message: `修复失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export { corsWorkaroundInstance };
