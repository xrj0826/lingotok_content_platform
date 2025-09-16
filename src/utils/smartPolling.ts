/**
 * 智能轮询工具
 * 支持数据对比、条件停止、智能渲染等功能
 */

export interface PollingOptions<T = any> {
  /** 轮询间隔（毫秒） */
  interval?: number;
  /** 最大轮询次数 */
  maxAttempts?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否在数据变化时触发回调 */
  onlyOnChange?: boolean;
  /** 数据比较函数 */
  compareFn?: (oldData: T, newData: T) => boolean;
  /** 停止条件判断函数 */
  shouldStop?: (data: T) => boolean;
  /** 轮询成功回调 */
  onData?: (data: T, isChanged: boolean, attempt: number) => void;
  /** 轮询完成回调 */
  onComplete?: (data: T, reason: 'success' | 'timeout' | 'maxAttempts' | 'manual') => void;
  /** 轮询错误回调 */
  onError?: (error: any, attempt: number) => void;
}

export class SmartPolling<T = any> {
  private timer: NodeJS.Timeout | null = null;
  private attempt = 0;
  private startTime = 0;
  private lastData: T | null = null;
  private isRunning = false;

  constructor(
    private fetchFn: () => Promise<T>,
    private options: PollingOptions<T> = {}
  ) {
    // 设置默认值
    this.options = {
      interval: 8000, // 8秒间隔
      maxAttempts: 0, // 0表示无限制
      timeout: 0, // 0表示无超时
      onlyOnChange: true,
      compareFn: this.defaultCompareFn,
      shouldStop: this.defaultShouldStop,
      ...options
    };
  }

  /**
   * 开始轮询
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ [SmartPolling] 轮询已在运行中');
      return;
    }

    this.isRunning = true;
    this.attempt = 0;
    this.startTime = Date.now();
    this.lastData = null;

    console.log('🚀 [SmartPolling] 开始智能轮询', {
      interval: this.options.interval,
      maxAttempts: this.options.maxAttempts,
      timeout: this.options.timeout
    });

    this.scheduleNext();
  }

  /**
   * 停止轮询
   */
  stop(reason: 'success' | 'timeout' | 'maxAttempts' | 'manual' = 'manual'): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    console.log('🛑 [SmartPolling] 停止轮询', { reason, attempt: this.attempt });

    if (this.options.onComplete && this.lastData) {
      this.options.onComplete(this.lastData, reason);
    }
  }

  /**
   * 获取轮询状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      attempt: this.attempt,
      elapsed: this.startTime ? Date.now() - this.startTime : 0,
      lastData: this.lastData
    };
  }

  /**
   * 调度下一次轮询
   */
  private scheduleNext(): void {
    if (!this.isRunning) return;

    this.timer = setTimeout(() => {
      this.poll();
    }, this.options.interval);
  }

  /**
   * 执行轮询
   */
  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    this.attempt++;
    const elapsed = Date.now() - this.startTime;

    console.log(`🔄 [SmartPolling] 第${this.attempt}次轮询 (耗时: ${elapsed}ms)`);

    // 只在明确设置了超时且需要强制停止时才检查超时
    if (this.options.timeout && this.options.timeout > 0 && elapsed > this.options.timeout) {
      console.warn('⏰ [SmartPolling] 轮询超时');
      this.stop('timeout');
      return;
    }

    // 只在明确设置了最大尝试次数且需要强制停止时才检查
    if (this.options.maxAttempts && this.options.maxAttempts > 0 && this.attempt > this.options.maxAttempts) {
      console.warn('🔢 [SmartPolling] 达到最大尝试次数');
      this.stop('maxAttempts');
      return;
    }

    try {
      // 获取数据
      const newData = await this.fetchFn();

      // 比较数据是否发生变化
      const isChanged = this.hasDataChanged(this.lastData, newData);

      console.log(`📊 [SmartPolling] 数据获取成功`, {
        attempt: this.attempt,
        isChanged,
        hasStopCondition: !!this.options.shouldStop
      });

      // 触发数据回调
      if (this.options.onData) {
        if (!this.options.onlyOnChange || isChanged || this.attempt === 1) {
          this.options.onData(newData, isChanged, this.attempt);
        }
      }

      // 更新最后数据
      this.lastData = newData;

      // 检查是否需要停止
      if (this.options.shouldStop && this.options.shouldStop(newData)) {
        console.log('✅ [SmartPolling] 满足停止条件，停止轮询');
        this.stop('success');
        return;
      }

      // 继续下一次轮询
      this.scheduleNext();

    } catch (error) {
      console.error('💥 [SmartPolling] 轮询出错:', error);

      if (this.options.onError) {
        this.options.onError(error, this.attempt);
      }

      // 出错后继续轮询（除非达到最大次数）
      this.scheduleNext();
    }
  }

  /**
   * 检查数据是否发生变化
   */
  private hasDataChanged(oldData: T | null, newData: T): boolean {
    if (oldData === null) return true;

    if (this.options.compareFn) {
      return !this.options.compareFn(oldData, newData);
    }

    return !this.defaultCompareFn(oldData, newData);
  }

  /**
   * 默认数据比较函数
   */
  private defaultCompareFn(oldData: T, newData: T): boolean {
    try {
      return JSON.stringify(oldData) === JSON.stringify(newData);
    } catch {
      return oldData === newData;
    }
  }

  /**
   * 默认停止条件（永不停止）
   */
  private defaultShouldStop(data: T): boolean {
    return false;
  }
}

