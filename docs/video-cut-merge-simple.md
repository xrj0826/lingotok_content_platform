# 视频剪切与合并工具使用指南

基于FFmpeg的高质量视频剪切和合并功能，使用本地文件，无需CDN依赖。

## 功能特性

### 🎬 视频剪切
- **快速模式**: 保持原始编码，处理速度快
- **高质量模式**: 重新编码，输出质量高
- **精确时间控制**: 支持秒级精确剪切
- **多格式支持**: MP4、WebM、AVI等主流格式

### 🔗 视频合并
- **简单合并**: 顺序拼接多个视频
- **交叉淡入淡出**: 视频间平滑过渡效果
- **分辨率统一**: 自动处理不同分辨率视频
- **高质量输出**: 可调节的编码质量

## 安装配置

### 依赖包
```json
{
  "@ffmpeg/core": "^0.12.10",
  "@ffmpeg/ffmpeg": "^0.12.15",
  "@ffmpeg/util": "^0.12.2"
}
```

### FFmpeg文件
确保 `public/ffmpeg/` 目录包含以下文件：
- `ffmpeg-core.js`
- `ffmpeg-core.wasm`
- `ffmpeg-core.worker.js`

## 基本使用

### 导入模块
```typescript
import { cutVideo, mergeVideos, revokeVideoUrl } from '@/utils/videoProcessorSimple';
```

### 视频剪切

#### 快速剪切（推荐）
```typescript
// 剪切第10秒到第30秒，保持原始编码
const cutUrl = await cutVideo(file, 10, 30, {
  fastMode: true  // 快速模式，速度快
});
```

#### 高质量剪切
```typescript
// 重新编码，获得更好的质量
const hqCutUrl = await cutVideo(file, 10, 30, {
  fastMode: false,
  videoQuality: 18,     // 0-51，数值越小质量越高
  outputFormat: 'mp4'   // 指定输出格式
});
```

### 视频合并

#### 简单合并
```typescript
// 按顺序合并多个视频
const mergedUrl = await mergeVideos(files, {
  outputFormat: 'mp4',
  videoQuality: 23,
  resolution: '1920x1080'  // 统一输出分辨率
});
```

#### 带淡入淡出效果
```typescript
// 视频间添加交叉淡入淡出效果
const crossfadeUrl = await mergeVideos(files, {
  enableCrossfade: true,
  fadeLength: 1.5,      // 1.5秒淡入淡出
  videoQuality: 20
});
```

## 完整示例

### 单个视频剪切
```typescript
async function cutVideoExample(file: File) {
  try {
    // 剪切视频的第10-30秒
    const cutUrl = await cutVideo(file, 10, 30, {
      fastMode: true  // 使用快速模式
    });
    
    console.log('剪切完成:', cutUrl);
    
    // 使用完毕后记得释放内存
    // revokeVideoUrl(cutUrl);
    
    return cutUrl;
  } catch (error) {
    console.error('剪切失败:', error);
  }
}
```

### 多个视频合并
```typescript
async function mergeVideoExample(files: File[]) {
  try {
    // 合并多个视频，带淡入淡出效果
    const mergedUrl = await mergeVideos(files, {
      enableCrossfade: true,
      fadeLength: 2,        // 2秒淡入淡出
      resolution: '1280x720' // 输出720p
    });
    
    console.log('合并完成:', mergedUrl);
    return mergedUrl;
  } catch (error) {
    console.error('合并失败:', error);
  }
}
```

### 完整工作流
```typescript
async function videoWorkflow(videoFiles: File[]) {
  const processedUrls: string[] = [];
  
  try {
    // 1. 剪切每个视频的前30秒
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      console.log(`处理视频 ${i + 1}/${videoFiles.length}`);
      
      const cutUrl = await cutVideo(file, 0, 30, {
        fastMode: true
      });
      processedUrls.push(cutUrl);
    }

    // 2. 合并所有剪切后的视频
    if (processedUrls.length > 1) {
      // 将URL转换为File对象
      const cutFiles: File[] = [];
      for (let i = 0; i < processedUrls.length; i++) {
        const response = await fetch(processedUrls[i]);
        const blob = await response.blob();
        cutFiles.push(new File([blob], `cut-${i}.mp4`, { type: 'video/mp4' }));
      }

      // 合并视频
      const finalUrl = await mergeVideos(cutFiles, {
        enableCrossfade: true,
        fadeLength: 1,
        resolution: '1920x1080'
      });

      // 清理中间文件
      processedUrls.forEach(url => revokeVideoUrl(url));
      
      return finalUrl;
    } else {
      return processedUrls[0];
    }
    
  } catch (error) {
    // 出错时清理已创建的URL
    processedUrls.forEach(url => revokeVideoUrl(url));
    throw error;
  }
}
```

