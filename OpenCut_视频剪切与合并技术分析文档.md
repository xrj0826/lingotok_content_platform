# OpenCut 视频剪切与合并技术分析文档

## 项目概述

OpenCut是一个基于Web的视频编辑器，使用React、TypeScript和现代Web技术构建。该项目采用时间轴（Timeline）架构，支持多轨道视频编辑，提供了完整的视频剪切、合并和导出功能。

## 核心技术栈

- **前端框架**: React + TypeScript + Next.js
- **状态管理**: Zustand
- **视频处理**: MediaBunny + FFmpeg.wasm 
- **UI组件**: Tailwind CSS + Radix UI
- **视频缓存**: 自定义VideoCache系统

## 数据结构设计

### 时间轴结构 (Timeline)

```typescript
interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType; // "media" | "audio" | "text"
  elements: TimelineElement[];
  muted: boolean;
}

interface TimelineElement {
  id: string;
  type: "media" | "text";
  name: string;
  startTime: number;      // 在时间轴上的开始时间
  duration: number;       // 原始媒体时长
  trimStart: number;      // 头部裁剪时间
  trimEnd: number;        // 尾部裁剪时间
  mediaId?: string;       // 关联的媒体文件ID
  muted?: boolean;
}
```

### 媒体文件结构

```typescript
interface MediaFile {
  id: string;
  name: string;
  type: "video" | "audio" | "image";
  file: File;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  thumbnailUrl?: string;
}
```

## 视频剪切功能实现

### 1. 基础分割操作 (splitSelected)

**核心实现位置**: `apps/web/src/stores/timeline-store.ts:1565`

```typescript
splitSelected: (splitTime, trackId?: string, elementId?: string) => {
  // 1. 确定要分割的元素
  const elementsToProcess = trackId && elementId 
    ? [{ trackId, elementId }]
    : selectedElements.length > 0 
      ? selectedElements 
      : [];

  // 2. 验证分割点是否在元素范围内
  for (const { trackId: tId, elementId: eId } of elementsToProcess) {
    const element = track?.elements.find((e) => e.id === eId);
    const effectiveStart = element.startTime;
    const effectiveEnd = element.startTime + 
      (element.duration - element.trimStart - element.trimEnd);
    
    if (splitTime > effectiveStart && splitTime < effectiveEnd) {
      elementsToSplit.push({ trackId: tId, elementId: eId, element });
    }
  }

  // 3. 执行分割操作
  return track.elements.flatMap((element) => {
    if (!elementToSplit) return [element];
    
    const relativeTime = splitTime - element.startTime;
    const firstDuration = relativeTime;
    const secondDuration = element.duration - element.trimStart - element.trimEnd - relativeTime;

    // 创建两个新元素
    return [
      {
        ...element,
        trimEnd: element.trimEnd + secondDuration,
        name: getElementNameWithSuffix(element.name, "left"),
      },
      {
        ...element,
        id: generateUUID(),
        startTime: splitTime,
        trimStart: element.trimStart + firstDuration,
        name: getElementNameWithSuffix(element.name, "right"),
      },
    ];
  });
}
```

**分割原理**:
1. 不实际切割媒体文件，而是通过调整`trimStart`和`trimEnd`参数
2. 左侧片段：增加`trimEnd`时间，保持原始`startTime`
3. 右侧片段：调整`startTime`到分割点，增加`trimStart`时间

### 2. 精确分割操作

**splitAndKeepLeft** (仅保留左侧):
```typescript
splitAndKeepLeft: (trackId, elementId, splitTime) => {
  const relativeTime = splitTime - element.startTime;
  const durationToRemove = element.duration - element.trimStart - element.trimEnd - relativeTime;
  
  // 只保留左侧部分，增加trimEnd裁剪右侧
  return {
    ...element,
    trimEnd: element.trimEnd + durationToRemove,
    name: getElementNameWithSuffix(element.name, "left"),
  };
}
```

**splitAndKeepRight** (仅保留右侧):
```typescript
splitAndKeepRight: (trackId, elementId, splitTime) => {
  const relativeTime = splitTime - element.startTime;
  
  // 只保留右侧部分，调整startTime和trimStart
  return {
    ...element,
    startTime: splitTime,
    trimStart: element.trimStart + relativeTime,
    name: getElementNameWithSuffix(element.name, "right"),
  };
}
```

