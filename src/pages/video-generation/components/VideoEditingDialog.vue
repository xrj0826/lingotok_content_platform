<template>
  <t-dialog v-model:visible="visible" header="视频编辑工具" :width="1200" :close-on-overlay-click="false"
    :close-on-escape-key="false" placement="center" @close="handleClose">
    <div class="video-editing-dialog">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="tool-tabs">
          <t-button :variant="activeTab === 'upload' ? 'base' : 'outline'" @click="activeTab = 'upload'">
            <t-icon name="folder-open" />
            选择本地视频
          </t-button>
          <t-button :variant="activeTab === 'cut' ? 'base' : 'outline'" @click="activeTab = 'cut'"
            :disabled="videoList.length === 0">
            <t-icon name="edit" />
            视频剪切
          </t-button>
          <t-button :variant="activeTab === 'merge' ? 'base' : 'outline'" @click="activeTab = 'merge'"
            :disabled="videoList.length < 2">
            <t-icon name="layers" />
            视频拼接
          </t-button>
        </div>
        <div class="toolbar-actions">
          <t-button theme="primary" @click="handleDownloadResult" :disabled="!finalResult">
            <t-icon name="download" />
            下载结果
          </t-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 选择本地视频标签页 -->
        <div v-if="activeTab === 'upload'" class="upload-section">
          <div class="upload-area">
            <div class="local-file-selector">
              <input type="file" ref="fileInput" @change="handleLocalFileSelect"
                accept="video/mp4,video/avi,video/mov,video/webm" multiple style="display: none;" />
              <div class="upload-trigger" @click="openFileSelector">
                <t-icon name="folder-open" size="48px" />
                <div class="upload-text">
                  <p>选择本地视频文件</p>
                  <p class="upload-hint">支持 MP4、AVI、MOV、WebM 格式，可同时选择多个文件</p>
                </div>
              </div>
            </div>
          </div>


          <!-- 已选择视频列表 -->
          <div v-if="videoList.length > 0" class="video-list-section">
            <h4>已选择的视频 ({{ videoList.length }}个)</h4>
            <div class="video-grid">
              <div v-for="(video, index) in videoList" :key="index" class="video-card">
                <div class="video-preview">
                  <video :src="video.url" controls class="preview-video" />
                </div>
                <div class="video-info">
                  <div class="video-title">{{ video.title }}</div>
                  <div class="video-actions">
                    <t-button size="small" @click="selectVideoForCut(video, index)">
                      剪切
                    </t-button>
                    <t-checkbox :checked="isVideoSelectedForMerge(index)"
                      @change="(checked) => toggleVideoForMerge(video, index, checked)">
                      选择拼接
                    </t-checkbox>
                    <t-button size="small" variant="outline" @click="removeVideo(index)">
                      删除
                    </t-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 视频剪切标签页 -->
        <div v-if="activeTab === 'cut'" class="cut-section">
          <div v-if="selectedVideoForCut" class="cut-tool">
            <h4>剪切视频: {{ selectedVideoForCut.title }}</h4>

            <!-- 视频预览 -->
            <div class="video-preview-section">
              <video ref="cutVideoRef" :src="selectedVideoForCut.url" controls class="cut-video-preview"
                @loadedmetadata="onVideoMetadataLoaded" />
            </div>

            <!-- 剪切设置 -->
            <div class="cut-settings">
              <div class="setting-row">
                <label>剪切模式:</label>
                <t-select v-model="cutOptions.mode" style="width: 150px;">
                  <t-option value="fast" label="快速模式" />
                  <t-option value="precise" label="精确模式" />
                  <t-option value="timeline" label="时间轴模式" />
                </t-select>
              </div>

              <div class="setting-row">
                <label>开始时间 (秒):</label>
                <t-input-number v-model="cutOptions.startTime" :min="0" :max="cutOptions.endTime - 0.1" :step="0.1"
                  :decimal-places="1" style="width: 150px;" />
              </div>

              <div class="setting-row">
                <label>结束时间 (秒):</label>
                <t-input-number v-model="cutOptions.endTime" :min="cutOptions.startTime + 0.1" :max="videoDuration"
                  :step="0.1" :decimal-places="1" style="width: 150px;" />
              </div>

              <div class="setting-row">
                <label>输出格式:</label>
                <t-select v-model="cutOptions.outputFormat" style="width: 120px;">
                  <t-option value="mp4" label="MP4" />
                  <t-option value="webm" label="WebM" />
                  <t-option value="avi" label="AVI" />
                </t-select>
              </div>

              <div class="setting-row">
                <label>视频质量:</label>
                <t-select v-model="cutOptions.quality" style="width: 120px;">
                  <t-option value="high" label="高质量" />
                  <t-option value="medium" label="中等质量" />
                  <t-option value="low" label="低质量" />
                </t-select>
              </div>
            </div>

            <!-- 剪切操作 -->
            <div class="cut-actions">
              <t-button theme="primary" @click="executeCutVideo" :loading="processingCut">
                开始剪切
              </t-button>
              <t-button @click="clearCutSelection">
                取消选择
              </t-button>
            </div>

            <!-- 剪切结果 -->
            <div v-if="cutResult" class="cut-result">
              <h5>剪切结果</h5>
              <video :src="cutResult.url" controls style="width: 100%; max-height: 300px;" />
              <div class="result-actions">
                <t-button @click="downloadCutResult">下载剪切结果</t-button>
                <t-button @click="addCutResultToList">添加到视频列表</t-button>
                <t-button variant="outline" @click="clearCutResult">清除结果</t-button>
              </div>
            </div>
          </div>
          <div v-else class="no-selection">
            <t-icon name="video" size="64px" />
            <p>请先从上传页面选择要剪切的视频</p>
          </div>
        </div>

        <!-- 视频拼接标签页 -->
        <div v-if="activeTab === 'merge'" class="merge-section">
          <div v-if="selectedVideosForMerge.length >= 2" class="merge-tool">
            <h4>拼接视频 ({{ selectedVideosForMerge.length }}个)</h4>

            <!-- 拼接预览 -->
            <div class="merge-preview">
              <h5>拼接顺序</h5>
              <div class="merge-sequence">
                <div v-for="(video, index) in selectedVideosForMerge" :key="index" class="sequence-item">
                  <div class="sequence-number">{{ index + 1 }}</div>
                  <div class="sequence-title">{{ video.title }}</div>
                  <div class="sequence-actions">
                    <t-button size="small" :disabled="index === 0" @click="moveVideoUp(index)">
                      <t-icon name="chevron-up" />
                    </t-button>
                    <t-button size="small" :disabled="index === selectedVideosForMerge.length - 1"
                      @click="moveVideoDown(index)">
                      <t-icon name="chevron-down" />
                    </t-button>
                    <t-button size="small" variant="outline" @click="removeFromMergeSelection(index)">
                      <t-icon name="close" />
                    </t-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 拼接设置 -->
            <div class="merge-settings">
              <div class="setting-row">
                <label>输出格式:</label>
                <t-select v-model="mergeOptions.outputFormat" style="width: 120px;">
                  <t-option value="mp4" label="MP4" />
                  <t-option value="webm" label="WebM" />
                  <t-option value="avi" label="AVI" />
                </t-select>
              </div>

              <div class="setting-row">
                <label>视频质量:</label>
                <t-select v-model="mergeOptions.quality" style="width: 120px;">
                  <t-option value="high" label="高质量" />
                  <t-option value="medium" label="中等质量" />
                  <t-option value="low" label="低质量" />
                </t-select>
              </div>

            </div>

            <!-- 拼接操作 -->
            <div class="merge-actions">
              <t-button theme="primary" @click="executeVideoMerge" :loading="processingMerge">
                开始拼接
              </t-button>
              <t-button @click="clearMergeSelection">
                清空选择
              </t-button>
            </div>

            <!-- 拼接结果 -->
            <div v-if="mergeResult" class="merge-result">
              <h5>拼接结果</h5>
              <video :src="mergeResult.url" controls style="width: 100%; max-height: 300px;" />
              <div class="result-actions">
                <t-button @click="downloadMergeResult">下载拼接结果</t-button>
                <t-button variant="outline" @click="clearMergeResult">清除结果</t-button>
              </div>
            </div>
          </div>
          <div v-else class="no-selection">
            <t-icon name="layers" size="64px" />
            <p>请先从上传页面选择至少2个视频进行拼接</p>
          </div>
        </div>
      </div>

      <!-- 加载状态遮罩 -->
      <div v-if="processingCut || processingMerge" class="loading-overlay">
        <div class="loading-content">
          <t-loading size="large" />
          <div class="loading-text">{{ loadingMessage }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <t-button @click="handleClose">关闭</t-button>
        <t-button v-if="finalResult" theme="primary" @click="handleConfirm">
          确认并返回结果
        </t-button>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { cutVideoWithFFmpeg, createPlayableVideoUrl, revokeVideoUrl, mergeVideosWithFFmpeg } from '@/utils/videoProcessorEnhanced';
import { cutVideoWithTimeline } from '@/utils/advancedVideoProcessor';

// 定义接口
interface VideoItem {
  url: string;
  title: string;
  file?: File;
  blob?: Blob;
}

interface CutResult {
  url: string;
  title: string;
  duration: number;
}

interface MergeResult {
  url: string;
  title: string;
  duration: number;
}

// Props 和 Emits
interface Props {
  visible: boolean;
  initialVideos?: VideoItem[];
  hideOnlineVideos?: boolean; // 新增：是否隐藏线上视频，只允许上传操作
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  initialVideos: () => [],
  hideOnlineVideos: false
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'confirm': [result: VideoItem | null];
}>();

// 响应式数据
const activeTab = ref<'upload' | 'cut' | 'merge'>('upload');
const videoList = ref<VideoItem[]>([]);
const selectedVideoForCut = ref<VideoItem | null>(null);
const selectedVideosForMerge = ref<VideoItem[]>([]);
const cutResult = ref<CutResult | null>(null);
const mergeResult = ref<MergeResult | null>(null);
const finalResult = ref<VideoItem | null>(null);

// 处理状态
const processingCut = ref(false);
const processingMerge = ref(false);
const loadingMessage = ref('');
// 移除进度条相关的变量

// 视频信息
const cutVideoRef = ref<HTMLVideoElement>();
const fileInput = ref<HTMLInputElement>();
const videoDuration = ref(60);

// 剪切选项
const cutOptions = reactive({
  mode: 'precise' as 'fast' | 'precise' | 'timeline',
  startTime: 0,
  endTime: 10,
  outputFormat: 'mp4' as 'mp4' | 'webm' | 'avi',
  quality: 'medium' as 'high' | 'medium' | 'low'
});

// 拼接选项
const mergeOptions = reactive({
  outputFormat: 'mp4' as 'mp4' | 'webm' | 'avi',
  quality: 'medium' as 'high' | 'medium' | 'low'
});

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

// 监听初始视频列表
watch(() => props.initialVideos, (newVideos) => {
  if (newVideos && newVideos.length > 0 && !props.hideOnlineVideos) {
    // 当hideOnlineVideos为true时，不自动添加线上视频到列表中
    videoList.value = [...newVideos];
  }
}, { immediate: true });

// 方法实现
const handleClose = () => {
  // 停止所有正在播放的视频
  stopAllVideos();
  visible.value = false;
};

const handleConfirm = () => {
  emit('confirm', finalResult.value);
  handleClose();
};

const handleDownloadResult = () => {
  if (!finalResult.value) return;

  const link = document.createElement('a');
  link.href = finalResult.value.url;
  link.download = finalResult.value.title;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载最终结果');
};

// 本地文件选择处理
const openFileSelector = () => {
  fileInput.value?.click();
};

const handleLocalFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) {
    return;
  }

  console.log('✅ 选择本地视频文件:', files.length);

  Array.from(files).forEach((file) => {
    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      MessagePlugin.warning(`文件 ${file.name} 不是视频文件`);
      return;
    }

    // 创建本地URL用于预览
    const url = URL.createObjectURL(file);

    const newVideo: VideoItem = {
      url: url,
      title: file.name,
      file: file // 保存原始文件引用
    };

    videoList.value.push(newVideo);
    MessagePlugin.success(`已添加视频: ${newVideo.title}`);
  });

  // 清空input值，允许重复选择同一文件
  target.value = '';
};

