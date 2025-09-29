/**
 * 视频处理UI工具
 * 提供视频处理过程中的UI交互功能
 */

import { createApp, h } from 'vue';
import FFmpegProgressOverlay from '@/components/FFmpegProgressOverlay.vue';
import { getSharedFFmpegStatus, preloadSharedFFmpeg } from './ffmpegSharedInstance';
import { isBrowser, safeDocument, executeInBrowser } from './isBrowser';

interface ProgressOptions {
  title?: string;
  message?: string;
  cancelable?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
}

// 保存overlay实例
let overlayInstance: any = null;
let overlayContainer: HTMLElement | null = null;

/**
 * 显示FFmpeg操作进度覆盖层
 */
export function showFFmpegProgress(options: ProgressOptions = {}): {
  updateProgress: (progress: number, message?: string) => void;
  completeProgress: (message?: string) => void;
  failProgress: (errorMessage: string) => Promise<boolean>;
  close: () => void;
} {
  // 检查是否在浏览器环境中
  if (!isBrowser) {
    console.warn('非浏览器环境，不创建进度覆盖层');
    return {
      updateProgress: () => { },
      completeProgress: () => { },
      failProgress: () => Promise.resolve(false),
      close: () => { }
    };
  }

  // 先移除可能存在的旧实例
  if (overlayInstance) {
    try {
      overlayInstance.unmount();
      safeDocument?.body.removeChild(overlayContainer!);
    } catch (e) {
      console.warn('移除旧进度覆盖层失败', e);
    }
  }

  // 创建容器
  overlayContainer = safeDocument?.createElement('div') || null;
  if (overlayContainer && safeDocument?.body) {
    safeDocument.body.appendChild(overlayContainer);
  }

  // 响应式状态
  const state = {
    visible: true,
    status: 'loading',
    title: options.title || '视频处理中',
    message: options.message || '正在准备FFmpeg引擎...',
    errorMessage: '',
    progress: 0
  };

  // 创建应用（仅在浏览器环境）
  if (overlayContainer) {
    overlayInstance = createApp({
      setup() {
        return () => h(FFmpegProgressOverlay, {
          ...state,
          onRetry: async () => {
            // 重试处理
            state.status = 'loading';
            state.message = '正在重新加载...';
            state.progress = 0;

            try {
              await preloadSharedFFmpeg();
              state.status = 'success';
              state.message = 'FFmpeg引擎加载成功';
              setTimeout(() => {
                state.visible = false;
                options.onComplete?.();
              }, 1500);
            } catch (error) {
              state.status = 'error';
              state.errorMessage = error instanceof Error ? error.message : '加载失败';
            }
          }
        });
      }
    });

    overlayInstance.mount(overlayContainer);
  }

  // 返回控制方法
  return {
    updateProgress: (progress: number, message?: string) => {
      state.progress = Math.min(Math.max(progress, 0), 100);
      if (message) {
        state.message = message;
      }
    },

    completeProgress: (message?: string) => {
      state.status = 'success';
      state.progress = 100;
      state.message = message || '处理完成';

      // 自动关闭
      setTimeout(() => {
        state.visible = false;
        options.onComplete?.();

        // 延迟卸载
        setTimeout(() => {
          if (overlayInstance) {
            overlayInstance.unmount();
            if (overlayContainer && safeDocument?.body && safeDocument.body.contains(overlayContainer)) {
              safeDocument.body.removeChild(overlayContainer);
            }
            overlayInstance = null;
            overlayContainer = null;
          }
        }, 300);
      }, 1500);
    },

    failProgress: async (errorMessage: string): Promise<boolean> => {
      state.status = 'error';
      state.errorMessage = errorMessage;

      // 返回Promise用于等待用户的重试操作
      return new Promise((resolve) => {
        const originalOnRetry = overlayInstance?._instance?.props.onRetry;

        // 重写onRetry处理函数
        overlayInstance._instance.props.onRetry = () => {
          // 调用原始的重试函数
          if (originalOnRetry) {
            originalOnRetry();
          }
          // 告诉调用者用户选择了重试
          resolve(true);
        };
      });
    },

    close: () => {
      state.visible = false;

      // 延迟卸载
      setTimeout(() => {
        if (overlayInstance) {
          overlayInstance.unmount();
          if (overlayContainer && safeDocument?.body && safeDocument.body.contains(overlayContainer)) {
            safeDocument.body.removeChild(overlayContainer);
          }
          overlayInstance = null;
          overlayContainer = null;
        }
      }, 300);
    }
  };
}

/**
 * 确保FFmpeg已加载，静默加载无UI提示
 */
export async function ensureFFmpegLoaded(): Promise<boolean> {
  // 检查FFmpeg是否已加载
  const status = getSharedFFmpegStatus();
  if (status.isLoaded) {
    return true;
  }

  try {
    // 静默加载FFmpeg，无任何UI提示
    await preloadSharedFFmpeg();
    return true;
  } catch (error) {
    console.error('FFmpeg加载失败:', error);
    return false;
  }
}

/**
 * 执行视频处理操作，不显示UI进度
 */
export async function withProcessingUI<T>(
  operation: (updateProgress: (progress: number, message?: string) => void) => Promise<T>,
  options: ProgressOptions = {}
): Promise<T> {
  // 确保FFmpeg已加载（静默模式）
  await ensureFFmpegLoaded();

  try {
    // 执行操作，使用空的进度更新函数
    const result = await operation(() => {
      // 不显示任何进度
    });

    return result;
  } catch (error) {
    console.error('视频处理失败:', error);
    throw error;
  }
}