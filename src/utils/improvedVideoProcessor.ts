/**
 * 改进的视频处理器 - 解决FFmpeg卡死问题
 * 基于修改建议报告优化
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoProcessOptions {
  format?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
  onProgress?: (progress: number, message: string) => void;
  signal?: AbortSignal;
}

export interface VideoProcessResult {
  success: boolean;
  data?: Blob;
  error?: string;
}

/**
 * 改进的视频处理器类
 */
export class ImprovedVideoProcessor {
  private ffmpeg: FFmpeg | null = null;
  private isLoading = false;
  private loadPromise: Promise<FFmpeg> | null = null;
  private maxRetries = 3;
  private retryDelay = 2000;

  /**
   * 获取FFmpeg实例 - 添加超时和重试机制
   */
  private async getFFmpegInstance(): Promise<FFmpeg> {
    if (this.ffmpeg && this.ffmpeg.loaded) {
      return this.ffmpeg;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadFFmpegWithRetry();
    return this.loadPromise;
  }

  /**
   * 带重试机制的FFmpeg加载
   */
  private async loadFFmpegWithRetry(): Promise<FFmpeg> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[ImprovedVideoProcessor] 尝试加载FFmpeg (${attempt}/${this.maxRetries})...`);

        this.ffmpeg = new FFmpeg();

        // 设置事件监听
        this.ffmpeg.on('log', ({ message }) => {
          console.log(`[FFmpeg Log] ${message}`);
        });

        this.ffmpeg.on('progress', ({ progress }) => {
          console.log(`[FFmpeg Progress] ${Math.round(progress * 100)}%`);
        });

        // 检查环境
        await this.checkEnvironment();

        // 加载FFmpeg核心文件
        await this.loadFFmpegCore();

        console.log(`[ImprovedVideoProcessor] FFmpeg加载成功 (尝试 ${attempt})`);
        return this.ffmpeg;

      } catch (error) {
        lastError = error as Error;
        console.warn(`[ImprovedVideoProcessor] 第${attempt}次加载失败:`, error);

        if (attempt < this.maxRetries) {
          // 指数退避延迟
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[ImprovedVideoProcessor] ${delay}ms后重试...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`FFmpeg加载失败，已重试${this.maxRetries}次。最后错误: ${lastError?.message}`);
  }

  /**
   * 检查运行环境
   */
  private async checkEnvironment(): Promise<void> {
    // 检查WebAssembly支持
    if (!('WebAssembly' in window)) {
      throw new Error('浏览器不支持WebAssembly，无法运行FFmpeg');
    }

    // 检查基础API支持
    if (!window.URL || !window.URL.createObjectURL) {
      throw new Error('浏览器API不完整，无法处理视频文件');
    }

    console.log('[ImprovedVideoProcessor] 环境检查通过');
  }

  /**
   * 加载FFmpeg核心文件
   */
  private async loadFFmpegCore(): Promise<void> {
    const baseURL = '/ffmpeg';
    const timeout = 30000; // 30秒超时

    try {
      // 创建超时Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('FFmpeg加载超时')), timeout);
      });

      // 并行生成Blob URLs
      const [coreURL, wasmURL, workerURL] = await Promise.race([
        Promise.all([
          toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        ]),
        timeoutPromise
      ]);

      console.log('[ImprovedVideoProcessor] Blob URLs生成完成，开始加载核心...');

      // 加载FFmpeg核心
      const loadPromise = this.ffmpeg!.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      await Promise.race([loadPromise, timeoutPromise]);

      console.log('[ImprovedVideoProcessor] FFmpeg核心加载完成');

    } catch (error) {
      if (error instanceof Error && error.message === 'FFmpeg加载超时') {
        throw error;
      }
      throw new Error(`FFmpeg核心文件加载失败: ${error}`);
    }
  }

  /**
   * 视频剪切 - 改进版本
   */
  async cutVideo(
    file: File,
    startTime: number,
    endTime: number,
    options: VideoProcessOptions = {}
  ): Promise<VideoProcessResult> {
    const { format = 'mp4', quality = 'medium', onProgress, signal } = options;

    try {
      // 验证输入参数
      this.validateCutParameters(file, startTime, endTime);

      onProgress?.(10, '初始化FFmpeg...');

      // 检查是否被取消
      if (signal?.aborted) {
        throw new Error('操作已取消');
      }

      // 获取FFmpeg实例
      const ffmpeg = await this.getFFmpegInstance();

      onProgress?.(30, '准备视频文件...');

      // 生成文件名
      const inputName = `input_${Date.now()}.${this.getFileExtension(file)}`;
      const outputName = `output_${Date.now()}.${format}`;

      // 写入输入文件
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      onProgress?.(50, '执行视频剪切...');

      // 检查是否被取消
      if (signal?.aborted) {
        await this.cleanup(ffmpeg, [inputName]);
        throw new Error('操作已取消');
      }

      // 构建FFmpeg命令
      const args = this.buildCutCommand(inputName, outputName, startTime, endTime, format, quality);

      // 执行剪切
      await ffmpeg.exec(args);

      onProgress?.(80, '生成输出文件...');

      // 读取输出文件
      const data = await ffmpeg.readFile(outputName) as Uint8Array;
      const blob = new Blob([data], { type: `video/${format}` });

      onProgress?.(90, '清理临时文件...');

      // 清理文件
      await this.cleanup(ffmpeg, [inputName, outputName]);

      onProgress?.(100, '完成');

      return {
        success: true,
        data: blob
      };

    } catch (error) {
      console.error('[ImprovedVideoProcessor] 视频剪切失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 视频合并 - 改进版本
   */
  async mergeVideos(
    files: File[],
    options: VideoProcessOptions = {}
  ): Promise<VideoProcessResult> {
    const { format = 'mp4', quality = 'medium', onProgress, signal } = options;

    try {
      // 验证输入
      if (files.length < 2) {
        throw new Error('至少需要2个视频文件进行合并');
      }

      onProgress?.(10, '初始化FFmpeg...');

      const ffmpeg = await this.getFFmpegInstance();

      onProgress?.(20, '准备视频文件...');

      // 生成文件名
      const inputNames: string[] = [];
      const listFileName = `list_${Date.now()}.txt`;
      const outputName = `merged_${Date.now()}.${format}`;

      // 检查是否被取消
      if (signal?.aborted) {
        throw new Error('操作已取消');
      }

      // 写入所有输入文件
      for (let i = 0; i < files.length; i++) {
        const inputName = `input_${i}_${Date.now()}.${this.getFileExtension(files[i])}`;
        inputNames.push(inputName);
        await ffmpeg.writeFile(inputName, await fetchFile(files[i]));

        onProgress?.(20 + (i / files.length) * 30, `准备文件 ${i + 1}/${files.length}...`);
      }

      // 创建文件列表
      const listContent = inputNames.map(name => `file '${name}'`).join('\n');
      await ffmpeg.writeFile(listFileName, new TextEncoder().encode(listContent));

      onProgress?.(60, '执行视频合并...');

      // 检查是否被取消
      if (signal?.aborted) {
        await this.cleanup(ffmpeg, [...inputNames, listFileName]);
        throw new Error('操作已取消');
      }

      // 构建合并命令
      const args = this.buildMergeCommand(listFileName, outputName, format, quality);

      // 执行合并
      await ffmpeg.exec(args);

      onProgress?.(80, '生成输出文件...');

      // 读取输出文件
      const data = await ffmpeg.readFile(outputName) as Uint8Array;
      const blob = new Blob([data], { type: `video/${format}` });

      onProgress?.(90, '清理临时文件...');

      // 清理文件
      await this.cleanup(ffmpeg, [...inputNames, listFileName, outputName]);

      onProgress?.(100, '完成');

      return {
        success: true,
        data: blob
      };

    } catch (error) {
      console.error('[ImprovedVideoProcessor] 视频合并失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 验证剪切参数
   */
  private validateCutParameters(file: File, startTime: number, endTime: number): void {
    if (!file) {
      throw new Error('文件不能为空');
    }

    if (startTime < 0) {
      throw new Error('开始时间不能小于0');
    }

    if (endTime <= startTime) {
      throw new Error('结束时间必须大于开始时间');
    }

    if (endTime - startTime < 0.1) {
      throw new Error('剪切时长不能少于0.1秒');
    }

    // 检查文件大小 (200MB限制)
    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`文件过大 (${Math.round(file.size / 1024 / 1024)}MB)，请选择小于200MB的文件`);
    }
  }

  /**
   * 构建剪切命令
   */
  private buildCutCommand(
    inputName: string,
    outputName: string,
    startTime: number,
    endTime: number,
    format: string,
    quality: string
  ): string[] {
    const duration = endTime - startTime;
    const qualityMap = {
      low: { crf: '28', bitrate: '1M' },
      medium: { crf: '23', bitrate: '2M' },
      high: { crf: '18', bitrate: '4M' }
    };

    const qualitySettings = qualityMap[quality as keyof typeof qualityMap] || qualityMap.medium;

    const args = [
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', inputName,
      '-c:v', format === 'webm' ? 'libvpx-vp9' : 'libx264',
      '-crf', qualitySettings.crf,
      '-c:a', format === 'webm' ? 'libopus' : 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y', // 覆盖输出文件
      outputName
    ];

    return args;
  }

  /**
   * 构建合并命令
   */
  private buildMergeCommand(
    listFileName: string,
    outputName: string,
    format: string,
    quality: string
  ): string[] {
    const qualityMap = {
      low: { crf: '28' },
      medium: { crf: '23' },
      high: { crf: '18' }
    };

    const qualitySettings = qualityMap[quality as keyof typeof qualityMap] || qualityMap.medium;

    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', listFileName,
      '-c:v', format === 'webm' ? 'libvpx-vp9' : 'libx264',
      '-crf', qualitySettings.crf,
      '-c:a', format === 'webm' ? 'libopus' : 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y',
      outputName
    ];

    return args;
  }

  /**
   * 清理临时文件
   */
  private async cleanup(ffmpeg: FFmpeg, filenames: string[]): Promise<void> {
    for (const filename of filenames) {
      try {
        await ffmpeg.deleteFile(filename);
      } catch (error) {
        console.warn(`[ImprovedVideoProcessor] 清理文件失败 ${filename}:`, error);
      }
    }
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() || 'mp4';
  }

  /**
   * 睡眠工具函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 重置处理器状态
   */
  async reset(): Promise<void> {
    this.loadPromise = null;
    this.isLoading = false;

    if (this.ffmpeg) {
      try {
        // 尝试终止FFmpeg实例
        this.ffmpeg = null;
      } catch (error) {
        console.warn('[ImprovedVideoProcessor] 重置时出错:', error);
      }
    }
  }

  /**
   * 销毁处理器
   */
  async destroy(): Promise<void> {
    await this.reset();
  }
}

// 导出单例实例
export const improvedVideoProcessor = new ImprovedVideoProcessor();






















