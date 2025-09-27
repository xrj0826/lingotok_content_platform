<!-- AIGC视频生成管理组件 -->
<template>
  <div class="aigc-video-manager">
    <!-- 视频类型选择 -->
    <div v-if="currentStep === 'select'" class="step-container">
      <h3>选择视频类型</h3>
      <div class="type-selection">
        <t-card class="type-card" :class="{ selected: selectedType === 'word' }" @click="selectType('word')">
          <h4>单词视频</h4>
          <p>单词学习类视频生成</p>
        </t-card>
        <t-card class="type-card" :class="{ selected: selectedType === 'dialog' }" @click="selectType('dialog')">
          <h4>对话视频</h4>
          <p>对话场景类视频生成</p>
        </t-card>
      </div>
      <div class="actions">
        <t-button theme="primary" :disabled="!selectedType" @click="startCreation">
          开始创建
        </t-button>
      </div>
    </div>

    <!-- 单词视频创建流程 -->
    <div v-if="currentStep === 'word-create'" class="step-container">
      <AIGCWordFlow @completed="handleWordCompleted" @back="backToSelection" />
    </div>

    <!-- 对话视频创建流程 -->
    <div v-if="currentStep === 'dialog-create'" class="step-container">
      <AIGCDialogFlow @completed="handleDialogCompleted" @back="backToSelection" />
    </div>

    <!-- 视频列表展示 -->
    <div v-if="currentStep === 'list'" class="step-container">
      <AIGCVideoList @create-new="backToSelection" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import AIGCWordFlow from './AIGCWordFlow.vue';
import AIGCDialogFlow from './AIGCDialogFlow.vue';
import AIGCVideoList from './AIGCVideoList.vue';
import { preloadFFmpeg } from '@/utils/ffmpegCache';

type VideoType = 'word' | 'dialog';
type Step = 'select' | 'word-create' | 'dialog-create' | 'list';

// 接收FFmpeg状态属性
const props = defineProps({
  ffmpegReady: {
    type: Boolean,
    default: false
  }
});

// 状态管理
const currentStep = ref<Step>('select');
const selectedType = ref<VideoType | null>(null);

// 监听组件挂载
watch(() => props.ffmpegReady, (ready) => {
  if (ready) {
    console.log('✅ AIGCVideoManager: FFmpeg已就绪');
  }
}, { immediate: true });

// 选择视频类型
const selectType = (type: VideoType) => {
  selectedType.value = type;
};

// 开始创建
const startCreation = () => {
  if (!selectedType.value) return;

  if (selectedType.value === 'word') {
    currentStep.value = 'word-create';
  } else {
    currentStep.value = 'dialog-create';
  }
};

// 返回选择页面
const backToSelection = () => {
  currentStep.value = 'select';
  selectedType.value = null;
};

// 单词视频完成
const handleWordCompleted = (videoData: any) => {
  MessagePlugin.success('单词视频创建完成！');
  currentStep.value = 'list';
};

// 对话视频完成
const handleDialogCompleted = (videoData: any) => {
  MessagePlugin.success('对话视频创建完成！');
  currentStep.value = 'list';
};
</script>

<style scoped>
.aigc-video-manager {
  min-height: 100vh;
  padding: 20px;
}

.step-container {
  max-width: 1200px;
  margin: 0 auto;
}

.step-container h3 {
  text-align: center;
  margin-bottom: 32px;
  font-size: 24px;
  color: #1f2937;
}

.type-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.type-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
  padding: 32px 24px;
}

.type-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.type-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.type-card h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1f2937;
}

.type-card p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.actions {
  text-align: center;
}
</style>
