<template>
  <div class="enhanced-video-cut-panel">
    <t-row :gutter="24">
      <!-- 左侧：文件上传和参数设置 -->
      <t-col :span="6">
        <t-card title="文件选择" :bordered="false" class="settings-card">
          <t-upload v-model="fileList" :max="1" accept="video/*" :auto-upload="false" :show-upload-progress="false"
            @change="handleFileChange">
            <template #file-list-display>
              <div v-if="selectedFile" class="file-info">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
                <!-- 显示视频信息 -->
                <div v-if="videoInfo" class="video-details">
                  <div>分辨率: {{ videoInfo.width }}x{{ videoInfo.height }}</div>
                  <div>帧率: {{ videoInfo.fps }}fps</div>
                  <div>编码: {{ videoInfo.codec }}</div>
                  <div>比特率: {{ formatBitrate(videoInfo.bitrate) }}</div>
                </div>
              </div>
            </template>
          </t-upload>
        </t-card>

        <t-card title="剪切设置" :bordered="false" class="settings-card">
          <t-form :data="cutOptions" label-width="80px">
            <t-form-item label="开始时间" name="startTime">
              <t-input-number v-model="cutOptions.startTime" :min="0" :max="videoDuration" :step="0.1" placeholder="秒"
                style="width: 100%" />
            </t-form-item>
            <t-form-item label="结束时间" name="endTime">
              <t-input-number v-model="cutOptions.endTime" :min="cutOptions.startTime" :max="videoDuration" :step="0.1"
                placeholder="秒" style="width: 100%" />
            </t-form-item>
            <t-form-item label="输出格式" name="outputFormat">
              <t-select v-model="cutOptions.outputFormat" style="width: 100%">
                <t-option value="mp4" label="MP4" />
                <t-option value="webm" label="WebM" />
                <t-option value="avi" label="AVI" />
              </t-select>
            </t-form-item>

            <!-- 新增：智能模式选择 -->
            <t-form-item label="处理模式" name="mode">
              <t-radio-group v-model="cutOptions.mode">
                <t-radio value="fast">快速模式（流复制）</t-radio>
                <t-radio value="precise">精确模式（重编码）</t-radio>
                <t-radio value="timeline">时间轴模式（精确到帧）</t-radio>
                <t-radio value="smart">智能模式（自动选择）</t-radio>
              </t-radio-group>
            </t-form-item>

            <!-- 新增：质量预设 -->
            <t-form-item v-if="cutOptions.mode !== 'fast'" label="质量预设" name="qualityPreset">
              <t-select v-model="cutOptions.qualityPreset" style="width: 100%">
                <t-option value="high" label="高质量（CRF 18）" />
                <t-option value="medium" label="中等质量（CRF 23）" />
                <t-option value="low" label="低质量（CRF 28）" />
                <t-option value="custom" label="自定义" />
              </t-select>
            </t-form-item>

            <t-form-item v-if="cutOptions.qualityPreset === 'custom' && cutOptions.mode !== 'fast'" label="自定义质量"
              name="quality">
              <t-slider v-model="cutOptions.quality" :min="0" :max="51" :step="1"
                :marks="{ 0: '最高', 18: '高', 23: '中', 28: '低', 51: '最低' }" style="width: 100%" />
            </t-form-item>

            <!-- 新增：编码预设 -->
            <t-form-item v-if="cutOptions.mode !== 'fast'" label="编码速度" name="preset">
              <t-select v-model="cutOptions.preset" style="width: 100%">
                <t-option value="ultrafast" label="极快（文件较大）" />
                <t-option value="fast" label="快速（推荐）" />
                <t-option value="medium" label="中等（平衡）" />
                <t-option value="slow" label="慢速（文件较小）" />
              </t-select>
            </t-form-item>
          </t-form>

          <div class="action-buttons">
            <t-button theme="primary" :disabled="!selectedFile || processing" :loading="processing" @click="handleCut"
              block>
              {{ processing ? `${processingStatus} (${Math.round(processingProgress)}%)` : '开始剪切' }}
            </t-button>

            <!-- 新增：取消按钮 -->
            <t-button v-if="processing" theme="default" @click="handleCancel" block style="margin-top: 8px;">
              取消操作
            </t-button>
          </div>
        </t-card>

        <!-- 新增：性能监控 -->
        <t-card title="性能监控" :bordered="false" class="settings-card">
          <div class="performance-info">
            <div>内存使用: {{ memoryUsage.urlCount }} 个URL</div>
            <div>处理历史: {{ processHistory.length }} 次操作</div>
            <div v-if="lastProcessTime">上次处理耗时: {{ lastProcessTime }}ms</div>
          </div>
        </t-card>
      </t-col>

      <!-- 右侧：视频预览和结果 -->
      <t-col :span="18">
        <t-card title="视频预览" :bordered="false">
          <!-- 原视频预览 -->
          <div v-if="selectedFile" class="video-section">
            <h4>原视频</h4>
            <video ref="originalVideoRef" :src="originalVideoUrl" controls class="video-player"
              @loadedmetadata="handleVideoLoaded" />
            <div class="video-info">
              <span>时长: {{ formatTime(videoDuration) }}</span>
              <span>剪切片段: {{ formatTime(cutOptions.startTime) }} - {{ formatTime(cutOptions.endTime) }}</span>
              <span>片段时长: {{ formatTime(cutOptions.endTime - cutOptions.startTime) }}</span>
              <span v-if="videoInfo">原始大小: {{ videoInfo.width }}x{{ videoInfo.height }}</span>
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
              <t-button variant="outline" @click="addToProject">添加到项目</t-button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!selectedFile" class="empty-state">
            <video-icon class="empty-icon" />
            <p>请选择视频文件开始剪切</p>
            <div class="quick-tips">
              <h5>新功能提示：</h5>
              <ul>
                <li>🚀 智能模式自动选择最佳处理方式</li>
                <li>⚡ 快速模式支持实时预览</li>
                <li>🎯 时间轴模式精确到帧级别</li>
                <li>📊 实时性能监控</li>
              </ul>
            </div>
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onUnmounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { VideoIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import { createPlayableVideoUrl, revokeVideoUrl } from '@/utils/videoProcessor';
import {
  optimizedCutVideo,
  getOptimizedVideoInfo,
  memoryManager,
  type OptimizedCutOptions
} from '@/utils/optimizedVideoProcessor';
import {
  enhancedCutVideo,
  smartCutVideo,
  VideoProjectManager,
  performanceMonitor
} from '@/utils/videoProcessorUsageExample';

interface CutOptions {
  startTime: number;
  endTime: number;
  outputFormat: string;
  mode: 'fast' | 'precise' | 'timeline' | 'smart';
  qualityPreset: 'high' | 'medium' | 'low' | 'custom';
  quality: number;
  preset: 'ultrafast' | 'fast' | 'medium' | 'slow';
}

const fileList = ref([]);
const selectedFile = ref<File | null>(null);
const originalVideoUrl = ref('');
const resultVideoUrl = ref('');
const videoDuration = ref(0);
const processing = ref(false);
const processingProgress = ref(0);
const processingStatus = ref('');
const originalVideoRef = ref<HTMLVideoElement>();
const abortController = ref<AbortController | null>(null);

// 新增：视频信息
const videoInfo = ref<any>(null);
const memoryUsage = ref({ urlCount: 0 });
const processHistory = ref<any[]>([]);
const lastProcessTime = ref(0);

// 新增：项目管理器
const projectManager = new VideoProjectManager();

const cutOptions = reactive<CutOptions>({
  startTime: 0,
  endTime: 10,
  outputFormat: 'mp4',
  mode: 'smart',
  qualityPreset: 'medium',
  quality: 23,
  preset: 'fast'
});

// 监听文件变化
const handleFileChange = async (files: any[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0].raw;
    originalVideoUrl.value = createPlayableVideoUrl(files[0].raw);

    try {
      // 获取视频详细信息
      videoInfo.value = await getOptimizedVideoInfo(files[0].raw);
      MessagePlugin.success('视频信息加载完成');
    } catch (error) {
      console.warn('获取视频信息失败:', error);
      videoInfo.value = null;
    }
  } else {
    selectedFile.value = null;
    videoInfo.value = null;
    if (originalVideoUrl.value) {
      revokeVideoUrl(originalVideoUrl.value);
      originalVideoUrl.value = '';
    }
  }
  updateMemoryUsage();
};

