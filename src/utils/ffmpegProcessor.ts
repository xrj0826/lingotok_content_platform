/**
 * FFmpeg 视频处理工具
 * 适配不同版本的 @ffmpeg/ffmpeg 库
 */

// 动态导入 FFmpeg，兼容不同版本
let FFmpegLib: any;
let fetchFileLib: any;

// 尝试不同的导入方式
try {
  // 新版本 API
  const ffmpegModule = require('@ffmpeg/ffmpeg');
  FFmpegLib = ffmpegModule.FFmpeg;

  const utilModule = require('@ffmpeg/util');
  fetchFileLib = utilModule.fetchFile;
} catch (e) {
  try {
    // 旧版本 API
    const ffmpegModule = require('@ffmpeg/ffmpeg');
    FFmpegLib = ffmpegModule.createFFmpeg;
    fetchFileLib = ffmpegModule.fetchFile;
  } catch (e2) {
    console.warn('FFmpeg 库未找到，将使用 Canvas 方案');
  }
}

/**
 * 创建 FFmpeg 实例
 */
function createFFmpegInstance() {
  if (!FFmpegLib) {
    throw new Error('FFmpeg 库未可用');
  }

  // 尝试新版本 API
  if (typeof FFmpegLib === 'function' && FFmpegLib.name === 'FFmpeg') {
    return new FFmpegLib();
  }

  // 尝试旧版本 API
  if (typeof FFmpegLib === 'function') {
    return FFmpegLib({ log: false });
  }

  throw new Error('无法创建 FFmpeg 实例');
}

/**
 * 使用 FFmpeg 进行视频剪切
 * @param file 视频文件
 * @param startTime 开始时间(秒)
 * @param endTime 结束时间(秒)
 * @returns Promise<Blob> 剪切后的视频
 */
export async function cutVideoWithFFmpeg(file: File, startTime: number, endTime: number): Promise<Blob> {
  if (!FFmpegLib || !fetchFileLib) {
    throw new Error('FFmpeg 库未可用，请使用 Canvas 方案');
  }

  const ffmpeg = createFFmpegInstance();

  // 检查是否已加载
  const isLoaded = typeof ffmpeg.isLoaded === 'function' ? ffmpeg.isLoaded() : true;

  if (!isLoaded) {
    await ffmpeg.load();
  }

  // 文件名
  const inputName = `input.${file.name.split('.').pop()}`;
  const outputName = `output.${file.name.split('.').pop()}`;

  try {
    // 写入文件 - 兼容新旧 API
    if (typeof ffmpeg.writeFile === 'function') {
      // 新 API
      await ffmpeg.writeFile(inputName, await fetchFileLib(file));
    } else if (ffmpeg.FS) {
      // 旧 API
      ffmpeg.FS('writeFile', inputName, await fetchFileLib(file));
    } else {
      throw new Error('无法写入文件到 FFmpeg');
    }

    // 执行剪切命令
    await ffmpeg.exec([
      '-ss', `${startTime}`,
      '-t', `${endTime - startTime}`,
      '-i', inputName,
      '-vcodec', 'copy',
      '-acodec', 'copy',
      outputName
    ]);

    // 读取输出文件 - 兼容新旧 API
    let data: Uint8Array;
    if (typeof ffmpeg.readFile === 'function') {
      // 新 API
      data = await ffmpeg.readFile(outputName) as Uint8Array;
    } else if (ffmpeg.FS) {
      // 旧 API
      const fileData = ffmpeg.FS('readFile', outputName);
      data = new Uint8Array(fileData.buffer || fileData);
    } else {
      throw new Error('无法从 FFmpeg 读取文件');
    }

    return new Blob([data], { type: file.type });
  } catch (error) {
    console.error('FFmpeg 处理失败:', error);
    throw error;
  }
}

/**
 * 使用 FFmpeg 提取视频帧
 * @param file 视频文件
 * @param frameCount 帧数
 * @param size 尺寸
 * @returns Promise<string[]> Base64 图片数组
 */
export async function extractVideoFrames(
  file: File,
  frameCount: number = 20,
  size: string = "88*50"
): Promise<string[]> {
  if (!FFmpegLib || !fetchFileLib) {
    throw new Error('FFmpeg 库未可用');
  }

  const ffmpeg = createFFmpegInstance();

  const isLoaded = typeof ffmpeg.isLoaded === 'function' ? ffmpeg.isLoaded() : true;

  if (!isLoaded) {
    await ffmpeg.load();
  }

  const inputName = `input.${file.name.split('.').pop()}`;

  try {
    // 写入文件
    if (typeof ffmpeg.writeFile === 'function') {
      await ffmpeg.writeFile(inputName, await fetchFileLib(file));
    } else if (ffmpeg.FS) {
      ffmpeg.FS('writeFile', inputName, await fetchFileLib(file));
    }

    // 提取帧
    await ffmpeg.exec([
      '-i', inputName,
      '-r', '1',
      '-ss', '0',
      '-vframes', `${frameCount}`,
      '-f', 'image2',
      '-s', size,
      'image-%02d.png'
    ]);

    const frames: string[] = [];

    // 读取生成的图片
    for (let i = 1; i <= frameCount; i++) {
      try {
        const frameFileName = `image-${i.toString().padStart(2, '0')}.png`;

        let frameData: Uint8Array;
        if (typeof ffmpeg.readFile === 'function') {
          frameData = await ffmpeg.readFile(frameFileName) as Uint8Array;
        } else if (ffmpeg.FS) {
          const fileData = ffmpeg.FS('readFile', frameFileName);
          frameData = new Uint8Array(fileData.buffer || fileData);
        } else {
          break;
        }

        const base64 = arrayBufferToBase64(frameData.buffer);
        frames.push(base64);
      } catch (err) {
        console.warn(`Frame ${i} not found, stopping...`);
        break;
      }
    }

    return frames;
  } catch (error) {
    console.error('提取视频帧失败:', error);
    throw error;
  }
}

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const length = uint8Array.byteLength;
  const table = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
  ];

  let base64Str = "";
  let i: number;

  for (i = 0; length - i >= 3; i += 3) {
    const num1 = uint8Array[i];
    const num2 = uint8Array[i + 1];
    const num3 = uint8Array[i + 2];
    base64Str +=
      table[num1 >>> 2] +
      table[((num1 & 0b11) << 4) | (num2 >>> 4)] +
      table[((num2 & 0b1111) << 2) | (num3 >>> 6)] +
      table[num3 & 0b111111];
  }

  const lastByte = length - i;
  if (lastByte === 1) {
    const lastNum1 = uint8Array[i];
    base64Str +=
      table[lastNum1 >>> 2] + table[(lastNum1 & 0b11) << 4] + "==";
  } else if (lastByte === 2) {
    const lastNum1 = uint8Array[i];
    const lastNum2 = uint8Array[i + 1];
    base64Str +=
      table[lastNum1 >>> 2] +
      table[((lastNum1 & 0b11) << 4) | (lastNum2 >>> 4)] +
      table[(lastNum2 & 0b1111) << 2] +
      "=";
  }

  return base64Str;
}

/**
 * 检查 FFmpeg 是否可用
 */
export function isFFmpegAvailable(): boolean {
  return !!(FFmpegLib && fetchFileLib);
}