const removeVideo = (index: number) => {
  const video = videoList.value[index];
  videoList.value.splice(index, 1);

  // 清理相关选择
  if (selectedVideoForCut.value === video) {
    selectedVideoForCut.value = null;
  }

  const mergeIndex = selectedVideosForMerge.value.findIndex(v => v === video);
  if (mergeIndex > -1) {
    selectedVideosForMerge.value.splice(mergeIndex, 1);
  }

  MessagePlugin.success('视频已删除');
};

// 剪切相关方法
const selectVideoForCut = (video: VideoItem, index: number) => {
  selectedVideoForCut.value = video;
  activeTab.value = 'cut';

  // 重置剪切选项
  cutOptions.startTime = 0;
  cutOptions.endTime = 10;
};

const clearCutSelection = () => {
  selectedVideoForCut.value = null;
};

const clearCutResult = () => {
  if (cutResult.value?.url) {
    revokeVideoUrl(cutResult.value.url);
  }
  cutResult.value = null;
};

const onVideoMetadataLoaded = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  const duration = video.duration;
  if (duration && !isNaN(duration)) {
    videoDuration.value = duration;
    cutOptions.endTime = Math.min(duration, cutOptions.endTime || duration);
    console.log('📹 视频元数据加载完成，时长:', duration);
  }
};

