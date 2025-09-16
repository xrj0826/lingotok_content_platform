/**
 * FFmpeg配置工具
 * 使用本地文件，避免CORS和网络问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * 检查SharedArrayBuffer是否可用
 */
function checkSharedArrayBufferSupport(): boolean {
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const isCrossOriginIsolated = crossOriginIsolated;

  console.log('🔍 SharedArrayBuffer检查:');
  console.log('  - SharedArrayBuffer可用:', hasSharedArrayBuffer);
  console.log('  - crossOriginIsolated:', isCrossOriginIsolated);
  console.log('  - 当前协议:', location.protocol);
  console.log('  - 当前域名:', location.hostname);

  return hasSharedArrayBuffer && isCrossOriginIsolated;
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

  // 检查SharedArrayBuffer支持
  console.log('🔍 [DEBUG] 开始检查SharedArrayBuffer支持...');
  if (!checkSharedArrayBufferSupport()) {
    const errorMsg = 'SharedArrayBuffer不可用。请确保：\n1. 使用HTTPS或localhost环境\n2. 正确配置了跨域隔离头部\n3. 重启开发服务器';
    console.error('💥 [DEBUG] SharedArrayBuffer检查失败:', errorMsg);
    throw new Error(errorMsg);
  }
  console.log('✅ [DEBUG] SharedArrayBuffer检查通过');

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
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 检查SharedArrayBuffer是否存在
  if (typeof SharedArrayBuffer === 'undefined') {
    issues.push('SharedArrayBuffer未定义');
    recommendations.push('确保使用现代浏览器（Chrome 68+, Firefox 79+, Safari 15.2+）');
  }

  // 检查跨域隔离状态
  if (!crossOriginIsolated) {
    issues.push('跨域隔离未启用');
    recommendations.push('检查CORS头部配置：Cross-Origin-Opener-Policy: same-origin 和 Cross-Origin-Embedder-Policy: require-corp');
  }

  // 检查协议
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    issues.push('不安全的协议环境');
    recommendations.push('使用HTTPS协议或localhost环境');
  }

  // 检查浏览器特殊设置
  if (typeof SharedArrayBuffer !== 'undefined' && !crossOriginIsolated) {
    recommendations.push('重启开发服务器确保CORS头部生效');
    recommendations.push('清除浏览器缓存');
  }

  return {
    supported: typeof SharedArrayBuffer !== 'undefined' && crossOriginIsolated,
    issues,
    recommendations
  };
}