// 视频加载完成
const handleVideoLoaded = () => {
  if (originalVideoRef.value) {
    videoDuration.value = originalVideoRef.value.duration;
    cutOptions.endTime = Math.min(10, videoDuration.value);
  }
};

// 监听开始时间变化
watch(() => cutOptions.startTime, (newVal) => {
  if (newVal >= cutOptions.endTime) {
    cutOptions.endTime = Math.min(newVal + 1, videoDuration.value);
  }
});

// 监听质量预设变化
watch(() => cutOptions.qualityPreset, (newVal) => {
  switch (newVal) {
    case 'high':
      cutOptions.quality = 18;
      break;
    case 'medium':
      cutOptions.quality = 23;
      break;
    case 'low':
      cutOptions.quality = 28;
      break;
  }
});

// 执行剪切
const handleCut = async () => {
  if (!selectedFile.value) {
    MessagePlugin.warning('请先选择视频文件');
    return;
  }

  if (cutOptions.startTime >= cutOptions.endTime) {
    MessagePlugin.warning('开始时间必须小于结束时间');
    return;
  }

  try {
    processing.value = true;
    processingProgress.value = 0;
    processingStatus.value = '准备中';

    // 创建取消控制器
    abortController.value = new AbortController();

    // 清除之前的结果
    if (resultVideoUrl.value) {
      revokeVideoUrl(resultVideoUrl.value);
      resultVideoUrl.value = '';
    }

    let result: string;
    const startTime = Date.now();

    // 进度回调
    const onProgress = (progress: number) => {
      processingProgress.value = progress;
      if (progress < 30) {
        processingStatus.value = '初始化';
      } else if (progress < 70) {
        processingStatus.value = '处理中';
      } else {
        processingStatus.value = '生成结果';
      }
    };

    if (cutOptions.mode === 'smart') {
      // 使用智能模式
      result = await smartCutVideo(
        selectedFile.value,
        cutOptions.startTime,
        cutOptions.endTime,
        onProgress
      );
    } else {
      // 使用指定模式
      const options: OptimizedCutOptions = {
        startTime: cutOptions.startTime,
        endTime: cutOptions.endTime,
        mode: cutOptions.mode as any,
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality,
        preset: cutOptions.preset,
        onProgress,
        signal: abortController.value.signal
      };

      result = await optimizedCutVideo(selectedFile.value, options);
    }

    const processTime = Date.now() - startTime;
    lastProcessTime.value = processTime;

    resultVideoUrl.value = result;

    // 记录处理历史
    processHistory.value.unshift({
      timestamp: new Date(),
      mode: cutOptions.mode,
      duration: cutOptions.endTime - cutOptions.startTime,
      processTime,
      fileSize: selectedFile.value.size
    });

    MessagePlugin.success(`视频剪切完成！耗时 ${processTime}ms`);
  } catch (error) {
    console.error('视频剪切失败:', error);
    if (error instanceof Error && error.message.includes('取消')) {
      MessagePlugin.info('操作已取消');
    } else {
      MessagePlugin.error(`剪切失败: ${error}`);
    }
  } finally {
    processing.value = false;
    processingProgress.value = 0;
    processingStatus.value = '';
    abortController.value = null;
    updateMemoryUsage();
  }
};

