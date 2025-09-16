/**
 * FFmpeg加载卡死问题修复工具
 * 专门解决"使用toBlobURL转换文件..."卡死问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface LoadingProgress {
  step: string;
  progress: number;
  message: string;
}

export interface LoadingResult {
  success: boolean;
  ffmpeg?: FFmpeg;
  error?: string;
  duration: number;
}

/**
 * 增强的FFmpeg加载器 - 解决toBlobURL卡死问题
 */
export class FFmpegLoadFixer {
  private static instance: FFmpegLoadFixer;
  private ffmpegInstance: FFmpeg | null = null;
  private isLoading = false;
  private loadingPromise: Promise<FFmpeg> | null = null;

  static getInstance(): FFmpegLoadFixer {
    if (!FFmpegLoadFixer.instance) {
      FFmpegLoadFixer.instance = new FFmpegLoadFixer();
    }
    return FFmpegLoadFixer.instance;
  }

  /**
   * 主要加载方法 - 带有多重失败处理
   */
  async loadFFmpeg(
    onProgress?: (progress: LoadingProgress) => void,
    timeoutMs = 30000
  ): Promise<LoadingResult> {
    const startTime = Date.now();

    if (this.ffmpegInstance?.loaded) {
      return {
        success: true,
        ffmpeg: this.ffmpegInstance,
        duration: Date.now() - startTime
      };
    }

    if (this.isLoading && this.loadingPromise) {
      try {
        const ffmpeg = await this.loadingPromise;
        return {
          success: true,
          ffmpeg,
          duration: Date.now() - startTime
        };
      } catch (error) {
        // 如果当前加载失败，重新尝试
        this.isLoading = false;
        this.loadingPromise = null;
      }
    }

    try {
      this.isLoading = true;
      this.loadingPromise = this._performLoad(onProgress, timeoutMs);
      const ffmpeg = await this.loadingPromise;

      return {
        success: true,
        ffmpeg,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    } finally {
      this.isLoading = false;
      this.loadingPromise = null;
    }
  }

  /**
   * 内部加载实现 - 多种策略
   */
  private async _performLoad(
    onProgress?: (progress: LoadingProgress) => void,
    timeoutMs = 30000
  ): Promise<FFmpeg> {
    // 策略1: 预检查环境
    onProgress?.({ step: 'env-check', progress: 5, message: '检查运行环境...' });
    await this._checkEnvironment();

    // 策略2: 预加载文件检查
    onProgress?.({ step: 'file-check', progress: 10, message: '检查FFmpeg文件...' });
    await this._checkFFmpegFiles();

    // 策略3: 尝试三种不同的加载方式
    const strategies = [
      () => this._loadWithStrategy1(onProgress),  // 标准toBlobURL方式
      () => this._loadWithStrategy2(onProgress),  // 预加载方式
      () => this._loadWithStrategy3(onProgress),  // 备用方式
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < strategies.length; i++) {
      try {
        onProgress?.({
          step: `strategy-${i + 1}`,
          progress: 20 + i * 25,
          message: `尝试加载策略 ${i + 1}/3...`
        });

        const ffmpeg = await Promise.race([
          strategies[i](),
          this._createTimeoutPromise(timeoutMs, `策略${i + 1}超时`)
        ]);

        // 验证加载成功
        onProgress?.({ step: 'verify', progress: 90, message: '验证FFmpeg功能...' });
        await this._verifyFFmpeg(ffmpeg);

        onProgress?.({ step: 'complete', progress: 100, message: '加载完成！' });
        this.ffmpegInstance = ffmpeg;
        return ffmpeg;

      } catch (error) {
        console.warn(`策略 ${i + 1} 失败:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));

        // 清理失败的实例
        try {
          if (this.ffmpegInstance) {
            this.ffmpegInstance = null;
          }
        } catch (cleanupError) {
          console.warn('清理失败实例时出错:', cleanupError);
        }
      }
    }

    throw new Error(`所有加载策略都失败了。最后错误: ${lastError?.message}`);
  }

  /**
   * 策略1: 标准toBlobURL方式（优化版）
   */
  private async _loadWithStrategy1(onProgress?: (progress: LoadingProgress) => void): Promise<FFmpeg> {
    const ffmpeg = new FFmpeg();

    onProgress?.({ step: 'tobloburl', progress: 30, message: '生成Blob URLs...' });

    // 关键优化：并行生成URLs，而不是串行
    const urlPromises = [
      toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
      toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
      toBlobURL('/ffmpeg/ffmpeg-core.worker.js', 'text/javascript')
    ];

    const [coreURL, wasmURL, workerURL] = await Promise.all(urlPromises);

    onProgress?.({ step: 'load-core', progress: 60, message: '加载FFmpeg核心...' });

    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    });

    return ffmpeg;
  }

  /**
   * 策略2: 预加载到内存再转换
   */
  private async _loadWithStrategy2(onProgress?: (progress: LoadingProgress) => void): Promise<FFmpeg> {
    const ffmpeg = new FFmpeg();

    onProgress?.({ step: 'preload', progress: 35, message: '预加载文件到内存...' });

    // 预先加载所有文件到内存
    const filePromises = [
      fetch('/ffmpeg/ffmpeg-core.js').then(r => r.arrayBuffer()),
      fetch('/ffmpeg/ffmpeg-core.wasm').then(r => r.arrayBuffer()),
      fetch('/ffmpeg/ffmpeg-core.worker.js').then(r => r.arrayBuffer())
    ];

    const [coreBuffer, wasmBuffer, workerBuffer] = await Promise.all(filePromises);

    onProgress?.({ step: 'create-blobs', progress: 50, message: '创建Blob URLs...' });

    // 从内存创建Blob URLs
    const coreBlob = new Blob([coreBuffer], { type: 'text/javascript' });
    const wasmBlob = new Blob([wasmBuffer], { type: 'application/wasm' });
    const workerBlob = new Blob([workerBuffer], { type: 'text/javascript' });

    const coreURL = URL.createObjectURL(coreBlob);
    const wasmURL = URL.createObjectURL(wasmBlob);
    const workerURL = URL.createObjectURL(workerBlob);

    onProgress?.({ step: 'load-core', progress: 70, message: '加载FFmpeg核心...' });

    try {
      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      return ffmpeg;
    } finally {
      // 清理临时URLs
      URL.revokeObjectURL(coreURL);
      URL.revokeObjectURL(wasmURL);
      URL.revokeObjectURL(workerURL);
    }
  }

  /**
   * 策略3: 简化直接加载
   */
  private async _loadWithStrategy3(onProgress?: (progress: LoadingProgress) => void): Promise<FFmpeg> {
    const ffmpeg = new FFmpeg();

    onProgress?.({ step: 'direct-load', progress: 40, message: '尝试直接加载...' });

    // 最简单的直接加载方式
    await ffmpeg.load({
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm',
      workerURL: '/ffmpeg/ffmpeg-core.worker.js',
    });

    return ffmpeg;
  }

  /**
   * 环境检查
   */
  private async _checkEnvironment(): Promise<void> {
    const issues: string[] = [];

    if (typeof SharedArrayBuffer === 'undefined') {
      issues.push('SharedArrayBuffer不可用');
    }

    if (typeof crossOriginIsolated === 'undefined' || !crossOriginIsolated) {
      issues.push('跨域隔离未启用');
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      issues.push('需要HTTPS或localhost环境');
    }

    if (issues.length > 0) {
      throw new Error(`环境检查失败: ${issues.join(', ')}`);
    }
  }

  /**
   * 文件检查
   */
  private async _checkFFmpegFiles(): Promise<void> {
    const files = [
      '/ffmpeg/ffmpeg-core.js',
      '/ffmpeg/ffmpeg-core.wasm',
      '/ffmpeg/ffmpeg-core.worker.js'
    ];

    const checkPromises = files.map(async (file) => {
      try {
        const response = await fetch(file, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`${file}: ${response.status}`);
        }
      } catch (error) {
        throw new Error(`文件 ${file} 不可访问: ${error}`);
      }
    });

    await Promise.all(checkPromises);
  }

  /**
   * 验证FFmpeg功能
   */
  private async _verifyFFmpeg(ffmpeg: FFmpeg): Promise<void> {
    if (!ffmpeg.loaded) {
      throw new Error('FFmpeg未正确加载');
    }

    try {
      // 简单的功能测试
      await ffmpeg.writeFile('test.txt', new Uint8Array([1, 2, 3]));
      const data = await ffmpeg.readFile('test.txt');
      await ffmpeg.deleteFile('test.txt');

      if (data.length !== 3) {
        throw new Error('FFmpeg功能测试失败');
      }
    } catch (error) {
      throw new Error(`FFmpeg验证失败: ${error}`);
    }
  }

  /**
   * 创建超时Promise
   */
  private _createTimeoutPromise(timeoutMs: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${message} (${timeoutMs}ms)`));
      }, timeoutMs);
    });
  }

  /**
   * 重置实例
   */
  reset(): void {
    this.ffmpegInstance = null;
    this.isLoading = false;
    this.loadingPromise = null;
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    isLoaded: boolean;
    isLoading: boolean;
    hasInstance: boolean;
  } {
    return {
      isLoaded: this.ffmpegInstance?.loaded || false,
      isLoading: this.isLoading,
      hasInstance: this.ffmpegInstance !== null
    };
  }
}

