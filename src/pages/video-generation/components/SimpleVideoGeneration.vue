<!-- 简化版视频生成组件 -->
<template>
  <div class="video-generation-container">
    <div class="step-header">
      <div class="header-icon">
        <t-icon name="video" />
      </div>
      <h3>智能视频生成中</h3>
      <p>正在使用AI技术为您生成高质量的{{ contentType === 'dialogue' ? '对话' : '单词' }}视频内容</p>
    </div>

    <div class="generation-content">
      <!-- 生成状态 -->
      <div class="generation-status-display" v-if="contentType === 'word'">
        <div class="status-header">
          <h4>生成状态</h4>
          <div class="status-badge" :class="generationStatus">
            {{ getStatusText() }}
          </div>
        </div>

        <div class="status-details">
          <div class="detail-item">
            <span class="label">当前步骤：</span>
            <span class="value">{{ currentStep }}</span>
          </div>
          <div class="detail-item" v-if="generationStatus === 'completed'">
            <span class="label">状态：</span>
            <span class="value success">生成完成，可进入下一步</span>
          </div>
        </div>
      </div>

      <!-- 对话视频保留进度条 -->
      <div class="generation-progress" v-else>
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
        </div>
      </div>

      <!-- 生成参数概览 -->
      <div class="generation-summary">
        <h4>生成参数概览</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">内容类型</div>
            <div class="summary-value">{{ contentType === 'dialogue' ? '对话视频' : '单词视频' }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">内容长度</div>
            <div class="summary-value">{{ content.length }} 字符</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">选择音色</div>
            <div class="summary-value">{{ getVoiceName() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">播放倍速</div>
            <div class="summary-value">{{ speed }}x</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">预计时长</div>
            <div class="summary-value">{{ estimatedDuration }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">视频分辨率</div>
            <div class="summary-value">1920x1080</div>
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
          <div class="video-placeholder">
            <div class="success-animation">
              <t-icon name="check-circle" class="success-icon" />
            </div>
            <h4>🎉 视频生成完成！</h4>
            <p class="video-info">您的{{ contentType === 'dialogue' ? '对话' : '单词' }}视频已成功生成</p>
            <div class="video-stats">
              <div class="stat-item">
                <t-icon name="time" />
                <span>{{ estimatedDuration }}</span>
              </div>
              <div class="stat-item">
                <t-icon name="hd" />
                <span>1920x1080</span>
              </div>
              <div class="stat-item">
                <t-icon name="sound" />
                <span>{{ getVoiceName() }}</span>
              </div>
            </div>
          </div>
          <div class="video-actions">
            <t-button theme="primary" @click="downloadVideo">
              <template #icon>
                <t-icon name="download" />
              </template>
              下载视频
            </t-button>
            <t-button theme="default" @click="shareVideo">
              <template #icon>
                <t-icon name="share" />
              </template>
              分享视频
            </t-button>
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
              您的{{ contentType === 'dialogue' ? '对话' : '单词' }}视频已成功生成，可以预览、下载或分享。
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
import { computed, onMounted, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义生成步骤接口
interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

// 定义 props 和 emits
interface Props {
  content: string;
  contentType: 'dialogue' | 'word';
  selectedVoice: string;
  speed: number;
}

interface Emits {
  (e: 'update:videoUrl', value: string): void;
  (e: 'complete'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localVideoUrl = ref('');
const isGenerating = ref(false);
const progressPercentage = ref(0);
const currentStep = ref('准备开始生成');
const generationError = ref('');

// 生成状态
const generationStatus = ref<'pending' | 'processing' | 'completed' | 'failed'>('pending');

// 生成步骤
const generationSteps = ref<GenerationStep[]>([
  {
    id: 'prepare',
    title: '准备素材',
    description: props.contentType === 'dialogue' ? '整理对话内容和音频文件' : '整理单词内容和发音',
    status: 'pending'
  },
  {
    id: 'tts',
    title: 'TTS语音合成',
    description: '将文本转换为高质量语音',
    status: 'pending'
  },
  {
    id: 'scene-design',
    title: '场景设计',
    description: props.contentType === 'dialogue' ? '设计对话场景和人物' : '设计单词学习场景',
    status: 'pending'
  },
  {
    id: 'video-render',
    title: '视频渲染',
    description: '合成最终视频文件',
    status: 'pending'
  },
  {
    id: 'post-process',
    title: '后期处理',
    description: '优化视频质量和添加字幕',
    status: 'pending'
  }
]);

// 计算属性
const progressStatus = computed(() => {
  if (generationError.value) return 'error';
  if (generationStatus.value === 'completed') return 'success';
  if (isGenerating.value) return 'active';
  return 'normal';
});

const estimatedTime = computed(() => {
  if (!isGenerating.value) return '—';
  const remaining = Math.ceil((100 - progressPercentage.value) / 10);
  return `${remaining} 秒`;
});

const estimatedDuration = computed(() => {
  // 根据内容长度和语速估算视频时长
  const baseTime = props.contentType === 'dialogue' ? 2 : 1; // 对话视频基础时间更长
  const contentFactor = Math.ceil(props.content.length / 100);
  const speedFactor = 1 / props.speed;
  const totalMinutes = Math.ceil(baseTime * contentFactor * speedFactor);
  return `约 ${totalMinutes} 分钟`;
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
  return voiceMap[props.selectedVoice] || props.selectedVoice;
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

// 开始视频生成
const startGeneration = async () => {
  if (isGenerating.value || localVideoUrl.value) return;

  try {
    isGenerating.value = true;
    generationStatus.value = 'processing';
    generationError.value = '';
    progressPercentage.value = 0;

    // 逐步执行生成步骤
    for (let i = 0; i < generationSteps.value.length; i++) {
      const step = generationSteps.value[i];

      // 设置当前步骤为处理中
      step.status = 'processing';
      currentStep.value = step.title;

      // 模拟步骤进度
      const stepDuration = 3000; // 每个步骤3秒
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
    }

    // 生成完成
    generationStatus.value = 'completed';
    currentStep.value = '视频生成完成';

    // 生成模拟视频URL
    const mockVideoUrl = `/videos/generated-${props.contentType}-video-${Date.now()}.mp4`;
    localVideoUrl.value = mockVideoUrl;
    emit('update:videoUrl', mockVideoUrl);

    MessagePlugin.success('视频生成完成！');

  } catch (error) {
    console.error('视频生成失败:', error);
    generationError.value = error instanceof Error ? error.message : '生成过程中发生未知错误';
    generationStatus.value = 'failed';
    MessagePlugin.error('视频生成失败');
  } finally {
    isGenerating.value = false;
  }
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

// 下载视频
const downloadVideo = () => {
  MessagePlugin.success('视频下载已开始');
};

// 分享视频
const shareVideo = () => {
  MessagePlugin.success('视频链接已复制到剪贴板');
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
</script>

<style scoped>
.video-generation-container {
  max-width: 900px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.step-header h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.step-header p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.generation-content {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.generation-progress,
.generation-status-display {
  margin-bottom: 32px;
}

.progress-header,
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h4,
.status-header h4 {
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

.progress-details,
.status-details {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.label {
  color: #6b7280;
}

.value {
  color: #374151;
  font-weight: 500;
}

.value.success {
  color: #10b981;
  font-weight: 600;
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

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  background: linear-gradient(135deg, #f0fff4 0%, #ecfdf5 100%);
  border: 2px solid #10b981;
  border-radius: 16px;
  color: #065f46;
  position: relative;
  overflow: hidden;
}

.success-animation {
  margin-bottom: 16px;
}

.success-icon {
  font-size: 64px;
  color: #10b981;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {

  0%,
  20%,
  60%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  80% {
    transform: translateY(-5px);
  }
}

.video-placeholder h4 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #065f46;
}

.video-placeholder p {
  margin: 4px 0 16px 0;
  font-size: 16px;
  color: #047857;
}

.video-info {
  font-size: 16px;
  color: #047857;
}

.video-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #065f46;
}

.stat-item .t-icon {
  font-size: 14px;
}

.video-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
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
    flex-direction: column;
    gap: 8px;
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

  .video-actions {
    flex-direction: column;
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

  .step-header h3 {
    font-size: 20px;
  }
}
</style>