const executeCutVideo = async () => {
  if (!selectedVideoForCut.value) {
    MessagePlugin.warning('请选择要剪切的视频');
    return;
  }

  if (cutOptions.startTime >= cutOptions.endTime) {
    MessagePlugin.warning('开始时间必须小于结束时间');
    return;
  }

  processingCut.value = true;
  setLoadingState('正在准备视频剪切...');

  try {
    console.log('🎬 开始视频剪切流程', {
      video: selectedVideoForCut.value.title,
      startTime: cutOptions.startTime,
      endTime: cutOptions.endTime,
      mode: cutOptions.mode
    });

    // 清除之前的结果
    clearCutResult();

    let videoFile: File;

    // 获取视频文件
    if (selectedVideoForCut.value.file) {
      videoFile = selectedVideoForCut.value.file;
    } else if (selectedVideoForCut.value.blob) {
      videoFile = new File([selectedVideoForCut.value.blob], 'video.mp4', { type: 'video/mp4' });
    } else {
      // 从URL下载视频文件
      setLoadingState('正在下载视频文件...');
      console.log('📥 下载视频文件:', selectedVideoForCut.value.url);
      const response = await fetch(selectedVideoForCut.value.url);
      const blob = await response.blob();
      videoFile = new File([blob], 'video.mp4', { type: 'video/mp4' });
    }

    setLoadingState('正在剪切视频...');

    let result: string;

    // 根据模式选择剪切方法
    if (cutOptions.mode === 'timeline') {
      console.log('📅 使用时间轴剪切方法');
      const timelineOptions = {
        fastMode: false,
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality === 'high' ? 18 : cutOptions.quality === 'medium' ? 23 : 28
      };

      result = await cutVideoWithTimeline(
        videoFile,
        cutOptions.startTime,
        cutOptions.endTime,
        timelineOptions
      );
    } else {
      console.log('🔧 使用传统FFmpeg剪切方法');
      const ffmpegOptions = {
        keepOriginalCodec: cutOptions.mode === 'fast',
        enableReEncode: cutOptions.mode === 'precise',
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality === 'high' ? 18 : cutOptions.quality === 'medium' ? 23 : 28
      };

      result = await cutVideoWithFFmpeg(
        videoFile,
        {
          startTime: cutOptions.startTime,
          endTime: cutOptions.endTime,
          ...ffmpegOptions
        }
      );
    }

    cutResult.value = {
      url: result,
      title: `${selectedVideoForCut.value.title.replace(/\.(mp4|avi|mov|webm)$/i, '')}.mp4`,
      duration: cutOptions.endTime - cutOptions.startTime
    };

    setLoadingState('剪切完成！');
    console.log('✅ 视频剪切完成:', result);
    MessagePlugin.success('视频剪切完成！');

  } catch (error) {
    console.error('💥 视频剪切失败:', error);
    MessagePlugin.error(`剪切失败: ${(error as Error).message}`);
  } finally {
    processingCut.value = false;
    setLoadingState('');
  }
};

