/**
 * FFmpeg紧急加载器
 * 专门解决FFmpeg文件无法加载的问题
 * 使用多种备用方案和加载策略
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface EmergencyLoadResult {
  success: boolean;
  method: string;
  ffmpeg?: FFmpeg;
  error?: string;
  loadTime: number;
  details: string[];
}

/**
 * 紧急加载策略
 */
const EMERGENCY_STRATEGIES = [
  {
    name: 'backup-direct',
    description: '备份目录直接加载',
    async load(): Promise<FFmpeg> {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: '/ffmpeg/backup/ffmpeg-core.js',
        wasmURL: '/ffmpeg/backup/ffmpeg-core.wasm',
        workerURL: '/ffmpeg/backup/ffmpeg-core.worker.js'
      });
      return ffmpeg;
    }
  },
  {
    name: 'backup-blob',
    description: '备份目录toBlobURL',
    async load(): Promise<FFmpeg> {
      const ffmpeg = new FFmpeg();
      const [coreURL, wasmURL, workerURL] = await Promise.all([
        toBlobURL('/ffmpeg/backup/ffmpeg-core.js', 'text/javascript'),
        toBlobURL('/ffmpeg/backup/ffmpeg-core.wasm', 'application/wasm'),
        toBlobURL('/ffmpeg/backup/ffmpeg-core.worker.js', 'text/javascript')
      ]);
      await ffmpeg.load({ coreURL, wasmURL, workerURL });
      return ffmpeg;
    }
  },
  {
    name: 'main-direct',
    description: '主目录直接加载',
    async load(): Promise<FFmpeg> {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: '/ffmpeg/ffmpeg-core.js',
        wasmURL: '/ffmpeg/ffmpeg-core.wasm',
        workerURL: '/ffmpeg/ffmpeg-core.worker.js'
      });
      return ffmpeg;
    }
  },
  {
    name: 'cdn-fallback',
    description: 'CDN备用方案',
    async load(): Promise<FFmpeg> {
      const ffmpeg = new FFmpeg();
      const [coreURL, wasmURL, workerURL] = await Promise.all([
        toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js', 'text/javascript'),
        toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
        toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.worker.js', 'text/javascript')
      ]);
      await ffmpeg.load({ coreURL, wasmURL, workerURL });
      return ffmpeg;
    }
  },
  {
    name: 'manual-download',
    description: '手动下载并加载',
    async load(): Promise<FFmpeg> {
      const ffmpeg = new FFmpeg();

      // 手动下载文件
      const downloadFile = async (url: string): Promise<Uint8Array> => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`下载失败: ${response.status}`);
        return new Uint8Array(await response.arrayBuffer());
      };

      const [coreData, wasmData, workerData] = await Promise.all([
        downloadFile('/ffmpeg/backup/ffmpeg-core.js'),
        downloadFile('/ffmpeg/backup/ffmpeg-core.wasm'),
        downloadFile('/ffmpeg/backup/ffmpeg-core.worker.js')
      ]);

      // 创建Blob URLs
      const coreBlob = new Blob([coreData], { type: 'text/javascript' });
      const wasmBlob = new Blob([wasmData], { type: 'application/wasm' });
      const workerBlob = new Blob([workerData], { type: 'text/javascript' });

      const coreURL = URL.createObjectURL(coreBlob);
      const wasmURL = URL.createObjectURL(wasmBlob);
      const workerURL = URL.createObjectURL(workerBlob);

      await ffmpeg.load({ coreURL, wasmURL, workerURL });

      // 清理URLs
      URL.revokeObjectURL(coreURL);
      URL.revokeObjectURL(wasmURL);
      URL.revokeObjectURL(workerURL);

      return ffmpeg;
    }
  }
];

/**
 * 紧急FFmpeg加载器
 */
export class EmergencyFFmpegLoader {
  private static loadedFFmpeg: FFmpeg | null = null;
  private static lastSuccessMethod: string | null = null;

