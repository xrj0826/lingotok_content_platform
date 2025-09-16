/**
 * 简化的 node_modules FFmpeg 配置
 * 直接使用已安装的 @ffmpeg/core 包
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// 导入 FFmpeg 核心文件 - 使用包的正确导出路径
// @ts-ignore - Vite 会处理这些导入
import ffmpegCoreUrl from '@ffmpeg/core?url';
// @ts-ignore 
import ffmpegWasmUrl from '@ffmpeg/core/wasm?url';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * 检查环境支持
 */
function checkSupport(): boolean {
  console.log('🔍 [DEBUG] 检查环境支持...');

  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const isCrossOriginIsolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;

  console.log('📊 [DEBUG] 环境状态:', {
    SharedArrayBuffer: hasSharedArrayBuffer,
    crossOriginIsolated: isCrossOriginIsolated,
    userAgent: navigator.userAgent,
    location: location.href
  });

  return hasSharedArrayBuffer && isCrossOriginIsolated;
}

/**
 * 从 node_modules 获取 FFmpeg 实例
 */
export async function getFFmpegInstanceFromNodeModules(): Promise<FFmpeg> {
  console.log('🎬 [DEBUG] getFFmpegInstanceFromNodeModules() 被调用');

  if (ffmpegInstance) {
    console.log('✅ [DEBUG] 返回已存在的实例');
    return ffmpegInstance;
  }

  if (isLoading) {
    console.log('⏳ [DEBUG] 等待加载完成...');
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (ffmpegInstance) return ffmpegInstance;
  }

  isLoading = true;
  const startTime = performance.now();

  try {
    // 检查环境支持
    if (!checkSupport()) {
      throw new Error('环境不支持 SharedArrayBuffer，请确保在 HTTPS 环境下运行并正确配置 CORS 头部');
    }

    console.log('🔧 [DEBUG] 创建 FFmpeg 实例...');
    ffmpegInstance = new FFmpeg();

    // 设置监听器
    ffmpegInstance.on('log', ({ message }) => {
      console.log('📝 [FFmpeg LOG]:', message);
    });

    ffmpegInstance.on('progress', ({ progress, time }) => {
      console.log('⏳ [FFmpeg PROGRESS]:', `${Math.round(progress * 100)}% (${time}ms)`);
    });

    console.log('📋 [DEBUG] 使用 node_modules 文件路径:');
    console.log('  - Core:', ffmpegCoreUrl);
    console.log('  - WASM:', ffmpegWasmUrl);

    // 转换为 Blob URLs
    console.log('🔄 [DEBUG] 转换为 Blob URLs...');
    const blobStartTime = performance.now();

    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(ffmpegCoreUrl, 'text/javascript'),
      toBlobURL(ffmpegWasmUrl, 'application/wasm')
    ]);

    const blobEndTime = performance.now();
    console.log(`✅ [DEBUG] Blob URLs 转换完成，耗时: ${(blobEndTime - blobStartTime).toFixed(2)}ms`);

    console.log('📊 [DEBUG] Blob URLs 信息:');
    console.log('  - Core 长度:', coreURL.length);
    console.log('  - WASM 长度:', wasmURL.length);

    // 加载 FFmpeg
    console.log('🚀 [DEBUG] 开始加载 FFmpeg...');
    const loadStartTime = performance.now();

    await ffmpegInstance.load({
      coreURL,
      wasmURL,
      workerURL: coreURL // UMD 版本，worker 包含在 core 中
    });

    const loadEndTime = performance.now();
    console.log(`✅ [DEBUG] FFmpeg 加载完成，耗时: ${(loadEndTime - loadStartTime).toFixed(2)}ms`);

    const totalEndTime = performance.now();
    console.log(`🎉 [DEBUG] node_modules FFmpeg 加载成功！总耗时: ${(totalEndTime - startTime).toFixed(2)}ms`);

    return ffmpegInstance;

  } catch (error) {
    const endTime = performance.now();
    console.error(`💥 [DEBUG] node_modules FFmpeg 加载失败，耗时: ${(endTime - startTime).toFixed(2)}ms`);
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
export function resetFFmpegNodeModulesInstance(): void {
  console.log('🔄 [DEBUG] 重置 node_modules FFmpeg 实例');
  ffmpegInstance = null;
  isLoading = false;
}

/**
 * 获取状态
 */
export function getNodeModulesFFmpegStatus(): { loaded: boolean; loading: boolean } {
  return {
    loaded: ffmpegInstance !== null,
    loading: isLoading
  };
}
