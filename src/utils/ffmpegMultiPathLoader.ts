/**
 * FFmpeg多路径加载器
 * 尝试多种文件引用方式和路径，确保FFmpeg能够成功加载
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

export interface LoadStrategy {
  name: string;
  description: string;
  paths: {
    coreURL: string;
    wasmURL: string;
    workerURL: string;
  };
  useToBlob: boolean;
  priority: number;
}

/**
 * 多种FFmpeg文件路径策略
 */
export const FFMPEG_LOAD_STRATEGIES: LoadStrategy[] = [
  {
    name: 'local-public',
    description: '本地public目录',
    paths: {
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm',
      workerURL: '/ffmpeg/ffmpeg-core.worker.js'
    },
    useToBlob: true,
    priority: 1
  },
  {
    name: 'local-backup',
    description: '本地备份目录',
    paths: {
      coreURL: '/ffmpeg/backup/ffmpeg-core.js',
      wasmURL: '/ffmpeg/backup/ffmpeg-core.wasm',
      workerURL: '/ffmpeg/backup/ffmpeg-core.worker.js'
    },
    useToBlob: true,
    priority: 2
  },
  {
    name: 'local-direct',
    description: '本地直接路径（不使用toBlobURL）',
    paths: {
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm',
      workerURL: '/ffmpeg/ffmpeg-core.worker.js'
    },
    useToBlob: false,
    priority: 3
  },
  {
    name: 'cdn-unpkg',
    description: 'UNPKG CDN',
    paths: {
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm',
      workerURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.worker.js'
    },
    useToBlob: true,
    priority: 4
  },
  {
    name: 'cdn-jsdelivr',
    description: 'jsDelivr CDN',
    paths: {
      coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
      wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm',
      workerURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.worker.js'
    },
    useToBlob: true,
    priority: 5
  },
  {
    name: 'local-assets',
    description: '本地assets目录',
    paths: {
      coreURL: '/assets/ffmpeg/ffmpeg-core.js',
      wasmURL: '/assets/ffmpeg/ffmpeg-core.wasm',
      workerURL: '/assets/ffmpeg/ffmpeg-core.worker.js'
    },
    useToBlob: true,
    priority: 6
  },
  {
    name: 'local-static',
    description: '本地static目录',
    paths: {
      coreURL: '/static/ffmpeg/ffmpeg-core.js',
      wasmURL: '/static/ffmpeg/ffmpeg-core.wasm',
      workerURL: '/static/ffmpeg/ffmpeg-core.worker.js'
    },
    useToBlob: true,
    priority: 7
  }
];

export interface LoadResult {
  success: boolean;
  strategy?: LoadStrategy;
  ffmpeg?: FFmpeg;
  error?: string;
  duration: number;
  details: string[];
}

/**
 * 多路径FFmpeg加载器
 */
export class MultiPathFFmpegLoader {
  private static instance: MultiPathFFmpegLoader;
  private loadedFFmpeg: FFmpeg | null = null;
  private lastSuccessfulStrategy: LoadStrategy | null = null;

  static getInstance(): MultiPathFFmpegLoader {
    if (!MultiPathFFmpegLoader.instance) {
      MultiPathFFmpegLoader.instance = new MultiPathFFmpegLoader();
    }
    return MultiPathFFmpegLoader.instance;
  }

