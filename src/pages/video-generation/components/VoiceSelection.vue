<!-- 音色选择步骤组件 -->
<template>
  <div class="voice-selection-container">
    <div class="step-header">
      <h3>选择音色</h3>
      <p>选择适合您内容的语音音色</p>
    </div>

    <div class="voice-grid">
      <div v-for="voice in voiceOptions" :key="voice.id" class="voice-card"
        :class="{ 'selected': localSelectedVoice === voice.id }" @click="selectVoice(voice.id)">
        <div class="voice-avatar">
          <img :src="voice.avatar" :alt="voice.name" />
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

    <!-- 音频播放器（隐藏） -->
    <audio ref="audioPlayer" style="display: none;" @ended="handleAudioEnded" @error="handleAudioError"></audio>

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
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义音色选项接口
interface VoiceOption {
  id: string;
  name: string;
  description: string;
  avatar: string;
  tags: string[];
  sampleUrl: string;
  gender: 'male' | 'female';
  language: 'zh' | 'en' | 'mixed';
}

// 定义 props 和 emits
interface Props {
  selectedVoice: string;
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
const audioPlayer = ref<HTMLAudioElement>();

// 监听 props 变化
watch(() => props.selectedVoice, (newValue) => {
  localSelectedVoice.value = newValue;
});

// 音色选项数据
const voiceOptions: VoiceOption[] = [
  {
    id: 'xiaoxiao-2.0',
    name: '晓晓 2.0',
    description: '新一代温柔甜美的女声，适合对话和故事朗读',
    avatar: '/src/assets/avatars/xiaoxiao.jpg',
    tags: ['女声', '温柔', '甜美', '2.0'],
    sampleUrl: '/samples/xiaoxiao-2.0.mp3',
    gender: 'female',
    language: 'zh'
  },
  {
    id: 'common-female',
    name: '通用女声',
    description: '标准的女声朗读音色，适合各种内容',
    avatar: '/src/assets/avatars/common-female.jpg',
    tags: ['女声', '通用', '标准'],
    sampleUrl: '/samples/common-female.mp3',
    gender: 'female',
    language: 'zh'
  },
  {
    id: 'common-male',
    name: '通用男声',
    description: '标准的男声朗读音色，适合各种内容',
    avatar: '/src/assets/avatars/common-male.jpg',
    tags: ['男声', '通用', '标准'],
    sampleUrl: '/samples/common-male.mp3',
    gender: 'male',
    language: 'zh'
  },
  {
    id: 'sunshine-youth',
    name: '阳光青年',
    description: '充满活力的青年男声，适合青春内容',
    avatar: '/src/assets/avatars/sunshine-youth.jpg',
    tags: ['男声', '阳光', '青年'],
    sampleUrl: '/samples/sunshine-youth.mp3',
    gender: 'male',
    language: 'zh'
  },
  {
    id: 'kind-female',
    name: '亲切女声',
    description: '温暖亲切的女声，让人感到舒适',
    avatar: '/src/assets/avatars/kind-female.jpg',
    tags: ['女声', '亲切', '温暖'],
    sampleUrl: '/samples/kind-female.mp3',
    gender: 'female',
    language: 'zh'
  },
  {
    id: 'sunshine-male',
    name: '阳光男声',
    description: '开朗阳光的男声，充满正能量',
    avatar: '/src/assets/avatars/sunshine-male.jpg',
    tags: ['男声', '阳光', '开朗'],
    sampleUrl: '/samples/sunshine-male.mp3',
    gender: 'male',
    language: 'zh'
  },
  {
    id: 'lively-female',
    name: '活泼女声',
    description: '活泼可爱的女声，适合轻松愉快的内容',
    avatar: '/src/assets/avatars/lively-female.jpg',
    tags: ['女声', '活泼', '可爱'],
    sampleUrl: '/samples/lively-female.mp3',
    gender: 'female',
    language: 'zh'
  }
];

// 选择音色
const selectVoice = (voiceId: string) => {
  localSelectedVoice.value = voiceId;
  emit('update:selectedVoice', voiceId);
};

// 播放音色样本
const playVoiceSample = async (voice: VoiceOption) => {
  if (playingVoice.value) {
    // 如果正在播放，先停止
    audioPlayer.value?.pause();
    playingVoice.value = '';
  }

  try {
    playingVoice.value = voice.id;

    if (audioPlayer.value) {
      audioPlayer.value.src = voice.sampleUrl;
      await audioPlayer.value.play();
    }
  } catch (error) {
    console.error('播放音频失败:', error);
    MessagePlugin.error('播放失败，请检查网络连接');
    playingVoice.value = '';
  }
};

// 处理音频播放结束
const handleAudioEnded = () => {
  playingVoice.value = '';
};

// 处理音频播放错误
const handleAudioError = () => {
  MessagePlugin.error('音频加载失败');
  playingVoice.value = '';
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
  margin-bottom: 40px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.voice-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.selected-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #3b82f6;
  font-size: 24px;
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

