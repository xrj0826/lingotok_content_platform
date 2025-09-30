/**
 * 优化视频处理器使用示例
 * 展示如何整合到现有的VideoCutPanel组件中
 */

import {
  optimizedCutVideo,
  optimizedMergeVideos,
  getOptimizedVideoInfo,
  memoryManager,
  type OptimizedCutOptions,
  type OptimizedMergeOptions
} from './optimizedVideoProcessor';

/**
 * 示例1：在VideoCutPanel中使用优化的剪切功能
 */
export async function enhancedCutVideo(
  file: File,
  startTime: number,
  endTime: number,
  mode: 'fast' | 'precise' | 'timeline',
  onProgress?: (progress: number) => void
): Promise<string> {
  const options: OptimizedCutOptions = {
    startTime,
    endTime,
    mode,
    outputFormat: 'mp4',
    videoQuality: 23,
    preset: 'fast',
    onProgress
  };

  try {
    const resultUrl = await optimizedCutVideo(file, options);

    // 使用内存管理器跟踪URL
    memoryManager.trackUrl(resultUrl);

    return resultUrl;
  } catch (error) {
    console.error('视频剪切失败:', error);
    throw new Error(`剪切失败: ${error}`);
  }
}

/**
 * 示例2：智能模式选择
 */
export async function smartCutVideo(
  file: File,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  const duration = endTime - startTime;

  // 根据剪切时长智能选择模式
  let mode: 'fast' | 'precise' | 'timeline';

  if (duration < 10) {
    mode = 'timeline';  // 短片段使用精确模式
  } else if (duration < 60) {
    mode = 'precise';   // 中等长度使用重编码
  } else {
    mode = 'fast';      // 长片段使用快速模式
  }

  return enhancedCutVideo(file, startTime, endTime, mode, onProgress);
}

/**
 * 示例3：批量视频处理
 */
export async function batchProcessVideos(
  files: File[],
  operations: Array<{
    type: 'cut';
    startTime: number;
    endTime: number;
  } | {
    type: 'merge';
    enableCrossfade?: boolean;
  }>,
  onProgress?: (overall: number, current: string) => void
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    const progress = (i / operations.length) * 100;

    try {
      if (operation.type === 'cut' && files[i]) {
        onProgress?.(progress, `剪切视频 ${i + 1}`);

        const result = await enhancedCutVideo(
          files[i],
          operation.startTime,
          operation.endTime,
          'smart' as any  // 使用智能模式
        );
        results.push(result);

      } else if (operation.type === 'merge') {
        onProgress?.(progress, '合并视频');

        const mergeOptions: OptimizedMergeOptions = {
          outputFormat: 'mp4',
          useFileList: true,
          enableCrossfade: operation.enableCrossfade || false,
          fadeLength: 1.0
        };

        const result = await optimizedMergeVideos(files, mergeOptions);
        results.push(result);
      }
    } catch (error) {
      console.error(`操作 ${i} 失败:`, error);
      throw error;
    }
  }

  onProgress?.(100, '处理完成');
  return results;
}

/**
 * 示例4：内存管理最佳实践
 */
export class VideoProjectManager {
  private projectUrls = new Set<string>();

  async addVideo(file: File): Promise<{
    url: string;
    info: any;
  }> {
    // 获取视频信息
    const info = await getOptimizedVideoInfo(file);

    // 创建预览URL
    const url = URL.createObjectURL(file);
    this.projectUrls.add(url);
    memoryManager.trackUrl(url);

    return { url, info };
  }

  async cutVideo(
    file: File,
    startTime: number,
    endTime: number,
    options?: {
      mode?: 'fast' | 'precise' | 'timeline';
      quality?: number;
    }
  ): Promise<string> {
    const mode = options?.mode || 'precise';
    const quality = options?.quality || 23;

    const result = await optimizedCutVideo(file, {
      startTime,
      endTime,
      mode,
      videoQuality: quality,
      outputFormat: 'mp4'
    });

    this.projectUrls.add(result);
    return result;
  }

  async mergeVideos(files: File[], enableEffects = false): Promise<string> {
    const result = await optimizedMergeVideos(files, {
      outputFormat: 'mp4',
      useFileList: !enableEffects,
      enableCrossfade: enableEffects,
      fadeLength: 1.5
    });

    this.projectUrls.add(result);
    return result;
  }

  cleanup(): void {
    // 清理项目相关的所有URL
    this.projectUrls.forEach(url => {
      memoryManager.cleanupUrl(url);
    });
    this.projectUrls.clear();
  }

  getMemoryUsage(): {
    projectUrls: number;
    totalUrls: number;
  } {
    return {
      projectUrls: this.projectUrls.size,
      ...memoryManager.getMemoryUsage()
    };
  }
}

/**
 * 示例5：错误恢复和重试机制
 */
export async function robustVideoProcess<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`操作失败 (尝试 ${attempt}/${retries}):`, error);

      if (attempt === retries) {
        throw new Error(`操作失败，已重试 ${retries} 次: ${error}`);
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw new Error('不应该到达这里');
}

/**
 * 示例6：性能监控
 */
export class VideoPerformanceMonitor {
  private operations: Map<string, number> = new Map();

  startOperation(operationId: string): void {
    this.operations.set(operationId, Date.now());
  }

  endOperation(operationId: string): number {
    const startTime = this.operations.get(operationId);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    this.operations.delete(operationId);

    console.log(`[性能监控] ${operationId} 耗时: ${duration}ms`);
    return duration;
  }

  async monitorOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const operationId = `${operationName}_${Date.now()}`;

    this.startOperation(operationId);
    try {
      const result = await operation();
      this.endOperation(operationId);
      return result;
    } catch (error) {
      this.endOperation(operationId);
      throw error;
    }
  }
}

export const performanceMonitor = new VideoPerformanceMonitor();































































































