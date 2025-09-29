/**
 * FFmpeg操作管理器
 * 确保FFmpeg操作按顺序执行，避免重复加载和竞争条件
 */

import { getSharedFFmpegStatus, preloadSharedFFmpeg } from './ffmpegSharedInstance';

// 操作队列
let operationQueue: Array<{
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

let isProcessing = false;
let retryCount = 0;
const MAX_RETRIES = 3;

/**
 * 执行FFmpeg操作，确保先等待FFmpeg加载完成
 * @param operation 要执行的操作函数
 * @returns 操作结果的Promise
 */
export async function executeFFmpegOperation<T>(operation: () => Promise<T>): Promise<T> {
  // 创建一个Promise，将其加入队列
  return new Promise<T>((resolve, reject) => {
    operationQueue.push({
      operation,
      resolve,
      reject
    });

    // 如果当前没有正在处理的操作，开始处理队列
    if (!isProcessing) {
      processQueue();
    }
  });
}

/**
 * 处理操作队列
 */
async function processQueue() {
  if (isProcessing || operationQueue.length === 0) {
    return;
  }

  isProcessing = true;

  try {
    // 检查FFmpeg是否已经加载
    const ffmpegStatus = getSharedFFmpegStatus();

    if (!ffmpegStatus.isLoaded) {
      console.log('⏳ FFmpeg尚未加载完成，等待加载...');

      try {
        // 尝试加载FFmpeg
        await preloadSharedFFmpeg();
        console.log('✅ FFmpeg加载完成，可以开始处理操作');
      } catch (error) {
        // 如果加载失败，尝试重试
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.warn(`⚠️ FFmpeg加载失败，尝试重试 (${retryCount}/${MAX_RETRIES})`, error);

          // 延迟1秒后重试
          setTimeout(() => {
            isProcessing = false;
            processQueue();
          }, 1000);
          return;
        } else {
          console.error('❌ FFmpeg加载失败，已达到最大重试次数:', error);
          throw error;
        }
      }
    } else {
      console.log('✅ FFmpeg已加载，可以直接处理操作');
      // 重置重试计数
      retryCount = 0;
    }

    // 处理队列中的第一个操作
    const currentTask = operationQueue.shift();
    if (currentTask) {
      try {
        const result = await currentTask.operation();
        currentTask.resolve(result);
      } catch (error) {
        console.error('❌ FFmpeg操作执行失败:', error);
        currentTask.reject(error);
      }
    }
  } catch (error) {
    console.error('❌ 队列处理过程中发生错误:', error);
    // 如果出错，拒绝队列中的第一个操作
    if (operationQueue.length > 0) {
      const failedTask = operationQueue.shift();
      failedTask?.reject(error);
    }
  } finally {
    isProcessing = false;

    // 检查是否还有待处理的操作
    if (operationQueue.length > 0) {
      setTimeout(processQueue, 0);
    }
  }
}

/**
 * 等待FFmpeg加载完成
 */
async function waitForFFmpegLoad(timeout = 300000): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const ffmpegStatus = getSharedFFmpegStatus();

      // 检查是否已加载完成
      if (ffmpegStatus.isLoaded) {
        clearInterval(checkInterval);
        resolve();
        return;
      }

      // 检查是否超时
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('等待FFmpeg加载超时'));
        return;
      }
    }, 1000);
  });
}

/**
 * 获取FFmpeg操作队列状态
 */
export function getFFmpegOperationQueueStatus() {
  return {
    queueLength: operationQueue.length,
    isProcessing,
    ffmpegStatus: getSharedFFmpegStatus(),
    retryCount
  };
}