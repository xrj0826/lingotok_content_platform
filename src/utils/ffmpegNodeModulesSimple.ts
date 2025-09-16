/**
 * 简化的 node_modules FFmpeg 加载器
 * 直接使用静态文件路径，避免 ES Module 导入问题
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * 检查环境支持
 */
function checkEnvironment(): boolean {
  console.log('🔍 [DEBUG] 检查环境支持...');

  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const isCrossOriginIsolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;

  console.log('📊 [DEBUG] 环境检查:', {
    SharedArrayBuffer: hasSharedArrayBuffer,
    crossOriginIsolated: isCrossOriginIsolated,
    protocol: location.protocol,
    hostname: location.hostname
  });

  return hasSharedArrayBuffer && isCrossOriginIsolated;
}

/**
 * 获取 node_modules 中的文件路径
 * 使用 Vite 的静态文件服务
 */
function getNodeModulesFilePaths() {
  // Vite 会将 node_modules 文件映射到特定路径
  // 我们可以直接访问这些文件
  const paths = {
    coreURL: '/node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js',
    wasmURL: '/node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm',
    workerURL: '/node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js' // UMD版本包含worker
  };

  console.log('📋 [DEBUG] Node modules 文件路径:', paths);
  return paths;
}

/**
 * 检查文件是否可访问
 */
async function checkFileAvailability(url: string): Promise<boolean> {
  try {
    console.log(`🔍 [DEBUG] 检查文件: ${url}`);
    const response = await fetch(url, { method: 'HEAD' });
    const available = response.ok;

    console.log(`${available ? '✅' : '❌'} [DEBUG] ${url} - ${response.status}`);

    if (available) {
      const size = response.headers.get('content-length');
      if (size) {
        console.log(`📊 [DEBUG] 文件大小: ${Math.round(Number(size) / 1024)}KB`);
      }
    }

    return available;
  } catch (error) {
    console.error(`💥 [DEBUG] 文件检查失败: ${url}`, error);
    return false;
  }
}

/**
 * 从 node_modules 加载 FFmpeg
 */
