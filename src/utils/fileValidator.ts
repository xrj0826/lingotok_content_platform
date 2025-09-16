/**
 * 文件验证器
 * 验证文件格式、大小，获取视频信息
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  fps: number;
  fileSize: number;
  format: string;
  hasAudio: boolean;
  bitrate?: number;
}

export interface ValidationConfig {
  maxFileSize: number; // 字节
  supportedFormats: string[];
  maxDuration: number; // 秒
  maxResolution: { width: number; height: number };
  allowAudio: boolean;
}

/**
 * 文件验证器类
 */
export class FileValidator {
  private config: ValidationConfig = {
    maxFileSize: 200 * 1024 * 1024, // 200MB
    supportedFormats: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'm4v'],
    maxDuration: 30 * 60, // 30分钟
    maxResolution: { width: 3840, height: 2160 }, // 4K
    allowAudio: true
  };

  constructor(config?: Partial<ValidationConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 验证文件
   */
  validateFile(file: File): FileValidationResult {
    const warnings: string[] = [];

    // 1. 检查文件是否存在
    if (!file) {
      return {
        valid: false,
        error: '文件不能为空'
      };
    }

    // 2. 检查文件大小
    if (file.size === 0) {
      return {
        valid: false,
        error: '文件为空或已损坏'
      };
    }

    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `文件过大 (${this.formatBytes(file.size)})，最大支持 ${this.formatBytes(this.config.maxFileSize)}`
      };
    }

    // 大文件警告
    if (file.size > this.config.maxFileSize * 0.8) {
      warnings.push(`文件较大 (${this.formatBytes(file.size)})，处理可能较慢`);
    }

    // 3. 检查文件格式
    const extension = this.getFileExtension(file.name);
    if (!extension) {
      return {
        valid: false,
        error: '文件名无效或缺少扩展名'
      };
    }

    if (!this.config.supportedFormats.includes(extension)) {
      return {
        valid: false,
        error: `不支持的文件格式：${extension}。支持的格式：${this.config.supportedFormats.join(', ')}`
      };
    }

    // 4. 检查MIME类型
    const mimeValidation = this.validateMimeType(file);
    if (!mimeValidation.valid) {
      return mimeValidation;
    }

    if (mimeValidation.warnings) {
      warnings.push(...mimeValidation.warnings);
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * 验证MIME类型
   */
  private validateMimeType(file: File): FileValidationResult {
    const warnings: string[] = [];

    // 检查MIME类型是否为视频
    if (!file.type.startsWith('video/')) {
      // 如果MIME类型不是视频，但扩展名是视频格式，给出警告
      const extension = this.getFileExtension(file.name);
      if (this.config.supportedFormats.includes(extension!)) {
        warnings.push('文件MIME类型异常，但扩展名看起来是视频格式，将尝试处理');
      } else {
        return {
          valid: false,
          error: `文件类型不是视频格式 (${file.type})`
        };
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(file: File): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);

      let resolved = false;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
      };

      const resolveInfo = () => {
        if (resolved) return;
        resolved = true;

        const info: VideoInfo = {
          duration: video.duration || 0,
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          fps: this.estimateFPS(video),
          fileSize: file.size,
          format: this.getFileExtension(file.name) || 'unknown',
          hasAudio: this.detectAudio(video),
          bitrate: file.size * 8 / (video.duration || 1) // 粗略估算
        };

        cleanup();
        resolve(info);
      };

      const rejectWithError = (error: string) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        reject(new Error(error));
      };

      // 设置事件监听器
      video.addEventListener('loadedmetadata', resolveInfo, { once: true });
      video.addEventListener('error', () => {
        rejectWithError('无法读取视频信息，文件可能已损坏');
      }, { once: true });

      // 超时处理
      setTimeout(() => {
        rejectWithError('获取视频信息超时');
      }, 10000);

      // 设置静音和其他属性
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.src = objectUrl;
    });
  }

  /**
   * 估算帧率
   */
  private estimateFPS(video: HTMLVideoElement): number {
    // 默认帧率，因为HTML5 Video API不直接提供FPS信息
    // 实际项目中可能需要更复杂的检测方法
    return 30;
  }

  /**
   * 检测是否有音轨
   */
  private detectAudio(video: HTMLVideoElement): boolean {
    // 检查是否有音轨
    try {
      return video.mozHasAudio ||
        video.webkitAudioDecodedByteCount > 0 ||
        video.audioTracks?.length > 0 ||
        false;
    } catch {
      return true; // 默认假设有音频
    }
  }

  /**
   * 验证视频信息
   */
  validateVideoInfo(info: VideoInfo): FileValidationResult {
    const warnings: string[] = [];

    // 检查时长
    if (info.duration > this.config.maxDuration) {
      return {
        valid: false,
        error: `视频时长过长 (${this.formatDuration(info.duration)})，最大支持 ${this.formatDuration(this.config.maxDuration)}`
      };
    }

    if (info.duration > this.config.maxDuration * 0.8) {
      warnings.push(`视频较长 (${this.formatDuration(info.duration)})，处理可能需要更长时间`);
    }

    // 检查分辨率
    if (info.width > this.config.maxResolution.width || info.height > this.config.maxResolution.height) {
      return {
        valid: false,
        error: `分辨率过高 (${info.width}x${info.height})，最大支持 ${this.config.maxResolution.width}x${this.config.maxResolution.height}`
      };
    }

    if (info.width > 1920 || info.height > 1080) {
      warnings.push(`高分辨率视频 (${info.width}x${info.height}) 可能影响处理性能`);
    }

    // 检查音频
    if (!this.config.allowAudio && info.hasAudio) {
      warnings.push('视频包含音频轨道，处理时可能会被移除');
    }

    // 检查码率
    if (info.bitrate && info.bitrate > 50000000) { // 50Mbps
      warnings.push('视频码率较高，可能影响处理速度');
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * 批量验证文件
   */
  async validateFiles(files: File[]): Promise<{
    valid: File[];
    invalid: { file: File; error: string }[];
    warnings: { file: File; warnings: string[] }[];
  }> {
    const valid: File[] = [];
    const invalid: { file: File; error: string }[] = [];
    const warnings: { file: File; warnings: string[] }[] = [];

    for (const file of files) {
      const validation = this.validateFile(file);

      if (validation.valid) {
        valid.push(file);

        if (validation.warnings) {
          warnings.push({ file, warnings: validation.warnings });
        }
      } else {
        invalid.push({ file, error: validation.error! });
      }
    }

    return { valid, invalid, warnings };
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string | null {
    const match = filename.toLowerCase().match(/\.([^.]+)$/);
    return match ? match[1] : null;
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  }

  /**
   * 格式化时长
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * 重置配置为默认值
   */
  resetConfig(): void {
    this.config = {
      maxFileSize: 200 * 1024 * 1024,
      supportedFormats: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'm4v'],
      maxDuration: 30 * 60,
      maxResolution: { width: 3840, height: 2160 },
      allowAudio: true
    };
  }
}

// 导出单例实例
export const fileValidator = new FileValidator();






















