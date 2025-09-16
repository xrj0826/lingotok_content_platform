<template>
  <div class="timeline-editor">
    <t-card title="时间轴编辑器" :bordered="false">
      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="playback-controls">
          <t-button :icon="isPlaying ? 'pause' : 'play-filled'" @click="togglePlayback" theme="primary">
            {{ isPlaying ? '暂停' : '播放' }}
          </t-button>

          <div class="time-display">
            {{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}
          </div>

          <t-slider v-model="currentTime" :min="0" :max="totalDuration" :step="0.1" class="timeline-scrubber"
            @change="seekTo" />
        </div>

        <div class="editor-controls">
          <t-button @click="addMediaTrack">添加视频轨道</t-button>
          <t-button @click="addAudioTrack">添加音频轨道</t-button>
          <t-button @click="addTextTrack">添加文本轨道</t-button>
          <t-divider direction="vertical" />
          <t-button @click="splitAtTime" :disabled="!hasSelection">分割</t-button>
          <t-button @click="deleteSelected" :disabled="!hasSelection">删除</t-button>
          <t-button @click="copySelected" :disabled="!hasSelection">复制</t-button>
          <t-button @click="pasteAtCurrentTime" :disabled="!hasClipboard">粘贴</t-button>
        </div>
      </div>

      <!-- 轨道区域 -->
      <div class="tracks-container">
        <div v-for="track in tracks" :key="track.id" class="track" :class="{ 'track-muted': track.muted }">
          <div class="track-header">
            <div class="track-info">
              <h4>{{ track.name }}</h4>
              <span class="track-type">{{ getTrackTypeLabel(track.type) }}</span>
            </div>
            <div class="track-controls">
              <t-button size="small" variant="text" :theme="track.muted ? 'default' : 'primary'"
                @click="toggleTrackMute(track.id)">
                {{ track.muted ? '🔇' : '🔊' }}
              </t-button>
              <t-button size="small" variant="text" theme="danger" @click="removeTrack(track.id)">
                ✕
              </t-button>
            </div>
          </div>

          <div class="track-timeline">
            <div v-for="element in track.elements" :key="element.id" class="timeline-element" :class="{
              'element-selected': isElementSelected(track.id, element.id),
              'element-muted': element.muted
            }" :style="getElementStyle(element)" @click="selectElement(track.id, element.id, $event)"
              @contextmenu="showElementContextMenu($event, track.id, element.id)">
              <div class="element-content">
                <div class="element-name">{{ element.name }}</div>
                <div class="element-duration">
                  {{ formatTime(element.duration - element.trimStart - element.trimEnd) }}
                </div>
              </div>

              <!-- 调整手柄 -->
              <div class="resize-handle resize-left" @mousedown="startResize($event, track.id, element.id, 'left')">
              </div>
              <div class="resize-handle resize-right" @mousedown="startResize($event, track.id, element.id, 'right')">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <div class="preview-canvas-container">
          <canvas ref="previewCanvas" class="preview-canvas" :width="previewSize.width"
            :height="previewSize.height"></canvas>
          <div v-if="isRendering" class="rendering-overlay">
            <t-loading size="large" />
            <p>渲染中...</p>
          </div>
        </div>

        <div class="preview-controls">
          <t-form label-width="80px">
            <t-form-item label="输出尺寸">
              <t-select v-model="projectSettings.canvasSize" @change="updatePreview">
                <t-option :value="{ width: 1920, height: 1080 }" label="1080p (1920x1080)" />
                <t-option :value="{ width: 1280, height: 720 }" label="720p (1280x720)" />
                <t-option :value="{ width: 854, height: 480 }" label="480p (854x480)" />
              </t-select>
            </t-form-item>
            <t-form-item label="帧率">
              <t-input-number v-model="projectSettings.fps" :min="24" :max="60" @change="updatePreview" />
            </t-form-item>
            <t-form-item label="背景">
              <t-radio-group v-model="projectSettings.backgroundType" @change="updatePreview">
                <t-radio value="color">纯色</t-radio>
                <t-radio value="blur">模糊</t-radio>
              </t-radio-group>
            </t-form-item>
            <t-form-item v-if="projectSettings.backgroundType === 'color'" label="背景色">
              <input type="color" v-model="projectSettings.backgroundColor" @change="updatePreview" />
            </t-form-item>
          </t-form>

          <t-button theme="primary" block @click="exportVideo">
            导出视频
          </t-button>
        </div>
      </div>
    </t-card>

    <!-- 文件上传对话框 -->
    <t-dialog v-model:visible="showUploadDialog" title="添加媒体文件" width="600px">
      <t-upload v-model="uploadFiles" multiple accept="video/*,audio/*,image/*" :auto-upload="false"
        @change="handleFileUpload" />

      <template #footer>
        <t-button @click="showUploadDialog = false">取消</t-button>
        <t-button theme="primary" @click="addMediaFiles">确定</t-button>
      </template>
    </t-dialog>

    <!-- 导出进度对话框 -->
    <t-dialog v-model:visible="showExportDialog" title="导出视频" :close-btn="false" :close-on-overlay-click="false">
      <div class="export-progress">
        <t-progress :percentage="exportProgress" />
        <p>{{ exportMessage }}</p>
      </div>

      <template #footer>
        <t-button @click="cancelExport" :disabled="!isExporting">取消</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { timelineStore } from '@/utils/timelineStore';