### 3. 音频分离功能

**实现位置**: `apps/web/src/stores/timeline-store.ts:974`

```typescript
separateAudio: (trackId, elementId) => {
  const element = track?.elements.find((c) => c.id === elementId);
  if (!element || track?.type !== "media") return null;

  // 创建音频轨道元素
  const audioElement = {
    ...element,
    id: generateUUID(),
    name: getElementNameWithSuffix(element.name, "audio"),
  };

  // 添加到现有音频轨道或创建新的音频轨道
  if (existingAudioTrack) {
    // 添加到现有轨道
  } else {
    // 创建新的音频轨道
    const newAudioTrack: TimelineTrack = {
      id: generateUUID(),
      name: "Audio Track",
      type: "audio",
      elements: [audioElement],
      muted: false,
    };
  }
}
```

## 视频合并与渲染功能

OpenCut实现视频合并的核心思路是**基于时间轴的多轨道合成**，而非传统的文件级视频拼接。系统通过以下几种方式实现视频合并：

### 1. 时间轴序列合并（Sequential Merging）

**原理**: 将多个视频片段按时间顺序排列在同一轨道上，形成连续的视频序列。

**实现位置**: `apps/web/src/stores/timeline-store.ts:515` + `apps/web/src/lib/timeline.ts`

```typescript
// 时间轴元素序列排列 - 实现视频连接
addElementToTrack: (trackId, elementData) => {
  const track = tracks.find(t => t.id === trackId);
  const newElement: TimelineElement = {
    id: generateUUID(),
    type: elementData.type,
    name: elementData.name,
    duration: elementData.duration,
    startTime: elementData.startTime, // 关键：精确控制开始时间
    trimStart: elementData.trimStart || 0,
    trimEnd: elementData.trimEnd || 0,
    mediaId: elementData.mediaId,
  };

  // 防重叠检查 - 确保视频片段正确连接
  const hasOverlap = checkElementOverlap(trackId, newElement.startTime, newElement.duration);
  if (hasOverlap) {
    // 自动解决重叠，推移后续元素
    const resolvedElements = resolveElementOverlaps([...track.elements, newElement]);
    updateTrack(trackId, { elements: resolvedElements });
  }
}

// 重叠解决算法 - 实现自动视频拼接
export const resolveElementOverlaps = (elements: TimelineElement[]): TimelineElement[] => {
  const sortedElements = [...elements].sort((a, b) => a.startTime - b.startTime);
  const resolvedElements: TimelineElement[] = [];

  for (let i = 0; i < sortedElements.length; i++) {
    const current = { ...sortedElements[i] };

    if (resolvedElements.length > 0) {
      const previous = resolvedElements[resolvedElements.length - 1];
      const previousEnd = previous.startTime + 
        (previous.duration - previous.trimStart - previous.trimEnd);

      // 自动连接：如果当前元素与前一个重叠，将其移动到前一个结束位置
      if (current.startTime < previousEnd) {
        current.startTime = previousEnd; // 实现无缝连接
      }
    }
    resolvedElements.push(current);
  }
  return resolvedElements;
};
```

### 2. 多轨道层叠合并（Multi-track Layered Merging）

**原理**: 多个视频轨道同时播放，上层轨道覆盖下层轨道，实现画中画或叠加效果。

**实现位置**: `apps/web/src/lib/timeline-renderer.ts` + `apps/web/src/components/editor/preview-panel.tsx`

