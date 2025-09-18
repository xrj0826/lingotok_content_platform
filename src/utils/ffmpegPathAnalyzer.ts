/**
 * FFmpeg路径分析工具
 * 专门分析和对比加载路径与实际文件路径的对应关系
 */

export interface PathAnalysisResult {
  configuredPaths: {
    coreURL: string;
    wasmURL: string;
    workerURL: string;
  };
  actualPaths: {
    coreURL: string;
    wasmURL: string;
    workerURL: string;
  };
  pathMatches: {
    core: boolean;
    wasm: boolean;
    worker: boolean;
  };
  blobURLInfo: {
    core: { isBlob: boolean; accessible: boolean };
    wasm: { isBlob: boolean; accessible: boolean };
    worker: { isBlob: boolean; accessible: boolean };
  };
  recommendations: string[];
}

/**
 * 分析FFmpeg路径配置
 */
export async function analyzeFFmpegPaths(): Promise<PathAnalysisResult> {
  console.log('🔍 开始分析FFmpeg路径配置...');

  // 实际的FFmpeg文件路径（基于您的项目结构）
  const actualPaths = {
    coreURL: '/ffmpeg/ffmpeg-core.js',
    wasmURL: '/ffmpeg/ffmpeg-core.wasm',
    workerURL: '/ffmpeg/ffmpeg-core.worker.js'
  };

  // 尝试从已加载的FFmpeg实例获取配置
  let configuredPaths = {
    coreURL: '/ffmpeg/ffmpeg-core.js',  // 默认值
    wasmURL: '/ffmpeg/ffmpeg-core.wasm',
    workerURL: '/ffmpeg/ffmpeg-core.worker.js'
  };

  // 检查浏览器控制台中的FFmpeg配置信息
  try {
    // 从全局变量或localStorage中获取路径信息
    const savedConfig = localStorage.getItem('ffmpeg-config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.coreURL) configuredPaths.coreURL = parsed.coreURL;
      if (parsed.wasmURL) configuredPaths.wasmURL = parsed.wasmURL;
      if (parsed.workerURL) configuredPaths.workerURL = parsed.workerURL;
    }
  } catch (error) {
    console.warn('无法从本地存储获取FFmpeg配置:', error);
  }

  // 检查blob URL信息
  const blobURLInfo = {
    core: await analyzeBlobURL(configuredPaths.coreURL),
    wasm: await analyzeBlobURL(configuredPaths.wasmURL),
    worker: await analyzeBlobURL(configuredPaths.workerURL)
  };

  // 比较路径匹配情况
  const pathMatches = {
    core: compareURLs(configuredPaths.coreURL, actualPaths.coreURL),
    wasm: compareURLs(configuredPaths.wasmURL, actualPaths.wasmURL),
    worker: compareURLs(configuredPaths.workerURL, actualPaths.workerURL)
  };

  // 生成建议
  const recommendations = generateRecommendations(pathMatches, blobURLInfo);

  const result: PathAnalysisResult = {
    configuredPaths,
    actualPaths,
    pathMatches,
    blobURLInfo,
    recommendations
  };

  console.log('📋 FFmpeg路径分析结果:', result);
  return result;
}

/**
 * 分析blob URL
 */
async function analyzeBlobURL(url: string): Promise<{ isBlob: boolean; accessible: boolean }> {
  const isBlob = url.startsWith('blob:');

  if (!isBlob) {
    return { isBlob: false, accessible: false };
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return { isBlob: true, accessible: response.ok };
  } catch (error) {
    return { isBlob: true, accessible: false };
  }
}

/**
 * 比较URLs（忽略blob URL的动态部分）
 */
function compareURLs(configuredURL: string, actualURL: string): boolean {
  // 如果是blob URL，检查原始路径是否匹配
  if (configuredURL.startsWith('blob:')) {
    // blob URL无法直接比较，但可以检查其他信息
    return false; // blob URL总是被认为是"不匹配"的，需要特殊处理
  }

  return configuredURL === actualURL;
}

/**
 * 生成建议
 */