import { renderTimelineFrame } from '@/utils/timelineRenderer';
import { videoCache } from '@/utils/videoCache';
import { exportTimelineProject } from '@/utils/advancedVideoProcessor';
import type { MediaFile } from '@/types/timeline';

// 响应式状态
const {
  tracks,
  mediaFiles,
  selectedElements,
  currentTime,
  clipboard,
  projectSettings,
  totalDuration,

  // 方法
  addTrack,
  removeTrack,
  updateTrack,
  addElementToTrack,
  selectElement,
  clearSelection,
  deleteSelected,
  copySelected,
  pasteAtTime,
  splitSelected,
  addMediaFile,
  pushHistory
} = timelineStore;

// 组件状态
const isPlaying = ref(false);
const isRendering = ref(false);
const playbackTimer = ref<number | null>(null);
const previewCanvas = ref<HTMLCanvasElement>();
const previewSize = reactive({ width: 640, height: 360 });

// 上传相关
const showUploadDialog = ref(false);
const uploadFiles = ref([]);

// 导出相关
const showExportDialog = ref(false);
const isExporting = ref(false);
const exportProgress = ref(0);
const exportMessage = ref('');

// 计算属性
const hasSelection = computed(() => selectedElements.value.length > 0);
const hasClipboard = computed(() => clipboard.value && clipboard.value.items.length > 0);

// 生命周期
onMounted(() => {
  updatePreview();

  // 设置定时器更新预览
  setInterval(() => {
    if (!isPlaying.value) {
      updatePreview();
    }
  }, 100);
});

// 方法
const togglePlayback = () => {
  if (isPlaying.value) {
    stopPlayback();
  } else {
    startPlayback();
  }
};

const startPlayback = () => {
  isPlaying.value = true;

  const fps = projectSettings.fps;
  const frameTime = 1000 / fps;

  playbackTimer.value = setInterval(() => {
    currentTime.value += frameTime / 1000;

    if (currentTime.value >= totalDuration.value) {
      stopPlayback();
      currentTime.value = totalDuration.value;
    }

    updatePreview();
  }, frameTime);
};

const stopPlayback = () => {
  isPlaying.value = false;

  if (playbackTimer.value) {
    clearInterval(playbackTimer.value);
    playbackTimer.value = null;
  }
};

const seekTo = (time: number) => {
  currentTime.value = time;
  updatePreview();
};

