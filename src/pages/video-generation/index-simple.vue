<!-- 视频生成主页面 - 简化版 -->
<template>
  <div class="video-generation-container">
    <div class="main-layout">
      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- 视频类型选择页面 -->
        <div v-if="showTypeSelection" class="type-selection-page">
          <!-- 面包屑导航 - 固定在左上角 -->
          <div class="page-breadcrumb">
            <t-breadcrumb>
              <t-breadcrumb-item>视频生成</t-breadcrumb-item>
              <t-breadcrumb-item>选择类型</t-breadcrumb-item>
            </t-breadcrumb>
          </div>
          
          <!-- 页面主要内容区域 -->
          <div class="selection-content">
            <h1 class="selection-title">选择视频生成类型</h1>

            <div class="type-selection-buttons">
              <div class="button-group">
                <div class="type-button" :class="{ active: selectedType === 'dialogue' }"
                  @click="selectVideoType('dialogue')">
                  <span class="button-text">对话视频</span>
                </div>
                <div class="type-button" :class="{ active: selectedType === 'word' }" @click="selectVideoType('word')">
                  <span class="button-text">单词视频</span>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <t-button theme="primary" :disabled="!selectedType" @click="startVideoCreation">
                开始创建
              </t-button>
            </div>
          </div>
        </div>

        <!-- 生成流程页面 -->
        <div v-else class="generation-flow">
          <t-card class="flow-card" :bordered="false">
            <!-- 返回按钮 -->
            <div class="flow-header">
              <t-button variant="text" @click="backToTypeSelection">
                <template #icon>
                  <t-icon name="chevron-left" />
                </template>
                返回选择类型
              </t-button>
              <h2>{{ getFlowTitle() }}</h2>
            </div>

            <!-- 步骤导航 -->
            <div class="steps-container">
              <t-steps :current="currentStep" :readonly="true" theme="dot">
                <t-step-item title="输入内容" :content="getStepContent(0)"></t-step-item>
                <t-step-item title="选择音色" content="选择语音音色"></t-step-item>
                <t-step-item title="选择倍速" content="设置播放倍速"></t-step-item>
                <t-step-item title="生成视频" content="生成最终视频"></t-step-item>
              </t-steps>
            </div>

            <!-- 步骤内容 -->
            <div class="step-content">
              <!-- 步骤1: 输入内容 -->
              <div v-if="currentStep === 0" class="step-panel">
                <SimpleContentInput v-model:content="formData.content"
                  :content-type="selectedType === 'dialogue' ? 'dialogue' : 'word'" @next="handleNextStep" />
              </div>

              <!-- 步骤2: 选择音色 -->
              <div v-if="currentStep === 1" class="step-panel">
                <SimpleVoiceSelection v-model:selectedVoice="formData.selectedVoice"
                  :content-type="selectedType === 'dialogue' ? 'dialogue' : 'word'" @next="handleNextStep"
                  @prev="handlePrevStep" />
              </div>

              <!-- 步骤3: 选择倍速 -->
              <div v-if="currentStep === 2" class="step-panel">
                <div class="speed-selection-container">
                  <div class="step-header">
                    <h3>选择播放倍速</h3>
                    <p>选择合适的语音播放速度</p>
                  </div>

                  <div class="speed-options">
                    <div class="speed-grid">
                      <div v-for="speed in speedOptions" :key="speed.value" class="speed-card"
                        :class="{ 'selected': formData.speed === speed.value }" @click="selectSpeed(speed.value)">
                        <div class="speed-value">{{ speed.label }}</div>
                        <div class="speed-description">{{ speed.description }}</div>
                        <div v-if="formData.speed === speed.value" class="selected-indicator">
                          <t-icon name="check-circle-filled" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="step-actions">
                    <t-button theme="default" size="large" @click="handlePrevStep">
                      上一步
                    </t-button>
                    <t-button theme="primary" size="large" @click="handleNextStep">
                      下一步：生成视频
                    </t-button>
                  </div>
                </div>
              </div>

              <!-- 步骤4: 生成视频 -->
              <div v-if="currentStep === 3" class="step-panel">
                <SimpleVideoGeneration :content="formData.content"
                  :content-type="selectedType === 'dialogue' ? 'dialogue' : 'word'"
                  :selected-voice="formData.selectedVoice" :speed="formData.speed" v-model:videoUrl="formData.videoUrl"
                  @complete="handleComplete" @prev="handlePrevStep" />
              </div>
            </div>
          </t-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import SimpleContentInput from './components/SimpleContentInput.vue';
import SimpleVoiceSelection from './components/SimpleVoiceSelection.vue';
import SimpleVideoGeneration from './components/SimpleVideoGeneration.vue';

// 定义数据接口
interface VideoGenerationForm {
  content: string;
  selectedVoice: string;
  speed: number;
  videoUrl: string;
}

const router = useRouter();
const showTypeSelection = ref(true);
const selectedType = ref<'dialogue' | 'word' | null>(null);



const currentStep = ref(0);

// 表单数据
const formData = reactive<VideoGenerationForm>({
  content: '',
  selectedVoice: '',
  speed: 1.0,
  videoUrl: ''
});

// 倍速选项
const speedOptions = [
  { value: 0.75, label: '0.75x', description: '慢速播放' },
  { value: 1.0, label: '1.0x', description: '正常速度' },
  { value: 1.25, label: '1.25x', description: '稍快播放' },
  { value: 1.5, label: '1.5x', description: '快速播放' }
];

