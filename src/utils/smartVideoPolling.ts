/**
 * 智能视频轮询工具
 * 用于高效地轮询视频生成状态，支持多种轮询策略
 */

import { getAIGCDialog, type AIGCDialog } from '@/api/aigc-video';

// 轮询配置接口
export interface PollingConfig {
  /** 最大轮询次数 */
  maxAttempts?: number;
  /** 初始轮询间隔（毫秒） */
  initialInterval?: number;
  /** 最大轮询间隔（毫秒） */
  maxInterval?: number;
  /** 轮询间隔递增因子 */
  backoffFactor?: number;
  /** 轮询超时时间（毫秒） */
  timeout?: number;
  /** 是否启用智能退避 */
  enableBackoff?: boolean;
  /** 进度回调 */
  onProgress?: (attempt: number, maxAttempts: number, message: string) => void;
  /** 数据变化回调 */
  onDataChange?: (data: AIGCDialog, isChanged: boolean) => void;
}

// 默认配置
const DEFAULT_CONFIG: Required<PollingConfig> = {
  maxAttempts: 30,
  initialInterval: 3000,
  maxInterval: 10000,
  backoffFactor: 1.2,
  timeout: 300000, // 5分钟
  enableBackoff: true,
  onProgress: () => { },
  onDataChange: () => { }
};

// 轮询状态
interface PollingState {
  attempt: number;
  interval: number;
  lastData: AIGCDialog | null;
  startTime: number;
  isActive: boolean;
  abortController: AbortController;
}

/**
 * 创建智能视频轮询器
 */
