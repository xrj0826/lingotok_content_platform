<!-- TTS转换步骤组件 -->
<template>
  <div class="tts-conversion-container">
    <div class="step-header">
      <h3>TTS语音转换</h3>
      <p>正在将您的文本内容转换为语音文件</p>
    </div>

    <div class="conversion-content">
      <!-- 转换进度 -->
      <div class="conversion-progress">
        <div class="progress-header">
          <h4>转换进度</h4>
          <div class="status-badge" :class="conversionStatus">
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

      <!-- 转换参数显示 -->
      <div class="conversion-params">
        <h4>转换参数</h4>
        <div class="params-grid">
          <div class="param-item">
            <span class="param-label">内容长度：</span>
            <span class="param-value">{{ content.length }} 字符</span>
          </div>
          <div class="param-item">
            <span class="param-label">选择音色：</span>
            <span class="param-value">{{ getVoiceName() }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">播放倍速：</span>
            <span class="param-value">{{ speed }}x</span>
          </div>
          <div class="param-item">
            <span class="param-label">预计时长：</span>
            <span class="param-value">{{ estimatedDuration }}</span>
          </div>
        </div>
      </div>

      <!-- 音频预览 -->
      <div v-if="localAudioUrl" class="audio-preview">
        <h4>音频预览</h4>
        <div class="audio-player-container">
          <audio ref="audioPlayer" :src="localAudioUrl" controls preload="metadata" class="audio-player">
            您的浏览器不支持音频播放
          </audio>
          <div class="audio-info">
            <div class="audio-meta">
              <span class="meta-item">格式: MP3</span>
              <span class="meta-item">质量: 高清</span>
              <span class="meta-item" v-if="audioDuration">时长: {{ formatDuration(audioDuration) }}</span>
            </div>
            <div class="audio-actions">
              <t-button variant="text" size="small" @click="downloadAudio">
                <template #icon>
                  <t-icon name="download" />
                </template>
                下载音频
              </t-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="conversionError" class="error-message">
        <t-alert theme="error" :close="false">
          <template #icon>
            <t-icon name="error-circle" />
          </template>
          <div class="error-content">
            <div class="error-title">转换失败</div>
            <div class="error-detail">{{ conversionError }}</div>
          </div>
        </t-alert>
        <div class="error-actions">
          <t-button theme="primary" @click="retryConversion">
            重新转换
          </t-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <t-button theme="default" size="large" :disabled="isConverting" @click="handlePrev">
        上一步
      </t-button>
      <t-button theme="primary" size="large" :disabled="!localAudioUrl || isConverting" @click="handleNext">
        下一步：内容审核
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义 props 和 emits
interface Props {
  content: string;
  voice: string;
  speed: number;
  audioUrl: string;
}

interface Emits {
  (e: 'update:audioUrl', value: string): void;
  (e: 'next'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localAudioUrl = ref(props.audioUrl);
const isConverting = ref(false);
const progressPercentage = ref(0);
const currentStep = ref('准备开始');
const conversionError = ref('');
const audioDuration = ref(0);
const audioPlayer = ref<HTMLAudioElement>();

// 转换步骤
const conversionSteps = [
  { step: '文本预处理', duration: 2000 },
  { step: '语音合成中', duration: 5000 },
  { step: '音频优化', duration: 2000 },
  { step: '质量检测', duration: 1000 },
  { step: '转换完成', duration: 500 }
];

// 定时器
let progressTimer: NodeJS.Timeout | null = null;

// 监听 props 变化
watch(() => props.audioUrl, (newValue) => {
  localAudioUrl.value = newValue;
});

// 计算属性
const conversionStatus = computed(() => {
  if (conversionError.value) return 'error';
  if (isConverting.value) return 'processing';
  if (localAudioUrl.value) return 'completed';
  return 'pending';
});

const progressStatus = computed(() => {
  if (conversionError.value) return 'error';
  if (progressPercentage.value === 100) return 'success';
  if (isConverting.value) return 'active';
  return 'normal';
});

const estimatedTime = computed(() => {
  if (!isConverting.value) return '—';
  const remaining = Math.ceil((100 - progressPercentage.value) / 10);
  return `${remaining} 秒`;
});

const estimatedDuration = computed(() => {
  // 根据内容长度和语速估算音频时长
  const wordsPerMinute = 150 * props.speed;
  const minutes = Math.ceil(props.content.length / wordsPerMinute * 4);
  return `约 ${minutes} 分钟`;
});

// 获取状态文本
const getStatusText = () => {
  switch (conversionStatus.value) {
    case 'pending': return '等待转换';
    case 'processing': return '转换中';
    case 'completed': return '转换完成';
    case 'error': return '转换失败';
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
  return voiceMap[props.voice] || props.voice;
};

// 格式化时长
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 开始TTS转换
const startConversion = async () => {
  if (isConverting.value || localAudioUrl.value) return;

  try {
    isConverting.value = true;
    conversionError.value = '';
    progressPercentage.value = 0;

    // 模拟转换过程
    let currentStepIndex = 0;
    let totalProgress = 0;

    for (const step of conversionSteps) {
      currentStep.value = step.step;

      // 模拟步骤进度
      const stepProgress = 100 / conversionSteps.length;
      const startProgress = totalProgress;

      await new Promise<void>((resolve) => {
        const stepTimer = setInterval(() => {
          progressPercentage.value = Math.min(
            startProgress + stepProgress * Math.random(),
            startProgress + stepProgress * 0.9
          );
        }, 200);

        setTimeout(() => {
          clearInterval(stepTimer);
          totalProgress += stepProgress;
          progressPercentage.value = totalProgress;
          resolve();
        }, step.duration);
      });

      currentStepIndex++;
    }

    // 模拟API调用
    await simulateTTSAPI();

    progressPercentage.value = 100;
    currentStep.value = '转换完成';

    // 生成模拟音频URL
    const mockAudioUrl = '/samples/generated-audio.mp3';
    localAudioUrl.value = mockAudioUrl;
    emit('update:audioUrl', mockAudioUrl);

    MessagePlugin.success('语音转换完成！');

  } catch (error) {
    console.error('TTS转换失败:', error);
    conversionError.value = error instanceof Error ? error.message : '转换过程中发生未知错误';
    MessagePlugin.error('语音转换失败');
  } finally {
    isConverting.value = false;
  }
};

// 模拟TTS API调用
const simulateTTSAPI = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟API成功/失败
      if (Math.random() > 0.1) { // 90%成功率
        resolve('success');
      } else {
        reject(new Error('TTS服务暂时不可用，请稍后重试'));
      }
    }, 1000);
  });
};

