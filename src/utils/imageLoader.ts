import { getAccessibleMediaUrl } from './mediaResourceLoader';

/**
 * 测试图片是否可以直接加载
 */
async function testImageLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve(true);
    };

    img.onerror = () => {
      resolve(false);
    };

    // 设置超时
    setTimeout(() => {
      resolve(false);
    }, 5000);

    img.src = url;
  });
}

/**
 * 通过Canvas转换图片（绕过COEP限制）
 */
async function loadImageViaCanvas(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

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

    // 设置超时
    setTimeout(() => {
      resolve(null);
    }, 10000);

    img.src = url;
  });
}

/**
 * 智能图片加载器
 * 使用多种策略尝试加载图片，确保最大兼容性
 */
export async function smartImageLoader(url: string): Promise<string> {
  console.log('🖼️ [ImageLoader] 开始智能加载图片:', url);

  if (!url) {
    throw new Error('图片URL为空');
  }

  // Strategy 1: 直接测试图片是否可以加载（通常能绕过COEP显示限制）
  try {
    const canLoad = await testImageLoad(url);
    if (canLoad) {
      console.log('✅ [ImageLoader] 直接加载成功:', url);
      return url;
    }
  } catch (error) {
    console.warn('⚠️ [ImageLoader] 直接加载失败:', error);
  }

  // Strategy 2: Canvas转换（最稳定的COEP绕过方法）
  try {
    const blob = await loadImageViaCanvas(url);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ [ImageLoader] Canvas转换成功:', url);
      return blobUrl;
    }
  } catch (error) {
    console.warn('⚠️ [ImageLoader] Canvas转换失败:', error);
  }

  // Strategy 3: 回退到现有的mediaResourceLoader（包含代理）
  try {
    const accessibleUrl = await getAccessibleMediaUrl(url);
    if (accessibleUrl && accessibleUrl !== url) {
      console.log('✅ [ImageLoader] 通过mediaResourceLoader加载成功:', url);
      return accessibleUrl;
    }
  } catch (error) {
    console.warn('⚠️ [ImageLoader] mediaResourceLoader加载失败:', error);
  }

  // 最后回退：返回原始URL（让浏览器尝试）
  console.warn('💥 [ImageLoader] 所有策略都失败，返回原始URL:', url);
  return url;
}

/**
 * 清理由smartImageLoader创建的blob URL
 */
export function cleanupBlobUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
    console.log('🧹 [ImageLoader] 已清理blob URL:', url);
  }
}

/**
 * 预加载图片
 */
export async function preloadImage(url: string): Promise<boolean> {
  try {
    const processedUrl = await smartImageLoader(url);
    const success = await testImageLoad(processedUrl);

    if (!success && processedUrl !== url) {
      cleanupBlobUrl(processedUrl);
    }

    return success;
  } catch (error) {
    console.error('预加载图片失败:', error);
    return false;
  }
}

























