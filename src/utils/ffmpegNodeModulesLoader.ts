/**
 * 直接从 node_modules 加载 FFmpeg
 * 避免依赖 public 目录的文件
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * 检查环境支持
 */
function checkEnvironmentSupport(): boolean {
  console.log('🔍 [DEBUG] 检查环境支持...');

  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const isCrossOriginIsolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const isHTTPS = location.protocol === 'https:';

  console.log('📊 [DEBUG] 环境检查结果:', {
    hasSharedArrayBuffer,
    isCrossOriginIsolated,
    isLocalhost,
    isHTTPS,
    protocol: location.protocol,
    hostname: location.hostname
  });

  const isSupported = hasSharedArrayBuffer && (isCrossOriginIsolated || isLocalhost);

  if (!isSupported) {
    console.error('❌ [DEBUG] 环境不支持 SharedArrayBuffer');
    if (!hasSharedArrayBuffer) {
      console.error('  - SharedArrayBuffer 不可用');
    }
    if (!isCrossOriginIsolated && !isLocalhost) {
      console.error('  - 需要跨域隔离或本地环境');
    }
  } else {
    console.log('✅ [DEBUG] 环境支持检查通过');
  }

  return isSupported;
}

/**
 * 从 node_modules 获取 FFmpeg 文件路径
 */
function getNodeModulesPaths() {
  // 直接使用 Vite 的 import 路径 - 使用包的正确导出路径
  const paths = {
    coreURL: new URL('@ffmpeg/core', import.meta.url).href,
    wasmURL: new URL('@ffmpeg/core/wasm', import.meta.url).href,
    workerURL: new URL('@ffmpeg/core', import.meta.url).href // UMD版本
  };

  console.log('📋 [DEBUG] Node modules 路径:', paths);
  return paths;
}

/**
 * 备用方案：通过动态导入获取路径
 */
async function getNodeModulesPathsDynamic() {
  try {
    console.log('🔄 [DEBUG] 尝试动态导入方案...');

    // 在生产环境中，直接使用 public 目录的文件
    if (import.meta.env.PROD) {
      const paths = {
        coreURL: '/ffmpeg/ffmpeg-core.js',
        wasmURL: '/ffmpeg/ffmpeg-core.wasm',
        workerURL: '/ffmpeg/ffmpeg-core.worker.js'
      };
      console.log('✅ [DEBUG] 生产环境路径:', paths);
      return paths;
    }

    // 开发环境尝试动态导入
    try {
      const coreModule = await import('@ffmpeg/core/dist/umd/ffmpeg-core.js?url');
      const wasmModule = await import('@ffmpeg/core/dist/umd/ffmpeg-core.wasm?url');
      const workerModule = await import('@ffmpeg/core/dist/umd/ffmpeg-core.worker.js?url');

      const paths = {
        coreURL: coreModule.default,
        wasmURL: wasmModule.default,
        workerURL: workerModule.default
      };

      console.log('✅ [DEBUG] 动态导入成功:', paths);
      return paths;
    } catch (importError) {
      // 如果动态导入失败，回退到 public 目录
      const paths = {
        coreURL: '/ffmpeg/ffmpeg-core.js',
        wasmURL: '/ffmpeg/ffmpeg-core.wasm',
        workerURL: '/ffmpeg/ffmpeg-core.worker.js'
      };
      console.log('✅ [DEBUG] 回退到 public 目录:', paths);
      return paths;
    }
  } catch (error) {
    console.error('❌ [DEBUG] 动态导入失败:', error);
    throw error;
  }
}

/**
 * 第三种方案：使用相对路径
 */
function getNodeModulesPathsRelative() {
  // 使用实际的文件路径，因为 Vite 会将 node_modules 文件映射到 /@fs/ 路径
  const basePath = '/@fs/' + process.cwd().replace(/\\/g, '/') + '/node_modules/@ffmpeg/core/dist/umd';
  const paths = {
    coreURL: `${basePath}/ffmpeg-core.js`,
    wasmURL: `${basePath}/ffmpeg-core.wasm`,
    workerURL: `${basePath}/ffmpeg-core.js`
  };

  console.log('📋 [DEBUG] 相对路径方案:', paths);
  return paths;
}

/**
 * 检查文件是否可访问
 */
async function checkFileAccess(url: string): Promise<boolean> {
  try {
    console.log(`🔍 [DEBUG] 检查文件: ${url}`);
    const response = await fetch(url, { method: 'HEAD' });
    const accessible = response.ok;

    console.log(`${accessible ? '✅' : '❌'} [DEBUG] ${url} - ${response.status} ${response.statusText}`);
    return accessible;
  } catch (error) {
    console.error(`💥 [DEBUG] 文件检查失败: ${url}`, error);
    return false;
  }
}

/**
 * 尝试多种方案获取可用的路径
 */
