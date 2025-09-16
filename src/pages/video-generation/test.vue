<!-- 视频生成页面 -->
<template>
  <div class="video-generation-container">
    <div class="page-header">
      <h1>智能视频生成平台</h1>
      <p>基于AI技术，快速生成高质量的对话和单词学习视频</p>
    </div>

    <div class="type-selection">
      <h2>选择视频类型</h2>

      <div class="type-options">
        <div class="type-card dialogue-card" :class="{ selected: selectedType === 'dialogue' }"
          @click="selectVideoType('dialogue')">
          <div class="card-number">1</div>
          <div class="card-content">
            <h3>对话视频</h3>
          </div>
        </div>

        <div class="type-card word-card" :class="{ selected: selectedType === 'word' }"
          @click="selectVideoType('word')">
          <div class="card-number">2</div>
          <div class="card-content">
            <h3>单词视频</h3>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <t-button theme="primary" size="large" :disabled="!selectedType" @click="startCreation">
          开始创建
        </t-button>
      </div>
    </div>

    <div v-if="selectedType" class="selected-info">
      <div class="info-card">
        <t-icon name="check-circle" class="success-icon" />
        <h4>已选择：{{ selectedType === 'dialogue' ? '对话视频' : '单词视频' }}</h4>
        <p>{{ selectedType === 'dialogue' ? '创建多人对话场景，适用于语言学习和情景模拟' : '制作单词学习视频，提升词汇记忆效果' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

const selectedType = ref<'dialogue' | 'word' | null>(null);

const selectVideoType = (type: 'dialogue' | 'word') => {
  selectedType.value = type;
  console.log('选择了类型:', type);
};

const startCreation = () => {
  if (selectedType.value) {
    MessagePlugin.success(`正在进入${selectedType.value === 'dialogue' ? '对话' : '单词'}视频创建流程`);
    // 这里可以跳转到具体的创建页面
    setTimeout(() => {
      window.location.href = '/video-generation/create';
    }, 1000);
  }
};
</script>

<style scoped>
.video-generation-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
  color: white;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-header p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.type-selection {
  text-align: center;
}

.type-selection {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.type-selection h2 {
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 40px;
}

.type-options {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.type-card {
  position: relative;
  width: 240px;
  height: 120px;
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.type-card:hover {
  border-color: #4A90E2;
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.2);
  transform: translateY(-2px);
}

.type-card.selected {
  border-color: #4A90E2;
  background: #f0f8ff;
}

.card-number {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 30px;
  height: 30px;
  background: #4A90E2;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.card-content h3 {
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  margin: 0;
}

.action-buttons {
  margin-bottom: 40px;
}

.selected-info {
  margin-top: 30px;
}

.info-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
  border: 2px solid #4ade80;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.2);
}

.success-icon {
  font-size: 32px;
  color: #22c55e;
  margin-bottom: 12px;
}

.info-card h4 {
  color: #166534;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.info-card p {
  color: #15803d;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .type-options {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .type-card {
    width: 280px;
  }

  .type-selection h2 {
    font-size: 24px;
  }
}
</style>