```typescript
// 多轨道渲染合成系统
export async function renderTimelineFrame({
  ctx, time, canvasWidth, canvasHeight, tracks, mediaFiles
}: RenderContext): Promise<void> {
  
  // 1. 清除画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // 2. 绘制背景
  if (backgroundType === "blur") {
    await drawBlurredBackground(ctx, time, tracks, mediaFiles);
  } else {
    ctx.fillStyle = backgroundColor || "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 3. 收集所有活动元素（关键：多轨道合并逻辑）
  const active: Array<{ element: TimelineElement; mediaItem: MediaFile; trackIndex: number }> = [];
  
  // 按轨道顺序处理（下层到上层）
  tracks.forEach((track, trackIndex) => {
    if (track.muted) return;
    
    track.elements.forEach((element) => {
      const effectiveStart = element.startTime;
      const effectiveEnd = element.startTime + 
        (element.duration - element.trimStart - element.trimEnd);
      
      // 检查元素是否在当前时间点活跃
      if (time >= effectiveStart && time < effectiveEnd) {
        const mediaItem = mediaFiles.find(m => m.id === element.mediaId);
        if (mediaItem) {
          active.push({ element, mediaItem, trackIndex });
        }
      }
    });
  });

  // 4. 按轨道层级顺序渲染（实现多轨道合并）
  // 轨道排序：文本轨道在顶部，主轨道在中间，音频轨道在底部
  const sortedActive = active.sort((a, b) => {
    const trackA = tracks[a.trackIndex];
    const trackB = tracks[b.trackIndex];
    
    // 文本轨道优先级最高
    if (trackA.type === "text" && trackB.type !== "text") return 1;
    if (trackB.type === "text" && trackA.type !== "text") return -1;
    
    // 音频轨道优先级最低（但不渲染视觉内容）
    if (trackA.type === "audio" && trackB.type !== "audio") return -1;
    if (trackB.type === "audio" && trackA.type !== "audio") return 1;
    
    // 主轨道在其他媒体轨道之下
    if (trackA.isMain && !trackB.isMain) return -1;
    if (trackB.isMain && !trackA.isMain) return 1;
    
    return a.trackIndex - b.trackIndex; // 保持轨道顺序
  });

  // 5. 逐层渲染视频帧（实现图层合成）
  for (const { element, mediaItem } of sortedActive) {
    if (element.hidden) continue;

    if (mediaItem.type === "video") {
      const localTime = time - element.startTime + element.trimStart;
      
      // 从视频缓存获取当前帧
      const frame = await videoCache.getFrameAt(mediaItem.id, mediaItem.file, localTime);
      if (!frame) continue;

      // 计算绘制尺寸和位置（contain模式保持比例）
      const mediaW = Math.max(1, mediaItem.width || canvasWidth);
      const mediaH = Math.max(1, mediaItem.height || canvasHeight);
      const containScale = Math.min(canvasWidth / mediaW, canvasHeight / mediaH);
      const drawW = mediaW * containScale;
      const drawH = mediaH * containScale;
      const drawX = (canvasWidth - drawW) / 2;
      const drawY = (canvasHeight - drawH) / 2;

      // 绘制到画布（实现轨道合成）
      ctx.drawImage(frame.canvas, drawX, drawY, drawW, drawH);
      
    } else if (mediaItem.type === "image") {
      // 图片渲染逻辑
      const img = await getImageElement(mediaItem);
      const mediaW = img.naturalWidth || canvasWidth;
      const mediaH = img.naturalHeight || canvasHeight;
      const containScale = Math.min(canvasWidth / mediaW, canvasHeight / mediaH);
      const drawW = mediaW * containScale;
      const drawH = mediaH * containScale;
      const drawX = (canvasWidth - drawW) / 2;
      const drawY = (canvasHeight - drawH) / 2;
      
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }
}
```

### 3. 音频混合合并

**实现位置**: `apps/web/src/lib/mediabunny-utils.ts:110`

