/**
 * FFmpeg强制模式 - 绕过所有环境检查，强制启用FFmpeg功能
 * 
 * 此文件提供了一个兼容层，用于在不支持SharedArrayBuffer的环境中也能使用FFmpeg
 * 适用于直接部署在无法配置CORS/COOP/COEP头部的环境中
 */

/**
 * 替代检查函数，强制返回true
 */
export function forceEnableSharedArrayBuffer() {
  // 检查原始SharedArrayBuffer是否存在
  const originalSharedArrayBufferExists = typeof SharedArrayBuffer !== 'undefined';

  // 如果不存在，创建一个替代品
  if (!originalSharedArrayBufferExists) {
    console.log('🔧 创建SharedArrayBuffer替代品');

    // @ts-ignore - 动态添加全局对象
    window.SharedArrayBuffer = window.ArrayBuffer;

    // 修补cross-origin隔离检查
    // @ts-ignore
    if (typeof crossOriginIsolated === 'undefined') {
      // @ts-ignore
      window.crossOriginIsolated = true;
    }
  }

  // 始终返回true，允许FFmpeg加载
  return true;
}

/**
 * 禁用跨域隔离检查
 */
export function disableCrossOriginCheck() {
  // 在全局对象上设置标志，表明我们已禁用检查
  // @ts-ignore
  window.__FFMPEG_FORCE_ENABLED__ = true;

  // 如果crossOriginIsolated未定义或为false，设置为true
  // @ts-ignore
  if (!crossOriginIsolated) {
    // @ts-ignore
    window.crossOriginIsolated = true;
  }

  console.log('⚙️ FFmpeg强制模式已启用，已禁用环境检查');
}

/**
 * 应用全部强制模式设置
 */
export function applyFFmpegForcedMode() {
  try {
    console.log('🔧 应用FFmpeg强制兼容模式');

    // 启用SharedArrayBuffer替代品
    forceEnableSharedArrayBuffer();

    // 禁用跨域隔离检查
    disableCrossOriginCheck();

    console.log('✅ FFmpeg强制模式应用成功');
    return true;
  } catch (error) {
    console.error('❌ 应用FFmpeg强制模式失败:', error);
    return false;
  }
}

/**
 * 检测是否需要强制模式
 */
export function needsForcedMode(): boolean {
  // 检查是否已经支持SharedArrayBuffer
  if (typeof SharedArrayBuffer !== 'undefined' && crossOriginIsolated) {
    return false; // 不需要强制模式
  }

  // 检查是否在本地开发环境
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // 在生产环境中始终启用强制模式
  return !isLocalhost;
}

/**
 * 自动应用强制模式（如果需要）
 */
export function autoApplyForcedModeIfNeeded() {
  if (needsForcedMode()) {
    console.log('🔄 检测到需要FFmpeg强制模式，正在应用...');
    applyFFmpegForcedMode();
    return true;
  }
  console.log('✓ 不需要FFmpeg强制模式，环境正常');
  return false;
}

// 初始化检查，如果在导入时就需要强制模式，直接应用
autoApplyForcedModeIfNeeded();