// 重新转换
const retryConversion = () => {
  conversionError.value = '';
  progressPercentage.value = 0;
  localAudioUrl.value = '';
  emit('update:audioUrl', '');
  startConversion();
};

// 下载音频
const downloadAudio = () => {
  if (localAudioUrl.value) {
    const link = document.createElement('a');
    link.href = localAudioUrl.value;
    link.download = `generated-audio-${Date.now()}.mp3`;
    link.click();
  }
};

// 处理音频加载完成
const handleAudioLoaded = () => {
  if (audioPlayer.value) {
    audioDuration.value = audioPlayer.value.duration;
  }
};

// 处理上一步
const handlePrev = () => {
  emit('prev');
};

// 处理下一步
const handleNext = () => {
  if (localAudioUrl.value) {
    emit('next');
  }
};

// 组件挂载时开始转换
onMounted(() => {
  if (!localAudioUrl.value && props.content && props.voice) {
    startConversion();
  }

  // 监听音频加载完成
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('loadedmetadata', handleAudioLoaded);
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
.tts-conversion-container {
  max-width: 800px;
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

.conversion-content {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.conversion-progress {
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

.status-badge.error {
  background: #fee2e2;
  color: #dc2626;
}

.progress-details {
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

.conversion-params {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.conversion-params h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.param-label {
  color: #6b7280;
  font-size: 14px;
}

.param-value {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.audio-preview {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.audio-preview h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.audio-player-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audio-player {
  width: 100%;
  height: 40px;
}

.audio-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.audio-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  color: #6b7280;
  font-size: 13px;
}

.error-message {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #fecaca;
}

.error-content {
  margin-bottom: 16px;
}

.error-title {
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 4px;
}

.error-detail {
  color: #7f1d1d;
  font-size: 14px;
}

.error-actions {
  display: flex;
  justify-content: center;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tts-conversion-container {
    padding: 0 16px;
  }

  .conversion-content {
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

  .params-grid {
    grid-template-columns: 1fr;
  }

  .audio-info {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .audio-meta {
    justify-content: center;
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
  .step-header h3 {
    font-size: 20px;
  }

  .audio-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>