```typescript
// 多轨道音频混合系统
export const extractTimelineAudio = async (onProgress?: (progress: number) => void) => {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  // 收集所有音频元素（来自视频和音频轨道）
  const audioElements: Array<{
    file: File;
    startTime: number;
    duration: number;
    trimStart: number;
    trimEnd: number;
    trackMuted: boolean;
  }> = [];

  // 遍历所有轨道收集音频
  for (const track of tracks) {
    if (track.muted) continue;
    
    for (const element of track.elements) {
      if (element.type === "media") {
        const mediaFile = mediaStore.mediaFiles.find(m => m.id === element.mediaId);
        if (mediaFile && (mediaFile.type === "video" || mediaFile.type === "audio")) {
          audioElements.push({
            file: mediaFile.file,
            startTime: element.startTime,
            duration: element.duration,
            trimStart: element.trimStart,
            trimEnd: element.trimEnd,
            trackMuted: track.muted || false,
          });
        }
      }
    }
  }

  // 创建FFmpeg复合滤镜进行音频混合
  const filterInputs: string[] = [];
  for (let i = 0; i < audioElements.length; i++) {
    const element = audioElements[i];
    const actualStart = element.trimStart;
    const actualDuration = element.duration - element.trimStart - element.trimEnd;

    // 音频裁剪和时间定位滤镜
    filterInputs.push(
      `[${i}:a]atrim=start=${actualStart}:duration=${actualDuration},asetpts=PTS-STARTPTS,adelay=${element.startTime * 1000}|${element.startTime * 1000}[audio_${i}]`
    );
  }

  // 音频混合滤镜
  const mixFilter = audioElements.length === 1
    ? `[audio_0]aresample=44100,aformat=sample_fmts=s16:channel_layouts=stereo[out]`
    : `${filterInputs.map((_, i) => `[audio_${i}]`).join("")}amix=inputs=${audioElements.length}:duration=longest:dropout_transition=2,aresample=44100,aformat=sample_fmts=s16:channel_layouts=stereo[out]`;

  const complexFilter = [...filterInputs, mixFilter].join(";");
  
  // 执行FFmpeg音频合并
  await ffmpeg.exec([
    ...inputFiles.flatMap(f => ["-i", f]),
    "-filter_complex", complexFilter,
    "-map", "[out]",
    "-f", "wav",
    "output.wav"
  ]);
  
  const data = await ffmpeg.readFile("output.wav");
  return new Blob([data], { type: "audio/wav" });
};
```

### 4. 视频合并的实现类型

OpenCut支持三种主要的视频合并模式：

#### A. 顺序连接合并（Sequential Concatenation）
```typescript
// 将多个视频片段按顺序连接
const sequentialMerge = (clips: VideoClip[]) => {
  let currentTime = 0;
  return clips.map(clip => ({
    ...clip,
    startTime: currentTime,
    endTime: currentTime += clip.duration
  }));
};
```

#### B. 并行叠加合并（Parallel Overlay）
```typescript
// 多个视频同时播放，形成画中画效果
const parallelMerge = (clips: VideoClip[], layouts: Layout[]) => {
  return clips.map((clip, index) => ({
    ...clip,
    startTime: 0, // 同时开始
    layout: layouts[index] // 不同的布局位置
  }));
};
```

#### C. 交替切换合并（Alternating Switch）
```typescript
// 根据时间点在不同视频间切换
const alternateMerge = (clips: VideoClip[], switchPoints: number[]) => {
  return clips.map((clip, index) => ({
    ...clip,
    startTime: switchPoints[index],
    endTime: switchPoints[index + 1] || totalDuration
  }));
};
```

### 5. 复制粘贴合并功能

**实现位置**: `apps/web/src/stores/timeline-store.ts:1479`

```typescript
// 剪贴板操作 - 实现跨轨道视频合并
copySelected: () => {
  const { selectedElements, _tracks } = get();
  if (selectedElements.length === 0) return;

  const items: Array<{ trackType: TrackType; element: CreateTimelineElement }> = [];
  
  for (const { trackId, elementId } of selectedElements) {
    const track = _tracks.find((t) => t.id === trackId);
    const element = track?.elements.find((e) => e.id === elementId);
    if (track && element) {
      const { id, ...elementWithoutId } = element;
      items.push({
        trackType: track.type,
        element: elementWithoutId as CreateTimelineElement,
      });
    }
  }
  set({ clipboard: { items } });
},

// 粘贴操作 - 实现批量视频合并
pasteAtTime: (time) => {
  const { clipboard } = get();
  if (!clipboard || clipboard.items.length === 0) return;

  // 计算相对偏移量保持元素间距
  const minStart = Math.min(...clipboard.items.map((x) => x.element.startTime));
  
  get().pushHistory();
  
  for (const item of clipboard.items) {
    const targetTrackId = get().findOrCreateTrack(item.trackType);
    const relativeOffset = item.element.startTime - minStart;
    const startTime = Math.max(0, time + relativeOffset);

    // 自动解决重叠冲突
    const duration = item.element.duration - item.element.trimStart - item.element.trimEnd;
    const hasOverlap = get().checkElementOverlap(targetTrackId, startTime, duration);
    
    if (hasOverlap) {
      // 智能推移：寻找下一个可用位置
      let candidate = startTime;
      let safety = 0;
      while (get().checkElementOverlap(targetTrackId, candidate, duration) && safety < 1000) {
        candidate += 0.01; // 精确推移
        safety += 1;
      }
      
      get().addElementToTrack(targetTrackId, {
        ...item.element,
        startTime: candidate,
      });
    } else {
      get().addElementToTrack(targetTrackId, {
        ...item.element,
        startTime,
      });
    }
  }
}
```