// 设置导航激活状态


// 选择视频类型
const selectVideoType = (type: 'dialogue' | 'word') => {
  selectedType.value = type;
};





// 开始创建视频
const startVideoCreation = () => {
  if (!selectedType.value) return;

  // 跳转到对应的详细页面
  if (selectedType.value === 'dialogue') {
    router.push('/video-generation/dialogue');
  } else {
    router.push('/video-generation/word');
  }
};



// 返回类型选择页面
const backToTypeSelection = () => {
  showTypeSelection.value = true;
  selectedType.value = null;
  currentStep.value = 0;
  // 重置表单数据
  Object.assign(formData, {
    content: '',
    selectedVoice: '',
    speed: 1.0,
    videoUrl: ''
  });
};

// 获取流程标题
const getFlowTitle = () => {
  return selectedType.value === 'dialogue' ? '对话视频生成' : '单词视频生成';
};

// 获取步骤内容描述
const getStepContent = (step: number) => {
  const contentMap = {
    0: selectedType.value === 'dialogue' ? '输入对话内容' : '输入单词内容'
  };
  return contentMap[step] || '';
};

// 选择倍速
const selectSpeed = (speed: number) => {
  formData.speed = speed;
};

// 处理下一步
const handleNextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

// 处理上一步
const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 处理完成
const handleComplete = () => {
  MessagePlugin.success('视频生成完成！');
  // 跳转到视频列表页面
  router.push('/video-generation/list');
};
</script>

<style scoped>
.video-generation-container {
  min-height: 100vh;
  background: #ffffff;
}

.main-layout {
  min-height: 100vh;
  background: #ffffff;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow: auto;
  background: #ffffff;
}

/* 类型选择页面 */
.type-selection-page {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 80px 0 60px 0;
}

/* 面包屑导航 - 固定在左上角 */
.page-breadcrumb {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
}

/* 页面主要内容区域 - 居中显示 */
.selection-content {
  width: 100%;
  max-width: 600px;
  text-align: center;
  padding: 0 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.selection-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 48px;
  line-height: 1.2;
  text-align: center;
}

.type-selection-buttons {
  margin-bottom: 48px;
  display: flex;
  justify-content: center;
}

.button-group {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: center;
}

.type-button {
  width: 180px;
  height: 80px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.type-button:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.type-button.active {
  border-color: #3b82f6;
  background: #f0f8ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.button-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.type-button.active .button-text {
  color: #3b82f6;
  font-weight: 600;
}

.type-options {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-bottom: 60px;
}

.type-card {
  position: relative;
  width: 280px;
  height: 200px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
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

.card-icon {
  font-size: 32px;
  color: #4A90E2;
  margin-bottom: 12px;
}

.card-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.card-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0 0 12px 0;
  text-align: center;
  padding: 0 8px;
}

.card-features {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.feature-tag {
  background: #f0f8ff;
  color: #2563eb;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.type-card.selected .feature-tag {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #3b82f6;
}

.create-button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.library-button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  transition: all 0.3s ease;
}

.library-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.action-buttons .t-button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-selection-page {
    padding: 60px 0 40px 0;
  }

  .page-breadcrumb {
    top: 16px;
    left: 16px;
  }

  .selection-content {
    padding: 0 16px;
  }

  .selection-title {
    font-size: 20px;
    margin-bottom: 32px;
  }

  .button-group {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .type-button {
    width: 220px;
    height: 70px;
  }

  .button-text {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .type-selection-page {
    padding: 50px 0 30px 0;
  }
}

/* 生成流程页面 */
.generation-flow {
  padding: 24px;
}

.flow-card {
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.flow-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px 24px 0;
}

.flow-header h2 {
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.flow-content {
  padding: 20px 24px 24px;
}

.step-info {
  text-align: center;
}

.step-info h3 {
  color: #333;
  margin-bottom: 16px;
}

.step-info p {
  color: #666;
  margin-bottom: 40px;
}

.demo-steps {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #4A90E2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step-text {
  font-size: 14px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }

  .nav-text {
    display: none;
  }

  .nav-item.active-highlight {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0 10px;
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .sidebar-content {
    flex-direction: row;
    justify-content: center;
    padding: 10px 0;
  }

  .nav-item {
    width: 60px;
    height: 60px;
    margin: 0 5px;
    border-radius: 50%;
  }

  .nav-item.active-highlight {
    width: 80px;
    border-radius: 20px;
  }

  .nav-text {
    display: block;
    font-size: 12px;
  }

  .type-options {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .type-card {
    width: 280px;
  }

  .selection-title {
    font-size: 24px;
  }

  .demo-steps {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .type-selection-page {
    padding: 20px;
  }

  .selection-title {
    font-size: 20px;
    margin-bottom: 40px;
  }

  .type-card {
    width: 100%;
    max-width: 300px;
  }

  .generation-flow {
    padding: 16px;
  }

  .flow-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* 倍速选择样式 */
.speed-selection-container {
  max-width: 800px;
  margin: 0 auto;
}

.speed-options {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
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
}

.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #3b82f6;
  font-size: 20px;
}

.steps-container {
  margin-bottom: 40px;
  padding: 0 20px;
}

.step-content {
  min-height: 400px;
  padding: 20px;
}

.step-panel {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .speed-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .speed-grid {
    grid-template-columns: 1fr;
  }
}
</style>
