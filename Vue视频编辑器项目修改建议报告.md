# Vue视频编辑器项目修改建议报告

基于OpenCut项目技术分析和Vue项目卡死问题诊断，针对Vue视频编辑器项目提出以下具体修改建议。

## 一、紧急修复建议（高优先级）

### 1. 替换FFmpeg.wasm架构为MediaBunny

**问题**: 当前项目使用FFmpeg.wasm 0.12.x系列存在严重的卡死问题和SharedArrayBuffer依赖。

**解决方案**: 参考OpenCut项目，迁移到MediaBunny技术栈。

#### A. 依赖替换
```json
// package.json 修改
{
  "dependencies": {
    // 移除FFmpeg相关依赖
    // "@ffmpeg/core": "^0.12.10",
    // "@ffmpeg/ffmpeg": "^0.12.15", 
    // "@ffmpeg/util": "^0.12.2"
    
    // 添加MediaBunny依赖
    "mediabunny": "^1.0.0"
  }
}
```

#### B. 创建新的视频处理器
```typescript
// src/utils/mediaBunnyProcessor.ts
import {
  Input,
  Output,
  Mp4OutputFormat,
  WebMOutputFormat,
  BufferTarget,
  CanvasSource,
  AudioBufferSource,
  BlobSource,
  CanvasSink,
  QUALITY_MEDIUM,
  ALL_FORMATS
} from "mediabunny";

export class MediaBunnyVideoProcessor {
  private videoCache = new Map<string, CanvasSink>();

  async initializeVideoSink(file: File): Promise<CanvasSink> {
    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) {
      throw new Error("No video track found");
    }

    const sink = new CanvasSink(videoTrack, {
      poolSize: 3,
      fit: "contain",
    });

    return sink;
  }

  async cutVideo(
    file: File, 
    startTime: number, 
    endTime: number,
    options: { format?: 'mp4' | 'webm'; quality?: string } = {}
  ): Promise<Blob> {
    const { format = 'mp4', quality = 'medium' } = options;
    
    // 创建输出格式
    const outputFormat = format === 'webm' ? new WebMOutputFormat() : new Mp4OutputFormat();
    const output = new Output({
      format: outputFormat,
      target: new BufferTarget(),
    });

    // 初始化视频源
    const sink = await this.initializeVideoSink(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // 设置画布尺寸
    canvas.width = 1920;
    canvas.height = 1080;

    const videoSource = new CanvasSource(canvas, {
      codec: format === 'webm' ? 'vp9' : 'avc',
      bitrate: QUALITY_MEDIUM,
    });

    output.addVideoTrack(videoSource, { frameRate: 30 });
    await output.start();

    const duration = endTime - startTime;
    const totalFrames = Math.ceil(duration * 30);

    // 渲染指定时间段的帧
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const time = startTime + (frameIndex / 30);
      
      // 获取视频帧
      await sink.seek(time);
      const frame = await sink.readFrame();
      
      if (frame) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frame.canvas, 0, 0, canvas.width, canvas.height);
      }

      await videoSource.add(time - startTime, 1 / 30);
    }

    videoSource.close();
    await output.finalize();

    return new Blob([output.target.buffer!], { type: `video/${format}` });
  }
}
```

### 2. 重构视频剪切组件

**修改文件**: `src/pages/video-editor/components/VideoCutPanel.vue`

