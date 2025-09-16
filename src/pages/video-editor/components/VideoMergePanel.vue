<template>
  <div class="video-merge-panel">
    <t-row :gutter="24">
      <!-- 左侧：文件管理和设置 -->
      <t-col :span="6">
        <t-card title="文件列表" :bordered="false" class="settings-card">
          <t-upload v-model="fileList" multiple accept="video/*" :auto-upload="false" :show-upload-progress="false"
            @change="handleFileChange">
            <template #file-list-display>
              <div class="file-list">
                <div v-for="(file, index) in selectedFiles" :key="index" class="file-item"
                  :class="{ active: currentPreviewIndex === index }" @click="previewFile(index)">
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <div class="file-actions">
                    <t-button size="small" variant="text" @click.stop="moveUp(index)" :disabled="index === 0">
                      ↑
                    </t-button>
                    <t-button size="small" variant="text" @click.stop="moveDown(index)"
                      :disabled="index === selectedFiles.length - 1">
                      ↓
                    </t-button>
                    <t-button size="small" variant="text" theme="danger" @click.stop="removeFile(index)">
                      ✕
                    </t-button>
                  </div>
                </div>
              </div>
            </template>
          </t-upload>

          <div v-if="selectedFiles.length > 0" class="file-stats">
            <p>共 {{ selectedFiles.length }} 个文件</p>
            <p>总大小: {{ formatFileSize(totalSize) }}</p>
          </div>
        </t-card>

        <t-card title="合并设置" :bordered="false" class="settings-card">
          <t-form :data="mergeOptions" label-width="80px">
            <t-form-item label="输出格式" name="outputFormat">
              <t-select v-model="mergeOptions.outputFormat" style="width: 100%">
                <t-option value="mp4" label="MP4" />
                <t-option value="webm" label="WebM" />
                <t-option value="avi" label="AVI" />
              </t-select>
            </t-form-item>
            <t-form-item label="视频编码" name="videoCodec">
              <t-select v-model="mergeOptions.videoCodec" style="width: 100%">
                <t-option value="libx264" label="H.264" />
                <t-option value="libx265" label="H.265" />
                <t-option value="libvpx-vp9" label="VP9" />
              </t-select>
            </t-form-item>
            <t-form-item label="视频质量" name="videoQuality">
              <t-slider v-model="mergeOptions.videoQuality" :min="0" :max="51" :step="1"
                :marks="{ 0: '最高', 23: '默认', 51: '最低' }" style="width: 100%" />
            </t-form-item>
            <t-form-item label="音频质量" name="audioQuality">
              <t-select v-model="mergeOptions.audioQuality" style="width: 100%">
                <t-option value="128k" label="128k" />
                <t-option value="192k" label="192k" />
                <t-option value="256k" label="256k" />
                <t-option value="320k" label="320k" />
              </t-select>
            </t-form-item>
            <t-form-item label="分辨率" name="resolution">
              <t-select v-model="mergeOptions.resolution" style="width: 100%" allow-input>
                <t-option value="" label="保持原始" />
                <t-option value="1920x1080" label="1080p" />
                <t-option value="1280x720" label="720p" />
                <t-option value="854x480" label="480p" />
              </t-select>
            </t-form-item>
            <t-form-item label="交叉淡入" name="enableCrossfade">
              <t-switch v-model="mergeOptions.enableCrossfade" />
            </t-form-item>
            <t-form-item v-if="mergeOptions.enableCrossfade" label="淡入时长" name="fadeLength">
              <t-input-number v-model="mergeOptions.fadeLength" :min="0.1" :max="5" :step="0.1" placeholder="秒"
                style="width: 100%" />
            </t-form-item>
            <t-form-item label="合并模式" name="mergeMode">
              <t-select v-model="mergeOptions.mergeMode" style="width: 100%">
                <t-option value="timeline" label="时间轴合并（推荐）" />
                <t-option value="sequential" label="顺序连接" />
              </t-select>
            </t-form-item>
            <t-form-item v-if="mergeOptions.mergeMode === 'timeline'" label="背景类型" name="backgroundType">
              <t-select v-model="mergeOptions.backgroundType" style="width: 100%">
                <t-option value="color" label="纯色背景" />
                <t-option value="blur" label="模糊背景" />
              </t-select>
            </t-form-item>
            <t-form-item v-if="mergeOptions.mergeMode === 'timeline' && mergeOptions.backgroundType === 'color'"
              label="背景颜色" name="backgroundColor">
              <input type="color" v-model="mergeOptions.backgroundColor"
                style="width: 100%; height: 32px; border: 1px solid #d9d9d9; border-radius: 4px;" />
            </t-form-item>
          </t-form>

          <div class="action-buttons">
            <t-button theme="primary" :disabled="selectedFiles.length < 2 || processing" :loading="processing"
              @click="handleMerge" block>
              {{ processing ? '合并中...' : '开始合并' }}
            </t-button>
          </div>
        </t-card>
      </t-col>

      <!-- 右侧：视频预览和结果 -->
      <t-col :span="18">
        <t-card title="视频预览" :bordered="false">
          <!-- 当前预览视频 -->
          <div v-if="selectedFiles.length > 0" class="video-section">
            <h4>
              预览视频 {{ currentPreviewIndex + 1 }}/{{ selectedFiles.length }}
              - {{ selectedFiles[currentPreviewIndex]?.name }}
            </h4>
            <video :key="currentPreviewIndex" :src="previewUrls[currentPreviewIndex]" controls class="video-player" />
            <div class="preview-controls">
              <t-button size="small" :disabled="currentPreviewIndex === 0"
                @click="previewFile(currentPreviewIndex - 1)">
                上一个
              </t-button>
              <t-button size="small" :disabled="currentPreviewIndex === selectedFiles.length - 1"
                @click="previewFile(currentPreviewIndex + 1)">
                下一个
              </t-button>
            </div>
          </div>

          <!-- 合并结果 -->
          <div v-if="resultVideoUrl" class="video-section">
            <h4>合并结果</h4>
            <video :src="resultVideoUrl" controls class="video-player" />
            <div class="result-actions">
              <t-button @click="downloadResult">
                <template #icon>
                  <download-icon />
                </template>
                下载视频
              </t-button>
              <t-button variant="outline" @click="clearResult">清除结果</t-button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="selectedFiles.length === 0" class="empty-state">
            <video-icon class="empty-icon" />
            <p>请选择至少2个视频文件开始合并</p>
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { VideoIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import { mergeVideosWithFFmpeg, createPlayableVideoUrl, revokeVideoUrl } from '@/utils/videoProcessor';
import { mergeTimelineVideos } from '@/utils/advancedVideoProcessor';
import type { TimelineTrack, MediaFile } from '@/types/timeline';

interface MergeOptions {
  outputFormat: string;
  videoCodec: string;
  audioCodec: string;
  videoQuality: number;
  audioQuality: string;
  enableCrossfade: boolean;
  fadeLength: number;
  resolution: string;
  mergeMode: string;
  backgroundType: string;
  backgroundColor: string;
}

const fileList = ref([]);
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const currentPreviewIndex = ref(0);
const resultVideoUrl = ref('');
const processing = ref(false);

const mergeOptions = reactive<MergeOptions>({
  outputFormat: 'mp4',
  videoCodec: 'libx264',
  audioCodec: 'aac',
  videoQuality: 23,
  audioQuality: '128k',
  enableCrossfade: false,
  fadeLength: 1,
  resolution: '',
  mergeMode: 'timeline',
  backgroundType: 'color',
  backgroundColor: '#000000'
});

// 计算总文件大小
const totalSize = computed(() => {
  return selectedFiles.value.reduce((total, file) => total + file.size, 0);
});

// 监听文件变化
const handleFileChange = (files: any[]) => {
  // 清除之前的预览URLs
  previewUrls.value.forEach(url => revokeVideoUrl(url));
  previewUrls.value = [];

  selectedFiles.value = files.map((f: any) => f.raw);

  // 创建新的预览URLs
  previewUrls.value = selectedFiles.value.map(file => createPlayableVideoUrl(file));

  if (selectedFiles.value.length > 0) {
    currentPreviewIndex.value = 0;
  }
};

// 预览指定文件
const previewFile = (index: number) => {
  if (index >= 0 && index < selectedFiles.value.length) {
    currentPreviewIndex.value = index;
  }
};

// 上移文件
const moveUp = (index: number) => {
  if (index > 0) {
    [selectedFiles.value[index], selectedFiles.value[index - 1]] =
      [selectedFiles.value[index - 1], selectedFiles.value[index]];

    [previewUrls.value[index], previewUrls.value[index - 1]] =
      [previewUrls.value[index - 1], previewUrls.value[index]];

    if (currentPreviewIndex.value === index) {
      currentPreviewIndex.value = index - 1;
    } else if (currentPreviewIndex.value === index - 1) {
      currentPreviewIndex.value = index;
    }
  }
};

// 下移文件
const moveDown = (index: number) => {
  if (index < selectedFiles.value.length - 1) {
    [selectedFiles.value[index], selectedFiles.value[index + 1]] =
      [selectedFiles.value[index + 1], selectedFiles.value[index]];

    [previewUrls.value[index], previewUrls.value[index + 1]] =
      [previewUrls.value[index + 1], previewUrls.value[index]];

    if (currentPreviewIndex.value === index) {
      currentPreviewIndex.value = index + 1;
    } else if (currentPreviewIndex.value === index + 1) {
      currentPreviewIndex.value = index;
    }
  }
};

// 删除文件
const removeFile = (index: number) => {
  revokeVideoUrl(previewUrls.value[index]);
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);

  if (currentPreviewIndex.value >= selectedFiles.value.length) {
    currentPreviewIndex.value = Math.max(0, selectedFiles.value.length - 1);
  }
};