const updatePreview = async () => {
  if (!previewCanvas.value || isRendering.value) return;

  isRendering.value = true;

  try {
    const ctx = previewCanvas.value.getContext('2d');
    if (!ctx) return;

    await renderTimelineFrame({
      ctx,
      time: currentTime.value,
      canvasWidth: previewSize.width,
      canvasHeight: previewSize.height,
      tracks: tracks.value,
      mediaFiles: mediaFiles.value,
      backgroundType: projectSettings.backgroundType,
      backgroundColor: projectSettings.backgroundColor,
      blurIntensity: projectSettings.blurIntensity,
      projectCanvasSize: projectSettings.canvasSize,
    });
  } catch (error) {
    console.error('Preview render failed:', error);
  } finally {
    isRendering.value = false;
  }
};

// 轨道管理
const addMediaTrack = () => {
  showUploadDialog.value = true;
};

const addAudioTrack = () => {
  addTrack('audio');
};

const addTextTrack = () => {
  const trackId = addTrack('text');
  // 添加默认文本元素
  addElementToTrack(trackId, {
    type: 'text',
    name: '新文本',
    startTime: currentTime.value,
    duration: 5
  });
};

const toggleTrackMute = (trackId: string) => {
  const track = tracks.value.find(t => t.id === trackId);
  if (track) {
    updateTrack(trackId, { muted: !track.muted });
    updatePreview();
  }
};

const getTrackTypeLabel = (type: string) => {
  switch (type) {
    case 'media': return '视频';
    case 'audio': return '音频';
    case 'text': return '文字';
    default: return type;
  }
};

// 元素管理
const isElementSelected = (trackId: string, elementId: string) => {
  return selectedElements.value.some(
    s => s.trackId === trackId && s.elementId === elementId
  );
};

const getElementStyle = (element: any) => {
  const scale = 100; // 像素/秒
  const left = element.startTime * scale;
  const width = (element.duration - element.trimStart - element.trimEnd) * scale;

  return {
    left: `${left}px`,
    width: `${width}px`
  };
};

const splitAtTime = () => {
  pushHistory();
  splitSelected(currentTime.value);
  updatePreview();
};

const pasteAtCurrentTime = () => {
  pasteAtTime(currentTime.value);
  updatePreview();
};

// 文件处理
const handleFileUpload = (files: any[]) => {
  uploadFiles.value = files;
};

const addMediaFiles = async () => {
  for (const fileItem of uploadFiles.value) {
    const file = fileItem.raw;
    const mediaId = `media_${Date.now()}_${Math.random()}`;

    const mediaFile: MediaFile = {
      id: mediaId,
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' :
        file.type.startsWith('audio/') ? 'audio' : 'image',
      file,
      url: URL.createObjectURL(file)
    };

    // 获取媒体信息
    if (mediaFile.type === 'video') {
      try {
        const info = await videoCache.getVideoInfo(mediaId, file);
        if (info) {
          mediaFile.duration = info.duration;
          mediaFile.width = info.width;
          mediaFile.height = info.height;
        }
      } catch (error) {
        console.warn('Failed to get video info:', error);
      }
    }

    addMediaFile(mediaFile);

    // 查找或创建媒体轨道
    let trackId = tracks.value.find(t => t.type === 'media')?.id;
    if (!trackId) {
      trackId = addTrack('media');
    }

    // 添加元素到轨道
    addElementToTrack(trackId, {
      type: 'media',
      name: file.name,
      startTime: currentTime.value,
      duration: mediaFile.duration || 5,
      mediaId: mediaId
    });
  }

  showUploadDialog.value = false;
  uploadFiles.value = [];
  updatePreview();
};