```vue
<template>
  <div class="video-cut-panel">
    <!-- 移除FFmpeg模式选择，统一使用MediaBunny -->
    <div class="cut-options">
      <div class="time-inputs">
        <t-input
          v-model="cutOptions.startTime"
          label="开始时间"
          type="number"
          :min="0"
          :max="videoDuration"
          step="0.1"
        />
        <t-input
          v-model="cutOptions.endTime"
          label="结束时间"
          type="number"
          :min="cutOptions.startTime"
          :max="videoDuration"
          step="0.1"
        />
      </div>
      
      <div class="format-options">
        <t-select v-model="cutOptions.outputFormat" label="输出格式">
          <t-option value="mp4">MP4 (推荐)</t-option>
          <t-option value="webm">WebM</t-option>
        </t-select>
        
        <t-select v-model="cutOptions.quality" label="视频质量">
          <t-option value="low">低质量</t-option>
          <t-option value="medium">中等质量</t-option>
          <t-option value="high">高质量</t-option>
        </t-select>
      </div>
    </div>

    <div class="action-buttons">
      <t-button
        @click="handleCut"
        :loading="isProcessing"
        :disabled="!selectedFile || isProcessing"
        theme="primary"
      >
        {{ isProcessing ? `处理中... ${progress}%` : '开始剪切' }}
      </t-button>
      
      <t-button
        v-if="isProcessing"
        @click="handleCancel"
        theme="default"
      >
        取消
      </t-button>
    </div>

    <!-- 进度显示 -->
    <div v-if="isProcessing" class="progress-section">
      <t-progress :percentage="progress" :label="progressText" />
    </div>

    <!-- 结果预览 -->
    <div v-if="resultVideoUrl" class="result-section">
      <video :src="resultVideoUrl" controls width="100%" />
      <t-button @click="downloadResult">下载结果</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { MediaBunnyVideoProcessor } from '@/utils/mediaBunnyProcessor';

const processor = new MediaBunnyVideoProcessor();
const isProcessing = ref(false);
const progress = ref(0);
const progressText = ref('');
const resultVideoUrl = ref<string | null>(null);
const cancelController = ref<AbortController | null>(null);

const cutOptions = reactive({
  startTime: 0,
  endTime: 10,
  outputFormat: 'mp4' as 'mp4' | 'webm',
  quality: 'medium'
});

const handleCut = async () => {
  if (!selectedFile.value) return;

  isProcessing.value = true;
  progress.value = 0;
  progressText.value = '初始化处理器...';
  cancelController.value = new AbortController();

  try {
    progressText.value = '处理视频...';
    
    const result = await processor.cutVideo(
      selectedFile.value,
      cutOptions.startTime,
      cutOptions.endTime,
      {
        format: cutOptions.outputFormat,
        quality: cutOptions.quality
      }
    );

    // 创建结果URL
    resultVideoUrl.value = URL.createObjectURL(result);
    progressText.value = '处理完成';
    progress.value = 100;

  } catch (error) {
    console.error('视频剪切失败:', error);
    // 错误处理逻辑
  } finally {
    isProcessing.value = false;
    cancelController.value = null;
  }
};

const handleCancel = () => {
  if (cancelController.value) {
    cancelController.value.abort();
    isProcessing.value = false;
    progressText.value = '已取消';
  }
};
</script>
```

### 3. 优化时间轴渲染系统

**问题**: 当前时间轴渲染存在死循环风险。

**解决方案**: 参考OpenCut的渲染架构，使用RAF和智能缓存。

#### A. 创建高效的时间轴渲染器
```typescript
// src/utils/optimizedTimelineRenderer.ts
export class OptimizedTimelineRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastRenderTime = 0;
  private frameCache = new Map<string, ImageData>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  startRendering(renderCallback: () => void) {
    const render = (currentTime: number) => {
      // 限制帧率到60fps
      if (currentTime - this.lastRenderTime >= 16.67) {
        renderCallback();
        this.lastRenderTime = currentTime;
      }
      
      this.animationFrameId = requestAnimationFrame(render);
    };
    
    this.animationFrameId = requestAnimationFrame(render);
  }

  stopRendering() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  async renderFrame(time: number, tracks: TimelineTrack[], mediaFiles: MediaFile[]) {
    // 生成缓存键
    const cacheKey = this.generateCacheKey(time, tracks);
    
    // 检查缓存
    if (this.frameCache.has(cacheKey)) {
      const cachedFrame = this.frameCache.get(cacheKey)!;
      this.ctx.putImageData(cachedFrame, 0, 0);
      return;
    }

    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 渲染活动元素
    const activeElements = this.getActiveElements(time, tracks, mediaFiles);
    
    for (const element of activeElements) {
      await this.renderElement(element, time);
    }

    // 缓存结果（限制缓存大小）
    if (this.frameCache.size < 100) {
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.frameCache.set(cacheKey, imageData);
    }
  }

  private generateCacheKey(time: number, tracks: TimelineTrack[]): string {
    // 生成基于时间和轨道状态的缓存键
    const trackHash = tracks.map(t => `${t.id}_${t.elements.length}`).join('|');
    return `${Math.floor(time * 30)}_${trackHash}`;
  }

  clearCache() {
    this.frameCache.clear();
  }

  destroy() {
    this.stopRendering();
    this.clearCache();
  }
}
```