const downloadCutResult = () => {
  if (!cutResult.value) return;

  const link = document.createElement('a');
  link.href = cutResult.value.url;
  link.download = cutResult.value.title;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载剪切结果');
};

const addCutResultToList = () => {
  if (!cutResult.value) return;

  const newVideo: VideoItem = {
    url: cutResult.value.url,
    title: cutResult.value.title
  };

  videoList.value.push(newVideo);
  MessagePlugin.success('剪切结果已添加到视频列表');
  clearCutResult();
};

// 拼接相关方法
const isVideoSelectedForMerge = (index: number): boolean => {
  return selectedVideosForMerge.value.includes(videoList.value[index]);
};

const toggleVideoForMerge = (video: VideoItem, index: number, checked: boolean) => {
  const existingIndex = selectedVideosForMerge.value.findIndex(v => v === video);

  if (checked && existingIndex === -1) {
    selectedVideosForMerge.value.push(video);
  } else if (!checked && existingIndex > -1) {
    selectedVideosForMerge.value.splice(existingIndex, 1);
  }
};

const clearMergeSelection = () => {
  selectedVideosForMerge.value = [];
};

const clearMergeResult = () => {
  if (mergeResult.value?.url) {
    revokeVideoUrl(mergeResult.value.url);
  }
  mergeResult.value = null;
};

