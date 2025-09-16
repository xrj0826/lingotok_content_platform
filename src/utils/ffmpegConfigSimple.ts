/**
 * 简化版FFmpeg配置 - 解决加载卡死问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * 简化版FFmpeg实例获取
 */
export async function getSimpleFFmpegInstance(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // 等待加载完成
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return ffmpegInstance!;
  }

  isLoading = true;

  try {
    console.log('🚀 开始简化版FFmpeg加载...');

    // 检查基础环境
    if (typeof SharedArrayBuffer === 'undefined') {
      throw new Error('SharedArrayBuffer不可用');
    }

    if (typeof crossOriginIsolated === 'undefined' || !crossOriginIsolated) {
      throw new Error('跨域隔离未启用');
    }

    ffmpegInstance = new FFmpeg();

    // 设置事件监听
    ffmpegInstance.on('log', ({ message }) => {
      console.log('📝 FFmpeg:', message);
    });

    ffmpegInstance.on('progress', ({ progress }) => {
      console.log('⏳ FFmpeg进度:', `${Math.round(progress * 100)}%`);
    });

    console.log('🔄 使用默认配置加载FFmpeg...');

    // 使用默认配置，让FFmpeg自动选择最佳方式
    await ffmpegInstance.load();

    console.log('✅ 简化版FFmpeg加载成功！');
    return ffmpegInstance;

  } catch (error) {
    console.error('❌ 简化版FFmpeg加载失败:', error);
    ffmpegInstance = null;
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * 重置FFmpeg实例
 */
export function resetSimpleFFmpegInstance(): void {
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch (error) {
      console.warn('FFmpeg终止时出现警告:', error);
    }
  }
  ffmpegInstance = null;
  isLoading = false;
}

/**
 * 检查FFmpeg是否已加载
 */
export function isFFmpegLoaded(): boolean {
  return ffmpegInstance !== null;
}