  /**
   * 尝试所有策略加载FFmpeg
   */
  async loadWithAllStrategies(
    onProgress?: (strategy: LoadStrategy, attempt: number, total: number) => void,
    onDetails?: (message: string) => void
  ): Promise<LoadResult> {
    const startTime = Date.now();
    const details: string[] = [];

    // 如果已经有加载成功的实例，直接返回
    if (this.loadedFFmpeg?.loaded) {
      return {
        success: true,
        ffmpeg: this.loadedFFmpeg,
        strategy: this.lastSuccessfulStrategy!,
        duration: Date.now() - startTime,
        details: ['使用已存在的FFmpeg实例']
      };
    }

    // 按优先级排序策略
    const strategies = [...FFMPEG_LOAD_STRATEGIES].sort((a, b) => a.priority - b.priority);

    details.push(`开始尝试 ${strategies.length} 种加载策略...`);
    onDetails?.(`开始尝试 ${strategies.length} 种加载策略...`);

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      onProgress?.(strategy, i + 1, strategies.length);

      details.push(`\n尝试策略 ${i + 1}/${strategies.length}: ${strategy.name} (${strategy.description})`);
      onDetails?.(`尝试策略 ${i + 1}/${strategies.length}: ${strategy.name}`);

      try {
        const result = await this.loadWithStrategy(strategy, onDetails);

        if (result.success && result.ffmpeg) {
          this.loadedFFmpeg = result.ffmpeg;
          this.lastSuccessfulStrategy = strategy;

          details.push(`✅ 策略 ${strategy.name} 加载成功！`);

          return {
            success: true,
            strategy,
            ffmpeg: result.ffmpeg,
            duration: Date.now() - startTime,
            details: [...details, ...result.details]
          };
        } else {
          details.push(`❌ 策略 ${strategy.name} 失败: ${result.error}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        details.push(`❌ 策略 ${strategy.name} 异常: ${errorMsg}`);
        onDetails?.(`策略 ${strategy.name} 失败: ${errorMsg}`);
      }
    }

    // 所有策略都失败了
    details.push('\n❌ 所有加载策略都失败了');

    return {
      success: false,
      error: '所有FFmpeg加载策略都失败了',
      duration: Date.now() - startTime,
      details
    };
  }

  /**
   * 使用特定策略加载FFmpeg
   */
  async loadWithStrategy(
    strategy: LoadStrategy,
    onDetails?: (message: string) => void
  ): Promise<LoadResult> {
    const startTime = Date.now();
    const details: string[] = [];

    try {
      details.push(`使用策略: ${strategy.description}`);
      onDetails?.(`检查文件可用性...`);

      // 1. 首先检查文件是否可访问
      const filesAvailable = await this.checkFilesAvailability(strategy.paths);
      if (!filesAvailable.allAvailable) {
        const missingFiles = filesAvailable.results
          .filter(r => !r.available)
          .map(r => r.file)
          .join(', ');

        return {
          success: false,
          error: `文件不可访问: ${missingFiles}`,
          duration: Date.now() - startTime,
          details: [...details, `缺失文件: ${missingFiles}`]
        };
      }

      details.push('✅ 所有文件都可访问');
      onDetails?.(`创建FFmpeg实例...`);

      // 2. 创建FFmpeg实例
      const ffmpeg = new FFmpeg();

      // 3. 准备加载URLs
      let loadConfig: any;

      if (strategy.useToBlob) {
        details.push('使用toBlobURL方式加载...');
        onDetails?.(`转换文件为Blob URL...`);

        try {
          const [coreURL, wasmURL, workerURL] = await Promise.all([
            toBlobURL(strategy.paths.coreURL, 'text/javascript'),
            toBlobURL(strategy.paths.wasmURL, 'application/wasm'),
            toBlobURL(strategy.paths.workerURL, 'text/javascript')
          ]);

          loadConfig = { coreURL, wasmURL, workerURL };
          details.push('✅ Blob URL转换成功');
        } catch (blobError) {
          details.push(`❌ Blob URL转换失败: ${blobError}`);
          throw new Error(`toBlobURL失败: ${blobError}`);
        }
      } else {
        details.push('使用直接路径方式加载...');
        loadConfig = strategy.paths;
      }

      // 4. 加载FFmpeg
      onDetails?.(`加载FFmpeg核心...`);
      details.push('开始加载FFmpeg核心...');

      // 添加加载超时
      const loadPromise = ffmpeg.load(loadConfig);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('加载超时 (45秒)')), 45000);
      });

      await Promise.race([loadPromise, timeoutPromise]);

      // 5. 验证加载结果
      if (!ffmpeg.loaded) {
        throw new Error('FFmpeg加载状态验证失败');
      }

      details.push('✅ FFmpeg加载成功，开始功能测试...');
      onDetails?.(`验证FFmpeg功能...`);

      // 6. 简单功能测试
      await this.testFFmpegFunctionality(ffmpeg);
      details.push('✅ FFmpeg功能测试通过');

      return {
        success: true,
        ffmpeg,
        strategy,
        duration: Date.now() - startTime,
        details
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMsg,
        duration: Date.now() - startTime,
        details: [...details, `加载失败: ${errorMsg}`]
      };
    }
  }

  /**
   * 检查文件可用性
   */
  private async checkFilesAvailability(paths: any): Promise<{
    allAvailable: boolean;
    results: Array<{ file: string; available: boolean; size?: number; error?: string }>;
  }> {
    const files = [
      { name: 'core', url: paths.coreURL },
      { name: 'wasm', url: paths.wasmURL },
      { name: 'worker', url: paths.workerURL }
    ];

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const response = await fetch(file.url, { method: 'HEAD' });
          const size = parseInt(response.headers.get('content-length') || '0');

          return {
            file: file.name,
            available: response.ok,
            size: size || undefined,
            error: response.ok ? undefined : `HTTP ${response.status}`
          };
        } catch (error) {
          return {
            file: file.name,
            available: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    return {
      allAvailable: results.every(r => r.available),
      results
    };
  }

  /**
   * 测试FFmpeg基本功能
   */
  private async testFFmpegFunctionality(ffmpeg: FFmpeg): Promise<void> {
    try {
      // 测试文件写入和读取
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      await ffmpeg.writeFile('test.bin', testData);
      const readData = await ffmpeg.readFile('test.bin');
      await ffmpeg.deleteFile('test.bin');

      if (readData.length !== testData.length) {
        throw new Error('文件读写测试失败');
      }
    } catch (error) {
      throw new Error(`功能测试失败: ${error}`);
    }
  }

  /**
   * 获取推荐的策略
   */
  getRecommendedStrategy(): LoadStrategy {
    // 如果之前有成功的策略，优先使用
    if (this.lastSuccessfulStrategy) {
      return this.lastSuccessfulStrategy;
    }

    // 否则返回优先级最高的
    return FFMPEG_LOAD_STRATEGIES.sort((a, b) => a.priority - b.priority)[0];
  }

  /**
   * 重置加载器
   */
  reset(): void {
    this.loadedFFmpeg = null;
    this.lastSuccessfulStrategy = null;
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    hasLoaded: boolean;
    isLoaded: boolean;
    lastStrategy?: string;
  } {
    return {
      hasLoaded: this.loadedFFmpeg !== null,
      isLoaded: this.loadedFFmpeg?.loaded || false,
      lastStrategy: this.lastSuccessfulStrategy?.name
    };
  }
}

/**
 * 便捷的加载函数
 */
export async function loadFFmpegWithMultiPath(
  onProgress?: (strategy: LoadStrategy, attempt: number, total: number) => void,
  onDetails?: (message: string) => void
): Promise<FFmpeg> {
  const loader = MultiPathFFmpegLoader.getInstance();
  const result = await loader.loadWithAllStrategies(onProgress, onDetails);

  if (!result.success || !result.ffmpeg) {
    throw new Error(result.error || '所有加载策略都失败了');
  }

  return result.ffmpeg;
}

/**
 * 诊断当前环境的FFmpeg支持情况
 */
export async function diagnoseFFmpegEnvironment(): Promise<{
  environment: {
    hasSharedArrayBuffer: boolean;
    isCrossOriginIsolated: boolean;
    protocol: string;
    userAgent: string;
  };
  strategies: Array<{
    name: string;
    description: string;
    available: boolean;
    details: string[];
  }>;
  recommendations: string[];
}> {
  const environment = {
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    isCrossOriginIsolated: typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false,
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };

  const strategies = [];
  const recommendations = [];

  // 测试每个策略的可用性
  for (const strategy of FFMPEG_LOAD_STRATEGIES) {
    const loader = new MultiPathFFmpegLoader();
    const details = [];

    try {
      const filesCheck = await loader['checkFilesAvailability'](strategy.paths);
      const available = filesCheck.allAvailable;

      details.push(`文件检查: ${available ? '通过' : '失败'}`);
      if (!available) {
        const missing = filesCheck.results.filter(r => !r.available).map(r => r.file);
        details.push(`缺失文件: ${missing.join(', ')}`);
      }

      strategies.push({
        name: strategy.name,
        description: strategy.description,
        available,
        details
      });
    } catch (error) {
      strategies.push({
        name: strategy.name,
        description: strategy.description,
        available: false,
        details: [`检查失败: ${error}`]
      });
    }
  }

  // 生成建议
  if (!environment.hasSharedArrayBuffer) {
    recommendations.push('SharedArrayBuffer不可用，请使用现代浏览器或HTTPS协议');
  }

  if (!environment.isCrossOriginIsolated) {
    recommendations.push('跨域隔离未启用，检查CORS头部配置');
  }

  const availableStrategies = strategies.filter(s => s.available);
  if (availableStrategies.length === 0) {
    recommendations.push('没有可用的FFmpeg文件路径，请检查文件部署');
  } else {
    recommendations.push(`发现 ${availableStrategies.length} 个可用的加载策略`);
  }

  return {
    environment,
    strategies,
    recommendations
  };
}





























