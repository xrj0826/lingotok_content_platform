/**
 * 错误恢复管理器
 * 实现重试机制、错误分类和恢复策略
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error) => boolean;
}

export interface ErrorInfo {
  type: string;
  message: string;
  recoverable: boolean;
  suggestions: string[];
}

/**
 * 错误恢复管理器类
 */
export class ErrorRecoveryManager {
  private retryCount = new Map<string, number>();
  private defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: () => true
  };

  /**
   * 执行带重试机制的操作
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    options: RetryOptions = {},
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    const attempts = this.retryCount.get(operationId) || 0;

    try {
      const result = await operation();
      // 成功后清除重试计数
      this.retryCount.delete(operationId);
      return result;
    } catch (error) {
      const err = error as Error;

      // 检查是否应该重试
      if (!config.retryCondition(err) || attempts >= config.maxRetries) {
        this.retryCount.delete(operationId);
        throw this.enhanceError(err, operationId);
      }

      // 更新重试计数
      const nextAttempt = attempts + 1;
      this.retryCount.set(operationId, nextAttempt);

      // 通知重试回调
      onRetry?.(nextAttempt, err);

      // 计算延迟时间（指数退避）
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffFactor, attempts),
        config.maxDelay
      );

      console.warn(`[ErrorRecoveryManager] 操作 ${operationId} 第${nextAttempt}次重试，${delay}ms后执行`);

      // 等待后重试
      await this.sleep(delay);
      return this.executeWithRetry(operation, operationId, options, onRetry);
    }
  }

  /**
   * 分析错误类型并提供解决建议
   */
  analyzeError(error: Error): ErrorInfo {
    const message = error.message.toLowerCase();

    // FFmpeg相关错误
    if (message.includes('ffmpeg') || message.includes('sharedarraybuffer')) {
      if (message.includes('sharedarraybuffer')) {
        return {
          type: 'ENVIRONMENT_ERROR',
          message: 'SharedArrayBuffer不可用',
          recoverable: false,
          suggestions: [
            '确保使用HTTPS或localhost环境',
            '检查浏览器版本（需要Chrome 68+, Firefox 79+, Safari 15.2+）',
            '验证CORS头部配置',
            '重启开发服务器'
          ]
        };
      }

      if (message.includes('timeout') || message.includes('超时')) {
        return {
          type: 'TIMEOUT_ERROR',
          message: 'FFmpeg加载或处理超时',
          recoverable: true,
          suggestions: [
            '检查网络连接',
            '减小文件大小',
            '降低处理质量',
            '重试操作'
          ]
        };
      }

      return {
        type: 'FFMPEG_ERROR',
        message: 'FFmpeg处理错误',
        recoverable: true,
        suggestions: [
          '检查视频文件格式',
          '确认文件未损坏',
          '尝试不同的处理参数',
          '重新上传文件'
        ]
      };
    }

    // 内存相关错误
    if (message.includes('memory') || message.includes('内存')) {
      return {
        type: 'MEMORY_ERROR',
        message: '内存不足',
        recoverable: true,
        suggestions: [
          '关闭其他标签页释放内存',
          '处理较小的文件',
          '降低处理质量',
          '分段处理大文件'
        ]
      };
    }

    // 网络相关错误
    if (message.includes('network') || message.includes('fetch') || message.includes('load')) {
      return {
        type: 'NETWORK_ERROR',
        message: '网络连接问题',
        recoverable: true,
        suggestions: [
          '检查网络连接',
          '重新加载页面',
          '清除浏览器缓存',
          '稍后重试'
        ]
      };
    }

    // 文件相关错误
    if (message.includes('file') || message.includes('文件')) {
      return {
        type: 'FILE_ERROR',
        message: '文件处理错误',
        recoverable: false,
        suggestions: [
          '检查文件格式是否支持',
          '确认文件未损坏',
          '尝试重新选择文件',
          '转换文件格式后重试'
        ]
      };
    }

    // 取消操作
    if (message.includes('abort') || message.includes('cancel') || message.includes('取消')) {
      return {
        type: 'CANCELLED_ERROR',
        message: '操作已取消',
        recoverable: false,
        suggestions: ['重新开始操作']
      };
    }

    // 默认错误
    return {
      type: 'UNKNOWN_ERROR',
      message: error.message,
      recoverable: true,
      suggestions: [
        '刷新页面重试',
        '检查控制台错误信息',
        '联系技术支持'
      ]
    };
  }

  /**
   * 增强错误信息
   */
  private enhanceError(error: Error, operationId: string): Error {
    const errorInfo = this.analyzeError(error);
    const attempts = this.retryCount.get(operationId) || 0;

    const enhancedMessage = `
操作失败: ${operationId}
错误类型: ${errorInfo.type}
错误信息: ${errorInfo.message}
重试次数: ${attempts}
解决建议: ${errorInfo.suggestions.join('; ')}
原始错误: ${error.message}
    `.trim();

    const enhancedError = new Error(enhancedMessage);
    enhancedError.name = errorInfo.type;
    enhancedError.stack = error.stack;

    return enhancedError;
  }

  /**
   * 重置特定操作的重试计数
   */
  resetRetryCount(operationId: string): void {
    this.retryCount.delete(operationId);
  }

  /**
   * 重置所有重试计数
   */
  resetAllRetryCounts(): void {
    this.retryCount.clear();
  }

  /**
   * 获取操作的重试次数
   */
  getRetryCount(operationId: string): number {
    return this.retryCount.get(operationId) || 0;
  }

  /**
   * 检查操作是否可以重试
   */
  canRetry(operationId: string, maxRetries: number = this.defaultOptions.maxRetries): boolean {
    return this.getRetryCount(operationId) < maxRetries;
  }

  /**
   * 创建重试条件函数
   */
  createRetryCondition(errorTypes: string[]): (error: Error) => boolean {
    return (error: Error) => {
      const errorInfo = this.analyzeError(error);
      return errorInfo.recoverable && errorTypes.includes(errorInfo.type);
    };
  }

  /**
   * 睡眠工具函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取错误统计信息
   */
  getStatistics(): {
    totalOperations: number;
    activeRetries: number;
    maxRetryCount: number;
  } {
    const retryValues = Array.from(this.retryCount.values());

    return {
      totalOperations: this.retryCount.size,
      activeRetries: retryValues.length,
      maxRetryCount: retryValues.length > 0 ? Math.max(...retryValues) : 0
    };
  }
}

/**
 * 预定义的重试配置
 */
export const RetryConfigs = {
  // 快速重试：适用于轻量级操作
  FAST: {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 2000,
    backoffFactor: 1.5
  },

  // 标准重试：适用于一般操作
  STANDARD: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2
  },

  // 耐心重试：适用于重要但耗时的操作
  PATIENT: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffFactor: 2
  },

  // 网络操作重试
  NETWORK: {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 8000,
    backoffFactor: 2,
    retryCondition: (error: Error) => {
      const message = error.message.toLowerCase();
      return message.includes('network') ||
        message.includes('fetch') ||
        message.includes('timeout') ||
        message.includes('connection');
    }
  }
};

// 导出单例实例
export const errorRecoveryManager = new ErrorRecoveryManager();






