/**
 * 便捷的加载函数
 */
export async function fixedLoadFFmpeg(
  onProgress?: (progress: LoadingProgress) => void,
  timeoutMs = 30000
): Promise<FFmpeg> {
  const fixer = FFmpegLoadFixer.getInstance();
  const result = await fixer.loadFFmpeg(onProgress, timeoutMs);

  if (!result.success) {
    throw new Error(result.error || '未知加载错误');
  }

  return result.ffmpeg!;
}

/**
 * 诊断和修复UI组件
 */
export function createDiagnosticInfo(): {
  environment: any;
  suggestions: string[];
} {
  const environment = {
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    isCrossOriginIsolated: typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false,
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };

  const suggestions: string[] = [];

  if (!environment.hasSharedArrayBuffer) {
    suggestions.push('更新浏览器到最新版本（Chrome 68+, Firefox 79+, Safari 15.2+）');
  }

  if (!environment.isCrossOriginIsolated) {
    suggestions.push('检查vite.config.ts中的CORS头部配置');
    suggestions.push('重启开发服务器');
  }

  if (environment.protocol !== 'https:' && !location.hostname.includes('localhost')) {
    suggestions.push('使用HTTPS或localhost环境');
  }

  suggestions.push('清除浏览器缓存并刷新页面');
  suggestions.push('检查网络连接和防火墙设置');

  return { environment, suggestions };
}





























