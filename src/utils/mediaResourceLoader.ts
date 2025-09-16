/**
 * 媒体资源加载器
 * 解决在线图片和视频无法展示的问题
 */

// 媒体资源缓存
const mediaCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string>>();

/**
 * 检查URL是否为外部资源
 */
function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * 通过Image对象加载图片并转换为Blob (更好的COEP兼容性)
 */
async function loadImageAsBlob(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();

    // 设置跨域属性
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // 创建canvas来转换图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0);

        // 转换为blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);

      } catch (error) {
        console.warn('Canvas转换失败:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    // 开始加载图片
    img.src = url;
  });
}

/**
 * 通过代理加载外部资源
 */
async function loadExternalResource(url: string): Promise<string> {
  console.log('🌐 [DEBUG] 加载外部资源:', url);

  // 方案1: 尝试通过Image对象加载 (避免COEP限制)
  try {
    const imgBlob = await loadImageAsBlob(url);
    if (imgBlob) {
      const objectUrl = URL.createObjectURL(imgBlob);
      console.log('✅ [DEBUG] Image对象加载成功:', url);
      return objectUrl;
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] Image对象加载失败，尝试fetch:', error);
  }

  try {
    // 方案2: 直接尝试加载 (no-cors模式)
    const response = await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      credentials: 'omit',
      headers: {
        'Accept': '*/*',
      }
    });

    if (response.type === 'opaque' || response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      console.log('✅ [DEBUG] 直接加载成功 (no-cors):', url);
      return objectUrl;
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] no-cors加载失败，尝试cors模式:', error);
  }

  try {
    // 方案3: 尝试CORS模式
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': '*/*',
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      console.log('✅ [DEBUG] 直接加载成功 (cors):', url);
      return objectUrl;
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] cors加载失败，尝试代理:', error);
  }

  try {
    // 方案2: 通过代理加载
    const proxyUrl = `/api/proxy-media?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      console.log('✅ [DEBUG] 代理加载成功:', url);
      return objectUrl;
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] 代理加载失败:', error);
  }

  // 方案3: 使用CORS代理服务
  try {
    const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    const response = await fetch(corsProxyUrl);

    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      console.log('✅ [DEBUG] CORS代理加载成功:', url);
      return objectUrl;
    }
  } catch (error) {
    console.warn('⚠️ [DEBUG] CORS代理加载失败:', error);
  }

  throw new Error(`无法加载外部资源: ${url}`);
}

/**
 * 获取可用的媒体URL
 */
export async function getAccessibleMediaUrl(originalUrl: string): Promise<string> {
  if (!originalUrl) {
    throw new Error('URL不能为空');
  }

  console.log('🎬 [DEBUG] 获取可访问媒体URL:', originalUrl);

  // 检查缓存
  if (mediaCache.has(originalUrl)) {
    const cachedUrl = mediaCache.get(originalUrl)!;
    console.log('💾 [DEBUG] 从缓存获取:', originalUrl);
    return cachedUrl;
  }

  // 检查是否正在加载
  if (loadingPromises.has(originalUrl)) {
    console.log('⏳ [DEBUG] 等待加载完成:', originalUrl);
    return loadingPromises.get(originalUrl)!;
  }

  // 如果是本地URL，直接返回
  if (!isExternalUrl(originalUrl)) {
    console.log('🏠 [DEBUG] 本地资源，直接返回:', originalUrl);
    return originalUrl;
  }

  // 开始加载外部资源
  const loadingPromise = loadExternalResource(originalUrl)
    .then(accessibleUrl => {
      mediaCache.set(originalUrl, accessibleUrl);
      loadingPromises.delete(originalUrl);
      return accessibleUrl;
    })
    .catch(error => {
      loadingPromises.delete(originalUrl);
      console.error('💥 [DEBUG] 资源加载失败:', originalUrl, error);
      // 返回原始URL作为fallback
      return originalUrl;
    });

  loadingPromises.set(originalUrl, loadingPromise);
  return loadingPromise;
}

/**
 * 预加载图片
 */
export async function preloadImage(url: string): Promise<HTMLImageElement> {
  console.log('🖼️ [DEBUG] 预加载图片:', url);

  const accessibleUrl = await getAccessibleMediaUrl(url);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      console.log('✅ [DEBUG] 图片预加载成功:', url);
      resolve(img);
    };

    img.onerror = (error) => {
      console.error('💥 [DEBUG] 图片预加载失败:', url, error);
      reject(new Error(`图片加载失败: ${url}`));
    };

    img.src = accessibleUrl;
  });
}

/**
 * 预加载视频
 */
export async function preloadVideo(url: string): Promise<HTMLVideoElement> {
  console.log('🎥 [DEBUG] 预加载视频:', url);

  const accessibleUrl = await getAccessibleMediaUrl(url);

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      console.log('✅ [DEBUG] 视频预加载成功:', url);
      resolve(video);
    };

    video.onerror = (error) => {
      console.error('💥 [DEBUG] 视频预加载失败:', url, error);
      reject(new Error(`视频加载失败: ${url}`));
    };

    video.src = accessibleUrl;
  });
}

/**
 * 清理缓存
 */
export function clearMediaCache(): void {
  console.log('🧹 [DEBUG] 清理媒体缓存');

  // 释放所有blob URL
  for (const [originalUrl, blobUrl] of mediaCache.entries()) {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  }

  mediaCache.clear();
  loadingPromises.clear();

  console.log('✅ [DEBUG] 媒体缓存清理完成');
}

/**
 * 获取缓存状态
 */
export function getMediaCacheStatus(): {
  cacheSize: number;
  loadingCount: number;
  cacheEntries: Array<{ original: string; accessible: string; isBlob: boolean }>;
} {
  const cacheEntries = Array.from(mediaCache.entries()).map(([original, accessible]) => ({
    original,
    accessible: accessible.length > 50 ? accessible.substring(0, 50) + '...' : accessible,
    isBlob: accessible.startsWith('blob:')
  }));

  return {
    cacheSize: mediaCache.size,
    loadingCount: loadingPromises.size,
    cacheEntries
  };
}

// 页面卸载时清理缓存
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', clearMediaCache);
}


