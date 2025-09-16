/**
 * 正确的FFmpeg配置 - 按照CSDN文档最佳实践
 * 参考：https://blog.csdn.net/qq_45902692/article/details/135032429
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * 按照文档推荐的方式获取FFmpeg实例
 */
export async function getCorrectFFmpegInstance(): Promise<FFmpeg> {
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
    console.log('🚀 按照文档标准初始化FFmpeg...');

    // 检查环境
    if (typeof SharedArrayBuffer === 'undefined') {
      throw new Error('SharedArrayBuffer不可用');
    }

    if (typeof crossOriginIsolated === 'undefined' || !crossOriginIsolated) {
      throw new Error('跨域隔离未启用，请检查CORS头部配置');
    }

    console.log('✅ 环境检查通过');

    // 创建FFmpeg实例
    ffmpegInstance = new FFmpeg();

    // 设置日志监听（按照文档推荐）
    ffmpegInstance.on('log', ({ message }) => {
      console.log('📝 FFmpeg日志:', message);
    });

    // 设置进度监听
    ffmpegInstance.on('progress', ({ progress, time }) => {
      console.log('⏳ FFmpeg进度:', `${Math.round(progress * 100)}% (${time}ms)`);
    });

    console.log('🔧 开始加载FFmpeg核心文件...');

    // 按照文档推荐的方式配置文件路径
    const baseURL = '/ffmpeg';  // 静态文件路径

    // 检查所有必需文件是否存在
    const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js', 'const.js', 'errors.js'];
    for (const file of files) {
      try {
        const response = await fetch(`${baseURL}/${file}`);
        if (!response.ok) {
          throw new Error(`${file} 无法访问: ${response.status}`);
        }
        console.log(`✅ ${file} 文件检查通过`);
      } catch (error) {
        console.error(`❌ ${file} 检查失败:`, error);
        throw new Error(`FFmpeg文件 ${file} 无法访问，请确保所有依赖文件存在于 public/ffmpeg/ 目录中`);
      }
    }

    // 使用toBlobURL加载文件（这是关键！）
    console.log('🔄 使用toBlobURL转换文件...');

    await ffmpegInstance.load({
      coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`/ffmpeg/ffmpeg-core.worker.js`, 'text/javascript'),
    });

    console.log('🎉 FFmpeg加载成功！');
    return ffmpegInstance;

  } catch (error) {
    console.error('❌ FFmpeg加载失败:', error);
    ffmpegInstance = null;

    // 根据错误类型提供具体建议
    if (error instanceof Error) {
      if (error.message.includes('SharedArrayBuffer')) {
        throw new Error('SharedArrayBuffer不可用。解决方案：\n1. 确保使用HTTPS或localhost\n2. 检查vite.config.ts中的CORS头部配置\n3. 重启开发服务器');
      } else if (error.message.includes('无法访问')) {
        throw new Error('FFmpeg文件无法访问。解决方案：\n1. 确保文件存在于public/ffmpeg/目录\n2. 检查文件权限\n3. 重新下载FFmpeg文件');
      }
    }

    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * 重置FFmpeg实例
 */
export function resetCorrectFFmpegInstance(): void {
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
export function isCorrectFFmpegLoaded(): boolean {
  return ffmpegInstance !== null;
}
