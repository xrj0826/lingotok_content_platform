/**
 * FFmpeg路径统一修复工具
 * 解决不同配置文件路径不一致的问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

/**
 * 统一的FFmpeg文件路径配置
 */
export const FFMPEG_PATHS = {
  // Node modules路径（推荐）
  nodeModules: {
    baseURL: '/node_modules/@ffmpeg/core/dist/umd',
    coreFile: 'ffmpeg-core.js',
    wasmFile: 'ffmpeg-core.wasm',
    workerFile: 'ffmpeg-core.js' // UMD版本将worker包含在core中
  },

  // 标准路径
  standard: {
    baseURL: '/ffmpeg',
    coreFile: 'ffmpeg-core.js',
    wasmFile: 'ffmpeg-core.wasm',
    workerFile: 'ffmpeg-core.worker.js'
  },

  // 备用路径
  backup: {
    baseURL: '/ffmpeg/backup',
    coreFile: 'ffmpeg-core.js',
    wasmFile: 'ffmpeg-core.wasm',
    workerFile: 'ffmpeg-core.worker.js'
  }
};

/**
 * 生成正确的文件URL
 */
export function generateFileURLs(useBackup = false) {
  const config = useBackup ? FFMPEG_PATHS.backup : FFMPEG_PATHS.standard;

  return {
    coreURL: `${config.baseURL}/${config.coreFile}`,
    wasmURL: `${config.baseURL}/${config.wasmFile}`,
    workerURL: `${config.baseURL}/${config.workerFile}`
  };
}

/**
 * 检查文件是否存在
 */
