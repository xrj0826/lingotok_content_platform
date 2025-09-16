/**
 * 时间轴状态管理 - 基于OpenCut架构
 * 实现非破坏性编辑和多轨道管理
 */

import { ref, reactive, computed } from 'vue';
import type {
  TimelineTrack,
  TimelineElement,
  MediaFile,
  CreateTimelineElement,
  ProjectSettings,
  TrackType
} from '@/types/timeline';

// 生成UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 获取元素名称后缀
function getElementNameWithSuffix(name: string, suffix: string): string {
  return `${name} (${suffix})`;
}

// 检查元素重叠
function checkElementOverlap(track: TimelineTrack, startTime: number, duration: number): boolean {
  const endTime = startTime + duration;

  return track.elements.some(element => {
    const elementStart = element.startTime;
    const elementEnd = element.startTime + (element.duration - element.trimStart - element.trimEnd);

    return (startTime < elementEnd && endTime > elementStart);
  });
}

// 解决元素重叠
function resolveElementOverlaps(elements: TimelineElement[]): TimelineElement[] {
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
}

/**
 * 时间轴状态管理
 */
export function createTimelineStore() {
  // 状态
  const tracks = ref<TimelineTrack[]>([]);
  const mediaFiles = ref<MediaFile[]>([]);
  const selectedElements = ref<Array<{ trackId: string; elementId: string }>>([]);
  const currentTime = ref(0);
  const clipboard = ref<{ items: Array<{ trackType: TrackType; element: CreateTimelineElement }> } | null>(null);
  const history = ref<{ tracks: TimelineTrack[]; mediaFiles: MediaFile[] }[]>([]);
  const historyIndex = ref(-1);

  // 项目设置
  const projectSettings = reactive<ProjectSettings>({
    name: 'New Project',
    canvasSize: { width: 1920, height: 1080 },
    fps: 30,
    duration: 0,
    backgroundType: 'color',
    backgroundColor: '#000000'
  });

  // 计算属性
  const totalDuration = computed(() => {
    let maxDuration = 0;
    tracks.value.forEach(track => {
      track.elements.forEach(element => {
        const elementEnd = element.startTime +
          (element.duration - element.trimStart - element.trimEnd);
        maxDuration = Math.max(maxDuration, elementEnd);
      });
    });
    return maxDuration;
  });

  // 历史记录管理
  const pushHistory = () => {
    // 移除后续历史
    history.value = history.value.slice(0, historyIndex.value + 1);

    // 添加当前状态
    history.value.push({
      tracks: JSON.parse(JSON.stringify(tracks.value)),
      mediaFiles: JSON.parse(JSON.stringify(mediaFiles.value))
    });

    historyIndex.value = history.value.length - 1;

    // 限制历史记录数量
    if (history.value.length > 50) {
      history.value = history.value.slice(-50);
      historyIndex.value = history.value.length - 1;
    }
  };

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const state = history.value[historyIndex.value];
      tracks.value = JSON.parse(JSON.stringify(state.tracks));
      mediaFiles.value = JSON.parse(JSON.stringify(state.mediaFiles));
    }
  };

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      const state = history.value[historyIndex.value];
      tracks.value = JSON.parse(JSON.stringify(state.tracks));
      mediaFiles.value = JSON.parse(JSON.stringify(state.mediaFiles));
    }
  };

  // 媒体文件管理
  const addMediaFile = (file: MediaFile) => {
    const existingFile = mediaFiles.value.find(f => f.id === file.id);
    if (!existingFile) {
      mediaFiles.value.push(file);
    }
  };

  const removeMediaFile = (mediaId: string) => {
    // 移除所有使用该媒体的元素
    tracks.value.forEach(track => {
      track.elements = track.elements.filter(element => element.mediaId !== mediaId);
    });

    // 移除媒体文件
    mediaFiles.value = mediaFiles.value.filter(f => f.id !== mediaId);
  };

  // 轨道管理
  const addTrack = (type: TrackType, name?: string): string => {
    const trackId = generateUUID();
    const track: TimelineTrack = {
      id: trackId,
      name: name || `${type === 'media' ? 'Video' : type === 'audio' ? 'Audio' : 'Text'} Track ${tracks.value.length + 1}`,
      type,
      elements: [],
      muted: false,
      isMain: tracks.value.length === 0 && type === 'media' // 第一个媒体轨道为主轨道
    };

    tracks.value.push(track);
    return trackId;
  };

  const removeTrack = (trackId: string) => {
    tracks.value = tracks.value.filter(t => t.id !== trackId);
  };

  const updateTrack = (trackId: string, updates: Partial<TimelineTrack>) => {
    const track = tracks.value.find(t => t.id === trackId);
    if (track) {
      Object.assign(track, updates);
    }
  };

  // 查找或创建轨道
  const findOrCreateTrack = (type: TrackType): string => {
    let track = tracks.value.find(t => t.type === type);
    if (!track) {
      return addTrack(type);
    }
    return track.id;
  };

  // 元素管理
  const addElementToTrack = (trackId: string, elementData: CreateTimelineElement): string => {
    const track = tracks.value.find(t => t.id === trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }

    const elementId = generateUUID();
    const newElement: TimelineElement = {
      id: elementId,
      type: elementData.type,
      name: elementData.name,
      duration: elementData.duration,
      startTime: elementData.startTime,
      trimStart: elementData.trimStart || 0,
      trimEnd: elementData.trimEnd || 0,
      mediaId: elementData.mediaId,
      muted: elementData.muted || false
    };

    // 检查重叠并解决
    const duration = newElement.duration - newElement.trimStart - newElement.trimEnd;
    const hasOverlap = checkElementOverlap(track, newElement.startTime, duration);

    if (hasOverlap) {
      // 自动解决重叠
      const resolvedElements = resolveElementOverlaps([...track.elements, newElement]);
      track.elements = resolvedElements;
    } else {
      track.elements.push(newElement);
    }

    return elementId;
  };

  const removeElement = (trackId: string, elementId: string) => {
    const track = tracks.value.find(t => t.id === trackId);
    if (track) {
      track.elements = track.elements.filter(e => e.id !== elementId);
    }
  };

  const updateElement = (trackId: string, elementId: string, updates: Partial<TimelineElement>) => {
    const track = tracks.value.find(t => t.id === trackId);
    if (track) {
      const element = track.elements.find(e => e.id === elementId);
      if (element) {
        Object.assign(element, updates);
      }
    }
  };

  // 剪切功能
  const splitSelected = (splitTime: number, trackId?: string, elementId?: string) => {
    pushHistory();

    const elementsToProcess = trackId && elementId
      ? [{ trackId, elementId }]
      : selectedElements.value.length > 0
        ? selectedElements.value
        : [];

    const elementsToSplit: Array<{ trackId: string; elementId: string; element: TimelineElement }> = [];

    // 验证分割点是否在元素范围内
    for (const { trackId: tId, elementId: eId } of elementsToProcess) {
      const track = tracks.value.find(t => t.id === tId);
      const element = track?.elements.find(e => e.id === eId);

      if (track && element) {
        const effectiveStart = element.startTime;
        const effectiveEnd = element.startTime +
          (element.duration - element.trimStart - element.trimEnd);

        if (splitTime > effectiveStart && splitTime < effectiveEnd) {
          elementsToSplit.push({ trackId: tId, elementId: eId, element });
        }
      }
    }

    // 执行分割操作
    elementsToSplit.forEach(({ trackId: tId, elementId: eId, element }) => {
      const track = tracks.value.find(t => t.id === tId);
      if (!track) return;

      const relativeTime = splitTime - element.startTime;
      const firstDuration = relativeTime;
      const secondDuration = element.duration - element.trimStart - element.trimEnd - relativeTime;

      // 更新原元素（左侧部分）
      element.trimEnd = element.trimEnd + secondDuration;
      element.name = getElementNameWithSuffix(element.name, "left");

      // 创建新元素（右侧部分）
      const rightElement: TimelineElement = {
        ...element,
        id: generateUUID(),
        startTime: splitTime,
        trimStart: element.trimStart + firstDuration,
        trimEnd: element.trimEnd - secondDuration,
        name: getElementNameWithSuffix(element.name.replace(" (left)", ""), "right"),
      };

      track.elements.push(rightElement);
    });
  };

  const splitAndKeepLeft = (trackId: string, elementId: string, splitTime: number) => {
    pushHistory();

    const track = tracks.value.find(t => t.id === trackId);
    const element = track?.elements.find(e => e.id === elementId);

    if (track && element) {
      const relativeTime = splitTime - element.startTime;
      const durationToRemove = element.duration - element.trimStart - element.trimEnd - relativeTime;

      // 只保留左侧部分，增加trimEnd裁剪右侧
      element.trimEnd = element.trimEnd + durationToRemove;
      element.name = getElementNameWithSuffix(element.name, "left");
    }
  };

  const splitAndKeepRight = (trackId: string, elementId: string, splitTime: number) => {
    pushHistory();

    const track = tracks.value.find(t => t.id === trackId);
    const element = track?.elements.find(e => e.id === elementId);

    if (track && element) {
      const relativeTime = splitTime - element.startTime;

      // 只保留右侧部分，调整startTime和trimStart
      element.startTime = splitTime;
      element.trimStart = element.trimStart + relativeTime;
      element.name = getElementNameWithSuffix(element.name, "right");
    }
  };

  // 音频分离
  const separateAudio = (trackId: string, elementId: string) => {
    pushHistory();

    const track = tracks.value.find(t => t.id === trackId);
    const element = track?.elements.find(e => e.id === elementId);

    if (!element || track?.type !== "media") return null;

    // 创建音频轨道元素
    const audioElement: TimelineElement = {
      ...element,
      id: generateUUID(),
      name: getElementNameWithSuffix(element.name, "audio"),
    };

    // 查找或创建音频轨道
    const audioTrackId = findOrCreateTrack("audio");
    const audioTrack = tracks.value.find(t => t.id === audioTrackId);

    if (audioTrack) {
      audioTrack.elements.push(audioElement);
    }

    return audioElement.id;
  };

  // 剪贴板操作
  const copySelected = () => {
    if (selectedElements.value.length === 0) return;

    const items: Array<{ trackType: TrackType; element: CreateTimelineElement }> = [];

    for (const { trackId, elementId } of selectedElements.value) {
      const track = tracks.value.find(t => t.id === trackId);
      const element = track?.elements.find(e => e.id === elementId);
      if (track && element) {
        const { id, ...elementWithoutId } = element;
        items.push({
          trackType: track.type,
          element: elementWithoutId as CreateTimelineElement,
        });
      }
    }
    clipboard.value = { items };
  };

  const pasteAtTime = (time: number) => {
    if (!clipboard.value || clipboard.value.items.length === 0) return;

    // 计算相对偏移量保持元素间距
    const minStart = Math.min(...clipboard.value.items.map(x => x.element.startTime));

    pushHistory();

    for (const item of clipboard.value.items) {
      const targetTrackId = findOrCreateTrack(item.trackType);
      const relativeOffset = item.element.startTime - minStart;
      const startTime = Math.max(0, time + relativeOffset);

      // 自动解决重叠冲突
      const duration = item.element.duration - (item.element.trimStart || 0) - (item.element.trimEnd || 0);
      const track = tracks.value.find(t => t.id === targetTrackId);

      if (track) {
        const hasOverlap = checkElementOverlap(track, startTime, duration);

        if (hasOverlap) {
          // 智能推移：寻找下一个可用位置
          let candidate = startTime;
          let safety = 0;
          while (checkElementOverlap(track, candidate, duration) && safety < 1000) {
            candidate += 0.01; // 精确推移
            safety += 1;
          }

          addElementToTrack(targetTrackId, {
            ...item.element,
            startTime: candidate,
          });
        } else {
          addElementToTrack(targetTrackId, {
            ...item.element,
            startTime,
          });
        }
      }
    }
  };

  // 选择管理
  const selectElement = (trackId: string, elementId: string, addToSelection = false) => {
    if (addToSelection) {
      const existing = selectedElements.value.find(
        s => s.trackId === trackId && s.elementId === elementId
      );
      if (!existing) {
        selectedElements.value.push({ trackId, elementId });
      }
    } else {
      selectedElements.value = [{ trackId, elementId }];
    }
  };

  const clearSelection = () => {
    selectedElements.value = [];
  };

  // 删除选中元素
  const deleteSelected = () => {
    if (selectedElements.value.length === 0) return;

    pushHistory();

    selectedElements.value.forEach(({ trackId, elementId }) => {
      removeElement(trackId, elementId);
    });

    clearSelection();
  };

  return {
    // 状态
    tracks,
    mediaFiles,
    selectedElements,
    currentTime,
    clipboard,
    projectSettings,

    // 计算属性
    totalDuration,

    // 历史记录
    pushHistory,
    undo,
    redo,

    // 媒体文件管理
    addMediaFile,
    removeMediaFile,

    // 轨道管理
    addTrack,
    removeTrack,
    updateTrack,
    findOrCreateTrack,

    // 元素管理
    addElementToTrack,
    removeElement,
    updateElement,

    // 剪切功能
    splitSelected,
    splitAndKeepLeft,
    splitAndKeepRight,
    separateAudio,

    // 剪贴板操作
    copySelected,
    pasteAtTime,

    // 选择管理
    selectElement,
    clearSelection,
    deleteSelected,
  };
}

// 创建全局实例
export const timelineStore = createTimelineStore();