#### B. 修改时间轴编辑器组件
```vue
<!-- src/components/TimelineEditor.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { OptimizedTimelineRenderer } from '@/utils/optimizedTimelineRenderer';

const canvasRef = ref<HTMLCanvasElement>();
const renderer = ref<OptimizedTimelineRenderer>();
const isPlaying = ref(false);
const currentTime = ref(0);

onMounted(() => {
  if (canvasRef.value) {
    renderer.value = new OptimizedTimelineRenderer(canvasRef.value);
    
    // 启动渲染循环
    renderer.value.startRendering(() => {
      if (renderer.value && tracks.value.length > 0) {
        renderer.value.renderFrame(currentTime.value, tracks.value, mediaFiles.value);
      }
    });
  }
});

onUnmounted(() => {
  renderer.value?.destroy();
});

// 移除原有的setInterval，改用RAF
const updatePreview = () => {
  // 这个函数现在由OptimizedTimelineRenderer的RAF循环调用
  // 不再需要setInterval
};
</script>
```

## 二、架构优化建议（中优先级）

### 1. 实现WebWorker处理架构

**创建WebWorker处理器**:
```typescript
// src/workers/videoWorker.ts
import { MediaBunnyVideoProcessor } from '../utils/mediaBunnyProcessor';

const processor = new MediaBunnyVideoProcessor();

self.onmessage = async (event) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'CUT_VIDEO':
        const { file, startTime, endTime, options } = payload;
        const result = await processor.cutVideo(file, startTime, endTime, options);
        
        self.postMessage({
          type: 'CUT_VIDEO_SUCCESS',
          id,
          payload: { result }
        });
        break;

      case 'MERGE_VIDEOS':
        // 合并视频逻辑
        break;

      default:
        throw new Error(`Unknown worker message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      payload: { error: error.message }
    });
  }
};
```

**创建WebWorker包装器**:
```typescript
// src/utils/videoWorkerManager.ts
export class VideoWorkerManager {
  private worker: Worker;
  private pendingTasks = new Map<string, { resolve: Function; reject: Function }>();

  constructor() {
    this.worker = new Worker(new URL('../workers/videoWorker.ts', import.meta.url));
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  async cutVideo(file: File, startTime: number, endTime: number, options = {}) {
    return this.sendMessage('CUT_VIDEO', { file, startTime, endTime, options });
  }

  private sendMessage(type: string, payload: any): Promise<any> {
    const id = Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(id, { resolve, reject });
      this.worker.postMessage({ type, payload, id });
    });
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, id, payload } = event.data;
    const task = this.pendingTasks.get(id);
    
    if (!task) return;

    this.pendingTasks.delete(id);

    if (type === 'ERROR') {
      task.reject(new Error(payload.error));
    } else {
      task.resolve(payload.result);
    }
  }

  destroy() {
    this.worker.terminate();
    this.pendingTasks.clear();
  }
}
```

### 2. 增强错误处理和恢复机制

**创建错误恢复管理器**:
```typescript
// src/utils/errorRecoveryManager.ts
export class ErrorRecoveryManager {
  private retryCount = new Map<string, number>();
  private maxRetries = 3;

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    onRetry?: (attempt: number) => void
  ): Promise<T> {
    const attempts = this.retryCount.get(operationId) || 0;

    try {
      const result = await operation();
      this.retryCount.delete(operationId); // 成功后清除重试计数
      return result;
    } catch (error) {
      if (attempts < this.maxRetries) {
        this.retryCount.set(operationId, attempts + 1);
        onRetry?.(attempts + 1);
        
        // 指数退避
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeWithRetry(operation, operationId, onRetry);
      } else {
        this.retryCount.delete(operationId);
        throw error;
      }
    }
  }

  resetRetryCount(operationId: string) {
    this.retryCount.delete(operationId);
  }
}
```

### 3. 实现内存监控和管理

**创建内存管理器**:
```typescript
// src/utils/memoryManager.ts
export class MemoryManager {
  private memoryThreshold = 0.8; // 80%内存使用率阈值
  private checkInterval: number | null = null;