export async function loadFFmpegFromNodeModules(): Promise<FFmpeg> {
  console.log('🎬 [DEBUG] loadFFmpegFromNodeModules() 开始');

  if (ffmpegInstance) {
    console.log('✅ [DEBUG] 返回已存在的实例');
    return ffmpegInstance;
  }

  if (isLoading) {
    console.log('⏳ [DEBUG] 等待加载完成...');
    let waitCount = 0;
    while (isLoading) {
      waitCount++;
      await new Promise(resolve => setTimeout(resolve, 100));

      if (waitCount > 300) { // 30秒超时
        throw new Error('FFmpeg 加载超时');
      }
    }

    if (ffmpegInstance) return ffmpegInstance;
  }

  isLoading = true;
  const startTime = performance.now();

  try {
    // 检查环境支持
    if (!checkEnvironment()) {
      throw new Error('环境不支持 SharedArrayBuffer，请确保使用 HTTPS 并正确配置 CORS 头部');
    }

    // 获取文件路径
    const paths = getNodeModulesFilePaths();

    // 检查文件可用性
    console.log('🔍 [DEBUG] 检查所有文件可用性...');
    const fileChecks = await Promise.all([
      checkFileAvailability(paths.coreURL),
      checkFileAvailability(paths.wasmURL)
    ]);

    if (!fileChecks.every(Boolean)) {
      throw new Error('部分 FFmpeg 文件不可访问，请确保 @ffmpeg/core 包已正确安装');
    }

    console.log('✅ [DEBUG] 所有文件检查通过');

    // 创建 FFmpeg 实例
    console.log('🔧 [DEBUG] 创建 FFmpeg 实例...');
    ffmpegInstance = new FFmpeg();

    // 设置监听器
    ffmpegInstance.on('log', ({ message }) => {
      console.log('📝 [FFmpeg LOG]:', message);
    });

    ffmpegInstance.on('progress', ({ progress, time }) => {
      console.log('⏳ [FFmpeg PROGRESS]:', `${Math.round(progress * 100)}% (${time}ms)`);
    });

    // 转换为 Blob URLs
    console.log('🔄 [DEBUG] 转换为 Blob URLs...');
    const blobStartTime = performance.now();

    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(paths.coreURL, 'text/javascript'),
      toBlobURL(paths.wasmURL, 'application/wasm')
    ]);

    const blobEndTime = performance.now();
    console.log(`✅ [DEBUG] Blob URLs 转换完成，耗时: ${(blobEndTime - blobStartTime).toFixed(2)}ms`);

    console.log('📊 [DEBUG] Blob URLs 信息:', {
      coreLength: coreURL.length,
      wasmLength: wasmURL.length
    });

    // 加载 FFmpeg
    console.log('🚀 [DEBUG] 开始加载 FFmpeg...');
    const loadStartTime = performance.now();

    await ffmpegInstance.load({
      coreURL,
      wasmURL,
      workerURL: coreURL // UMD 版本，worker 包含在 core 中
    });

    const loadEndTime = performance.now();
    console.log(`✅ [DEBUG] FFmpeg 加载完成，耗时: ${(loadEndTime - loadStartTime).toFixed(2)}ms`);

    const totalEndTime = performance.now();
    console.log(`🎉 [DEBUG] node_modules FFmpeg 加载成功！总耗时: ${(totalEndTime - startTime).toFixed(2)}ms`);

    return ffmpegInstance;

  } catch (error) {
    const endTime = performance.now();
    console.error(`💥 [DEBUG] node_modules FFmpeg 加载失败，耗时: ${(endTime - startTime).toFixed(2)}ms`);
    console.error('🔴 [DEBUG] 错误详情:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    ffmpegInstance = null;
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * 重置实例
 */
export function resetNodeModulesFFmpeg(): void {
  console.log('🔄 [DEBUG] 重置 node_modules FFmpeg 实例');
  ffmpegInstance = null;
  isLoading = false;
}

/**
 * 获取状态
 */
export function getNodeModulesFFmpegStatus(): { loaded: boolean; loading: boolean } {
  return {
    loaded: ffmpegInstance !== null,
    loading: isLoading
  };
}

/**
 * 使用 node_modules FFmpeg 进行视频剪切
 */
export async function cutVideoWithNodeModules(
  file: File,
  startTime: number,
  endTime: number,
  outputFormat: string = 'mp4'
): Promise<string> {
  console.log('🎬 [DEBUG] cutVideoWithNodeModules() 开始');
  console.log('📋 [DEBUG] 参数:', { fileName: file.name, startTime, endTime, outputFormat });

  const ffmpeg = await loadFFmpegFromNodeModules();

  const inputName = `input.${file.name.split('.').pop()}`;
  const outputName = `output.${outputFormat}`;
  const duration = endTime - startTime;

  try {
    // 写入输入文件
    console.log('📤 [DEBUG] 写入输入文件...');
    const writeStartTime = performance.now();

    const fileBuffer = await file.arrayBuffer();
    await ffmpeg.writeFile(inputName, new Uint8Array(fileBuffer));

    const writeEndTime = performance.now();
    console.log(`✅ [DEBUG] 文件写入完成，耗时: ${(writeEndTime - writeStartTime).toFixed(2)}ms`);

    // 执行剪切命令
    console.log('🎬 [DEBUG] 执行剪切命令...');
    const execStartTime = performance.now();

    const command = [
      '-i', inputName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy', // 使用流复制，速度更快
      '-avoid_negative_ts', 'make_zero',
      outputName
    ];

    console.log('📜 [DEBUG] FFmpeg 命令:', command);
    await ffmpeg.exec(command);

    const execEndTime = performance.now();
    console.log(`✅ [DEBUG] 命令执行完成，耗时: ${(execEndTime - execStartTime).toFixed(2)}ms`);

    // 读取输出文件
    console.log('📖 [DEBUG] 读取输出文件...');
    const readStartTime = performance.now();

    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data as Uint8Array], {
      type: `video/${outputFormat === 'webm' ? 'webm' : 'mp4'}`
    });

    const readEndTime = performance.now();
    console.log(`✅ [DEBUG] 文件读取完成，耗时: ${(readEndTime - readStartTime).toFixed(2)}ms`);
    console.log(`📊 [DEBUG] 输出文件大小: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

    // 创建 URL
    const url = URL.createObjectURL(blob);
    console.log('🎉 [DEBUG] 视频剪切完成');

    return url;

  } finally {
    // 清理临时文件
    console.log('🧹 [DEBUG] 清理临时文件...');
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      console.log('✅ [DEBUG] 临时文件清理完成');
    } catch (cleanupError) {
      console.warn('⚠️ [DEBUG] 清理文件失败:', cleanupError);
    }
  }
}