  /**
   * 紧急加载FFmpeg
   */
  static async emergencyLoad(
    onProgress?: (method: string, step: string) => void
  ): Promise<EmergencyLoadResult> {
    const startTime = Date.now();
    const allDetails: string[] = [];

    // 如果已经有实例，直接返回
    if (this.loadedFFmpeg?.loaded) {
      return {
        success: true,
        method: this.lastSuccessMethod || 'cached',
        ffmpeg: this.loadedFFmpeg,
        loadTime: Date.now() - startTime,
        details: ['使用已加载的FFmpeg实例']
      };
    }

    allDetails.push('🚨 开始紧急加载FFmpeg...');
    allDetails.push('📝 检测到之前的加载方式失败，尝试备用方案');

    // 首先检查环境
    onProgress?.('environment', '检查环境');
    const envCheck = this.checkEnvironment();
    allDetails.push(`环境检查: ${envCheck.ok ? '✅ 通过' : '❌ 有问题'}`);

    if (!envCheck.ok) {
      allDetails.push(`环境问题: ${envCheck.issues.join(', ')}`);
      if (envCheck.issues.includes('SharedArrayBuffer')) {
        return {
          success: false,
          method: 'environment-check',
          error: 'SharedArrayBuffer不可用，无法加载FFmpeg',
          loadTime: Date.now() - startTime,
          details: allDetails
        };
      }
    }

    // 尝试每种策略
    for (const strategy of EMERGENCY_STRATEGIES) {
      onProgress?.(strategy.name, strategy.description);
      allDetails.push(`\n🔄 尝试策略: ${strategy.description}`);

      try {
        // 添加超时控制
        const loadPromise = strategy.load();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('加载超时 (30秒)')), 30000);
        });

        const ffmpeg = await Promise.race([loadPromise, timeoutPromise]);

        // 验证加载状态
        if (!ffmpeg.loaded) {
          throw new Error('FFmpeg未正确加载');
        }

        // 简单功能测试
        await this.testBasicFunctionality(ffmpeg);

        // 成功
        this.loadedFFmpeg = ffmpeg;
        this.lastSuccessMethod = strategy.name;

        allDetails.push(`✅ 策略 ${strategy.description} 成功！`);

        return {
          success: true,
          method: strategy.name,
          ffmpeg,
          loadTime: Date.now() - startTime,
          details: allDetails
        };

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        allDetails.push(`❌ 策略 ${strategy.description} 失败: ${errorMsg}`);
      }
    }

    // 所有策略都失败
    allDetails.push('\n💥 所有紧急加载策略都失败了');

    return {
      success: false,
      method: 'all-failed',
      error: '所有紧急加载策略都失败了',
      loadTime: Date.now() - startTime,
      details: allDetails
    };
  }

  /**
   * 检查环境
   */
  private static checkEnvironment(): { ok: boolean; issues: string[] } {
    const issues: string[] = [];

    if (typeof SharedArrayBuffer === 'undefined') {
      issues.push('SharedArrayBuffer');
    }

    if (typeof crossOriginIsolated === 'undefined' || !crossOriginIsolated) {
      issues.push('跨域隔离');
    }

    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('协议');
    }

    return {
      ok: issues.length === 0,
      issues
    };
  }

  /**
   * 测试基本功能
   */
  private static async testBasicFunctionality(ffmpeg: FFmpeg): Promise<void> {
    try {
      const testData = new Uint8Array([1, 2, 3]);
      await ffmpeg.writeFile('test.bin', testData);
      const readData = await ffmpeg.readFile('test.bin');
      await ffmpeg.deleteFile('test.bin');

      if (readData.length !== testData.length) {
        throw new Error('基本功能测试失败');
      }
    } catch (error) {
      throw new Error(`功能测试失败: ${error}`);
    }
  }

  /**
   * 获取当前实例
   */
  static getCurrentInstance(): FFmpeg | null {
    return this.loadedFFmpeg;
  }

  /**
   * 重置
   */
  static reset(): void {
    this.loadedFFmpeg = null;
    this.lastSuccessMethod = null;
  }

  /**
   * 诊断文件可用性
   */
  static async diagnoseFileAvailability(): Promise<{
    mainDirectory: { [key: string]: boolean };
    backupDirectory: { [key: string]: boolean };
    cdn: { [key: string]: boolean };
    recommendations: string[];
  }> {
    const checkFile = async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    };

    const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'];

    const [mainResults, backupResults, cdnResults] = await Promise.all([
      Promise.all(files.map(f => checkFile(`/ffmpeg/${f}`))),
      Promise.all(files.map(f => checkFile(`/ffmpeg/backup/${f}`))),
      Promise.all(files.map(f => checkFile(`https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/${f}`)))
    ]);

    const mainDirectory = Object.fromEntries(files.map((f, i) => [f, mainResults[i]]));
    const backupDirectory = Object.fromEntries(files.map((f, i) => [f, backupResults[i]]));
    const cdn = Object.fromEntries(files.map((f, i) => [f, cdnResults[i]]));

    const recommendations: string[] = [];

    const mainAvailable = mainResults.every(r => r);
    const backupAvailable = backupResults.every(r => r);
    const cdnAvailable = cdnResults.every(r => r);

    if (mainAvailable) {
      recommendations.push('主目录文件完整，可以使用主目录加载');
    } else if (backupAvailable) {
      recommendations.push('主目录文件有问题，建议使用备份目录');
    } else if (cdnAvailable) {
      recommendations.push('本地文件都有问题，建议使用CDN加载');
    } else {
      recommendations.push('所有文件源都有问题，需要重新部署FFmpeg文件');
    }

    return {
      mainDirectory,
      backupDirectory,
      cdn,
      recommendations
    };
  }
}

/**
 * 便捷的紧急加载函数
 */
export async function emergencyLoadFFmpeg(
  onProgress?: (method: string, step: string) => void
): Promise<FFmpeg> {
  const result = await EmergencyFFmpegLoader.emergencyLoad(onProgress);

  if (!result.success || !result.ffmpeg) {
    throw new Error(result.error || '紧急加载失败');
  }

  return result.ffmpeg;
}

/**
 * 创建一个完全独立的FFmpeg加载器
 * 不依赖任何之前的配置
 */
export async function createFreshFFmpegInstance(): Promise<FFmpeg> {
  console.log('🔄 创建全新的FFmpeg实例...');

  const ffmpeg = new FFmpeg();

  // 尝试最可靠的加载方式
  try {
    // 方式1: 使用备份目录 + 直接路径
    await ffmpeg.load({
      coreURL: '/ffmpeg/backup/ffmpeg-core.js',
      wasmURL: '/ffmpeg/backup/ffmpeg-core.wasm',
      workerURL: '/ffmpeg/backup/ffmpeg-core.worker.js'
    });

    console.log('✅ 使用备份目录直接加载成功');
    return ffmpeg;
  } catch (error1) {
    console.warn('备份目录直接加载失败:', error1);

    try {
      // 方式2: 使用主目录 + 直接路径
      await ffmpeg.load({
        coreURL: '/ffmpeg/ffmpeg-core.js',
        wasmURL: '/ffmpeg/ffmpeg-core.wasm',
        workerURL: '/ffmpeg/ffmpeg-core.worker.js'
      });

      console.log('✅ 使用主目录直接加载成功');
      return ffmpeg;
    } catch (error2) {
      console.warn('主目录直接加载失败:', error2);
      throw new Error(`FFmpeg创建失败: ${error1}, ${error2}`);
    }
  }
}





