## 参数说明

### cutVideo 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| file | File | - | 输入视频文件 |
| startTime | number | - | 开始时间(秒) |
| endTime | number | - | 结束时间(秒) |
| options.fastMode | boolean | true | 快速模式(保持原编码) |
| options.outputFormat | string | 原格式 | 输出格式 |
| options.videoQuality | number | 23 | 视频质量(0-51) |

### mergeVideos 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| files | File[] | - | 视频文件数组 |
| options.outputFormat | string | 'mp4' | 输出格式 |
| options.videoQuality | number | 23 | 视频质量(0-51) |
| options.resolution | string | - | 输出分辨率 |
| options.enableCrossfade | boolean | false | 启用交叉淡入淡出 |
| options.fadeLength | number | 1 | 淡入淡出长度(秒) |

## 质量设置建议

### 视频质量 (CRF值)
- **18-22**: 高质量，文件较大
- **23-28**: 标准质量，平衡文件大小
- **29-35**: 低质量，文件较小

### 分辨率选择
- `1920x1080`: Full HD
- `1280x720`: HD  
- `854x480`: 480p
- `640x360`: 360p

## 最佳实践

### 1. 性能优化
```typescript
// 优先使用快速模式
const cutUrl = await cutVideo(file, 0, 30, {
  fastMode: true  // 速度快，适合批量处理
});

// 大文件建议分段处理
if (file.size > 100 * 1024 * 1024) { // 大于100MB
  console.warn('文件较大，建议先压缩或分段处理');
}
```

### 2. 内存管理
```typescript
// 及时释放不用的Blob URL
const videoUrl = await cutVideo(file, 0, 30);
// ... 使用完毕后
revokeVideoUrl(videoUrl);
```

### 3. 错误处理
```typescript
try {
  const result = await cutVideo(file, 0, 30);
  console.log('处理成功');
} catch (error) {
  console.error('处理失败:', error.message);
  // 提供用户友好的错误提示
}
```

### 4. 批量处理
```typescript
// 逐个处理避免内存过载
for (const file of files) {
  const result = await cutVideo(file, 0, 30);
  // 处理结果...
}

// 而不是
// const results = await Promise.all(files.map(file => cutVideo(file, 0, 30)));
```

## 常见问题

### Q: 处理速度慢怎么办？
A: 
- 使用快速模式 (`fastMode: true`)
- 降低输出质量 (`videoQuality: 28`)
- 减小输出分辨率

### Q: 内存不足怎么办？
A:
- 逐个处理文件，避免并发
- 及时释放不用的Blob URL
- 处理大文件前先压缩

### Q: FFmpeg加载失败？
A:
- 检查 `public/ffmpeg/` 目录文件是否存在
- 确认网络连接正常（备用CDN）
- 查看浏览器控制台错误信息

### Q: 支持哪些视频格式？
A: 支持主流格式包括：
- 输入：MP4, WebM, AVI, MOV, MKV等
- 输出：MP4, WebM

## 进度显示

工具内置进度显示功能，会在页面右下角显示：
- "初始化FFmpeg..."
- "加载FFmpeg核心..."
- "处理视频文件..."
- "剪切视频 (10s - 30s)..."
- "生成结果文件..."

## 更新日志

### v1.0.0
- 基于掘金文章方法实现
- 使用本地FFmpeg文件
- 支持快速和高质量两种剪切模式
- 支持交叉淡入淡出合并效果
- 完善的错误处理和进度显示

---

*基于 [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) 实现*


































