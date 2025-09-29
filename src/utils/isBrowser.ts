/**
 * 判断当前是否在浏览器环境中运行
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * 安全的document引用，确保在非浏览器环境中不会抛出错误
 */
export const safeDocument = isBrowser ? document : undefined;

/**
 * 安全的window引用，确保在非浏览器环境中不会抛出错误
 */
export const safeWindow = isBrowser ? window : undefined;

/**
 * 安全地执行仅在浏览器环境中可用的函数
 * @param callback 需要执行的回调函数
 * @param fallbackValue 在非浏览器环境中返回的备用值
 */
export function executeInBrowser<T>(callback: () => T, fallbackValue: T): T {
  if (isBrowser) {
    return callback();
  }
  return fallbackValue;
}


