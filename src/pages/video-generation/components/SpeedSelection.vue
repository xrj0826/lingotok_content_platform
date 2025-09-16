<!-- 倍速选择步骤组件 -->
<template>
  <div class="speed-selection-container">
    <div class="step-header">
      <h3>选择播放倍速</h3>
      <p>选择合适的语音播放速度，影响最终视频的节奏感</p>
    </div>

    <div class="speed-options">
      <!-- 预设倍速选项 -->
      <div class="preset-speeds">
        <h4 class="section-title">预设倍速</h4>
        <div class="speed-grid">
          <div v-for="preset in presetSpeeds" :key="preset.value" class="speed-card"
            :class="{ 'selected': localSpeed === preset.value }" @click="selectSpeed(preset.value)">
            <div class="speed-value">{{ preset.label }}</div>
            <div class="speed-description">{{ preset.description }}</div>
            <div class="speed-icon">
              <t-icon :name="preset.icon" />
            </div>
            <div v-if="localSpeed === preset.value" class="selected-indicator">
              <t-icon name="check-circle-filled" />
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义倍速 -->
      <div class="custom-speed">
        <h4 class="section-title">自定义倍速</h4>
        <div class="speed-slider-container">
          <div class="slider-wrapper">
            <t-slider v-model="localSpeed" :min="0.5" :max="2.0" :step="0.1" :marks="speedMarks" show-tooltip
              @change="handleSpeedChange" />
          </div>
          <div class="speed-display">
            <span class="current-speed">{{ localSpeed.toFixed(1) }}x</span>
            <span class="speed-note">{{ getSpeedNote(localSpeed) }}</span>
          </div>
        </div>
      </div>

      <!-- 播放预览 -->
      <div class="speed-preview">
        <h4 class="section-title">播放预览</h4>
        <div class="preview-controls">
          <t-button theme="primary" variant="outline" :loading="isPlaying" @click="playPreview">
            <template #icon>
              <t-icon :name="isPlaying ? 'loading' : 'play-circle'" />
            </template>
            {{ isPlaying ? '播放中' : '试听当前倍速' }}
          </t-button>
          <div class="preview-info">
            <p>当前倍速：<strong>{{ localSpeed.toFixed(1) }}x</strong></p>
            <p class="preview-note">{{ getSpeedNote(localSpeed) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 音频播放器（隐藏） -->
    <audio ref="audioPlayer" style="display: none;" @ended="handleAudioEnded" @error="handleAudioError"></audio>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <t-button theme="default" size="large" @click="handlePrev">
        上一步
      </t-button>
      <t-button theme="primary" size="large" @click="handleNext">
        下一步：TTS转换
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义预设倍速选项接口
interface PresetSpeed {
  value: number;
  label: string;
  description: string;
  icon: string;
}

// 定义 props 和 emits
interface Props {
  speed: number;
}

interface Emits {
  (e: 'update:speed', value: number): void;
  (e: 'next'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localSpeed = ref(props.speed);
const isPlaying = ref(false);
const audioPlayer = ref<HTMLAudioElement>();

// 监听 props 变化
watch(() => props.speed, (newValue) => {
  localSpeed.value = newValue;
});

// 预设倍速选项
const presetSpeeds: PresetSpeed[] = [
  {
    value: 0.5,
    label: '0.5x',
    description: '慢速播放，适合学习内容',
    icon: 'play-circle-1'
  },
  {
    value: 1.0,
    label: '1.0x',
    description: '正常速度，自然流畅',
    icon: 'play-circle'
  },
  {
    value: 1.5,
    label: '1.5x',
    description: '快速播放，提升效率',
    icon: 'play-circle-2'
  },
  {
    value: 2.0,
    label: '2x',
    description: '高速播放，快速浏览',
    icon: 'fast-forward'
  }
];

// 滑块标记
const speedMarks = {
  0.5: '0.5x',
  0.75: '0.75x',
  1.0: '1.0x',
  1.25: '1.25x',
  1.5: '1.5x',
  1.75: '1.75x',
  2.0: '2.0x'
};

// 获取倍速说明
const getSpeedNote = (speed: number): string => {
  if (speed < 0.8) return '慢速播放，适合学习和理解复杂内容';
  if (speed < 1.0) return '稍慢播放，保持清晰度';
  if (speed === 1.0) return '正常速度，最自然的播放效果';
  if (speed < 1.3) return '稍快播放，提升观看效率';
  if (speed < 1.6) return '快速播放，适合熟悉内容';
  return '高速播放，快速浏览内容';
};

// 选择倍速
const selectSpeed = (speed: number) => {
  localSpeed.value = speed;
  emit('update:speed', speed);
};

// 处理倍速变化
const handleSpeedChange = (value: number) => {
  emit('update:speed', value);
};

// 播放预览
const playPreview = async () => {
  if (isPlaying.value) {
    audioPlayer.value?.pause();
    isPlaying.value = false;
    return;
  }

  try {
    isPlaying.value = true;

    // 这里应该使用一个示例音频文件
    const sampleUrl = '/samples/speed-preview.mp3';

    if (audioPlayer.value) {
      audioPlayer.value.src = sampleUrl;
      audioPlayer.value.playbackRate = localSpeed.value;
      await audioPlayer.value.play();
    }
  } catch (error) {
    console.error('播放预览失败:', error);
    MessagePlugin.error('播放失败，请检查网络连接');
    isPlaying.value = false;
  }
};

// 处理音频播放结束
const handleAudioEnded = () => {
  isPlaying.value = false;
};

// 处理音频播放错误
const handleAudioError = () => {
  MessagePlugin.error('音频加载失败');
  isPlaying.value = false;
};

// 处理上一步
const handlePrev = () => {
  emit('prev');
};

// 处理下一步
const handleNext = () => {
  emit('next');
};
</script>

<style scoped>
.speed-selection-container {
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

.speed-options {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.section-title {
  color: #374151;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.preset-speeds {
  margin-bottom: 32px;
}

.speed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.speed-card {
  position: relative;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.speed-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.speed-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.speed-value {
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.speed-description {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.speed-icon {
  color: #9ca3af;
  font-size: 20px;
}

.speed-card.selected .speed-icon {
  color: #3b82f6;
}

.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #3b82f6;
  font-size: 20px;
}

.custom-speed {
  margin-bottom: 32px;
}

.speed-slider-container {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.slider-wrapper {
  margin-bottom: 20px;
}

.speed-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-speed {
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.speed-note {
  color: #6b7280;
  font-size: 14px;
}

.speed-preview {
  margin-bottom: 0;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.preview-info p {
  margin: 4px 0;
  color: #4b5563;
  font-size: 14px;
}

.preview-note {
  color: #6b7280 !important;
  font-size: 13px !important;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .speed-selection-container {
    padding: 0 16px;
  }

  .speed-options {
    padding: 16px;
  }

  .speed-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .speed-card {
    padding: 16px;
  }

  .preview-controls {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .speed-display {
    flex-direction: column;
    gap: 8px;
    text-align: center;
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
  .speed-grid {
    grid-template-columns: 1fr;
  }

  .step-header h3 {
    font-size: 20px;
  }

  .speed-value {
    font-size: 20px;
  }
}
</style>

