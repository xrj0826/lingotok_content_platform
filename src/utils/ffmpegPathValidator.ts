/**
 * FFmpeg路径验证工具
 * 验证加载路径与实际文件路径的对应关系
 */

export interface PathValidationResult {
  loadedPath: string;      // 加载时使用的路径
  actualPath: string;      // 实际文件路径
  isValid: boolean;        // 是否有效
  fileSize?: number;       // 文件大小
  error?: string;          // 错误信息
}

export interface PathsValidationSummary {
  coreFile: PathValidationResult;
  wasmFile: PathValidationResult;
  workerFile: PathValidationResult;
  allValid: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * FFmpeg路径验证器
 */
export class FFmpegPathValidator {

  /**
   * 验证单个文件路径
   */
  static async validateFilePath(
    loadedPath: string,
    actualPath: string
  ): Promise<PathValidationResult> {
    const result: PathValidationResult = {
      loadedPath,
      actualPath,
      isValid: false
    };

    try {
      // 检查加载路径
      const loadedResponse = await fetch(loadedPath, { method: 'HEAD' });
      if (!loadedResponse.ok) {
        result.error = `加载路径无效: HTTP ${loadedResponse.status}`;
        return result;
      }

      // 检查实际路径
      const actualResponse = await fetch(actualPath, { method: 'HEAD' });
      if (!actualResponse.ok) {
        result.error = `实际路径无效: HTTP ${actualResponse.status}`;
        return result;
      }

      // 检查文件大小是否一致
      const loadedSize = parseInt(loadedResponse.headers.get('content-length') || '0');
      const actualSize = parseInt(actualResponse.headers.get('content-length') || '0');

      if (loadedSize !== actualSize && loadedSize > 0 && actualSize > 0) {
        result.error = `文件大小不匹配: 加载路径(${loadedSize}) vs 实际路径(${actualSize})`;
        return result;
      }

      result.isValid = true;
      result.fileSize = actualSize || loadedSize;

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  /**
   * 从FFmpeg配置提取加载路径
   */
  static extractLoadedPaths(ffmpegConfig: any): {
    coreURL: string;
    wasmURL: string;
    workerURL: string;
  } {
    // 从配置对象中提取路径
    if (ffmpegConfig && typeof ffmpegConfig === 'object') {
      return {
        coreURL: ffmpegConfig.coreURL || '',
        wasmURL: ffmpegConfig.wasmURL || '',
        workerURL: ffmpegConfig.workerURL || ''
      };
    }

    // 默认路径（基于您的配置）
    return {
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm',
      workerURL: '/ffmpeg/ffmpeg-core.worker.js'
    };
  }

  /**
   * 全面验证FFmpeg路径
   */
  static async validateFFmpegPaths(ffmpegConfig?: any): Promise<PathsValidationSummary> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 提取加载路径
    const loadedPaths = this.extractLoadedPaths(ffmpegConfig);

    // 实际文件路径
    const actualPaths = {
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm',
      workerURL: '/ffmpeg/ffmpeg-core.worker.js'
    };

    console.log('🔍 开始验证FFmpeg路径对应关系...');
    console.log('加载路径:', loadedPaths);
    console.log('实际路径:', actualPaths);

    // 验证各个文件
    const [coreFile, wasmFile, workerFile] = await Promise.all([
      this.validateFilePath(loadedPaths.coreURL, actualPaths.coreURL),
      this.validateFilePath(loadedPaths.wasmURL, actualPaths.wasmURL),
      this.validateFilePath(loadedPaths.workerURL, actualPaths.workerURL)
    ]);

    // 分析问题
    [coreFile, wasmFile, workerFile].forEach((result, index) => {
      const fileName = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'][index];

      if (!result.isValid) {
        issues.push(`${fileName}: ${result.error}`);
      }

      if (result.loadedPath !== result.actualPath) {
        issues.push(`${fileName}: 路径不匹配 (${result.loadedPath} ≠ ${result.actualPath})`);
      }
    });

    // 生成建议
    if (issues.length > 0) {
      recommendations.push('检查public/ffmpeg/目录下的文件是否完整');
      recommendations.push('确保Web服务器正确配置静态文件访问');
      recommendations.push('验证所有FFmpeg文件的权限设置');

      if (issues.some(issue => issue.includes('路径不匹配'))) {
        recommendations.push('统一FFmpeg配置文件中的路径设置');
        recommendations.push('使用ffmpegPathFix.ts中的统一路径配置');
      }
    }

    const allValid = coreFile.isValid && wasmFile.isValid && workerFile.isValid;

    return {
      coreFile,
      wasmFile,
      workerFile,
      allValid,
      issues,
      recommendations
    };
  }

  /**
   * 生成路径对应关系报告
   */
  static generatePathReport(validation: PathsValidationSummary): string {
    let report = '# FFmpeg路径验证报告\n\n';

    report += `## 总体状态: ${validation.allValid ? '✅ 路径对应正确' : '❌ 发现路径问题'}\n\n`;

    // 文件详情
    report += '## 文件路径对应关系\n\n';

    const files = [
      { name: 'ffmpeg-core.js', result: validation.coreFile },
      { name: 'ffmpeg-core.wasm', result: validation.wasmFile },
      { name: 'ffmpeg-core.worker.js', result: validation.workerFile }
    ];

    files.forEach(({ name, result }) => {
      const status = result.isValid ? '✅' : '❌';
      report += `### ${status} ${name}\n`;
      report += `- 加载路径: \`${result.loadedPath}\`\n`;
      report += `- 实际路径: \`${result.actualPath}\`\n`;
      report += `- 路径匹配: ${result.loadedPath === result.actualPath ? '✅' : '❌'}\n`;

      if (result.fileSize) {
        report += `- 文件大小: ${this.formatFileSize(result.fileSize)}\n`;
      }

      if (result.error) {
        report += `- 错误: ${result.error}\n`;
      }
      report += '\n';
    });

    // 问题列表
    if (validation.issues.length > 0) {
      report += '## 发现的问题\n\n';
      validation.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += '\n';
    }

    // 建议
    if (validation.recommendations.length > 0) {
      report += '## 解决建议\n\n';
      validation.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }

  /**
   * 检查blob URL对应关系
   */
  static async validateBlobURLs(ffmpegConfig: any): Promise<{
    coreValid: boolean;
    wasmValid: boolean;
    workerValid: boolean;
    details: string[];
  }> {
    const details: string[] = [];

    try {
      if (!ffmpegConfig || typeof ffmpegConfig !== 'object') {
        details.push('无法获取FFmpeg配置对象');
        return { coreValid: false, wasmValid: false, workerValid: false, details };
      }

      const { coreURL, wasmURL, workerURL } = ffmpegConfig;

      // 检查是否为blob URL
      const isCoreBlob = coreURL && coreURL.startsWith('blob:');
      const isWasmBlob = wasmURL && wasmURL.startsWith('blob:');
      const isWorkerBlob = workerURL && workerURL.startsWith('blob:');

      details.push(`Core文件: ${isCoreBlob ? '使用blob URL' : '使用直接路径'} - ${coreURL}`);
      details.push(`WASM文件: ${isWasmBlob ? '使用blob URL' : '使用直接路径'} - ${wasmURL}`);
      details.push(`Worker文件: ${isWorkerBlob ? '使用blob URL' : '使用直接路径'} - ${workerURL}`);

      // 如果是blob URL，检查是否可访问
      const checkBlobURL = async (url: string): Promise<boolean> => {
        if (!url || !url.startsWith('blob:')) return false;
        try {
          const response = await fetch(url, { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      };

      const [coreValid, wasmValid, workerValid] = await Promise.all([
        isCoreBlob ? checkBlobURL(coreURL) : true,
        isWasmBlob ? checkBlobURL(wasmURL) : true,
        isWorkerBlob ? checkBlobURL(workerURL) : true
      ]);

      return { coreValid, wasmValid, workerValid, details };

    } catch (error) {
      details.push(`Blob URL验证失败: ${error}`);
      return { coreValid: false, wasmValid: false, workerValid: false, details };
    }
  }

  /**
   * 格式化文件大小
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * 快速路径验证函数
 */
export async function quickValidatePaths(ffmpegConfig?: any): Promise<PathsValidationSummary> {
  return FFmpegPathValidator.validateFFmpegPaths(ffmpegConfig);
}

/**
 * 从控制台配置提取路径信息
 */
export function extractPathsFromConsole(): {
  coreURL?: string;
  wasmURL?: string;
  workerURL?: string;
} | null {
  try {
    // 这里可以添加从控制台日志中提取路径的逻辑
    // 由于浏览器安全限制，通常无法直接访问控制台内容
    console.log('尝试从控制台提取FFmpeg配置路径...');
    return null;
  } catch (error) {
    console.warn('无法从控制台提取路径信息:', error);
    return null;
  }
}

/**
 * 分析当前FFmpeg实例的配置
 */
export async function analyzeCurrentFFmpegInstance(): Promise<{
  hasInstance: boolean;
  isLoaded: boolean;
  configInfo?: any;
  pathInfo?: any;
}> {
  try {
    // 检查全局FFmpeg实例（如果存在）
    const globalFFmpeg = (window as any).ffmpegInstance;

    if (globalFFmpeg) {
      return {
        hasInstance: true,
        isLoaded: globalFFmpeg.loaded || false,
        configInfo: globalFFmpeg.config || null,
        pathInfo: globalFFmpeg.pathInfo || null
      };
    }

    return {
      hasInstance: false,
      isLoaded: false
    };

  } catch (error) {
    console.warn('分析FFmpeg实例失败:', error);
    return {
      hasInstance: false,
      isLoaded: false
    };
  }
}














































