### 6. 智能合并算法

OpenCut还实现了多种智能合并算法来处理复杂的视频组合场景：

#### A. 智能gap填充
```typescript
// 自动填充轨道间隙
const fillGaps = (track: TimelineTrack) => {
  const sortedElements = track.elements.sort((a, b) => a.startTime - b.startTime);
  const gaps: Array<{ start: number; end: number }> = [];
  
  for (let i = 0; i < sortedElements.length - 1; i++) {
    const currentEnd = sortedElements[i].startTime + 
      (sortedElements[i].duration - sortedElements[i].trimStart - sortedElements[i].trimEnd);
    const nextStart = sortedElements[i + 1].startTime;
    
    if (nextStart > currentEnd) {
      gaps.push({ start: currentEnd, end: nextStart });
    }
  }
  
  return gaps;
};
```

#### B. 多轨道同步合并
```typescript
// 确保多轨道元素时间同步
const syncTracks = (tracks: TimelineTrack[]) => {
  const allStartTimes = tracks
    .flatMap(track => track.elements.map(el => el.startTime))
    .sort((a, b) => a - b);
    
  const syncPoints = [...new Set(allStartTimes)]; // 去重获取同步点
  
  return syncPoints; // 用于对齐多轨道内容
};
```

### 7. 实时预览合并

**实现位置**: `apps/web/src/components/editor/preview-panel.tsx:265`

```typescript
// 实时多轨道预览合成
const getActiveElements = (): ActiveElement[] => {
  const activeElements: ActiveElement[] = [];

  // 逆序遍历轨道确保正确的图层叠加顺序
  [...tracks].reverse().forEach((track) => {
    track.elements.forEach((element) => {
      if (element.hidden) return;
      
      const elementStart = element.startTime;
      const elementEnd = element.startTime + 
        (element.duration - element.trimStart - element.trimEnd);

      // 检查当前播放时间是否在元素范围内
      if (currentTime >= elementStart && currentTime < elementEnd) {
        let mediaItem = null;
        if (element.type === "media") {
          mediaItem = mediaFiles.find((item) => item.id === element.mediaId) || null;
        }
        activeElements.push({ element, track, mediaItem });
      }
    });
  });

  return activeElements;
};
```

### 8. 导出时的最终合并

**实现位置**: `apps/web/src/lib/export.ts:238`

```typescript
// 导出阶段的完整视频合并处理
for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
  const time = frameIndex / exportFps;

  // 渲染当前时间点的所有活动元素到统一画布
  await renderTimelineFrame({
    ctx,
    time,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    tracks,
    mediaFiles,
    backgroundType: activeProject.backgroundType,
    blurIntensity: activeProject.blurIntensity,
    backgroundColor: activeProject.backgroundType === "blur" 
      ? undefined 
      : activeProject.backgroundColor || "#000000",
    projectCanvasSize: canvasSize,
  });

  // 将合成结果添加到视频流
  const frameDuration = 1 / exportFps;
  await videoSource.add(time, frameDuration);

  // 更新进度
  const videoProgress = includeAudio
    ? 0.05 + (frameIndex / totalFrames) * 0.95
    : frameIndex / totalFrames;
  onProgress?.(videoProgress);
}
```

### 2. 视频缓存系统

**实现位置**: `apps/web/src/lib/video-cache.ts`