/**
 * 创建视频生成轮询器
 * 基于数据变化检测，而非绝对值判断
 */
export function createVideoPolling<T>(
  fetchFn: () => Promise<T>,
  options: {
    onVideoReady?: (data: T) => void;
    onDataChange?: (data: T, isChanged: boolean) => void;
    onError?: (error: any) => void;
    checkVideoReady?: (data: T) => boolean;
    interval?: number;
    maxAttempts?: number;
    timeout?: number;
    enableTimeout?: boolean;
    customCompareFn?: (oldData: T, newData: T) => boolean; // 自定义比较函数
    stopOnContentChange?: boolean; // 新增：是否在内容一致时停止轮询（两次返回相同结果时停止）
  } = {}
): SmartPolling<T> {
  // 用于跟踪轮询实例
  let pollingInstance: SmartPolling<T>;

  pollingInstance = new SmartPolling(fetchFn, {
    interval: options.interval || 8000, // 8秒间隔
    maxAttempts: options.enableTimeout ? (options.maxAttempts || 30) : 0, // 默认无限制
    timeout: options.enableTimeout ? (options.timeout || 240000) : 0, // 默认无超时
    onlyOnChange: false, // 修改为false，确保每次都能检查内容变化
    // 使用自定义比较函数或默认比较函数
    compareFn: options.customCompareFn,
    // 基于用户定义的条件或检测新视频生成
    shouldStop: options.checkVideoReady || ((data: any) => {
      // 依赖onDataChange中的逻辑来停止
      return false;
    }),
    onData: (data, isChanged, attempt) => {
      console.log(`🎬 [VideoPolling] 轮询数据更新`, {
        attempt,
        isChanged,
        stopOnContentChange: options.stopOnContentChange,
        dataKeys: Object.keys(data || {})
      });

      // 新增逻辑：如果启用了内容变化检测，当内容不变化时（第二次及以后的相同结果）停止轮询
      if (options.stopOnContentChange && !isChanged && attempt > 1) {
        console.log('🛑 [VideoPolling] 检测到内容无变化（两次返回一致），根据用户配置停止轮询');
        pollingInstance.stop('success');
        if (options.onVideoReady) {
          options.onVideoReady(data);
        }
        return;
      }

      if (options.onDataChange) {
        options.onDataChange(data, isChanged);
      }

      // 如果检测到数据变化且满足视频就绪条件，触发回调
      if (isChanged && options.checkVideoReady && options.checkVideoReady(data)) {
        console.log('🎉 [VideoPolling] 检测到新视频生成，准备停止轮询');
        // 不在这里直接停止，而是通过shouldStop函数或手动停止
        if (options.onVideoReady) {
          options.onVideoReady(data);
        }
      }
    },
    onComplete: (data, reason) => {
      console.log(`🏁 [VideoPolling] 轮询完成`, { reason });
    },
    onError: options.onError
  });

  return pollingInstance;
}

/**
 * 简化的轮询启动函数
 */
export function startSmartPolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions<T>
): SmartPolling<T> {
  const polling = new SmartPolling(fetchFn, options);
  polling.start();
  return polling;
}