// 执行合并
const handleMerge = async () => {
  if (selectedFiles.value.length < 2) {
    MessagePlugin.warning('请选择至少2个视频文件');
    return;
  }

  try {
    processing.value = true;

    // 清除之前的结果
    if (resultVideoUrl.value) {
      revokeVideoUrl(resultVideoUrl.value);
      resultVideoUrl.value = '';
    }

    let result: string;

    if (mergeOptions.mergeMode === 'timeline') {
      // 使用新的时间轴合并方法
      result = await mergeTimelineVideos(
        createTimelineFromFiles(selectedFiles.value),
        createMediaFilesFromFiles(selectedFiles.value),
        {
          outputFormat: mergeOptions.outputFormat,
          quality: getQualityLevel(mergeOptions.videoQuality),
          resolution: mergeOptions.resolution || '1920x1080',
          fps: 30,
          includeAudio: true,
          backgroundType: mergeOptions.backgroundType as 'color' | 'blur',
          backgroundColor: mergeOptions.backgroundColor
        }
      );
    } else {
      // 使用传统FFmpeg合并方法
      const options = {
        outputFormat: mergeOptions.outputFormat,
        videoCodec: mergeOptions.videoCodec,
        audioCodec: mergeOptions.audioCodec,
        videoQuality: mergeOptions.videoQuality,
        audioQuality: mergeOptions.audioQuality,
        enableCrossfade: mergeOptions.enableCrossfade,
        fadeLength: mergeOptions.fadeLength,
        resolution: mergeOptions.resolution || undefined
      };

      result = await mergeVideosWithFFmpeg(selectedFiles.value, options);
    }

    resultVideoUrl.value = result;
    MessagePlugin.success('视频合并完成！');
  } catch (error) {
    console.error('视频合并失败:', error);
    MessagePlugin.error(`合并失败: ${error}`);
  } finally {
    processing.value = false;
  }
};