function generateRecommendations(
  pathMatches: any,
  blobURLInfo: any
): string[] {
  const recommendations: string[] = [];

  // 检查路径匹配情况
  const unmatchedPaths = Object.entries(pathMatches)
    .filter(([_, matches]) => !matches)
    .map(([key, _]) => key);

  if (unmatchedPaths.length > 0) {
    recommendations.push(`发现路径不匹配的文件: ${unmatchedPaths.join(', ')}`);
    recommendations.push('建议检查FFmpeg配置文件中的路径设置');
  }

  // 检查blob URL情况
  const blobURLs = Object.entries(blobURLInfo)
    .filter(([_, info]: [string, any]) => info.isBlob)
    .map(([key, _]) => key);

  if (blobURLs.length > 0) {
    recommendations.push(`检测到blob URL: ${blobURLs.join(', ')}`);
    recommendations.push('blob URL是正常的，说明FFmpeg正在使用toBlobURL进行加载');

    const inaccessibleBlobs = Object.entries(blobURLInfo)
      .filter(([_, info]: [string, any]) => info.isBlob && !info.accessible)
      .map(([key, _]) => key);

    if (inaccessibleBlobs.length > 0) {
      recommendations.push(`发现无法访问的blob URL: ${inaccessibleBlobs.join(', ')}`);
      recommendations.push('这可能表示FFmpeg加载过程中出现了问题');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('路径配置正常，无需调整');
  }

  return recommendations;
}

/**
 * 生成路径对比报告
 */
export function generatePathComparisonReport(analysis: PathAnalysisResult): string {
  let report = '# FFmpeg路径对比分析报告\n\n';

  report += '## 路径配置对比\n\n';
  report += '| 文件类型 | 配置路径 | 实际路径 | 状态 |\n';
  report += '|---------|----------|----------|------|\n';

  const files = [
    { name: 'Core JS', configured: analysis.configuredPaths.coreURL, actual: analysis.actualPaths.coreURL, match: analysis.pathMatches.core },
    { name: 'WASM', configured: analysis.configuredPaths.wasmURL, actual: analysis.actualPaths.wasmURL, match: analysis.pathMatches.wasm },
    { name: 'Worker JS', configured: analysis.configuredPaths.workerURL, actual: analysis.actualPaths.workerURL, match: analysis.pathMatches.worker }
  ];

  files.forEach(file => {
    const status = file.match ? '✅ 匹配' : '❌ 不匹配';
    report += `| ${file.name} | \`${file.configured}\` | \`${file.actual}\` | ${status} |\n`;
  });

  report += '\n## Blob URL 分析\n\n';
  const blobFiles = [
    { name: 'Core JS', info: analysis.blobURLInfo.core },
    { name: 'WASM', info: analysis.blobURLInfo.wasm },
    { name: 'Worker JS', info: analysis.blobURLInfo.worker }
  ];

  blobFiles.forEach(file => {
    if (file.info.isBlob) {
      const accessible = file.info.accessible ? '✅ 可访问' : '❌ 不可访问';
      report += `- **${file.name}**: 使用 Blob URL (${accessible})\n`;
    } else {
      report += `- **${file.name}**: 使用直接路径\n`;
    }
  });

  report += '\n## 分析建议\n\n';
  analysis.recommendations.forEach(rec => {
    report += `- ${rec}\n`;
  });

  return report;
}

/**
 * 实时监控FFmpeg配置变化
 */
export class FFmpegPathMonitor {
  private lastConfig: any = null;
  private observers: Array<(config: any) => void> = [];

  startMonitoring(interval = 5000) {
    const checkConfig = async () => {
      try {
        const currentConfig = await this.getCurrentFFmpegConfig();

        if (JSON.stringify(currentConfig) !== JSON.stringify(this.lastConfig)) {
          this.lastConfig = currentConfig;
          this.notifyObservers(currentConfig);
        }
      } catch (error) {
        console.warn('FFmpeg配置监控失败:', error);
      }
    };

    // 立即执行一次
    checkConfig();

    // 定期检查
    setInterval(checkConfig, interval);
  }

  addObserver(callback: (config: any) => void) {
    this.observers.push(callback);
  }

  private notifyObservers(config: any) {
    this.observers.forEach(observer => {
      try {
        observer(config);
      } catch (error) {
        console.warn('FFmpeg配置观察者回调失败:', error);
      }
    });
  }

  private async getCurrentFFmpegConfig(): Promise<any> {
    // 尝试多种方式获取当前FFmpeg配置
    const sources = [
      () => (window as any).ffmpegConfig,
      () => (window as any).ffmpegInstance?.config,
      () => JSON.parse(localStorage.getItem('ffmpeg-config') || '{}'),
      () => this.extractConfigFromConsole()
    ];

    for (const source of sources) {
      try {
        const config = source();
        if (config && (config.coreURL || config.wasmURL || config.workerURL)) {
          return config;
        }
      } catch (error) {
        // 忽略错误，尝试下一个源
      }
    }

    return null;
  }

  private extractConfigFromConsole(): any {
    // 这里可以实现从控制台输出中提取配置信息的逻辑
    // 由于浏览器安全限制，这通常是不可能的
    return null;
  }
}

/**
 * 验证特定的路径配置
 */
export async function validateSpecificPaths(
  coreURL: string,
  wasmURL: string,
  workerURL: string
): Promise<{
  core: { valid: boolean; size?: number; error?: string };
  wasm: { valid: boolean; size?: number; error?: string };
  worker: { valid: boolean; size?: number; error?: string };
}> {
  const validatePath = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        return { valid: false, error: `HTTP ${response.status}` };
      }
      const size = parseInt(response.headers.get('content-length') || '0');
      return { valid: true, size };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  const [core, wasm, worker] = await Promise.all([
    validatePath(coreURL),
    validatePath(wasmURL),
    validatePath(workerURL)
  ]);

  return { core, wasm, worker };
}






