async function getBestAvailablePaths(): Promise<{
  coreURL: string;
  wasmURL: string;
  workerURL: string;
  method: string;
}> {
  console.log('🎯 [DEBUG] 开始寻找最佳可用路径...');

  // 方案1: 使用 import.meta.url
  try {
    console.log('🔄 [DEBUG] 尝试方案1: import.meta.url');
    const paths1 = getNodeModulesPaths();

    const allAccessible = await Promise.all([
      checkFileAccess(paths1.coreURL),
      checkFileAccess(paths1.wasmURL)
    ]);

    if (allAccessible.every(Boolean)) {
      console.log('✅ [DEBUG] 方案1成功');
      return { ...paths1, method: 'import.meta.url' };
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] 方案1失败:', error);
  }

  // 方案2: 动态导入
  try {
    console.log('🔄 [DEBUG] 尝试方案2: 动态导入');
    const paths2 = await getNodeModulesPathsDynamic();

    const allAccessible = await Promise.all([
      checkFileAccess(paths2.coreURL),
      checkFileAccess(paths2.wasmURL)
    ]);

    if (allAccessible.every(Boolean)) {
      console.log('✅ [DEBUG] 方案2成功');
      return { ...paths2, method: 'dynamic-import' };
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] 方案2失败:', error);
  }

  // 方案3: 相对路径
  try {
    console.log('🔄 [DEBUG] 尝试方案3: 相对路径');
    const paths3 = getNodeModulesPathsRelative();

    const allAccessible = await Promise.all([
      checkFileAccess(paths3.coreURL),
      checkFileAccess(paths3.wasmURL)
    ]);

    if (allAccessible.every(Boolean)) {
      console.log('✅ [DEBUG] 方案3成功');
      return { ...paths3, method: 'relative-path' };
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] 方案3失败:', error);
  }

  throw new Error('所有方案都失败了，无法从 node_modules 加载 FFmpeg 文件');
}

/**
 * 从 node_modules 加载 FFmpeg 实例
 */
export async function getFFmpegFromNodeModules(): Promise<FFmpeg> {
  console.log('🎬 [DEBUG] getFFmpegFromNodeModules() 被调用');

  if (ffmpegInstance) {
    console.log('✅ [DEBUG] 返回已存在的 FFmpeg 实例');
    return ffmpegInstance;
  }

  if (isLoading) {
    console.log('⏳ [DEBUG] 等待加载完成...');
    let waitCount = 0;
    while (isLoading) {
      waitCount++;
      await new Promise(resolve => setTimeout(resolve, 100));

      if (waitCount > 300) { // 30秒超时
        throw new Error('FFmpeg 加载超时');
      }
    }

    if (ffmpegInstance) {
      return ffmpegInstance;
    }
  }

  isLoading = true;
  const startTime = performance.now();

  try {
    // 检查环境支持
    if (!checkEnvironmentSupport()) {
      throw new Error('环境不支持 SharedArrayBuffer，请确保使用 HTTPS 或 localhost，并正确配置跨域隔离头部');
    }

    // 创建 FFmpeg 实例
    console.log('🔧 [DEBUG] 创建 FFmpeg 实例...');
    ffmpegInstance = new FFmpeg();

    // 设置监听器
    ffmpegInstance.on('log', ({ message }) => {
      console.log('📝 [FFmpeg LOG]:', message);
    });

    ffmpegInstance.on('progress', ({ progress, time }) => {
      console.log('⏳ [FFmpeg PROGRESS]:', `${Math.round(progress * 100)}% (${time}ms)`);
    });

    // 获取最佳可用路径
    const paths = await getBestAvailablePaths();
    console.log(`🎯 [DEBUG] 使用方案: ${paths.method}`);

    // 转换为 Blob URLs
    console.log('🔄 [DEBUG] 转换为 Blob URLs...');
    const blobStartTime = performance.now();

    const [coreURL, wasmURL, workerURL] = await Promise.all([
      toBlobURL(paths.coreURL, 'text/javascript'),
      toBlobURL(paths.wasmURL, 'application/wasm'),
      toBlobURL(paths.workerURL, 'text/javascript')
    ]);

    const blobEndTime = performance.now();
    console.log(`✅ [DEBUG] Blob URLs 转换完成，耗时: ${(blobEndTime - blobStartTime).toFixed(2)}ms`);

    // 加载 FFmpeg
    console.log('🚀 [DEBUG] 加载 FFmpeg 核心...');
    const loadStartTime = performance.now();

    await ffmpegInstance.load({
      coreURL,
      wasmURL,
      workerURL
    });

    const loadEndTime = performance.now();
    console.log(`✅ [DEBUG] FFmpeg 加载完成，耗时: ${(loadEndTime - loadStartTime).toFixed(2)}ms`);

    const totalEndTime = performance.now();
    console.log(`🎉 [DEBUG] 从 node_modules 加载 FFmpeg 成功！总耗时: ${(totalEndTime - startTime).toFixed(2)}ms`);
    console.log(`📊 [DEBUG] 使用的方案: ${paths.method}`);

    return ffmpegInstance;

  } catch (error) {
    const endTime = performance.now();
    console.error(`💥 [DEBUG] 从 node_modules 加载 FFmpeg 失败，耗时: ${(endTime - startTime).toFixed(2)}ms`);
    console.error('🔴 [DEBUG] 错误详情:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    ffmpegInstance = null;
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * 重置实例
 */
export function resetFFmpegInstance(): void {
  console.log('🔄 [DEBUG] 重置 FFmpeg 实例');
  ffmpegInstance = null;
  isLoading = false;
}

/**
 * 获取状态
 */
export function getFFmpegStatus(): { loaded: boolean; loading: boolean } {
  return {
    loaded: ffmpegInstance !== null,
    loading: isLoading
  };
}