  startMonitoring(onMemoryWarning: () => void) {
    this.checkInterval = window.setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (usageRatio > this.memoryThreshold) {
          onMemoryWarning();
        }
      }
    }, 5000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async clearCache() {
    // 清理各种缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}
```

## 三、用户体验优化建议（中优先级）

### 1. 实现进度监控和取消功能

**创建进度管理器**:
```typescript
// src/utils/progressManager.ts
export class ProgressManager {
  private currentOperation: AbortController | null = null;
  private progressCallback: ((progress: number, message: string) => void) | null = null;

  setProgressCallback(callback: (progress: number, message: string) => void) {
    this.progressCallback = callback;
  }

  startOperation(): AbortController {
    this.currentOperation = new AbortController();
    return this.currentOperation;
  }

  updateProgress(progress: number, message: string) {
    this.progressCallback?.(progress, message);
  }

  cancelOperation() {
    if (this.currentOperation) {
      this.currentOperation.abort();
      this.currentOperation = null;
      this.updateProgress(0, '操作已取消');
    }
  }

  isOperationActive(): boolean {
    return this.currentOperation !== null;
  }
}
```

### 2. 文件大小检查和预处理

**创建文件验证器**:
```typescript
// src/utils/fileValidator.ts
export class FileValidator {
  private maxFileSize = 200 * 1024 * 1024; // 200MB
  private supportedFormats = ['mp4', 'webm', 'avi', 'mov', 'mkv'];

  validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `文件过大 (${Math.round(file.size / 1024 / 1024)}MB)，请选择小于200MB的文件`
      };
    }

    // 检查文件格式
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.supportedFormats.includes(extension)) {
      return {
        valid: false,
        error: `不支持的文件格式：${extension}。支持的格式：${this.supportedFormats.join(', ')}`
      };
    }

    return { valid: true };
  }

  async getVideoInfo(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          fps: 30 // 默认值，MediaBunny可以获取实际fps
        });
      };
      video.onerror = () => reject(new Error('无法读取视频信息'));
      video.src = URL.createObjectURL(file);
    });
  }
}
```

## 四、配置文件修改建议

### 1. 更新Vite配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    // 移除SharedArrayBuffer相关的CORS头部配置
    // MediaBunny不需要这些配置
    host: true,
    port: 3000
  },
  build: {
    // 优化构建配置
    rollupOptions: {
      output: {
        manualChunks: {
          'mediabunny': ['mediabunny'],
          'ui': ['tdesign-vue-next']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['mediabunny'] // 确保MediaBunny正确处理
  }
});
```

### 2. 环境变量配置

```env
# .env
VITE_MAX_FILE_SIZE=200
VITE_SUPPORTED_FORMATS=mp4,webm,avi,mov,mkv
VITE_DEFAULT_QUALITY=medium
VITE_ENABLE_DEBUG=false
```

## 五、测试和验证建议

### 1. 创建测试套件

```typescript
// src/tests/videoProcessor.test.ts
import { describe, it, expect } from 'vitest';
import { MediaBunnyVideoProcessor } from '../utils/mediaBunnyProcessor';

describe('MediaBunnyVideoProcessor', () => {
  const processor = new MediaBunnyVideoProcessor();

  it('should cut video successfully', async () => {
    // 创建测试视频文件
    const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    
    const result = await processor.cutVideo(testFile, 0, 10);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('video/mp4');
  });

  it('should handle invalid time ranges', async () => {
    const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    
    await expect(
      processor.cutVideo(testFile, 10, 5) // 结束时间早于开始时间
    ).rejects.toThrow();
  });
});
```

### 2. 性能监控

```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  private metrics = new Map<string, number>();

  startMeasure(name: string) {
    this.metrics.set(name, performance.now());
  }

  endMeasure(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.metrics.delete(name);
    
    console.log(`${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    return operation().finally(() => {
      this.endMeasure(name);
    });
  }
}
```

## 六、实施计划

### 阶段1（1-2周）：紧急修复
1. 替换FFmpeg.wasm为MediaBunny
2. 重构视频剪切组件
3. 优化时间轴渲染系统
4. 添加文件大小检查

### 阶段2（2-3周）：架构优化
1. 实现WebWorker处理架构
2. 增强错误处理和恢复机制
3. 实现内存监控和管理
4. 添加进度监控和取消功能

### 阶段3（3-4周）：用户体验优化
1. 完善UI/UX设计
2. 添加更多文件格式支持
3. 实现批量处理功能
4. 优化性能和响应速度

### 阶段4（4-5周）：测试和部署
1. 全面测试所有功能
2. 性能测试和优化
3. 用户验收测试
4. 生产环境部署

## 七、总结

通过以上修改建议，Vue视频编辑器项目可以：

1. **彻底解决卡死问题** - 移除FFmpeg.wasm和SharedArrayBuffer依赖
2. **提升处理性能** - 使用MediaBunny的现代架构
3. **增强用户体验** - 实时进度反馈和取消功能
4. **提高系统稳定性** - 完善的错误处理和恢复机制
5. **优化资源使用** - 智能缓存和内存管理

建议优先实施阶段1的紧急修复，这将立即解决大部分卡死问题，然后逐步推进后续优化阶段。