// 导出
const exportVideo = async () => {
  if (tracks.value.length === 0) {
    MessagePlugin.warning('请先添加视频内容');
    return;
  }

  showExportDialog.value = true;
  isExporting.value = true;
  exportProgress.value = 0;
  exportMessage.value = '准备导出...';

  try {
    const result = await exportTimelineProject(
      tracks.value,
      mediaFiles.value,
      projectSettings,
      {
        format: 'mp4',
        quality: 'medium',
        fps: projectSettings.fps,
        includeAudio: true,
        onProgress: (progress) => {
          exportProgress.value = Math.round(progress * 100);
          exportMessage.value = `导出进度: ${exportProgress.value}%`;
        }
      }
    );

    if (result.success && result.buffer) {
      const blob = new Blob([result.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      // 下载文件
      const link = document.createElement('a');
      link.href = url;
      link.download = `timeline_export_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      MessagePlugin.success('视频导出成功！');
    } else {
      throw new Error(result.error || '导出失败');
    }
  } catch (error) {
    console.error('Export failed:', error);
    MessagePlugin.error(`导出失败: ${error}`);
  } finally {
    isExporting.value = false;
    showExportDialog.value = false;
  }
};

const cancelExport = () => {
  isExporting.value = false;
  showExportDialog.value = false;
};

// 工具函数
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 临时方法 - 这些需要实际实现
const showElementContextMenu = (event: MouseEvent, trackId: string, elementId: string) => {
  event.preventDefault();
  console.log('Context menu for element:', trackId, elementId);
};

const startResize = (event: MouseEvent, trackId: string, elementId: string, direction: 'left' | 'right') => {
  event.stopPropagation();
  console.log('Start resize:', trackId, elementId, direction);
};
</script>

<style lang="less" scoped>
.timeline-editor {
  .control-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 16px;

    .playback-controls {
      display: flex;
      align-items: center;
      gap: 16px;

      .time-display {
        font-family: monospace;
        font-size: 14px;
        color: #666;
        min-width: 100px;
      }

      .timeline-scrubber {
        width: 300px;
      }
    }

    .editor-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .tracks-container {
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;

    .track {
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &.track-muted {
        opacity: 0.6;
      }

      .track-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f9fa;

        .track-info {
          h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
          }

          .track-type {
            font-size: 12px;
            color: #666;
          }
        }

        .track-controls {
          display: flex;
          gap: 4px;
        }
      }

      .track-timeline {
        position: relative;
        height: 60px;
        background: #fff;
        border-left: 80px solid #f8f9fa; // 为轨道名称留出空间

        .timeline-element {
          position: absolute;
          top: 8px;
          height: 44px;
          background: #2196f3;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          min-width: 60px;

          &.element-selected {
            outline: 2px solid #ff9800;
          }

          &.element-muted {
            opacity: 0.5;
          }

          .element-content {
            text-align: center;
            pointer-events: none;

            .element-name {
              font-size: 12px;
              font-weight: 500;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 120px;
            }

            .element-duration {
              font-size: 10px;
              opacity: 0.8;
            }
          }

          .resize-handle {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 8px;
            background: rgba(255, 255, 255, 0.3);
            cursor: ew-resize;
            opacity: 0;
            transition: opacity 0.2s;

            &.resize-left {
              left: 0;
              border-radius: 4px 0 0 4px;
            }

            &.resize-right {
              right: 0;
              border-radius: 0 4px 4px 0;
            }
          }

          &:hover .resize-handle {
            opacity: 1;
          }
        }
      }
    }
  }

  .preview-section {
    display: flex;
    gap: 24px;
    margin-top: 24px;

    .preview-canvas-container {
      position: relative;
      flex: 1;

      .preview-canvas {
        width: 100%;
        max-width: 640px;
        height: auto;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background: #000;
      }

      .rendering-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        border-radius: 4px;

        p {
          margin-top: 16px;
          margin-bottom: 0;
        }
      }
    }

    .preview-controls {
      width: 280px;
      flex-shrink: 0;
    }
  }

  .export-progress {
    text-align: center;
    padding: 20px 0;

    p {
      margin-top: 16px;
      margin-bottom: 0;
      color: #666;
    }
  }
}
</style>
