/**
 * FFmpeg 兼容性初始化脚本
 * 在视频生成页面加载时自动应用FFmpeg强制模式
 */

import { applyFFmpegForcedMode } from '@/utils/ffmpegForcedMode';

// 在导入时立即执行的自执行函数
(function initFFmpegCompatibility() {
  console.log('🚀 视频生成页面 FFmpeg 兼容性初始化');

  try {
    // 应用强制模式
    const result = applyFFmpegForcedMode();

    if (result) {
      console.log('✅ FFmpeg 强制兼容模式已成功应用');

      // 添加全局标记，表示已启用强制模式
      // @ts-ignore
      window.__FFMPEG_FORCED_MODE_ENABLED__ = true;

      // 重写console.error，防止FFmpeg初始化相关错误干扰用户
      const originalConsoleError = console.error;
      console.error = function (...args: any[]) {
        // 过滤掉SharedArrayBuffer相关错误
        const errorStr = String(args[0] || '');
        if (
          errorStr.includes('SharedArrayBuffer') ||
          errorStr.includes('cross-origin-isolated') ||
          errorStr.includes('COOP') ||
          errorStr.includes('COEP')
        ) {
          console.log('🔧 已屏蔽FFmpeg兼容性警告:', args[0]);
          return;
        }

        // 对于其他错误，正常显示
        originalConsoleError.apply(console, args);
      };
    } else {
      console.warn('⚠️ FFmpeg 强制兼容模式应用可能不完全');
    }
  } catch (error) {
    console.error('❌ FFmpeg 兼容性初始化失败:', error);
  }
})();

export default {
  isInitialized: true
};






