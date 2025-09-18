/**
 * FFmpeg文件验证工具
 * 检查所有必需的FFmpeg文件是否可以正常引入和访问
 */

export interface FileValidationResult {
  file: string;
  exists: boolean;
  size: number;
  accessible: boolean;
  error?: string;
  loadTime: number;
}

export interface ValidationSummary {
  allValid: boolean;
  totalFiles: number;
  validFiles: number;
  totalSize: number;
  results: FileValidationResult[];
  issues: string[];
  suggestions: string[];
}

/**
 * FFmpeg文件验证器
 */
export class FFmpegFileValidator {
  private static requiredFiles = [
    'ffmpeg-core.js',
    'ffmpeg-core.wasm',
    'ffmpeg-core.worker.js',
    'const.js',
    'errors.js',
    'types.js',
    'utils.js',
    'classes.js'
  ];

  private static baseURL = '/ffmpeg';

  /**
   * 验证单个文件
   */
  static async validateFile(fileName: string): Promise<FileValidationResult> {
    const startTime = Date.now();
    const fileUrl = `${this.baseURL}/${fileName}`;

    const result: FileValidationResult = {
      file: fileName,
      exists: false,
      size: 0,
      accessible: false,
      loadTime: 0
    };

    try {
      console.log(`🔍 检查文件: ${fileUrl}`);

      // 使用HEAD请求检查文件存在性和大小
      const response = await fetch(fileUrl, { method: 'HEAD' });

      result.exists = response.ok;
      result.accessible = response.ok;

      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        result.size = contentLength ? parseInt(contentLength, 10) : 0;
        console.log(`✅ ${fileName} - 大小: ${this.formatFileSize(result.size)}`);
      } else {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
        console.log(`❌ ${fileName} - 错误: ${result.error}`);
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${fileName} - 异常: ${result.error}`);
    }

    result.loadTime = Date.now() - startTime;
    return result;
  }

  /**
   * 验证所有必需文件
   */
  static async validateAllFiles(
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<ValidationSummary> {
    console.log('🚀 开始验证FFmpeg文件...');

    const results: FileValidationResult[] = [];
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 逐个验证文件
    for (let i = 0; i < this.requiredFiles.length; i++) {
      const fileName = this.requiredFiles[i];
      onProgress?.(i + 1, this.requiredFiles.length, fileName);

      const result = await this.validateFile(fileName);
      results.push(result);

      // 分析问题
      if (!result.accessible) {
        if (result.error?.includes('404')) {
          issues.push(`${fileName} 文件不存在`);
        } else if (result.error?.includes('403')) {
          issues.push(`${fileName} 文件无访问权限`);
        } else {
          issues.push(`${fileName} 无法访问: ${result.error}`);
        }
      }
    }

    // 统计结果
    const validFiles = results.filter(r => r.accessible).length;
    const totalSize = results.reduce((sum, r) => sum + r.size, 0);
    const allValid = validFiles === this.requiredFiles.length;

    // 生成建议
    if (!allValid) {
      suggestions.push('检查 public/ffmpeg/ 目录是否存在');
      suggestions.push('确保所有FFmpeg文件已正确放置');
      suggestions.push('检查文件权限设置');
      suggestions.push('尝试重新下载FFmpeg文件');
    }

    // 特殊检查
    const wasmResult = results.find(r => r.file === 'ffmpeg-core.wasm');
    if (wasmResult?.accessible && wasmResult.size < 20 * 1024 * 1024) {
      issues.push('ffmpeg-core.wasm 文件太小，可能不完整');
      suggestions.push('重新下载完整的 ffmpeg-core.wasm 文件 (~25MB)');
    }

    const jsResult = results.find(r => r.file === 'ffmpeg-core.js');
    if (jsResult?.accessible && jsResult.size < 100 * 1024) {
      issues.push('ffmpeg-core.js 文件太小，可能不完整');
      suggestions.push('重新下载完整的 ffmpeg-core.js 文件 (~200KB)');
    }

    console.log(`📊 验证完成: ${validFiles}/${this.requiredFiles.length} 文件有效`);

    return {
      allValid,
      totalFiles: this.requiredFiles.length,
      validFiles,
      totalSize,
      results,
      issues,
      suggestions
    };
  }

  /**
   * 测试文件内容是否可以正常加载
   */
  static async testFileContent(fileName: string): Promise<{
    success: boolean;
    error?: string;
    contentType?: string;
    preview?: string;
  }> {
    try {
      console.log(`📄 测试文件内容: ${fileName}`);

      const response = await fetch(`${this.baseURL}/${fileName}`);
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const contentType = response.headers.get('content-type') || 'unknown';

      if (fileName.endsWith('.wasm')) {
        // 对于WASM文件，只检查是否能获取为ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        return {
          success: true,
          contentType,
          preview: `WASM文件，大小: ${arrayBuffer.byteLength} 字节`
        };
      } else {
        // 对于JS文件，检查内容
        const text = await response.text();
        const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;

        return {
          success: true,
          contentType,
          preview
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 测试toBlobURL转换
   */
  static async testToBlobURL(): Promise<{
    success: boolean;
    error?: string;
    details?: string;
  }> {
    try {
      console.log('🔄 测试 toBlobURL 转换...');

      // 动态导入 toBlobURL
      const { toBlobURL } = await import('@ffmpeg/util');

      // 测试一个小文件的转换
      const testFile = 'const.js';
      const blobURL = await toBlobURL(`${this.baseURL}/${testFile}`, 'text/javascript');

      // 验证生成的URL
      if (!blobURL.startsWith('blob:')) {
        return {
          success: false,
          error: 'toBlobURL 未生成有效的 blob URL'
        };
      }

      // 测试能否访问生成的URL
      const response = await fetch(blobURL);
      if (!response.ok) {
        return {
          success: false,
          error: '生成的 blob URL 无法访问'
        };
      }

      // 清理测试URL
      URL.revokeObjectURL(blobURL);

      return {
        success: true,
        details: '成功转换并验证 blob URL'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 完整的环境验证
   */
  static async validateEnvironment(): Promise<{
    fileValidation: ValidationSummary;
    contentTest: any[];
    blobURLTest: any;
    environment: any;
    overall: boolean;
  }> {
    console.log('🔍 开始完整环境验证...');

    // 1. 文件验证
    const fileValidation = await this.validateAllFiles();

    // 2. 内容测试（测试几个关键文件）
    const testFiles = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'const.js'];
    const contentTest = [];

    for (const file of testFiles) {
      if (fileValidation.results.find(r => r.file === file && r.accessible)) {
        const result = await this.testFileContent(file);
        contentTest.push({ file, ...result });
      }
    }

    // 3. toBlobURL测试
    const blobURLTest = await this.testToBlobURL();

    // 4. 环境检查
    const environment = {
      hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
      isCrossOriginIsolated: typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false,
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
      ffmpegUtilAvailable: false
    };

    try {
      await import('@ffmpeg/util');
      environment.ffmpegUtilAvailable = true;
    } catch (error) {
      console.warn('@ffmpeg/util 不可用:', error);
    }

    // 5. 综合评估
    const overall =
      fileValidation.allValid &&
      blobURLTest.success &&
      environment.hasSharedArrayBuffer &&
      environment.isCrossOriginIsolated &&
      environment.ffmpegUtilAvailable;

    console.log(`🎯 环境验证完成，整体状态: ${overall ? '✅ 正常' : '❌ 有问题'}`);

    return {
      fileValidation,
      contentTest,
      blobURLTest,
      environment,
      overall
    };
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

  /**
   * 生成验证报告
   */
  static generateReport(validation: any): string {
    const { fileValidation, contentTest, blobURLTest, environment, overall } = validation;

    let report = '# FFmpeg 文件验证报告\n\n';

    // 总体状态
    report += `## 总体状态: ${overall ? '✅ 正常' : '❌ 有问题'}\n\n`;

    // 文件验证
    report += '## 文件验证结果\n\n';
    report += `- 总文件数: ${fileValidation.totalFiles}\n`;
    report += `- 有效文件: ${fileValidation.validFiles}\n`;
    report += `- 总大小: ${this.formatFileSize(fileValidation.totalSize)}\n\n`;

    // 详细文件状态
    report += '### 文件详情\n\n';
    fileValidation.results.forEach((result: FileValidationResult) => {
      const status = result.accessible ? '✅' : '❌';
      const size = result.accessible ? this.formatFileSize(result.size) : 'N/A';
      report += `- ${status} ${result.file} (${size})\n`;
      if (result.error) {
        report += `  - 错误: ${result.error}\n`;
      }
    });

    // 环境检查
    report += '\n## 环境检查\n\n';
    report += `- SharedArrayBuffer: ${environment.hasSharedArrayBuffer ? '✅' : '❌'}\n`;
    report += `- 跨域隔离: ${environment.isCrossOriginIsolated ? '✅' : '❌'}\n`;
    report += `- 协议: ${environment.protocol}\n`;
    report += `- FFmpeg工具库: ${environment.ffmpegUtilAvailable ? '✅' : '❌'}\n`;

    // toBlobURL测试
    report += '\n## toBlobURL 测试\n\n';
    report += `- 状态: ${blobURLTest.success ? '✅ 正常' : '❌ 失败'}\n`;
    if (blobURLTest.error) {
      report += `- 错误: ${blobURLTest.error}\n`;
    }
    if (blobURLTest.details) {
      report += `- 详情: ${blobURLTest.details}\n`;
    }

    // 问题和建议
    if (fileValidation.issues.length > 0) {
      report += '\n## 发现的问题\n\n';
      fileValidation.issues.forEach((issue: string) => {
        report += `- ${issue}\n`;
      });
    }

    if (fileValidation.suggestions.length > 0) {
      report += '\n## 解决建议\n\n';
      fileValidation.suggestions.forEach((suggestion: string) => {
        report += `- ${suggestion}\n`;
      });
    }

    return report;
  }
}

/**
 * 快速验证函数
 */
export async function quickValidateFFmpeg(): Promise<ValidationSummary> {
  return FFmpegFileValidator.validateAllFiles();
}

/**
 * 完整验证函数
 */
export async function fullValidateFFmpeg(): Promise<any> {
  return FFmpegFileValidator.validateEnvironment();
}





