export function createVideoPolling(
  getData: () => Promise<AIGCDialog>,
  options: {
    checkVideoReady: (data: AIGCDialog) => boolean;
    onDataChange?: (data: AIGCDialog, isChanged: boolean) => void;
    onProgress?: (attempt: number, maxAttempts: number, message: string) => void;
    config?: Partial<PollingConfig>;
  }
) {
  const config = { ...DEFAULT_CONFIG, ...options.config };

  const state: PollingState = {
    attempt: 0,
    interval: config.initialInterval,
    lastData: null,
    startTime: Date.now(),
    isActive: false,
    abortController: new AbortController()
  };

  let timeoutId: NodeJS.Timeout | null = null;

  // 计算下一个轮询间隔
  const calculateNextInterval = (): number => {
    if (!config.enableBackoff) {
      return config.initialInterval;
    }

    const newInterval = Math.min(
      state.interval * config.backoffFactor,
      config.maxInterval
    );

    return Math.floor(newInterval);
  };

  // 检查数据是否发生变化
  const hasDataChanged = (newData: AIGCDialog): boolean => {
    if (!state.lastData) return true;

    // 简单的深度比较关键字段
    const oldDetailA = state.lastData.detail_a;
    const newDetailA = newData.detail_a;
    const oldDetailB = state.lastData.detail_b;
    const newDetailB = newData.detail_b;

    return (
      oldDetailA?.gen_ai_video_succeed !== newDetailA?.gen_ai_video_succeed ||
      oldDetailB?.gen_ai_video_succeed !== newDetailB?.gen_ai_video_succeed ||
      (oldDetailA?.ai_video_url_list?.length || 0) !== (newDetailA?.ai_video_url_list?.length || 0) ||
      (oldDetailB?.ai_video_url_list?.length || 0) !== (newDetailB?.ai_video_url_list?.length || 0) ||
      state.lastData.play_url !== newData.play_url
    );
  };

  // 执行单次轮询
  const performPoll = async (): Promise<boolean> => {
    try {
      state.attempt++;

      // 检查是否被中止
      if (state.abortController.signal.aborted) {
        return false;
      }

      // 检查超时
      const elapsed = Date.now() - state.startTime;
      if (elapsed > config.timeout) {
        throw new Error(`轮询超时 (${config.timeout / 1000}秒)`);
      }

      // 更新进度（减少控制台输出）
      const progressMessage = `正在检查视频生成状态... (${state.attempt}/${config.maxAttempts})`;
      // 只在有onProgress回调时才调用，减少不必要的输出
      if (options.onProgress) {
        options.onProgress(state.attempt, config.maxAttempts, progressMessage);
      }

      // 获取数据
      const newData = await getData();

      // 检查数据变化
      const isChanged = hasDataChanged(newData);
      if (isChanged) {
        state.lastData = newData;
        config.onDataChange(newData, isChanged);
        options.onDataChange?.(newData, isChanged);
      }

      // 检查是否完成
      if (options.checkVideoReady(newData)) {
        console.log(`✅ [SmartVideoPolling] 检测到新视频，停止轮询 (轮询${state.attempt}次)`);
        return true; // 轮询成功完成
      }

      // 检查是否达到最大尝试次数
      if (state.attempt >= config.maxAttempts) {
        throw new Error(`轮询次数超限 (${config.maxAttempts}次)`);
      }

      // 计算下一次轮询间隔
      state.interval = calculateNextInterval();

      return false; // 继续轮询

    } catch (error) {
      console.error('❌ [SmartVideoPolling] 轮询失败:', error);
      throw error;
    }
  };

  // 启动轮询
  const start = (): Promise<AIGCDialog> => {
    return new Promise((resolve, reject) => {
      if (state.isActive) {
        reject(new Error('轮询已在进行中'));
        return;
      }

      state.isActive = true;
      state.attempt = 0;
      state.interval = config.initialInterval;
      state.startTime = Date.now();
      state.abortController = new AbortController();

      console.log('🚀 [SmartVideoPolling] 开始智能视频轮询', {
        maxAttempts: config.maxAttempts,
        initialInterval: config.initialInterval,
        timeout: config.timeout
      });

      const poll = async () => {
        try {
          const isComplete = await performPoll();

          if (isComplete && state.lastData) {
            state.isActive = false;
            resolve(state.lastData);
            return;
          }

          // 继续轮询
          if (state.isActive && !state.abortController.signal.aborted) {
            timeoutId = setTimeout(poll, state.interval);
          }

        } catch (error) {
          state.isActive = false;
          reject(error);
        }
      };

      // 立即开始第一次轮询
      poll();
    });
  };

  // 停止轮询
  const stop = () => {
    console.log('⏹️ [SmartVideoPolling] 停止轮询');
    state.isActive = false;
    state.abortController.abort();

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  // 获取轮询状态
  const getState = () => ({
    isActive: state.isActive,
    attempt: state.attempt,
    maxAttempts: config.maxAttempts,
    elapsed: Date.now() - state.startTime,
    lastData: state.lastData
  });

  return {
    start,
    stop,
    getState
  };
}

/**
 * 轮询角色A视频生成状态
 */
export function pollRoleAVideos(
  dialogId: string,
  options: {
    onProgress?: (attempt: number, maxAttempts: number, message: string) => void;
    onDataChange?: (videos: string[], content: string[]) => void;
    config?: Partial<PollingConfig>;
  } = {}
) {
  return createVideoPolling(
    async () => {
      const response = await getAIGCDialog(dialogId);
      if (response.code === 200 || response.code === 0) {
        return response.data.aigc_dialog;
      }
      throw new Error(response.message || '获取对话数据失败');
    },
    {
      checkVideoReady: (data) => {
        const detailA = data.detail_a;
        return !!(detailA?.gen_ai_video_succeed && detailA.ai_video_url_list?.length > 0);
      },
      onDataChange: (data, isChanged) => {
        if (isChanged && data.detail_a?.ai_video_url_list?.length > 0) {
          options.onDataChange?.(
            data.detail_a.ai_video_url_list,
            data.detail_a.content_list || []
          );
        }
      },
      onProgress: options.onProgress,
      config: options.config
    }
  );
}

/**
 * 轮询角色B视频生成状态
 */
export function pollRoleBVideos(
  dialogId: string,
  options: {
    onProgress?: (attempt: number, maxAttempts: number, message: string) => void;
    onDataChange?: (videos: string[], content: string[]) => void;
    config?: Partial<PollingConfig>;
  } = {}
) {
  return createVideoPolling(
    async () => {
      const response = await getAIGCDialog(dialogId);
      if (response.code === 200 || response.code === 0) {
        return response.data.aigc_dialog;
      }
      throw new Error(response.message || '获取对话数据失败');
    },
    {
      checkVideoReady: (data) => {
        const detailB = data.detail_b;
        return !!(detailB?.gen_ai_video_succeed && detailB.ai_video_url_list?.length > 0);
      },
      onDataChange: (data, isChanged) => {
        if (isChanged && data.detail_b?.ai_video_url_list?.length > 0) {
          options.onDataChange?.(
            data.detail_b.ai_video_url_list,
            data.detail_b.content_list || []
          );
        }
      },
      onProgress: options.onProgress,
      config: options.config
    }
  );
}

/**
 * 轮询完整对话视频状态
 */
export function pollCompleteDialog(
  dialogId: string,
  options: {
    onProgress?: (attempt: number, maxAttempts: number, message: string) => void;
    onDataChange?: (data: AIGCDialog) => void;
    config?: Partial<PollingConfig>;
  } = {}
) {
  return createVideoPolling(
    async () => {
      const response = await getAIGCDialog(dialogId);
      if (response.code === 200 || response.code === 0) {
        return response.data.aigc_dialog;
      }
      throw new Error(response.message || '获取对话数据失败');
    },
    {
      checkVideoReady: (data) => {
        const detailA = data.detail_a;
        const detailB = data.detail_b;
        return !!(
          detailA?.gen_ai_video_succeed &&
          detailB?.gen_ai_video_succeed &&
          detailA.ai_video_url_list?.length > 0 &&
          detailB.ai_video_url_list?.length > 0
        );
      },
      onDataChange: (data, isChanged) => {
        if (isChanged) {
          options.onDataChange?.(data);
        }
      },
      onProgress: options.onProgress,
      config: options.config
    }
  );
}

export default {
  createVideoPolling,
  pollRoleAVideos,
  pollRoleBVideos,
  pollCompleteDialog
};