// 取消操作
const handleCancel = () => {
  if (abortController.value) {
    abortController.value.abort();
    MessagePlugin.info('正在取消操作...');
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

// 清除结果
const clearResult = () => {
  if (resultVideoUrl.value) {
    revokeVideoUrl(resultVideoUrl.value);
    resultVideoUrl.value = '';
    updateMemoryUsage();
  }
};

// 添加到项目
const addToProject = async () => {
  if (resultVideoUrl.value && selectedFile.value) {
    try {
      // 这里可以实现添加到项目的逻辑
      MessagePlugin.success('已添加到项目');
    } catch (error) {
      MessagePlugin.error('添加到项目失败');
    }
  }
};

// 更新内存使用情况
const updateMemoryUsage = () => {
  memoryUsage.value = memoryManager.getMemoryUsage();
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化比特率
const formatBitrate = (bitrate: number): string => {
  if (bitrate < 1000000) {
    return `${Math.round(bitrate / 1000)}kbps`;
  } else {
    return `${(bitrate / 1000000).toFixed(1)}Mbps`;
  }
};

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 组件卸载时清理
onUnmounted(() => {
  projectManager.cleanup();
  if (originalVideoUrl.value) {
    revokeVideoUrl(originalVideoUrl.value);
  }
  if (resultVideoUrl.value) {
    revokeVideoUrl(resultVideoUrl.value);
  }
});

// 定期更新内存使用情况
setInterval(updateMemoryUsage, 5000);
</script>

<style lang="less" scoped>
.enhanced-video-cut-panel {
  .settings-card {
    margin-bottom: 16px;
  }

  .file-info {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;
    margin-top: 8px;

    .file-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .file-size {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }

    .video-details {
      font-size: 12px;
      color: #666;

      div {
        margin-bottom: 2px;
      }
    }
  }

  .performance-info {
    font-size: 12px;
    color: #666;

    div {
      margin-bottom: 4px;
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
      gap: 24px;
      font-size: 14px;
      color: #666;
      flex-wrap: wrap;
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

    .quick-tips {
      margin-top: 24px;
      text-align: left;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;

      h5 {
        color: #333;
        margin-bottom: 12px;
        text-align: center;
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          padding: 4px 0;
          color: #666;
        }
      }
    }
  }
}
</style>





































