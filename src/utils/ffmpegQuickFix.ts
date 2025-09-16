/**
 * FFmpeg 快速修复工具
 * 专门用于解决 CORS 和初始化问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// 快速修复实例
let quickFixInstance: FFmpeg | null = null;

/**
 * 快速修复 FFmpeg 初始化问题
 * 专门针对 CORS 和超时问题设计
 */
export async function quickFixFFmpeg(): Promise<FFmpeg> {
  console.log('🔧 [QuickFix] 开始快速修复 FFmpeg...');

  // 清理之前的实例
  if (quickFixInstance) {
    try {
      quickFixInstance.terminate?.();
    } catch (error) {
      console.warn('[QuickFix] 清理旧实例时出错:', error);
    }
    quickFixInstance = null;
  }

  const ffmpeg = new FFmpeg();

  // 设置最简化的日志
  ffmpeg.on('log', ({ type, message }) => {
    if (type === 'fferr' || message.includes('error')) {
      console.error('[QuickFix FFmpeg]', message);
    }
  });

  try {
    console.log('[QuickFix] 强制使用本地文件，避免所有网络请求...');

    // 创建 30 秒的严格超时
    const quickTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('QuickFix: 30秒超时 - 可能是文件损坏或浏览器限制'));
      }, 30000);
    });

    // 使用本地文件，避免任何 CDN 请求
    const loadPromise = ffmpeg.load({
      coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
      workerURL: await toBlobURL('/ffmpeg/ffmpeg-core.worker.js', 'text/javascript'),
    });

    await Promise.race([loadPromise, quickTimeout]);

    // 验证加载状态
    if (!ffmpeg.loaded) {
      throw new Error('QuickFix: FFmpeg 未正确加载');
    }

    // 快速功能测试
    console.log('[QuickFix] 进行快速功能测试...');
    await ffmpeg.writeFile('test.txt', new Uint8Array([1, 2, 3]));
    const testRead = await ffmpeg.readFile('test.txt');
    await ffmpeg.deleteFile('test.txt');

    if (testRead.length !== 3) {
      throw new Error('QuickFix: 功能测试失败');
    }

    quickFixInstance = ffmpeg;
    console.log('✅ [QuickFix] FFmpeg 快速修复成功！');
    return ffmpeg;

  } catch (error) {
    console.error('❌ [QuickFix] 快速修复失败:', error);

    // 提供详细的修复建议
    const suggestions = [
      '1. 检查 public/ffmpeg/ 目录下是否有完整的文件：',
      '   - ffmpeg-core.js (~200KB)',
      '   - ffmpeg-core.wasm (~25MB)',
      '   - ffmpeg-core.worker.js (~5KB)',
      '2. 确保在 HTTPS 环境或 localhost 下运行',
      '3. 尝试清除浏览器缓存并刷新页面',
      '4. 检查浏览器是否支持 WebAssembly',
      '5. 关闭浏览器的安全软件或广告拦截器'
    ];

    throw new Error(`QuickFix 失败: ${error.message}\n\n修复建议:\n${suggestions.join('\n')}`);
  }
}

/**
 * 检查系统环境是否适合运行 FFmpeg
 */
export function checkQuickFixEnvironment(): {
  canRun: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // 检查基本环境
  if (typeof WebAssembly === 'undefined') {
    issues.push('浏览器不支持 WebAssembly');
    suggestions.push('更新浏览器到最新版本');
  }

  if (typeof SharedArrayBuffer === 'undefined') {
    issues.push('浏览器不支持 SharedArrayBuffer');
    suggestions.push('确保在 HTTPS 环境下运行');
  }

  if (!window.isSecureContext) {
    issues.push('非安全上下文环境');
    suggestions.push('使用 HTTPS 或 localhost');
  }

  // 检查内存
  const nav = navigator as any;
  if (nav.deviceMemory && nav.deviceMemory < 4) {
    issues.push('设备内存可能不足');
    suggestions.push('关闭其他标签页释放内存');
  }

  // 检查浏览器版本
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) {
    const chromeVersion = parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0');
    if (chromeVersion < 87) {
      issues.push('Chrome 版本过低');
      suggestions.push('更新 Chrome 到 87+ 版本');
    }
  } else if (userAgent.includes('Firefox')) {
    const firefoxVersion = parseInt(userAgent.match(/Firefox\/(\d+)/)?.[1] || '0');
    if (firefoxVersion < 79) {
      issues.push('Firefox 版本过低');
      suggestions.push('更新 Firefox 到 79+ 版本');
    }
  }

  return {
    canRun: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * 一键解决常见问题
 */
export async function oneClickFix(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  console.log('🔧 [OneClickFix] 开始一键修复...');

  try {
    // 1. 环境检查
    const envCheck = checkQuickFixEnvironment();
    if (!envCheck.canRun) {
      return {
        success: false,
        message: `环境不支持: ${envCheck.issues.join(', ')}`,
        details: envCheck
      };
    }

    // 2. 清理现有实例
    if (quickFixInstance) {
      try {
        quickFixInstance.terminate?.();
      } catch { }
      quickFixInstance = null;
    }

    // 3. 快速初始化
    await quickFixFFmpeg();

    return {
      success: true,
      message: 'FFmpeg 一键修复成功！现在可以正常使用视频编辑功能。'
    };

  } catch (error) {
    return {
      success: false,
      message: `一键修复失败: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
}

export { quickFixInstance };