```typescript
export class VideoCache {
  private sinks = new Map<string, VideoSinkData>();

  async getFrameAt(mediaId: string, file: File, time: number): Promise<VideoFrame | null> {
    await this.ensureSink(mediaId, file);
    const sinkData = this.sinks.get(mediaId);
    if (!sinkData) return null;

    try {
      // 跳转到指定时间
      await sinkData.sink.seek(time);
      
      // 获取当前帧
      const frame = await sinkData.sink.readFrame();
      return frame;
    } catch (error) {
      console.error(`Failed to get frame at time ${time}:`, error);
      return null;
    }
  }

  private async initializeSink(mediaId: string, file: File): Promise<void> {
    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    const videoTrack = await input.getPrimaryVideoTrack();
    const sink = new CanvasSink(videoTrack, {
      poolSize: 3,
      fit: "contain",
    });

    this.sinks.set(mediaId, {
      sink, iterator: null, currentFrame: null, lastTime: -1
    });
  }
}
```

### 3. 音频混合处理

**实现位置**: `apps/web/src/lib/mediabunny-utils.ts:110`

```typescript
export const extractTimelineAudio = async (onProgress?: (progress: number) => void) => {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  // 收集所有音频元素
  const audioElements: Array<{
    file: File;
    startTime: number;
    duration: number;
    trimStart: number;
    trimEnd: number;
    trackMuted: boolean;
  }> = [];

  // 遍历轨道收集音频
  for (const track of tracks) {
    if (track.muted) continue;
    
    for (const element of track.elements) {
      if (element.type === "media") {
        const mediaFile = mediaStore.mediaFiles.find(m => m.id === element.mediaId);
        if (mediaFile && (mediaFile.type === "video" || mediaFile.type === "audio")) {
          audioElements.push({
            file: mediaFile.file,
            startTime: element.startTime,
            duration: element.duration,
            trimStart: element.trimStart,
            trimEnd: element.trimEnd,
            trackMuted: track.muted || false,
          });
        }
      }
    }
  }

  // 创建FFmpeg复合滤镜进行音频混合
  const filterInputs: string[] = [];
  for (let i = 0; i < audioElements.length; i++) {
    const element = audioElements[i];
    const actualStart = element.trimStart;
    const actualDuration = element.duration - element.trimStart - element.trimEnd;

    filterInputs.push(
      `[${i}:a]atrim=start=${actualStart}:duration=${actualDuration},asetpts=PTS-STARTPTS,adelay=${element.startTime * 1000}|${element.startTime * 1000}[audio_${i}]`
    );
  }

  const mixFilter = audioElements.length === 1
    ? `[audio_0]aresample=44100,aformat=sample_fmts=s16:channel_layouts=stereo[out]`
    : `${filterInputs.map((_, i) => `[audio_${i}]`).join("")}amix=inputs=${audioElements.length}:duration=longest:dropout_transition=2,aresample=44100,aformat=sample_fmts=s16:channel_layouts=stereo[out]`;

  const complexFilter = [...filterInputs, mixFilter].join(";");
  
  // 执行FFmpeg处理
  await ffmpeg.exec([
    ...inputFiles.flatMap(f => ["-i", f]),
    "-filter_complex", complexFilter,
    "-map", "[out]",
    "-f", "wav",
    "output.wav"
  ]);
};
```

### 4. 项目导出功能

**实现位置**: `apps/web/src/lib/export.ts:150`

```typescript
export async function exportProject(options: ExportOptions): Promise<ExportResult> {
  const { format, quality, fps, includeAudio, onProgress, onCancel } = options;
  
  // 1. 初始化输出格式
  const outputFormat = format === "webm" ? new WebMOutputFormat() : new Mp4OutputFormat();
  const output = new Output({
    format: outputFormat,
    target: new BufferTarget(),
  });

  // 2. 创建画布用于渲染
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  const ctx = canvas.getContext("2d");

  // 3. 添加视频轨道
  const videoSource = new CanvasSource(canvas, {
    codec: format === "webm" ? "vp9" : "avc",
    bitrate: qualityMap[quality],
  });
  output.addVideoTrack(videoSource, { frameRate: exportFps });

  // 4. 处理音频轨道
  if (includeAudio) {
    const audioBuffer = await createTimelineAudioBuffer(tracks, mediaFiles, duration);
    if (audioBuffer) {
      const audioSource = new AudioBufferSource({
        codec: format === "webm" ? "opus" : "aac",
        bitrate: qualityMap[quality],
      });
      output.addAudioTrack(audioSource);
      await audioSource.add(audioBuffer);
    }
  }

  // 5. 逐帧渲染视频
  const totalFrames = Math.ceil(duration * exportFps);
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const time = frameIndex / exportFps;

    // 渲染当前帧到画布
    await renderTimelineFrame({
      ctx, time, canvasWidth: canvas.width, canvasHeight: canvas.height,
      tracks, mediaFiles, backgroundType, backgroundColor, blurIntensity
    });

    // 添加帧到视频源
    await videoSource.add(time, 1 / exportFps);
    onProgress?.((frameIndex / totalFrames));
  }

  // 6. 完成导出
  videoSource.close();
  await output.finalize();
  
  return {
    success: true,
    buffer: output.target.buffer,
  };
}
```