const moveVideoUp = (index: number) => {
  if (index > 0) {
    const temp = selectedVideosForMerge.value[index];
    selectedVideosForMerge.value[index] = selectedVideosForMerge.value[index - 1];
    selectedVideosForMerge.value[index - 1] = temp;
  }
};

const moveVideoDown = (index: number) => {
  if (index < selectedVideosForMerge.value.length - 1) {
    const temp = selectedVideosForMerge.value[index];
    selectedVideosForMerge.value[index] = selectedVideosForMerge.value[index + 1];
    selectedVideosForMerge.value[index + 1] = temp;
  }
};

const removeFromMergeSelection = (index: number) => {
  selectedVideosForMerge.value.splice(index, 1);
};

const executeVideoMerge = async () => {
  if (selectedVideosForMerge.value.length < 2) {
    MessagePlugin.warning('请至少选择2个视频进行拼接');
    return;
  }

  processingMerge.value = true;
  setLoadingState('正在准备视频拼接...');

  try {
    // 清除之前的结果
    clearMergeResult();

    console.log('🚀 开始视频拼接流程', {
      videoCount: selectedVideosForMerge.value.length,
      videos: selectedVideosForMerge.value.map(v => v.title)
    });

    // 转换为File对象数组
    const videoFiles: File[] = [];
    setLoadingState('正在下载视频文件...');

    for (const video of selectedVideosForMerge.value) {
      let videoFile: File;

      if (video.file) {
        videoFile = video.file;
      } else if (video.blob) {
        videoFile = new File([video.blob], video.title, { type: 'video/mp4' });
      } else {
        // 从URL下载视频文件
        console.log('📥 下载视频文件:', video.url);
        const response = await fetch(video.url);
        const blob = await response.blob();
        videoFile = new File([blob], video.title, { type: 'video/mp4' });
      }

      videoFiles.push(videoFile);
    }

    setLoadingState('正在拼接视频...');

    const options = {
      outputFormat: mergeOptions.outputFormat,
      videoCodec: 'libx264',
      audioCodec: 'aac',
      videoQuality: mergeOptions.quality === 'high' ? 18 : mergeOptions.quality === 'medium' ? 23 : 28,
      audioQuality: '128k',
      enableCrossfade: false,
      fadeLength: 0,
      resolution: undefined
    };

    const result = await mergeVideosWithFFmpeg(videoFiles, options);

    mergeResult.value = {
      url: result,
      title: `合并视频_${Date.now()}.mp4`,
      duration: 0 // 实际时长可以通过video元素获取
    };

    setLoadingState('拼接完成！');
    console.log('✅ 视频拼接完成:', result);
    MessagePlugin.success('视频拼接完成！');

  } catch (error) {
    console.error('💥 视频拼接失败:', error);
    MessagePlugin.error(`拼接失败: ${(error as Error).message}`);
  } finally {
    processingMerge.value = false;
    setLoadingState('');
  }
};