export async function checkFileExists(url: string): Promise<boolean> {
  console.log(`🔍 [DEBUG] 检查文件是否存在: ${url}`);
  try {
    const startTime = performance.now();
    const response = await fetch(url, { method: 'HEAD' });
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(`📊 [DEBUG] 文件检查结果:`, {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: response.headers ? (() => {
        const headerObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headerObj[key] = value;
        });
        return headerObj;
      })() : {},
      responseTime: `${responseTime.toFixed(2)}ms`
    });

    if (response.ok) {
      console.log(`✅ [DEBUG] 文件存在且可访问: ${url}`);
    } else {
      console.log(`❌ [DEBUG] 文件不可访问: ${url} (状态: ${response.status})`);
    }

    return response.ok;
  } catch (error) {
    console.error(`💥 [DEBUG] 检查文件时发生错误: ${url}`, error);
    console.error(`🔴 [DEBUG] 错误详情:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

/**
 * 自动选择可用的路径配置
 */
export async function autoSelectBestPaths(): Promise<{
  coreURL: string;
  wasmURL: string;
  workerURL: string;
  pathType: 'standard' | 'backup';
}> {
  console.log('🔍 [DEBUG] 开始自动检测最佳FFmpeg路径...');
  const startTime = performance.now();

  // 首先尝试标准路径
  console.log('🎯 [DEBUG] 生成标准路径URL...');
  const standardURLs = generateFileURLs(false);
  console.log('📝 [DEBUG] 标准路径配置:', standardURLs);

  console.log('🔄 [DEBUG] 开始检查标准路径文件可用性...');
  const standardValid = await Promise.all([
    checkFileExists(standardURLs.coreURL),
    checkFileExists(standardURLs.wasmURL),
    checkFileExists(standardURLs.workerURL)
  ]);

  console.log('📊 [DEBUG] 标准路径检查结果:', {
    core: standardValid[0],
    wasm: standardValid[1],
    worker: standardValid[2],
    allValid: standardValid.every(valid => valid)
  });

  if (standardValid.every(valid => valid)) {
    const endTime = performance.now();
    console.log(`✅ [DEBUG] 标准路径可用，耗时: ${(endTime - startTime).toFixed(2)}ms`);
    console.log('🎉 [DEBUG] 最终选择标准路径:', standardURLs);
    return {
      ...standardURLs,
      pathType: 'standard'
    };
  }

  // 尝试备用路径
  console.log('⚠️ [DEBUG] 标准路径不完全可用，尝试备用路径...');
  console.log('🎯 [DEBUG] 生成备用路径URL...');
  const backupURLs = generateFileURLs(true);
  console.log('📝 [DEBUG] 备用路径配置:', backupURLs);

  console.log('🔄 [DEBUG] 开始检查备用路径文件可用性...');
  const backupValid = await Promise.all([
    checkFileExists(backupURLs.coreURL),
    checkFileExists(backupURLs.wasmURL),
    checkFileExists(backupURLs.workerURL)
  ]);

  console.log('📊 [DEBUG] 备用路径检查结果:', {
    core: backupValid[0],
    wasm: backupValid[1],
    worker: backupValid[2],
    allValid: backupValid.every(valid => valid)
  });

  if (backupValid.every(valid => valid)) {
    const endTime = performance.now();
    console.log(`✅ [DEBUG] 备用路径可用，耗时: ${(endTime - startTime).toFixed(2)}ms`);
    console.log('🎉 [DEBUG] 最终选择备用路径:', backupURLs);
    return {
      ...backupURLs,
      pathType: 'backup'
    };
  }

  // 都不可用时抛出错误
  const endTime = performance.now();
  console.error(`💥 [DEBUG] 所有路径都不可用，总耗时: ${(endTime - startTime).toFixed(2)}ms`);
  console.error('🔴 [DEBUG] 详细失败信息:', {
    standardPaths: {
      urls: standardURLs,
      validationResults: standardValid
    },
    backupPaths: {
      urls: backupURLs,
      validationResults: backupValid
    }
  });

  throw new Error(`无法找到可用的FFmpeg文件路径，请检查文件是否存在。
  
检查详情:
- 标准路径检查结果: ${standardValid.map((v, i) => `${['core', 'wasm', 'worker'][i]}: ${v ? '✅' : '❌'}`).join(', ')}
- 备用路径检查结果: ${backupValid.map((v, i) => `${['core', 'wasm', 'worker'][i]}: ${v ? '✅' : '❌'}`).join(', ')}

请确保以下文件存在并可访问:
1. ${standardURLs.coreURL}
2. ${standardURLs.wasmURL}
3. ${standardURLs.workerURL}
或者备用文件:
1. ${backupURLs.coreURL}
2. ${backupURLs.wasmURL}
3. ${backupURLs.workerURL}`);
}

/**
 * 统一的FFmpeg加载器
 */
export class UnifiedFFmpegLoader {
  private static instance: FFmpeg | null = null;
  private static loading = false;

  /**
   * 获取FFmpeg实例
   */
  static async getInstance(): Promise<FFmpeg> {
    console.log('🎬 [DEBUG] UnifiedFFmpegLoader.getInstance() 被调用');
    console.log('🔍 [DEBUG] 当前实例状态:', {
      hasInstance: this.instance !== null,
      isLoading: this.loading,
      instanceType: this.instance ? typeof this.instance : 'null'
    });

    if (this.instance) {
      console.log('✅ [DEBUG] 返回已存在的FFmpeg实例');
      return this.instance;
    }

    if (this.loading) {
      console.log('⏳ [DEBUG] 检测到正在加载中，等待加载完成...');
      let waitCount = 0;
      // 等待加载完成
      while (this.loading) {
        waitCount++;
        console.log(`⏱️ [DEBUG] 等待加载... (${waitCount})`);
        await new Promise(resolve => setTimeout(resolve, 100));

        if (waitCount > 300) { // 30秒超时
          console.error('💥 [DEBUG] 等待FFmpeg加载超时');
          throw new Error('FFmpeg加载超时');
        }
      }
      if (this.instance) {
        console.log('✅ [DEBUG] 等待完成，返回已加载的实例');
        return this.instance;
      }
    }

    console.log('🚀 [DEBUG] 开始新的FFmpeg实例创建流程');
    this.loading = true;
    const startTime = performance.now();

    try {
      console.log('🔧 [DEBUG] 创建新的FFmpeg对象...');
      const ffmpeg = new FFmpeg();
      console.log('✅ [DEBUG] FFmpeg对象创建成功');

      // 设置事件监听器
      console.log('📡 [DEBUG] 设置FFmpeg事件监听器...');
      ffmpeg.on('log', ({ message }) => {
        console.log('📝 [FFmpeg LOG]:', message);
      });

      ffmpeg.on('progress', ({ progress, time }) => {
        console.log('⏳ [FFmpeg PROGRESS]:', `${Math.round(progress * 100)}% (${time}ms)`);
      });
      console.log('✅ [DEBUG] 事件监听器设置完成');

      // 自动选择最佳路径
      console.log('🎯 [DEBUG] 开始自动选择最佳路径...');
      const paths = await autoSelectBestPaths();
      console.log('✅ [DEBUG] 路径选择完成:', paths);

      console.log(`🔧 [DEBUG] 使用${paths.pathType}路径加载FFmpeg...`);

      // 生成Blob URLs
      console.log('🔄 [DEBUG] 开始生成Blob URLs...');
      const blobStartTime = performance.now();

      const [coreURL, wasmURL, workerURL] = await Promise.all([
        toBlobURL(paths.coreURL, 'text/javascript'),
        toBlobURL(paths.wasmURL, 'application/wasm'),
        toBlobURL(paths.workerURL, 'text/javascript')
      ]);

      const blobEndTime = performance.now();
      console.log(`✅ [DEBUG] Blob URLs生成完成，耗时: ${(blobEndTime - blobStartTime).toFixed(2)}ms`);

      console.log('📋 [DEBUG] FFmpeg加载配置:', {
        originalPaths: paths,
        blobURLs: {
          coreURL: coreURL.substring(0, 50) + '...',
          wasmURL: wasmURL.substring(0, 50) + '...',
          workerURL: workerURL.substring(0, 50) + '...'
        },
        pathType: paths.pathType,
        blobURLFullLengths: {
          core: coreURL.length,
          wasm: wasmURL.length,
          worker: workerURL.length
        }
      });

      // 加载FFmpeg
      console.log('🔄 [DEBUG] 开始加载FFmpeg核心...');
      const loadStartTime = performance.now();

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL
      });

      const loadEndTime = performance.now();
      console.log(`✅ [DEBUG] FFmpeg核心加载完成，耗时: ${(loadEndTime - loadStartTime).toFixed(2)}ms`);

      this.instance = ffmpeg;
      const totalEndTime = performance.now();
      console.log(`🎉 [DEBUG] FFmpeg统一加载器加载成功！总耗时: ${(totalEndTime - startTime).toFixed(2)}ms`);

      return ffmpeg;

    } catch (error) {
      const endTime = performance.now();
      console.error(`💥 [DEBUG] FFmpeg统一加载器失败，总耗时: ${(endTime - startTime).toFixed(2)}ms`);
      console.error('🔴 [DEBUG] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    } finally {
      this.loading = false;
      console.log('🏁 [DEBUG] 加载状态重置完成');
    }
  }

  /**
   * 重置实例
   */
  static reset(): void {
    console.log('🔄 [DEBUG] UnifiedFFmpegLoader.reset() 被调用');
    console.log('🔍 [DEBUG] 重置前状态:', {
      hasInstance: this.instance !== null,
      isLoading: this.loading
    });

    this.instance = null;
    this.loading = false;

    console.log('✅ [DEBUG] FFmpeg实例已重置');
  }

  /**
   * 获取加载状态
   */
  static getStatus(): {
    loaded: boolean;
    loading: boolean;
  } {
    const status = {
      loaded: this.instance !== null,
      loading: this.loading
    };

    console.log('🔍 [DEBUG] 获取FFmpeg状态:', status);
    return status;
  }
}

/**
 * 路径诊断工具
 */
export async function diagnoseFFmpegPaths(): Promise<{
  standardPaths: {
    available: boolean;
    details: Record<string, boolean>;
  };
  backupPaths: {
    available: boolean;
    details: Record<string, boolean>;
  };
  recommendation: string;
}> {
  console.log('🔍 开始FFmpeg路径诊断...');

  const standardURLs = generateFileURLs(false);
  const backupURLs = generateFileURLs(true);

  // 检查标准路径
  const standardDetails = {
    core: await checkFileExists(standardURLs.coreURL),
    wasm: await checkFileExists(standardURLs.wasmURL),
    worker: await checkFileExists(standardURLs.workerURL)
  };

  const standardAvailable = Object.values(standardDetails).every(v => v);

  // 检查备用路径
  const backupDetails = {
    core: await checkFileExists(backupURLs.coreURL),
    wasm: await checkFileExists(backupURLs.wasmURL),
    worker: await checkFileExists(backupURLs.workerURL)
  };

  const backupAvailable = Object.values(backupDetails).every(v => v);

  // 生成建议
  let recommendation = '';
  if (standardAvailable) {
    recommendation = '标准路径可用，建议使用标准配置';
  } else if (backupAvailable) {
    recommendation = '仅备用路径可用，建议检查标准路径文件';
  } else {
    recommendation = '所有路径都不可用，请检查FFmpeg文件是否正确部署';
  }

  const result = {
    standardPaths: {
      available: standardAvailable,
      details: standardDetails
    },
    backupPaths: {
      available: backupAvailable,
      details: backupDetails
    },
    recommendation
  };

  console.log('📊 路径诊断结果:', result);
  return result;
}

/**
 * 便捷的统一加载函数
 */
export async function loadFFmpegUnified(): Promise<FFmpeg> {
  console.log('🎬 [DEBUG] loadFFmpegUnified() 被调用');
  try {
    const result = await UnifiedFFmpegLoader.getInstance();
    console.log('✅ [DEBUG] loadFFmpegUnified() 成功完成');
    return result;
  } catch (error) {
    console.error('💥 [DEBUG] loadFFmpegUnified() 失败:', error);
    throw error;
  }
}