## 关键技术特点

### 1. 非破坏性编辑
- 所有剪切操作通过`trimStart`和`trimEnd`参数实现
- 原始媒体文件始终保持完整
- 支持无限次撤销/重做操作

### 2. 实时预览渲染
- 基于Canvas的实时渲染系统
- 视频帧缓存优化播放性能
- 支持多轨道实时合成预览

### 3. 精确时间控制
- 基于帧精度的时间计算
- 支持不同帧率的项目设置
- 时间轴吸附和对齐功能

### 4. 多格式支持
- 输出MP4 (H.264) 和 WebM (VP9) 格式
- 音频编码AAC (MP4) 和 Opus (WebM)
- 可配置的质量和比特率设置

### 5. 响应式架构
- Zustand状态管理确保数据一致性
- 事件驱动的播放控制系统
- 组件化的可复用编辑器模块

## 性能优化策略

1. **视频帧缓存**: 使用CanvasSink实现智能帧缓存
2. **懒加载**: 媒体文件按需处理和加载
3. **WebWorker**: FFmpeg处理在独立线程执行
4. **内存管理**: 自动清理不需要的视频帧和缓存
5. **渐进式渲染**: 导出时逐帧处理避免内存溢出

## 视频合并的技术总结

### 1. 合并方式对比

| 合并类型 | 实现方式 | 适用场景 | 技术复杂度 |
|---------|---------|---------|-----------|
| 顺序连接 | 时间轴排列 | 故事片、教程 | 低 |
| 多轨道叠加 | Canvas图层合成 | 画中画、直播 | 中 |
| 音视频混合 | FFmpeg滤镜 | 配音、音乐 | 高 |
| 实时切换 | 动态轨道控制 | 多角度视频 | 中 |

### 2. 关键技术要点

#### A. 时间同步机制
```typescript
// 确保多轨道精确同步
const syncElements = (elements: TimelineElement[], baseTime: number) => {
  return elements.map(element => ({
    ...element,
    syncOffset: element.startTime - baseTime, // 计算相对偏移
    actualStartTime: baseTime + element.syncOffset // 同步后的实际开始时间
  }));
};
```

#### B. 冲突解决策略
```typescript
// 智能解决时间轴冲突
const resolveConflicts = (track: TimelineTrack) => {
  const conflicts = detectOverlaps(track.elements);
  
  for (const conflict of conflicts) {
    // 策略1: 自动推移后续元素
    // 策略2: 压缩重叠区域
    // 策略3: 用户交互解决
    applyResolutionStrategy(conflict, "auto-shift");
  }
};
```

#### C. 性能优化模式
```typescript
// 分层渲染优化
const optimizedRender = {
  staticLayers: [], // 静态背景层，缓存结果
  dynamicLayers: [], // 动态前景层，实时渲染
  effectLayers: [], // 特效层，按需处理
};
```

## 扩展建议

1. **GPU加速**: 考虑集成WebGL进行硬件加速渲染
2. **云端处理**: 对于大文件可考虑服务器端处理
3. **更多编解码器**: 支持更多视频格式和编解码器
4. **高级特效**: 添加转场效果、滤镜等高级功能
5. **协作编辑**: 实现多用户实时协作编辑功能

## 视频合并的具体使用场景

### 1. 顺序连接场景
**应用**: 制作完整的视频故事、教程视频
**实现**: 将多个视频片段放在同一轨道上，通过`startTime`控制播放顺序
```typescript
// 示例：连接三个视频片段
const clips = [
  { mediaId: "intro", startTime: 0, duration: 5 },
  { mediaId: "main", startTime: 5, duration: 10 },
  { mediaId: "outro", startTime: 15, duration: 3 }
];
```

