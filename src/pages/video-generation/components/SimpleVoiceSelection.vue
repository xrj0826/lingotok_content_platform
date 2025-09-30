<!-- 简化版音色选择组件 -->
<template>
  <div class="voice-selection-container">
    <div class="step-header">
      <h3>选择音色</h3>
      <p>为您的{{ contentType === 'dialogue' ? '对话' : '单词' }}视频选择合适的语音音色</p>
    </div>

    <div class="voice-grid">
      <div v-for="voice in voiceOptions" :key="voice.id" class="voice-card"
        :class="{ 'selected': localSelectedVoice === voice.id }" @click="selectVoice(voice.id)">
        <div class="voice-avatar">
          <div class="avatar-placeholder">
            {{ voice.name.charAt(0) }}
          </div>
        </div>

        <div class="voice-info">
          <h4 class="voice-name">{{ voice.name }}</h4>
          <p class="voice-description">{{ voice.description }}</p>

          <div class="voice-tags">
            <t-tag v-for="tag in voice.tags" :key="tag" size="small" theme="light">
              {{ tag }}
            </t-tag>
          </div>
        </div>

        <div class="voice-actions">
          <t-button variant="text" size="small" :loading="playingVoice === voice.id"
            @click.stop="playVoiceSample(voice)">
            <template #icon>
              <t-icon name="play-circle" />
            </template>
            {{ playingVoice === voice.id ? '播放中' : '试听' }}
          </t-button>
        </div>

        <div v-if="localSelectedVoice === voice.id" class="selected-indicator">
          <t-icon name="check-circle-filled" />
        </div>
      </div>
    </div>

    <!-- 选中的音色信息 -->
    <div v-if="selectedVoiceInfo" class="selected-voice-info">
      <div class="info-card">
        <h4>已选择音色</h4>
        <div class="info-content">
          <span class="voice-name">{{ selectedVoiceInfo.name }}</span>
          <span class="voice-desc">{{ selectedVoiceInfo.description }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <t-button theme="default" size="large" @click="handlePrev">
        上一步
      </t-button>
      <t-button theme="primary" size="large" :disabled="!localSelectedVoice" @click="handleNext">
        下一步：选择倍速
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义音色选项接口
interface VoiceOption {
  id: string;
  name: string;
  description: string;
  tags: string[];
  gender: 'male' | 'female';
  language: 'zh' | 'en' | 'mixed';
}

// 定义 props 和 emits
interface Props {
  selectedVoice: string;
  contentType: 'dialogue' | 'word';
}

interface Emits {
  (e: 'update:selectedVoice', value: string): void;
  (e: 'next'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localSelectedVoice = ref(props.selectedVoice);
const playingVoice = ref('');

// 监听 props 变化
watch(() => props.selectedVoice, (newValue) => {
  localSelectedVoice.value = newValue;
});

// 音色选项数据
const voiceOptions: VoiceOption[] = [
  {
    id: 'xiaoxiao',
    name: '晓晓',
    description: '温柔甜美的女声，适合对话和故事朗读',
    tags: ['女声', '温柔', '甜美'],
    gender: 'female',
    language: 'zh'
  },
  {
    id: 'yunyang',
    name: '云扬',
    description: '磁性成熟的男声，适合商务和新闻播报',
    tags: ['男声', '磁性', '成熟'],
    gender: 'male',
    language: 'zh'
  },
  {
    id: 'xiaoyi',
    name: '小艺',
    description: '活泼可爱的女声，适合儿童内容和轻松对话',
    tags: ['女声', '活泼', '可爱'],
    gender: 'female',
    language: 'zh'
  },
  {
    id: 'yunhao',
    name: '云皓',
    description: '清朗有力的男声，适合教学和演讲',
    tags: ['男声', '清朗', '有力'],
    gender: 'male',
    language: 'zh'
  },
  {
    id: 'xiaoran',
    name: '小然',
    description: '知性优雅的女声，适合文学朗读和情感表达',
    tags: ['女声', '知性', '优雅'],
    gender: 'female',
    language: 'zh'
  },
  {
    id: 'yunfeng',
    name: '云峰',
    description: '沉稳大气的男声，适合正式场合和新闻播报',
    tags: ['男声', '沉稳', '大气'],
    gender: 'male',
    language: 'zh'
  }
];

// 计算当前选中的音色信息
const selectedVoiceInfo = computed(() => {
  return voiceOptions.find(voice => voice.id === localSelectedVoice.value);
});

// 选择音色
const selectVoice = (voiceId: string) => {
  localSelectedVoice.value = voiceId;
  emit('update:selectedVoice', voiceId);
};

// 播放音色样本
const playVoiceSample = async (voice: VoiceOption) => {
  if (playingVoice.value) {
    playingVoice.value = '';
    return;
  }

  try {
    playingVoice.value = voice.id;

    // 模拟播放音频
    await new Promise(resolve => setTimeout(resolve, 2000));

    MessagePlugin.success(`${voice.name} 音色试听完成`);
  } catch (error) {
    console.error('播放音频失败:', error);
    MessagePlugin.error('播放失败，请检查网络连接');
  } finally {
    playingVoice.value = '';
  }
};

// 处理上一步
const handlePrev = () => {
  emit('prev');
};

// 处理下一步
const handleNext = () => {
  if (localSelectedVoice.value) {
    emit('next');
  }
};
</script>

<style scoped>
.voice-selection-container {
  max-width: 1000px;
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

.voice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.voice-card {
  position: relative;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.voice-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.voice-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
}

.voice-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  border-radius: 50%;
}

.voice-info {
  text-align: center;
  margin-bottom: 16px;
}

.voice-name {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.voice-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.voice-tags {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.voice-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.selected-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #3b82f6;
  font-size: 24px;
}

.selected-voice-info {
  margin-bottom: 32px;
}

.info-card {
  background: #f0f8ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.info-card h4 {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-content .voice-name {
  color: #3b82f6;
  font-weight: 600;
  font-size: 16px;
  margin: 0;
}

.info-content .voice-desc {
  color: #6b7280;
  font-size: 14px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .voice-selection-container {
    padding: 0 16px;
  }

  .voice-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .voice-card {
    padding: 16px;
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

  .voice-name {
    font-size: 16px;
  }

  .voice-description {
    font-size: 13px;
  }
}
</style>








































































































