// 下载结果
const downloadResult = () => {
  if (resultVideoUrl.value) {
    const link = document.createElement('a');
    link.href = resultVideoUrl.value;
    link.download = `merged_video_${Date.now()}.${mergeOptions.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 清除结果
const clearResult = () => {
  if (resultVideoUrl.value) {
    revokeVideoUrl(resultVideoUrl.value);
    resultVideoUrl.value = '';
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 创建时间轴结构从文件列表
const createTimelineFromFiles = (files: File[]): TimelineTrack[] => {
  const tracks: TimelineTrack[] = [];

  files.forEach((file, index) => {
    const trackId = `track_${index}`;
    const elementId = `element_${index}`;
    const mediaId = `media_${index}_${Date.now()}`;

    tracks.push({
      id: trackId,
      name: `Track ${index + 1}`,
      type: 'media',
      muted: false,
      isMain: index === 0,
      elements: [{
        id: elementId,
        type: 'media',
        name: file.name,
        startTime: index * 0.1, // 轻微错开以创建叠加效果
        duration: 10, // 默认时长，实际会在运行时确定
        trimStart: 0,
        trimEnd: 0,
        mediaId: mediaId
      }]
    });
  });

  return tracks;
};

// 创建媒体文件列表
const createMediaFilesFromFiles = (files: File[]): MediaFile[] => {
  return files.map((file, index) => ({
    id: `media_${index}_${Date.now()}`,
    name: file.name,
    type: file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'image',
    file,
    url: URL.createObjectURL(file),
    duration: 10 // 默认时长，实际会在运行时确定
  }));
};

// 获取质量级别
const getQualityLevel = (crf: number): 'low' | 'medium' | 'high' => {
  if (crf <= 18) return 'high';
  if (crf <= 25) return 'medium';
  return 'low';
};
</script>

<style lang="less" scoped>
.video-merge-panel {
  .settings-card {
    margin-bottom: 16px;
  }

  .file-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e9ecef;
    }

    &.active {
      background: #e3f2fd;
      border: 1px solid #2196f3;
    }

    .file-info {
      flex: 1;

      .file-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 2px;
        word-break: break-all;
      }

      .file-size {
        font-size: 12px;
        color: #666;
      }
    }

    .file-actions {
      display: flex;
      gap: 4px;
    }
  }

  .file-stats {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f1f3f4;
    border-radius: 4px;
    font-size: 12px;
    color: #666;

    p {
      margin: 0;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .action-buttons {
    margin-top: 24px;
  }

  .video-section {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .video-player {
      width: 100%;
      max-width: 800px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .preview-controls {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }

    .result-actions {
      margin-top: 12px;
      display: flex;
      gap: 12px;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #999;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  }
}
</style>