const downloadMergeResult = () => {
  if (!mergeResult.value) return;

  const link = document.createElement('a');
  link.href = mergeResult.value.url;
  link.download = mergeResult.value.title;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载拼接结果');
};


// 工具方法
const setLoadingState = (message: string) => {
  loadingMessage.value = message;
};

// 停止所有正在播放的视频
const stopAllVideos = () => {
  // 查找并暂停弹窗内所有视频元素
  const videoElements = document.querySelectorAll('.video-editing-dialog video') as NodeListOf<HTMLVideoElement>;
  videoElements.forEach(video => {
    if (!video.paused) {
      video.pause();
      console.log('已暂停视频播放');
    }
  });
};

// 生命周期
onMounted(() => {
  console.log('VideoEditingDialog mounted');
});

onUnmounted(() => {
  // 清理所有blob URL
  videoList.value.forEach(video => {
    if (video.url.startsWith('blob:')) {
      revokeVideoUrl(video.url);
    }
  });

  clearCutResult();
  clearMergeResult();

  if (finalResult.value?.url.startsWith('blob:')) {
    revokeVideoUrl(finalResult.value.url);
  }
});
</script>

<style lang="less" scoped>
.video-editing-dialog {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 20px;

    .tool-tabs {
      display: flex;
      gap: 8px;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
  }

  .content-area {
    min-height: 500px;
    position: relative;
  }

  .upload-section {
    .upload-area {
      margin-bottom: 32px;

      .upload-trigger {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        background: #f9fafb;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .upload-text {
          text-align: center;
          margin-top: 16px;

          p {
            margin: 4px 0;
            font-size: 16px;
            font-weight: 500;
            color: #374151;
          }

          .upload-hint {
            font-size: 14px;
            font-weight: 400;
            color: #6b7280;
          }
        }
      }
    }

    .video-list-section {
      h4 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
        color: #374151;
      }

      .video-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .video-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        background: #ffffff;

        .video-preview {
          .preview-video {
            width: 100%;
            height: 180px;
            object-fit: cover;
          }
        }

        .video-info {
          padding: 12px;

          .video-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
            word-break: break-word;
          }

          .video-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }

  .cut-section,
  .merge-section {

    .cut-tool,
    .merge-tool {
      h4 {
        margin-bottom: 20px;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
      }

      .video-preview-section {
        margin-bottom: 20px;

        .cut-video-preview {
          width: 100%;
          max-height: 400px;
          border-radius: 8px;
        }
      }

      .cut-settings,
      .merge-settings {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;

        .setting-row {
          display: flex;
          align-items: center;
          gap: 12px;

          label {
            min-width: 120px;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }
        }
      }

      .cut-actions,
      .merge-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        justify-content: center;
      }

      .cut-result,
      .merge-result {
        padding: 16px;
        background: #f0f9ff;
        border-radius: 8px;
        border: 1px solid #bae6fd;

        h5 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #0369a1;
        }

        .result-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          justify-content: center;
        }
      }
    }

    .merge-preview {
      margin-bottom: 20px;

      h5 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #374151;
      }

      .merge-sequence {
        .sequence-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 8px;
          border: 1px solid #e5e7eb;

          .sequence-number {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
          }

          .sequence-title {
            flex: 1;
            font-weight: 500;
            color: #374151;
          }

          .sequence-actions {
            display: flex;
            gap: 4px;
          }
        }
      }
    }

    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: #6b7280;

      p {
        margin-top: 16px;
        font-size: 16px;
      }
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .loading-content {
      text-align: center;
      padding: 32px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      min-width: 300px;

      .loading-text {
        margin: 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: #374151;
      }

      .loading-progress {
        margin-top: 16px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

}
</style>