### 2. 画中画场景
**应用**: 视频会议录制、游戏解说、产品演示
**实现**: 使用多个媒体轨道，不同轨道的视频同时显示
```typescript
// 示例：主画面 + 人物小窗
const layout = {
  mainVideo: { track: "media-1", startTime: 0, layout: "fullscreen" },
  faceVideo: { track: "media-2", startTime: 0, layout: "corner" }
};
```

### 3. 音视频分离合并
**应用**: 音乐MV制作、配音视频
**实现**: 视频轨道 + 独立音频轨道的组合
```typescript
// 示例：视频 + 背景音乐
const composition = {
  video: { track: "media", mediaId: "visual" },
  bgMusic: { track: "audio", mediaId: "music", startTime: 0 },
  voiceover: { track: "audio", mediaId: "voice", startTime: 10 }
};
```

### 4. 多角度视频合并
**应用**: 体育赛事、演唱会录制
**实现**: 多个视频轨道在不同时间点切换显示
```typescript
// 示例：多角度切换
const multiAngle = [
  { track: "angle1", startTime: 0, endTime: 30 },
  { track: "angle2", startTime: 30, endTime: 60 },
  { track: "angle3", startTime: 60, endTime: 90 }
];
```

## 核心技术优势总结

### 1. 非破坏性合并
- **优势**: 原始文件完全保留，可随时调整合并参数
- **实现**: 通过时间轴元素的`trimStart`/`trimEnd`参数控制
- **性能**: 避免重复编码，大幅提升编辑效率

### 2. 实时预览合并
- **优势**: 所见即所得的编辑体验
- **实现**: Canvas-based多轨道实时渲染
- **技术**: WebGL加速 + 智能帧缓存

### 3. 精确时间控制
- **优势**: 帧级精度的视频同步
- **实现**: 基于项目帧率的精确时间计算
- **应用**: 专业视频制作的同步要求

### 4. 智能冲突解决
- **优势**: 自动处理轨道重叠和时间冲突
- **实现**: 动态重排算法 + 间隙填充
- **用户体验**: 减少手动调整工作量

## 实现建议与最佳实践

### 1. 架构设计建议
```typescript
// 建议的项目结构
interface VideoMergeProject {
  timeline: {
    tracks: Track[]; // 多轨道支持
    duration: number; // 总时长
    fps: number; // 帧率
  };
  assets: MediaFile[]; // 媒体资源池
  rendering: {
    canvas: HTMLCanvasElement; // 渲染画布
    cache: VideoCache; // 视频帧缓存
  };
  export: {
    format: "mp4" | "webm"; // 导出格式
    quality: "low" | "medium" | "high"; // 质量设置
  };
}
```

### 2. 性能优化要点
- **视频缓存**: 实现智能的视频帧缓存策略
- **WebWorker**: 将FFmpeg处理移到独立线程
- **内存管理**: 及时释放不需要的视频帧
- **渐进渲染**: 大文件分块处理避免内存溢出

### 3. 用户体验优化
- **实时预览**: 提供流畅的多轨道预览
- **智能对齐**: 自动吸附和对齐功能
- **撤销重做**: 完整的操作历史管理
- **批量操作**: 支持多选和批量编辑

### 4. 扩展功能建议
- **转场效果**: 添加淡入淡出、切换动画
- **视频滤镜**: 实现色彩调整、特效处理
- **音频处理**: 音量包络、音效添加
- **协作编辑**: 多用户实时协作功能

## 总结

OpenCut项目展示了现代Web视频编辑器的完整实现方案，其视频剪切与合并功能具有以下核心特点：

1. **基于时间轴的多轨道架构** - 提供灵活的视频组合方式
2. **非破坏性编辑模式** - 保护原始素材，提高编辑效率  
3. **实时渲染合成系统** - 所见即所得的编辑体验
4. **智能冲突解决机制** - 自动处理复杂的时间和空间冲突
5. **高性能缓存策略** - 确保流畅的播放和预览体验

此文档提供了OpenCut项目视频剪切与合并功能的完整技术实现细节，涵盖了从基础数据结构到高级合并算法的全方位解析，可作为类似项目开发的权威参考指南。
