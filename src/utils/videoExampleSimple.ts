/**
 * 精简版视频处理使用示例
 * 只包含视频剪切和合并功能的使用方法
 */

import { cutVideo, mergeVideos, revokeVideoUrl } from './videoProcessorSimple';

/**
 * 视频剪切示例
 */
export async function exampleVideoCut(file: File) {
  try {
    console.log('开始视频剪切...');

    // 快速剪切模式（推荐，速度快）
    const quickCutUrl = await cutVideo(file, 10, 30, {
      fastMode: true  // 保持原始编码，速度快
    });

    // 高质量剪切模式（重新编码，质量好但速度慢）
    const hqCutUrl = await cutVideo(file, 10, 30, {
      fastMode: false,
      videoQuality: 18,  // 高质量设置
      outputFormat: 'mp4'
    });

    console.log('剪切完成:', { quickCutUrl, hqCutUrl });
    return { quickCutUrl, hqCutUrl };
  } catch (error) {
    console.error('视频剪切失败:', error);
    throw error;
  }
}

/**
 * 视频合并示例
 */
export async function exampleVideoMerge(files: File[]) {
  try {
    console.log('开始视频合并...');

    // 简单合并
    const simpleUrl = await mergeVideos(files, {
      outputFormat: 'mp4',
      videoQuality: 23,
      resolution: '1920x1080'
    });

    // 带交叉淡入淡出效果的合并
    const crossfadeUrl = await mergeVideos(files, {
      outputFormat: 'mp4',
      enableCrossfade: true,
      fadeLength: 1.5,  // 1.5秒淡入淡出
      videoQuality: 20
    });

    console.log('合并完成:', { simpleUrl, crossfadeUrl });
    return { simpleUrl, crossfadeUrl };
  } catch (error) {
    console.error('视频合并失败:', error);
    throw error;
  }
}

/**
 * 完整的视频处理工作流示例
 */
export async function exampleVideoWorkflow(videoFiles: File[]) {
  try {
    console.log('开始视频处理工作流...');

    // 1. 剪切每个视频的前30秒
    const cutVideos: string[] = [];
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      console.log(`剪切视频 ${i + 1}/${videoFiles.length}:`, file.name);

      const cutUrl = await cutVideo(file, 0, 30, {
        fastMode: true  // 使用快速模式
      });
      cutVideos.push(cutUrl);
    }

    // 2. 如果有多个视频，合并它们
    let finalVideoUrl = '';
    if (cutVideos.length > 1) {
      console.log('合并剪切后的视频...');

      // 将URL转换回File对象以便合并
      const cutVideoFiles: File[] = [];
      for (let i = 0; i < cutVideos.length; i++) {
        const response = await fetch(cutVideos[i]);
        const blob = await response.blob();
        const file = new File([blob], `cut-video-${i}.mp4`, { type: 'video/mp4' });
        cutVideoFiles.push(file);
      }

      finalVideoUrl = await mergeVideos(cutVideoFiles, {
        enableCrossfade: true,
        fadeLength: 1,
        resolution: '1920x1080'
      });

      // 清理中间文件的URL
      cutVideos.forEach(url => revokeVideoUrl(url));
    } else {
      finalVideoUrl = cutVideos[0];
    }

    console.log('视频处理工作流完成!');
    return {
      finalVideoUrl,
      processedVideoCount: videoFiles.length
    };

  } catch (error) {
    console.error('视频处理工作流失败:', error);
    throw error;
  }
}

/**
 * 批量视频处理示例
 */
export async function exampleBatchProcess(videoFiles: File[]) {
  try {
    console.log('开始批量视频处理...');
    const results = [];

    // 逐个处理视频（避免内存过载）
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      console.log(`处理视频 ${i + 1}/${videoFiles.length}:`, file.name);

      // 剪切视频的中间部分
      const duration = 60; // 假设每个视频剪切1分钟
      const startTime = 10; // 从第10秒开始
      const endTime = startTime + duration;

      const cutUrl = await cutVideo(file, startTime, endTime, {
        fastMode: true,
        outputFormat: 'mp4'
      });

      results.push({
        originalFile: file.name,
        processedUrl: cutUrl,
        startTime,
        endTime
      });
    }

    console.log('批量处理完成，共处理:', results.length, '个视频');
    return results;
  } catch (error) {
    console.error('批量处理失败:', error);
    throw error;
  }
}

/**
 * 使用最佳实践的示例
 */
export async function exampleBestPractices(files: File[]) {
  const processedUrls: string[] = [];

  try {
    // 1. 检查文件大小，大文件先压缩
    const processFiles = files.map(file => {
      if (file.size > 100 * 1024 * 1024) { // 大于100MB
        console.warn(`文件 ${file.name} 较大 (${Math.round(file.size / 1024 / 1024)}MB)，建议先压缩`);
      }
      return file;
    });

    // 2. 逐个处理避免内存问题
    for (const file of processFiles) {
      // 剪切视频
      const cutUrl = await cutVideo(file, 5, 35, {
        fastMode: true  // 使用快速模式减少处理时间
      });
      processedUrls.push(cutUrl);
    }

    // 3. 合并处理后的视频
    if (processedUrls.length > 1) {
      // 转换为File对象
      const fileObjects: File[] = [];
      for (let i = 0; i < processedUrls.length; i++) {
        const response = await fetch(processedUrls[i]);
        const blob = await response.blob();
        fileObjects.push(new File([blob], `processed-${i}.mp4`, { type: 'video/mp4' }));
      }

      const finalUrl = await mergeVideos(fileObjects, {
        videoQuality: 25,  // 平衡质量和文件大小
        resolution: '1280x720'  // 使用较小分辨率
      });

      // 4. 清理中间文件
      processedUrls.forEach(url => revokeVideoUrl(url));

      return finalUrl;
    } else {
      return processedUrls[0];
    }

  } catch (error) {
    // 清理已创建的URL
    processedUrls.forEach(url => revokeVideoUrl(url));
    throw error;
  }
}

// 导出所有示例
export default {
  exampleVideoCut,
  exampleVideoMerge,
  exampleVideoWorkflow,
  exampleBatchProcess,
  exampleBestPractices
};















































