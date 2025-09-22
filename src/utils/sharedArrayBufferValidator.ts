/**
 * SharedArrayBuffer支持检查工具
 * 用于检测浏览器环境是否支持FFmpeg所需的SharedArrayBuffer
 */

/**
 * 检查浏览器是否满足最低版本要求
 */
export function checkBrowserCompatibility(): boolean {
  const ua = navigator.userAgent;

  // Chrome 68+
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch && parseInt(chromeMatch[1], 10) >= 68) return true;

  // Firefox 79+
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  if (firefoxMatch && parseInt(firefoxMatch[1], 10) >= 79) return true;

  // Safari 15.2+
  const safariMatch = ua.match(/Version\/(\d+\.\d+).*Safari/);
  if (safariMatch && parseFloat(safariMatch[1]) >= 15.2) return true;

  return false;
}

/**
 * 综合检查SharedArrayBuffer支持状态
 */
export function checkSharedArrayBufferSupport(): {
  supported: boolean;
  details: {
    hasSharedArrayBuffer: boolean;
    isCrossOriginIsolated: boolean;
    isSecureContext: boolean;
    isCompatibleBrowser: boolean;
    protocol: string;
    hostname: string;
  };
  message: string;
} {
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const isCrossOriginIsolated = typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false;
  const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : false;
  const isCompatibleBrowser = checkBrowserCompatibility();

  // 收集环境信息
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'unknown';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';

  // 确定支持状态
  const supported = hasSharedArrayBuffer && isCrossOriginIsolated;

  // 生成消息
  let message = '';
  if (supported) {
    message = 'SharedArrayBuffer可用，FFmpeg可以正常工作';
  } else {
    const issues = [];
    if (!hasSharedArrayBuffer) issues.push('SharedArrayBuffer不可用');
    if (!isCrossOriginIsolated) issues.push('跨源隔离未启用');
    if (!isSecureContext) issues.push('非安全上下文');
    if (!isCompatibleBrowser) issues.push('浏览器版本可能不兼容');

    message = `SharedArrayBuffer不可用，FFmpeg无法使用。问题：${issues.join('，')}`;
  }

  return {
    supported,
    details: {
      hasSharedArrayBuffer,
      isCrossOriginIsolated,
      isSecureContext,
      isCompatibleBrowser,
      protocol,
      hostname
    },
    message
  };
}

/**
 * 验证SharedArrayBuffer支持状态 - 仅在控制台显示结果
 */
export function validateSharedArrayBufferSupport(
  options: {
    throwOnError?: boolean;
    logToConsole?: boolean;
    logLevel?: 'verbose' | 'normal' | 'minimal';
  } = {}
): boolean {
  const {
    throwOnError = false,
    logToConsole = true,
    logLevel = 'normal'
  } = options;

  const result = checkSharedArrayBufferSupport();

  // 记录到控制台 - 不同级别的日志详细程度
  if (logToConsole) {
    if (logLevel === 'verbose') {
      console.group('🔍 SharedArrayBuffer 详细诊断');
      console.log('🧩 SharedArrayBuffer可用:', result.details.hasSharedArrayBuffer);
      console.log('🔒 跨源隔离已启用:', result.details.isCrossOriginIsolated);
      console.log('🔐 安全上下文:', result.details.isSecureContext);
      console.log('🌐 浏览器兼容:', result.details.isCompatibleBrowser);
      console.log('📋 协议:', result.details.protocol);
      console.log('🏠 主机名:', result.details.hostname);

      if (result.supported) {
        console.log('✅ 总体状态: 支持 - FFmpeg可以正常工作');
      } else {
        console.error('❌ 总体状态: 不支持 - FFmpeg可能无法使用');
        console.warn('💡 可能的解决方法:', getSharedArrayBufferSuggestions());
      }
      console.groupEnd();
    }
    else if (logLevel === 'normal') {
      if (result.supported) {
        console.log('✅ SharedArrayBuffer 可用 - FFmpeg功能正常');
      } else {
        console.warn('⚠️ SharedArrayBuffer 不可用 - FFmpeg功能可能受限');
        // 在任何环境中都显示提示
        console.info('💡 提示: 请确保Nginx配置了正确的CORS头部: Cross-Origin-Opener-Policy: same-origin 和 Cross-Origin-Embedder-Policy: require-corp');
      }
    }
    else { // minimal
      if (!result.supported) {
        console.warn('⚠️ SharedArrayBuffer 不可用');
      }
    }
  }

  // 如果失败且配置了抛出错误 - 通常在生产环境不应抛出
  if (!result.supported && throwOnError) {
    throw new Error(result.message);
  }

  return result.supported;
}

/**
 * 生成解决方案建议
 */
export function getSharedArrayBufferSuggestions(): string[] {
  const result = checkSharedArrayBufferSupport();
  const suggestions: string[] = [];

  if (!result.supported) {
    // 浏览器兼容性问题
    if (!result.details.isCompatibleBrowser) {
      suggestions.push('升级到最新版本的Chrome、Firefox或Safari浏览器');
    }

    // 协议问题
    if (result.details.protocol !== 'https:' && result.details.hostname !== 'localhost') {
      suggestions.push('使用HTTPS协议或在localhost上运行应用');
    }

    // 跨源隔离未启用
    if (!result.details.isCrossOriginIsolated) {
      suggestions.push('确保网站配置了正确的CORS头部：Cross-Origin-Opener-Policy: same-origin和Cross-Origin-Embedder-Policy: require-corp');
    }

    // 通用建议
    suggestions.push('清除浏览器缓存并重新加载页面');
    suggestions.push('检查网站的部署配置，确保包含了正确的HTTP头部');

    if (result.details.hostname === 'localhost' || result.details.hostname === '127.0.0.1') {
      suggestions.push('重启开发服务器');
    }
  }

  return suggestions;
}
