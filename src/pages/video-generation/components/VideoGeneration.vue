<!-- 视频生成步骤组件 -->
<template>
  <div class="video-generation-container">
    <div class="step-header">
      <h3>生成视频</h3>
      <p>正在根据您的内容和设置生成最终视频</p>
    </div>

    <div class="generation-content">
      <!-- 生成进度 -->
      <div class="generation-progress">
        <div class="progress-header">
          <h4>生成进度</h4>
          <div class="status-badge" :class="generationStatus">
            {{ getStatusText() }}
          </div>
        </div>

        <t-progress :percentage="progressPercentage" :status="progressStatus" :show-info="true" size="large" />

        <div class="progress-details">
          <div class="detail-item">
            <span class="label">当前步骤：</span>
            <span class="value">{{ currentStep }}</span>
          </div>
          <div class="detail-item">
            <span class="label">预计剩余时间：</span>
            <span class="value">{{ estimatedTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">生成队列：</span>
            <span class="value">第 {{ queuePosition }} 位</span>
          </div>
        </div>
      </div>

      <!-- 生成参数概览 -->
      <div class="generation-summary">
        <h4>生成参数概览</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">内容类型</div>
            <div class="summary-value">{{ formData.contentType === 'dialogue' ? '对话视频' : '文章视频' }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">内容长度</div>
            <div class="summary-value">{{ formData.content.length }} 字符</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">选择音色</div>
            <div class="summary-value">{{ getVoiceName() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">播放倍速</div>
            <div class="summary-value">{{ formData.speed }}x</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">预计时长</div>
            <div class="summary-value">{{ estimatedDuration }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">视频分辨率</div>
            <div class="summary-value">{{ videoResolution }}</div>
          </div>
        </div>
      </div>

      <!-- 生成步骤详情 -->
      <div class="generation-steps">
        <h4>生成步骤</h4>
        <div class="steps-list">
          <div v-for="(step, index) in generationSteps" :key="step.id" class="step-item" :class="step.status">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div v-if="step.status === 'processing'" class="step-progress">
                <t-progress :percentage="step.progress || 0" size="small" :show-info="false" />
              </div>
            </div>
            <div class="step-status">
              <t-icon :name="getStepIcon(step.status)" :class="step.status" />
            </div>
          </div>
        </div>
      </div>

      <!-- 视频预览 -->
      <div v-if="localVideoUrl" class="video-preview">
        <h4>视频预览</h4>
        <div class="video-player-container">
          <video ref="videoPlayer" :src="localVideoUrl" controls preload="metadata" class="video-player"
            @loadedmetadata="handleVideoLoaded">
            您的浏览器不支持视频播放
          </video>
          <div class="video-info">
            <div class="video-meta">
              <span class="meta-item">格式: MP4</span>
              <span class="meta-item">质量: 高清</span>
              <span class="meta-item" v-if="videoDuration">时长: {{ formatDuration(videoDuration) }}</span>
              <span class="meta-item" v-if="videoSize">大小: {{ formatFileSize(videoSize) }}</span>
            </div>
            <div class="video-actions">
              <t-button variant="text" size="small" @click="downloadVideo">
                <template #icon>
                  <t-icon name="download" />
                </template>
                下载视频
              </t-button>
              <t-button variant="text" size="small" @click="shareVideo">
                <template #icon>
                  <t-icon name="share" />
                </template>
                分享视频
              </t-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="generationError" class="error-message">
        <t-alert theme="error" :close="false">
          <template #icon>
            <t-icon name="error-circle" />
          </template>
          <div class="error-content">
            <div class="error-title">生成失败</div>
            <div class="error-detail">{{ generationError }}</div>
          </div>
        </t-alert>
        <div class="error-actions">
          <t-button theme="primary" @click="retryGeneration">
            重新生成
          </t-button>
          <t-button theme="default" @click="contactSupport">
            联系客服
          </t-button>
        </div>
      </div>

      <!-- 成功信息 -->
      <div v-if="generationStatus === 'completed'" class="success-message">
        <t-alert theme="success" :close="false">
          <template #icon>
            <t-icon name="check-circle" />
          </template>
          <div class="success-content">
            <div class="success-title">视频生成完成！</div>
            <div class="success-detail">
              您的视频已成功生成，可以预览、下载或分享给他人。
            </div>
          </div>
        </t-alert>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <t-button theme="default" size="large" :disabled="isGenerating" @click="handlePrev">
        上一步
      </t-button>
      <t-button v-if="generationStatus !== 'completed'" theme="primary" size="large" :disabled="true">
        生成中...
      </t-button>
      <t-button v-else theme="primary" size="large" @click="handleComplete">
        完成
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义生成步骤接口
interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
}

// 定义表单数据接口
interface VideoGenerationForm {
  content: string;
  contentType: 'dialogue' | 'article';
  selectedVoice: string;
  speed: number;
  audioUrl: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  videoUrl: string;
}

// 定义 props 和 emits
interface Props {
  formData: VideoGenerationForm;
  videoUrl: string;
}

interface Emits {
  (e: 'update:videoUrl', value: string): void;
  (e: 'complete'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localVideoUrl = ref(props.videoUrl);
const isGenerating = ref(false);
const progressPercentage = ref(0);
const currentStep = ref('准备开始生成');
const generationError = ref('');
const videoDuration = ref(0);
const videoSize = ref(0);
const queuePosition = ref(1);
const videoPlayer = ref<HTMLVideoElement>();
const videoResolution = ref('1920x1080');

// 生成状态
const generationStatus = ref<'pending' | 'processing' | 'completed' | 'failed'>('pending');

// 生成步骤
const generationSteps = ref<GenerationStep[]>([
  {
    id: 'prepare',
    title: '准备素材',
    description: '整理文本内容和音频文件',
    status: 'pending',
    estimatedTime: 10
  },
  {
    id: 'scene-design',
    title: '场景设计',
    description: '根据内容类型设计视频场景和布局',
    status: 'pending',
    estimatedTime: 15
  },
  {
    id: 'avatar-generate',
    title: '生成虚拟人像',
    description: '创建对应的虚拟人物形象',
    status: 'pending',
    estimatedTime: 20
  },
  {
    id: 'sync-audio',
    title: '音画同步',
    description: '将语音与人物口型进行同步处理',
    status: 'pending',
    estimatedTime: 25
  },
  {
    id: 'render-video',
    title: '渲染视频',
    description: '合成最终视频文件',
    status: 'pending',
    estimatedTime: 30
  },
  {
    id: 'post-process',
    title: '后期处理',
    description: '优化视频质量和添加字幕',
    status: 'pending',
    estimatedTime: 15
  }
]);

// 定时器
let progressTimer: NodeJS.Timeout | null = null;

// 计算属性
const progressStatus = computed(() => {
  if (generationError.value) return 'error';
  if (generationStatus.value === 'completed') return 'success';
  if (isGenerating.value) return 'active';
  return 'normal';
});

const estimatedTime = computed(() => {
  if (!isGenerating.value) return '—';
  const remaining = generationSteps.value
    .filter(step => step.status === 'pending')
    .reduce((total, step) => total + (step.estimatedTime || 0), 0);
  return remaining > 60 ? `${Math.ceil(remaining / 60)} 分钟` : `${remaining} 秒`;
});

const estimatedDuration = computed(() => {
  // 根据内容长度和语速估算视频时长
  const wordsPerMinute = 150 * props.formData.speed;
  const minutes = Math.ceil(props.formData.content.length / wordsPerMinute * 4);
  return `约 ${minutes} 分钟`;
});

// 获取状态文本
const getStatusText = () => {
  switch (generationStatus.value) {
    case 'pending': return '等待生成';
    case 'processing': return '生成中';
    case 'completed': return '生成完成';
    case 'failed': return '生成失败';
    default: return '未知状态';
  }
};

// 获取音色名称
const getVoiceName = () => {
  const voiceMap: Record<string, string> = {
    'xiaoxiao': '晓晓',
    'yunyang': '云扬',
    'xiaoyi': '小艺',
    'yunhao': '云皓',
    'xiaoran': '小然',
    'yunfeng': '云峰'
  };
  return voiceMap[props.formData.selectedVoice] || props.formData.selectedVoice;
};

// 获取步骤图标
const getStepIcon = (status: string) => {
  switch (status) {
    case 'pending': return 'time';
    case 'processing': return 'loading';
    case 'completed': return 'check-circle';
    case 'failed': return 'error-circle';
    default: return 'time';
  }
};

// 格式化时长
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// 开始视频生成
const startGeneration = async () => {
  if (isGenerating.value || localVideoUrl.value) return;

  try {
    isGenerating.value = true;
    generationStatus.value = 'processing';
    generationError.value = '';
    progressPercentage.value = 0;
    queuePosition.value = Math.floor(Math.random() * 5) + 1;

    // 逐步执行生成步骤
    for (let i = 0; i < generationSteps.value.length; i++) {
      const step = generationSteps.value[i];

      // 设置当前步骤为处理中
      step.status = 'processing';
      currentStep.value = step.title;

      // 模拟步骤进度
      const stepDuration = step.estimatedTime! * 1000;
      const progressInterval = 100;
      const progressStep = 100 / (stepDuration / progressInterval);

      step.progress = 0;

      await new Promise<void>((resolve) => {
        const stepTimer = setInterval(() => {
          if (step.progress! < 100) {
            step.progress = Math.min(step.progress! + progressStep, 100);
          } else {
            clearInterval(stepTimer);
            step.status = 'completed';
            progressPercentage.value = ((i + 1) / generationSteps.value.length) * 100;
            resolve();
          }
        }, progressInterval);
      });

      // 减少队列位置
      if (queuePosition.value > 1) {
        queuePosition.value = Math.max(1, queuePosition.value - 1);
      }
    }

    // 模拟API调用
    await simulateVideoGenerationAPI();

    // 生成完成
    generationStatus.value = 'completed';
    currentStep.value = '视频生成完成';

    // 生成模拟视频URL
    const mockVideoUrl = '/samples/generated-video.mp4';
    localVideoUrl.value = mockVideoUrl;
    emit('update:videoUrl', mockVideoUrl);

    // 模拟视频信息
    videoDuration.value = 120; // 2分钟
    videoSize.value = 15 * 1024 * 1024; // 15MB

    MessagePlugin.success('视频生成完成！');

  } catch (error) {
    console.error('视频生成失败:', error);
    generationError.value = error instanceof Error ? error.message : '生成过程中发生未知错误';
    generationStatus.value = 'failed';
    MessagePlugin.error('视频生成失败');
  } finally {
    isGenerating.value = false;
    queuePosition.value = 0;
  }
};

// 模拟视频生成API调用
const simulateVideoGenerationAPI = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟API成功/失败
      if (Math.random() > 0.05) { // 95%成功率
        resolve('success');
      } else {
        reject(new Error('视频生成服务暂时不可用，请稍后重试'));
      }
    }, 2000);
  });
};

// 重新生成
const retryGeneration = () => {
  generationError.value = '';
  generationStatus.value = 'pending';
  progressPercentage.value = 0;
  localVideoUrl.value = '';
  emit('update:videoUrl', '');

  // 重置所有步骤状态
  generationSteps.value.forEach(step => {
    step.status = 'pending';
    step.progress = 0;
  });

  startGeneration();
};

// 联系客服
const contactSupport = () => {
  MessagePlugin.info('客服功能开发中，请稍后再试');
};

// 下载视频
const downloadVideo = () => {
  if (localVideoUrl.value) {
    const link = document.createElement('a');
    link.href = localVideoUrl.value;
    link.download = `generated-video-${Date.now()}.mp4`;
    link.click();
    MessagePlugin.success('视频下载已开始');
  }
};

// 分享视频
const shareVideo = () => {
  if (navigator.share && localVideoUrl.value) {
    navigator.share({
      title: '我生成的视频',
      text: '看看我用AI生成的视频！',
      url: localVideoUrl.value
    });
  } else {
    // 复制链接到剪贴板
    if (localVideoUrl.value) {
      navigator.clipboard.writeText(localVideoUrl.value);
      MessagePlugin.success('视频链接已复制到剪贴板');
    }
  }
};

// 处理视频加载完成
const handleVideoLoaded = () => {
  if (videoPlayer.value) {
    videoDuration.value = videoPlayer.value.duration;
  }
};

// 处理上一步
const handlePrev = () => {
  emit('prev');
};

// 处理完成
const handleComplete = () => {
  emit('complete');
};

// 组件挂载时开始生成
onMounted(() => {
  if (!localVideoUrl.value) {
    // 延迟开始生成，给用户查看的时间
    setTimeout(() => {
      startGeneration();
    }, 1000);
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (progressTimer) {
    clearTimeout(progressTimer);
  }
});
</script>

<style scoped>
.video-generation-container {
  max-width: 900px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h3 {
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.step-header p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.generation-content {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.generation-progress {
  margin-bottom: 32px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h4 {
  color: #374151;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.processing {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.failed {
  background: #fee2e2;
  color: #dc2626;
}

.progress-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
  font-size: 14px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #6b7280;
}

.value {
  color: #374151;
  font-weight: 500;
}

.generation-summary {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.generation-summary h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 4px;
}

.summary-value {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.generation-steps {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.generation-steps h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.step-item.processing {
  border-color: #3b82f6;
  background: #eff6ff;
}

.step-item.completed {
  border-color: #10b981;
  background: #ecfdf5;
}

.step-item.failed {
  border-color: #ef4444;
  background: #fef2f2;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
  margin-right: 16px;
  flex-shrink: 0;
}

.step-item.processing .step-number {
  background: #3b82f6;
  color: white;
}

.step-item.completed .step-number {
  background: #10b981;
  color: white;
}

.step-item.failed .step-number {
  background: #ef4444;
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
}

.step-description {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

.step-progress {
  margin-top: 8px;
}

.step-status {
  margin-left: 16px;
  font-size: 20px;
}

.step-status.pending {
  color: #6b7280;
}

.step-status.processing {
  color: #3b82f6;
}

.step-status.completed {
  color: #10b981;
}

.step-status.failed {
  color: #ef4444;
}

.video-preview {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.video-preview h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.video-player-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-player {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  background: #000;
}

.video-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  color: #6b7280;
  font-size: 13px;
}

.video-actions {
  display: flex;
  gap: 8px;
}

.error-message,
.success-message {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.error-content,
.success-content {
  margin-bottom: 16px;
}

.error-title,
.success-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.error-title {
  color: #dc2626;
}

.success-title {
  color: #166534;
}

.error-detail,
.success-detail {
  font-size: 14px;
  opacity: 0.9;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-generation-container {
    padding: 0 16px;
  }

  .generation-content {
    padding: 16px;
  }

  .progress-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .progress-details {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .step-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .step-number {
    margin-right: 0;
  }

  .step-status {
    margin-left: 0;
  }

  .video-info {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .video-meta {
    justify-content: center;
  }

  .error-actions {
    flex-direction: column;
  }

  .step-actions {
    flex-direction: column;
    gap: 12px;
  }

  .step-actions .t-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .video-meta {
    flex-direction: column;
    gap: 4px;
  }

  .step-header h3 {
    font-size: 20px;
  }
}
</style>


