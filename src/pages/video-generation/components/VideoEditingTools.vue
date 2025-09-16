<template>
  <div class="video-editing-tools">
    <!-- 视频剪切工具 -->
    <div v-if="selectedVideoForEdit" class="tool-section">
      <div class="tool-header" @click="toggleTool('cut')">
        <span>视频剪切</span>
        <span class="toggle-icon">{{ showCutTool ? '−' : '+' }}</span>
      </div>
      <div v-if="showCutTool" class="tool-content">
        <div class="video-cut-panel">
          <t-row :gutter="24">
            <!-- 左侧：参数设置 -->
            <t-col :span="10">
              <t-card title="剪切设置" :bordered="false" class="settings-card">
                <div v-if="selectedVideoForEdit" class="file-info">
                  <div class="file-name">{{ selectedVideoForEdit.title }}</div>
                  <div class="file-size">{{ selectedVideoForEdit.url }}</div>
                </div>

                <t-form :data="cutOptions" label-width="80px">
                  <t-form-item label="开始时间" name="startTime">
                    <t-input-number v-model="cutOptions.startTime" :min="0" :max="videoDuration" :step="0.1"
                      placeholder="秒" style="width: 100%" />
                  </t-form-item>
                  <t-form-item label="结束时间" name="endTime">
                    <t-input-number v-model="cutOptions.endTime" :min="cutOptions.startTime" :max="videoDuration"
                      :step="0.1" placeholder="秒" style="width: 100%" />
                  </t-form-item>
                  <t-form-item label="输出格式" name="outputFormat">
                    <t-select v-model="cutOptions.outputFormat" style="width: 100%">
                      <t-option value="mp4" label="MP4" />
                      <t-option value="webm" label="WebM" />
                      <t-option value="avi" label="AVI" />
                    </t-select>
                  </t-form-item>
                  <t-form-item label="编码模式" name="mode">
                    <t-radio-group v-model="cutOptions.mode">
                      <t-radio value="timeline">时间轴模式（推荐）</t-radio>
                      <t-radio value="fast">快速模式</t-radio>
                      <t-radio value="precise">精确模式</t-radio>
                    </t-radio-group>
                  </t-form-item>

                  <!-- 结尾检测提示 -->
                  <t-form-item v-if="endingWarning" label="结尾提醒">
                    <t-alert theme="warning" :message="endingWarning" />
                  </t-form-item>
                  <t-form-item v-if="cutOptions.mode === 'precise'" label="视频质量" name="quality">
                    <t-slider v-model="cutOptions.quality" :min="0" :max="51" :step="1"
                      :marks="{ 0: '最高', 23: '默认', 51: '最低' }" style="width: 100%" />
                  </t-form-item>
                </t-form>

                <div class="action-buttons">
                  <t-button theme="primary" :disabled="!selectedVideoForEdit || processing" :loading="processing"
                    @click="handleCut" block>
                    {{ processing ? '剪切中...' : '开始剪切' }}
                  </t-button>
                </div>
              </t-card>
            </t-col>

            <!-- 右侧：视频预览和结果 -->
            <t-col :span="14">
              <t-card title="视频预览" :bordered="false">
                <!-- 原视频预览 -->
                <div v-if="selectedVideoForEdit" class="video-section">
                  <h4>原视频</h4>
                  <video ref="originalVideoRef" :src="originalVideoUrl" controls class="video-player"
                    @loadedmetadata="handleVideoLoaded" />
                  <div class="video-info">
                    <span>时长: {{ formatTime(videoDuration) }}</span>
                    <span>剪切片段: {{ formatTime(cutOptions.startTime) }} - {{ formatTime(cutOptions.endTime) }}</span>
                    <span>片段时长: {{ formatTime(cutOptions.endTime - cutOptions.startTime) }}</span>
                  </div>
                </div>

                <!-- 剪切结果 -->
                <div v-if="resultVideoUrl" class="video-section">
                  <h4>剪切结果</h4>
                  <video :src="resultVideoUrl" controls class="video-player" />
                  <div class="result-actions">
                    <t-button @click="downloadResult">
                      <template #icon>
                        <download-icon />
                      </template>
                      下载视频
                    </t-button>
                    <t-button variant="outline" @click="clearResult">清除结果</t-button>
                    <t-button variant="outline" @click="addResultToList">添加到列表</t-button>
                  </div>
                </div>
              </t-card>
            </t-col>
          </t-row>
        </div>
      </div>
    </div>

    <!-- 视频拼接工具 -->
    <div v-if="selectedVideosForMerge.length > 1" class="tool-section">
      <div class="tool-header" @click="toggleTool('merge')">
        <span>视频拼接 ({{ selectedVideosForMerge.length }}个视频)</span>
        <span class="toggle-icon">{{ showMergeTool ? '−' : '+' }}</span>
      </div>
      <div v-if="showMergeTool" class="tool-content">
        <div class="video-merge-panel">
          <t-row :gutter="24">
            <!-- 左侧：文件管理和设置 -->
            <t-col :span="10">
              <t-card title="文件列表" :bordered="false" class="settings-card">
                <div class="file-list">
                  <div v-for="(video, index) in selectedVideosForMerge" :key="video.id" class="file-item"
                    :class="{ active: currentPreviewIndex === index }" @click="previewFile(index)">
                    <div class="file-info">
                      <div class="file-name">{{ video.title }}</div>
                      <div class="file-size">{{ video.role === 'A' ? '角色A' : '角色B' }}</div>
                    </div>
                    <div class="file-actions">
                      <t-button size="small" variant="text" @click.stop="moveUp(index)" :disabled="index === 0">
                        ↑
                      </t-button>
                      <t-button size="small" variant="text" @click.stop="moveDown(index)"
                        :disabled="index === selectedVideosForMerge.length - 1">
                        ↓
                      </t-button>
                      <t-button size="small" variant="text" theme="danger" @click.stop="removeFile(index)">
                        ✕
                      </t-button>
                    </div>
                  </div>
                </div>

                <div v-if="selectedVideosForMerge.length > 0" class="file-stats">
                  <p>共 {{ selectedVideosForMerge.length }} 个文件</p>
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
                  <t-form-item label="交叉淡入" name="enableCrossfade">
                    <t-switch v-model="mergeOptions.enableCrossfade" />
                  </t-form-item>
                  <t-form-item v-if="mergeOptions.enableCrossfade" label="淡入时长" name="fadeLength">
                    <t-input-number v-model="mergeOptions.fadeLength" :min="0.1" :max="5" :step="0.1" placeholder="秒"
                      style="width: 100%" />
                  </t-form-item>
                </t-form>

                <div class="action-buttons">
                  <t-button theme="primary" :disabled="selectedVideosForMerge.length < 2 || processing"
                    :loading="processing" @click="handleMerge" block>
                    {{ processing ? '合并中...' : '开始合并' }}
                  </t-button>
                </div>
              </t-card>
            </t-col>

            <!-- 右侧：视频预览和结果 -->
            <t-col :span="14">
              <t-card title="视频预览" :bordered="false">
                <!-- 当前预览视频 -->
                <div v-if="selectedVideosForMerge.length > 0" class="video-section">
                  <h4>
                    预览视频 {{ currentPreviewIndex + 1 }}/{{ selectedVideosForMerge.length }}
                    - {{ selectedVideosForMerge[currentPreviewIndex]?.title }}
                  </h4>
                  <video :key="currentPreviewIndex" :src="previewUrls[currentPreviewIndex]" controls
                    class="video-player" />
                  <div class="preview-controls">
                    <t-button size="small" :disabled="currentPreviewIndex === 0"
                      @click="previewFile(currentPreviewIndex - 1)">
                      上一个
                    </t-button>
                    <t-button size="small" :disabled="currentPreviewIndex === selectedVideosForMerge.length - 1"
                      @click="previewFile(currentPreviewIndex + 1)">
                      下一个
                    </t-button>
                  </div>
                </div>

                <!-- 合并结果 -->
                <div v-if="mergeResultVideoUrl" class="video-section">
                  <h4>合并结果</h4>
                  <video :src="mergeResultVideoUrl" controls class="video-player" />
                  <div class="result-actions">
                    <t-button @click="downloadMergeResult">
                      <template #icon>
                        <download-icon />
                      </template>
                      下载视频
                    </t-button>
                    <t-button variant="outline" @click="clearMergeResult">清除结果</t-button>
                  </div>
                </div>
              </t-card>
            </t-col>
          </t-row>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div v-if="roleAVideos.length > 0 && roleBVideos.length > 0" class="quick-actions">
      <t-button @click="quickMergeAllVideos">
        快速拼接所有视频
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { VideoIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import { cutVideoWithFFmpeg, createPlayableVideoUrl, revokeVideoUrl, mergeVideosWithFFmpeg } from '@/utils/videoProcessor';
import { cutVideoWithTimeline } from '@/utils/advancedVideoProcessor';

// 定义接口
interface VideoItem {
  url: string;
  title: string;
  content?: string;
  role?: 'A' | 'B';
  index?: number;
  file?: File;
  blob?: Blob;
}

interface SelectedVideo {
  id: string;
  role: 'A' | 'B';
  video: VideoItem;
  index: number;
  title: string;
}

interface CutOptions {
  startTime: number;
  endTime: number;
  outputFormat: string;
  mode: 'fast' | 'precise' | 'timeline';
  quality: number;
}

interface MergeOptions {
  outputFormat: string;
  videoCodec: string;
  audioCodec: string;
  videoQuality: number;
  audioQuality: string;
  enableCrossfade: boolean;
  fadeLength: number;
}

// Props
const props = defineProps<{
  selectedVideoForEdit: VideoItem | null;
  selectedVideosForMerge: SelectedVideo[];
  roleAVideos: VideoItem[];
  roleBVideos: VideoItem[];
}>();

// Emits
const emit = defineEmits<{
  'clear-selection': [];
  'add-video-to-list': [video: VideoItem, role: 'A' | 'B'];
  'update:selectedVideosForMerge': [videos: SelectedVideo[]];
}>();

// 状态
const showCutTool = ref(true);
const showMergeTool = ref(true);
const processing = ref(false);

// 剪切相关
const originalVideoUrl = ref('');
const resultVideoUrl = ref('');
const videoDuration = ref(0);
const originalVideoRef = ref<HTMLVideoElement>();
const endingWarning = ref('');

const cutOptions = reactive<CutOptions>({
  startTime: 0,
  endTime: 10,
  outputFormat: 'mp4',
  mode: 'timeline',
  quality: 23
});

// 拼接相关
const previewUrls = ref<string[]>([]);
const currentPreviewIndex = ref(0);
const mergeResultVideoUrl = ref('');

const mergeOptions = reactive<MergeOptions>({
  outputFormat: 'mp4',
  videoCodec: 'libx264',
  audioCodec: 'aac',
  videoQuality: 23,
  audioQuality: '128k',
  enableCrossfade: false,
  fadeLength: 1
});

// 监听selectedVideoForEdit变化
watch(() => props.selectedVideoForEdit, (newVideo) => {
  if (newVideo) {
    originalVideoUrl.value = newVideo.url;
    // 清除之前的结果
    if (resultVideoUrl.value) {
      revokeVideoUrl(resultVideoUrl.value);
      resultVideoUrl.value = '';
    }
  } else {
    if (originalVideoUrl.value) {
      originalVideoUrl.value = '';
    }
    if (resultVideoUrl.value) {
      revokeVideoUrl(resultVideoUrl.value);
      resultVideoUrl.value = '';
    }
  }
}, { immediate: true });

// 监听selectedVideosForMerge变化
watch(() => props.selectedVideosForMerge, (newVideos) => {
  // 清除之前的预览URLs
  previewUrls.value.forEach(url => {
    if (url.startsWith('blob:')) {
      revokeVideoUrl(url);
    }
  });
  previewUrls.value = [];

  // 创建新的预览URLs
  if (newVideos.length > 0) {
    previewUrls.value = newVideos.map(item => item.video.url);
    currentPreviewIndex.value = 0;
  }

  // 清除合并结果
  if (mergeResultVideoUrl.value) {
    revokeVideoUrl(mergeResultVideoUrl.value);
    mergeResultVideoUrl.value = '';
  }
}, { immediate: true, deep: true });

// 检测结尾问题
const checkEndingIssue = () => {
  if (videoDuration.value > 0 && cutOptions.endTime > videoDuration.value - 1.0) {
    endingWarning.value = `⚠️ 检测到剪切包含视频结尾最后1秒，可能导致黑屏。建议使用"智能修复模式"或将结束时间调整为 ${(videoDuration.value - 1.0).toFixed(1)}s`;
  } else {
    endingWarning.value = '';
  }
};

// 视频加载完成
const handleVideoLoaded = () => {
  if (originalVideoRef.value) {
    videoDuration.value = originalVideoRef.value.duration;
    cutOptions.endTime = Math.min(10, videoDuration.value);
    checkEndingIssue();
  }
};

// 监听开始时间变化
watch(() => cutOptions.startTime, (newVal) => {
  if (newVal >= cutOptions.endTime) {
    cutOptions.endTime = Math.min(newVal + 1, videoDuration.value);
  }
  checkEndingIssue();
});

// 监听结束时间变化
watch(() => cutOptions.endTime, () => {
  checkEndingIssue();
});

// 工具展开/收起
const toggleTool = (tool: 'cut' | 'merge') => {
  if (tool === 'cut') {
    showCutTool.value = !showCutTool.value;
  } else {
    showMergeTool.value = !showMergeTool.value;
  }
};

// 执行剪切（完全照搬左侧栏实现）
const handleCut = async () => {
  console.log('🎬 [DEBUG] VideoCutPanel.handleCut() 开始执行');
  console.log('📋 [DEBUG] 当前状态检查:', {
    hasSelectedFile: !!props.selectedVideoForEdit,
    fileName: props.selectedVideoForEdit?.title,
    startTime: cutOptions.startTime,
    endTime: cutOptions.endTime,
    mode: cutOptions.mode,
    processing: processing.value
  });

  if (!props.selectedVideoForEdit) {
    console.log('❌ [DEBUG] 没有选择文件，显示警告');
    MessagePlugin.warning('请先选择视频文件');
    return;
  }

  if (cutOptions.startTime >= cutOptions.endTime) {
    console.log('❌ [DEBUG] 时间参数错误，显示警告');
    MessagePlugin.warning('开始时间必须小于结束时间');
    return;
  }

  try {
    console.log('🚀 [DEBUG] 开始视频剪切流程');
    processing.value = true;

    // 清除之前的结果
    if (resultVideoUrl.value) {
      console.log('🧹 [DEBUG] 清除之前的结果URL');
      revokeVideoUrl(resultVideoUrl.value);
      resultVideoUrl.value = '';
    }

    let result: string;
    let videoFile: File;

    // 获取视频文件
    if (props.selectedVideoForEdit.file) {
      videoFile = props.selectedVideoForEdit.file;
    } else if (props.selectedVideoForEdit.blob) {
      videoFile = new File([props.selectedVideoForEdit.blob], 'video.mp4', { type: 'video/mp4' });
    } else {
      // 从URL下载视频文件
      console.log('📥 下载视频文件:', props.selectedVideoForEdit.url);
      const response = await fetch(props.selectedVideoForEdit.url);
      const blob = await response.blob();
      videoFile = new File([blob], 'video.mp4', { type: 'video/mp4' });
    }

    console.log(`🎯 [DEBUG] 选择剪切模式: ${cutOptions.mode}`);

    if (cutOptions.mode === 'timeline') {
      console.log('📅 [DEBUG] 使用时间轴剪切方法');
      const timelineOptions = {
        fastMode: false,
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality
      };
      console.log('📋 [DEBUG] 时间轴剪切参数:', timelineOptions);

      const timelineStartTime = performance.now();
      result = await cutVideoWithTimeline(
        videoFile,
        cutOptions.startTime,
        cutOptions.endTime,
        timelineOptions
      );
      const timelineEndTime = performance.now();
      console.log(`✅ [DEBUG] 时间轴剪切完成，耗时: ${(timelineEndTime - timelineStartTime).toFixed(2)}ms`);
    } else {
      console.log('🔧 [DEBUG] 使用传统FFmpeg剪切方法');
      const ffmpegOptions = {
        keepOriginalCodec: cutOptions.mode === 'fast',
        enableReEncode: cutOptions.mode === 'precise',
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality
      };
      console.log('📋 [DEBUG] FFmpeg剪切参数:', ffmpegOptions);

      const ffmpegStartTime = performance.now();
      result = await cutVideoWithFFmpeg(
        videoFile,
        cutOptions.startTime,
        cutOptions.endTime,
        ffmpegOptions
      );
      const ffmpegEndTime = performance.now();
      console.log(`✅ [DEBUG] FFmpeg剪切完成，耗时: ${(ffmpegEndTime - ffmpegStartTime).toFixed(2)}ms`);
    }

    console.log('🎯 [DEBUG] 剪切结果:', {
      resultType: typeof result,
      resultLength: result.length,
      isBlob: result.startsWith('blob:')
    });

    resultVideoUrl.value = result;
    console.log('🎉 [DEBUG] 视频剪切流程成功完成');
    MessagePlugin.success('视频剪切完成！');
  } catch (error) {
    console.error('💥 [DEBUG] 视频剪切失败:', error);
    MessagePlugin.error(`剪切失败: ${error}`);
  } finally {
    console.log('🏁 [DEBUG] 视频剪切流程结束，重置processing状态');
    processing.value = false;
  }
};

// 执行合并（完全照搬左侧栏实现）
const handleMerge = async () => {
  if (props.selectedVideosForMerge.length < 2) {
    MessagePlugin.warning('请选择至少2个视频文件');
    return;
  }

  try {
    processing.value = true;

    // 清除之前的结果
    if (mergeResultVideoUrl.value) {
      revokeVideoUrl(mergeResultVideoUrl.value);
      mergeResultVideoUrl.value = '';
    }

    // 转换为File对象数组
    const videoFiles: File[] = [];

    for (const selectedVideo of props.selectedVideosForMerge) {
      let videoFile: File;

      if (selectedVideo.video.file) {
        videoFile = selectedVideo.video.file;
      } else if (selectedVideo.video.blob) {
        videoFile = new File([selectedVideo.video.blob], `${selectedVideo.title}.mp4`, { type: 'video/mp4' });
      } else {
        // 从URL下载视频文件
        console.log('📥 下载视频文件:', selectedVideo.video.url);
        const response = await fetch(selectedVideo.video.url);
        const blob = await response.blob();
        videoFile = new File([blob], `${selectedVideo.title}.mp4`, { type: 'video/mp4' });
      }

      videoFiles.push(videoFile);
    }

    // 使用传统FFmpeg合并方法（与左侧栏一致）
    const options = {
      outputFormat: mergeOptions.outputFormat,
      videoCodec: mergeOptions.videoCodec,
      audioCodec: mergeOptions.audioCodec,
      videoQuality: mergeOptions.videoQuality,
      audioQuality: mergeOptions.audioQuality,
      enableCrossfade: mergeOptions.enableCrossfade,
      fadeLength: mergeOptions.fadeLength,
      resolution: undefined
    };

    const result = await mergeVideosWithFFmpeg(videoFiles, options);

    mergeResultVideoUrl.value = result;
    MessagePlugin.success('视频合并完成！');
  } catch (error) {
    console.error('视频合并失败:', error);
    MessagePlugin.error(`合并失败: ${error}`);
  } finally {
    processing.value = false;
  }
};

// 文件操作
const moveUp = (index: number) => {
  if (index > 0) {
    const newList = [...props.selectedVideosForMerge];
    [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    emit('update:selectedVideosForMerge', newList);
  }
};

const moveDown = (index: number) => {
  if (index < props.selectedVideosForMerge.length - 1) {
    const newList = [...props.selectedVideosForMerge];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    emit('update:selectedVideosForMerge', newList);
  }
};

const removeFile = (index: number) => {
  const newList = [...props.selectedVideosForMerge];
  newList.splice(index, 1);
  emit('update:selectedVideosForMerge', newList);
};

const previewFile = (index: number) => {
  if (index >= 0 && index < props.selectedVideosForMerge.length) {
    currentPreviewIndex.value = index;
  }
};

// 下载结果
const downloadResult = () => {
  if (resultVideoUrl.value) {
    const link = document.createElement('a');
    link.href = resultVideoUrl.value;
    link.download = `cut_video_${Date.now()}.${cutOptions.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const downloadMergeResult = () => {
  if (mergeResultVideoUrl.value) {
    const link = document.createElement('a');
    link.href = mergeResultVideoUrl.value;
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

const clearMergeResult = () => {
  if (mergeResultVideoUrl.value) {
    revokeVideoUrl(mergeResultVideoUrl.value);
    mergeResultVideoUrl.value = '';
  }
};

// 添加结果到列表
const addResultToList = () => {
  if (!resultVideoUrl.value || !props.selectedVideoForEdit) return;

  const newVideo: VideoItem = {
    url: resultVideoUrl.value,
    title: `${props.selectedVideoForEdit.title.replace(/\.(mp4|avi|mov|webm)$/i, '')}.mp4`,
    content: `剪切时间: ${cutOptions.startTime}s - ${cutOptions.endTime}s`
  };

  const role = props.selectedVideoForEdit.role || 'A';
  emit('add-video-to-list', newVideo, role);

  MessagePlugin.success('剪切结果已添加到视频列表');

  // 清空剪切结果
  clearResult();
};

// 快速拼接所有视频
const quickMergeAllVideos = () => {
  emit('clear-selection');

  // 按角色A、角色B交替选择
  const selectedVideos: SelectedVideo[] = [];
  const maxLength = Math.max(props.roleAVideos.length, props.roleBVideos.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < props.roleAVideos.length) {
      selectedVideos.push({
        id: `A-${i}`,
        role: 'A',
        video: props.roleAVideos[i],
        index: i,
        title: props.roleAVideos[i].title || `角色A视频 ${i + 1}`
      });
    }

    if (i < props.roleBVideos.length) {
      selectedVideos.push({
        id: `B-${i}`,
        role: 'B',
        video: props.roleBVideos[i],
        index: i,
        title: props.roleBVideos[i].title || `角色B视频 ${i + 1}`
      });
    }
  }

  emit('update:selectedVideosForMerge', selectedVideos);
  MessagePlugin.success(`已选择 ${selectedVideos.length} 个视频进行拼接`);
};

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style lang="less" scoped>
.video-editing-tools {
  .tool-section {
    margin-bottom: 24px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .tool-header {
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;

    &:hover {
      background: #e9ecef;
    }

    .toggle-icon {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .tool-content {
    padding: 20px;
  }

  .settings-card {
    margin-bottom: 16px;
  }

  .file-info {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 16px;

    .file-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .file-size {
      font-size: 12px;
      color: #666;
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

    .video-info {
      margin-top: 12px;
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #6b7280;

      span {
        padding: 4px 8px;
        background: #f3f4f6;
        border-radius: 4px;
      }
    }

    .result-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
    }

    .preview-controls {
      margin-top: 12px;
      display: flex;
      gap: 12px;
    }
  }

  .file-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f8f9fa;
    }

    &.active {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .file-info {
      margin: 0;
      padding: 0;
      background: none;
      flex: 1;

      .file-name {
        margin: 0;
        font-size: 14px;
      }

      .file-size {
        margin: 0;
        font-size: 12px;
      }
    }

    .file-actions {
      display: flex;
      gap: 4px;
    }
  }

  .file-stats {
    margin-top: 12px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 12px;
    color: #6b7280;

    p {
      margin: 0;
    }
  }

  .quick-actions {
    text-align: center;
    padding: 20px;
    border-top: 1px solid #e5e7eb;
  }
}
</style>
