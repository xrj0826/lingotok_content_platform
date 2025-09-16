/**
 * 内存管理器
 * 监控内存使用，自动清理缓存，防止内存泄漏
 */

export interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
  usageRatio: number;
  available: number;
}

export interface CacheItem {
  key: string;
  data: any;
  size: number;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

/**
 * 内存管理器类
 */
export class MemoryManager {
  private memoryThreshold = 0.8; // 80%内存使用率阈值
  private checkInterval: number | null = null;
  private cache = new Map<string, CacheItem>();
  private maxCacheSize = 100 * 1024 * 1024; // 100MB缓存限制
  private currentCacheSize = 0;
  private cleanupCallbacks = new Set<() => void>();

  /**
   * 开始内存监控
   */
  startMonitoring(onMemoryWarning?: (memoryInfo: MemoryInfo) => void): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    console.log('[MemoryManager] 开始内存监控...');

    this.checkInterval = window.setInterval(() => {
      const memoryInfo = this.getMemoryInfo();

      if (memoryInfo && memoryInfo.usageRatio > this.memoryThreshold) {
        console.warn('[MemoryManager] 内存使用率过高:', memoryInfo);
        onMemoryWarning?.(memoryInfo);
        this.performEmergencyCleanup();
      }
    }, 5000);
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[MemoryManager] 停止内存监控');
    }
  }

  /**
   * 获取内存使用信息
   */
  getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        available: memory.jsHeapSizeLimit - memory.usedJSHeapSize
      };
    }
    return null;
  }

  /**
   * 添加缓存项
   */
  addToCache(key: string, data: any): boolean {
    const size = this.estimateSize(data);

    // 检查是否超过缓存限制
    if (size > this.maxCacheSize) {
      console.warn('[MemoryManager] 数据过大，无法缓存:', key, size);
      return false;
    }

    // 如果需要，清理缓存空间
    this.ensureCacheSpace(size);

    const item: CacheItem = {
      key,
      data,
      size,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now()
    };

    this.cache.set(key, item);
    this.currentCacheSize += size;

    console.log(`[MemoryManager] 缓存添加: ${key} (${this.formatBytes(size)})`);
    return true;
  }

  /**
   * 从缓存获取数据
   */
  getFromCache(key: string): any {
    const item = this.cache.get(key);
    if (item) {
      item.accessCount++;
      item.lastAccess = Date.now();
      return item.data;
    }
    return null;
  }

  /**
   * 从缓存移除数据
   */
  removeFromCache(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.currentCacheSize -= item.size;
      console.log(`[MemoryManager] 缓存移除: ${key} (${this.formatBytes(item.size)})`);
      return true;
    }
    return false;
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    const size = this.currentCacheSize;
    this.cache.clear();
    this.currentCacheSize = 0;
    console.log(`[MemoryManager] 清空缓存: ${this.formatBytes(size)}`);
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    itemCount: number;
    totalSize: number;
    maxSize: number;
    usageRatio: number;
    oldestItem?: string;
    newestItem?: string;
  } {
    const items = Array.from(this.cache.values());
    const sorted = items.sort((a, b) => a.timestamp - b.timestamp);

    return {
      itemCount: this.cache.size,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      usageRatio: this.currentCacheSize / this.maxCacheSize,
      oldestItem: sorted[0]?.key,
      newestItem: sorted[sorted.length - 1]?.key
    };
  }

  /**
   * 确保有足够的缓存空间
   */
  private ensureCacheSpace(requiredSize: number): void {
    while (this.currentCacheSize + requiredSize > this.maxCacheSize && this.cache.size > 0) {
      this.evictLeastUsed();
    }
  }

  /**
   * 驱逐最少使用的缓存项
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastUsedScore = Infinity;

    for (const [key, item] of this.cache) {
      // 计算使用分数（访问次数 / 时间因子）
      const timeFactor = (Date.now() - item.lastAccess) / 1000; // 秒
      const score = item.accessCount / (1 + timeFactor);

      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.removeFromCache(leastUsedKey);
    }
  }

  /**
   * 紧急清理
   */
  performEmergencyCleanup(): void {
    console.warn('[MemoryManager] 执行紧急清理...');

    // 1. 清理过期缓存
    this.cleanExpiredCache();

    // 2. 清理一半缓存
    const targetSize = this.maxCacheSize * 0.5;
    while (this.currentCacheSize > targetSize && this.cache.size > 0) {
      this.evictLeastUsed();
    }

    // 3. 调用注册的清理回调
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[MemoryManager] 清理回调执行失败:', error);
      }
    });

    // 4. 强制垃圾回收（如果支持）
    if ('gc' in window) {
      (window as any).gc();
    }

    console.log('[MemoryManager] 紧急清理完成');
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(maxAge: number = 10 * 60 * 1000): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache) {
      if (now - item.lastAccess > maxAge) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.removeFromCache(key));

    if (expiredKeys.length > 0) {
      console.log(`[MemoryManager] 清理过期缓存: ${expiredKeys.length}项`);
    }
  }

  /**
   * 注册清理回调
   */
  registerCleanupCallback(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback);

    // 返回取消注册的函数
    return () => {
      this.cleanupCallbacks.delete(callback);
    };
  }

  /**
   * 估算数据大小
   */
  private estimateSize(data: any): number {
    if (data instanceof Blob) {
      return data.size;
    }

    if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      return data.byteLength;
    }

    if (typeof data === 'string') {
      return data.length * 2; // 字符串大约2字节/字符
    }

    if (data instanceof HTMLCanvasElement) {
      return data.width * data.height * 4; // RGBA
    }

    if (data instanceof ImageData) {
      return data.data.length;
    }

    // 对象类型的粗略估算
    try {
      const jsonStr = JSON.stringify(data);
      return jsonStr.length * 2;
    } catch {
      return 1024; // 默认1KB
    }
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  }

  /**
   * 设置内存阈值
   */
  setMemoryThreshold(threshold: number): void {
    if (threshold > 0 && threshold <= 1) {
      this.memoryThreshold = threshold;
      console.log(`[MemoryManager] 内存阈值设置为: ${threshold * 100}%`);
    }
  }

  /**
   * 设置最大缓存大小
   */
  setMaxCacheSize(size: number): void {
    if (size > 0) {
      this.maxCacheSize = size;
      // 如果当前缓存超过新限制，进行清理
      if (this.currentCacheSize > size) {
        this.ensureCacheSpace(0);
      }
      console.log(`[MemoryManager] 最大缓存大小设置为: ${this.formatBytes(size)}`);
    }
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    this.stopMonitoring();
    this.clearCache();
    this.cleanupCallbacks.clear();
    console.log('[MemoryManager] 内存管理器已销毁');
  }
}

// 导出单例实例
export const memoryManager = new MemoryManager();






















