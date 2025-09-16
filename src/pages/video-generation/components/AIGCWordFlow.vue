<!-- AIGC单词视频流程组件 -->
<template>
  <div class="aigc-word-flow">
    <!-- 头部信息 -->
    <div class="flow-header">
      <t-button variant="text" @click="handleBack">
        <template #icon>
          <t-icon name="chevron-left" />
        </template>
        返回
      </t-button>
      <h2>单词视频生成</h2>
      <div class="status-info" v-if="currentVideo">
        <span>状态：{{ getWordStatusText(currentVideo.status) }}</span>
      </div>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <t-steps :current="currentStepIndex" theme="dot">
        <t-step-item title="基础信息" />
        <t-step-item title="生成图片" />
        <t-step-item title="生成视频" />
        <t-step-item title="完成" />
      </t-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1: 基础信息输入 -->
      <div v-if="currentStepIndex === 0" class="step-panel">
        <t-card title="基础信息">
          <div class="form-container">
            <t-form :data="formData" :rules="formRules" ref="formRef">
              <t-form-item label="系列名称" name="series_name">
                <t-input v-model="formData.series_name" placeholder="系列名称" />
              </t-form-item>
              <t-form-item label="视频标题" name="title">
                <t-input v-model="formData.title" placeholder="视频标题" />
              </t-form-item>
              <t-form-item label="单词" name="word">
                <t-input v-model="formData.word" placeholder="单词" />
              </t-form-item>
              <t-form-item label="提示词" name="word_prompt">
                <t-textarea v-model="formData.word_prompt" placeholder="提示词" :autosize="{ minRows: 3, maxRows: 6 }" />
              </t-form-item>
            </t-form>
            <div class="step-actions">
              <t-button theme="primary" @click="createWordVideo" :loading="loading">
                创建并生成图片
              </t-button>
            </div>
          </div>
        </t-card>
      </div>

      <!-- 步骤2: 图片生成 -->
      <div v-if="currentStepIndex === 1" class="step-panel">
        <t-card title="AI图片生成">
          <div class="generation-container">
            <div class="generation-info">
              <div class="prompt-display">
                <strong>提示词：</strong>{{ formData.word_prompt }}
              </div>
            </div>

            <div class="image-preview" v-if="currentVideo?.ai_gen_img_url">
              <img :src="currentVideo.ai_gen_img_url" alt="生成的图片" />
            </div>

            <div class="generation-status">
              <!-- 图片生成状态显示 -->
              <div v-if="currentVideo?.status === AIGCWordStatus.img_generating" class="generating-status">
                <t-icon name="loading" style="color: #1890ff; margin-right: 8px;" />
                <span style="color: #1890ff; font-weight: 500;">图片生成中...</span>
              </div>
              <!-- 图片完成状态 -->
              <div v-if="currentVideo?.status === AIGCWordStatus.img_reviewing" class="completion-status">
                <t-icon name="check-circle-filled" style="color: #52c41a; margin-right: 8px;" />
                <span style="color: #52c41a; font-weight: 500;">图片生成完成！</span>
              </div>
            </div>

            <div class="step-actions">
              <t-button v-if="canGenerateVideo" theme="primary" @click="generateVideo" :loading="loading">
                生成视频
              </t-button>
            </div>
          </div>
        </t-card>
      </div>

      <!-- 步骤3: 视频生成 -->
      <div v-if="currentStepIndex === 2" class="step-panel">
        <t-card title="AI视频生成">
          <div class="generation-container">

            <div class="video-preview" v-if="currentVideo?.ai_gen_video_url">
              <video :src="currentVideo.ai_gen_video_url" controls preload="metadata">
                您的浏览器不支持视频播放
              </video>
            </div>

            <div class="generation-status">
              <!-- 视频生成状态显示 -->
              <div v-if="currentVideo?.status === AIGCWordStatus.video_generating" class="generating-status">
                <t-icon name="loading" style="color: #1890ff; margin-right: 8px;" />
                <span style="color: #1890ff; font-weight: 500;">视频生成中...</span>
              </div>
              <!-- 视频完成状态 -->
              <div v-if="currentVideo?.status === AIGCWordStatus.video_reviewing" class="completion-status">
                <t-icon name="check-circle-filled" style="color: #52c41a; margin-right: 8px;" />
                <span style="color: #52c41a; font-weight: 500;">视频生成完成！</span>
              </div>
            </div>

            <div class="step-actions" v-if="canProcessFinal">
              <t-button theme="primary" @click="generateFinalVideo" :loading="loading">
                完成并保存
              </t-button>
            </div>
          </div>
        </t-card>
      </div>

      <!-- 步骤4: 完成 -->
      <div v-if="currentStepIndex === 3" class="step-panel">
        <t-card title="视频生成完成">
          <div class="completion-container">
            <div class="success-icon">
              <t-icon name="check-circle" size="64px" />
            </div>
            <h3>恭喜！单词视频生成完成</h3>
            <div class="video-info">
              <p><strong>标题：</strong>{{ currentVideo?.title || formData.title }}</p>
              <p><strong>单词：</strong>{{ formData.word }}</p>
              <p><strong>状态：</strong>{{ getWordStatusText(currentVideo?.status || AIGCWordStatus.finished) }}</p>
            </div>

            <div class="final-video" v-if="currentVideo?.play_url">
              <video :src="currentVideo.play_url" controls preload="metadata">
                您的浏览器不支持视频播放
              </video>
            </div>

            <div class="completion-actions">
              <t-button theme="primary" @click="viewInLibrary">
                查看视频库
              </t-button>
              <t-button theme="default" @click="createAnother">
                创建新视频
              </t-button>
            </div>
          </div>
        </t-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  createAIGCWord,
  operateAIGCWordGenImg,
  operateAIGCWordGenVideo,
  operateAIGCWordGenFinalVideo,
  getAIGCWord,
  getWordStatusText,
  AIGCWordStatus,
  type AIGCWord
} from '@/api/aigc-video';

// 定义 emits
interface Emits {
  (e: 'completed', video: AIGCWord): void;
  (e: 'back'): void;
}

const emit = defineEmits<Emits>();

// 表单数据
const formData = ref({
  series_name: '',
  title: '',
  word: '',
  word_prompt: ''
});

// 表单验证规则
const formRules = {
  series_name: [{ required: true, message: '必填项' }],
  title: [{ required: true, message: '必填项' }],
  word: [{ required: true, message: '必填项' }],
  word_prompt: [{ required: true, message: '必填项' }]
};

// 状态数据
const loading = ref(false);
const currentVideo = ref<AIGCWord | null>(null);
const videoId = ref<string>('');
const formRef = ref();

// 进度相关数据已移除

// 轮询定时器
let pollingTimer: NodeJS.Timeout | null = null;

// 移除自动触发标志（不再需要）

// 计算属性
const currentStepIndex = computed(() => {
  if (!currentVideo.value) return 0;

  const status = currentVideo.value.status;

  // 调试信息
  console.log('=== currentStepIndex 计算 ===');
  console.log('当前状态:', status);
  console.log('AIGCWordStatus.img_generating:', AIGCWordStatus.img_generating);
  console.log('AIGCWordStatus.img_reviewing:', AIGCWordStatus.img_reviewing);

  // 确保状态有效
  if (!status) {
    console.log('状态为空，返回步骤0');
    return 0;
  }

  if (status === AIGCWordStatus.img_generating || status === AIGCWordStatus.img_reviewing) {
    console.log('返回步骤1（生成图片）');
    return 1;
  }
  if (status === AIGCWordStatus.video_generating || status === AIGCWordStatus.video_reviewing) {
    console.log('返回步骤2（生成视频）');
    return 2;
  }
  if (status === AIGCWordStatus.video_processing || status === AIGCWordStatus.video_process_failed || status === AIGCWordStatus.finished) {
    console.log('返回步骤3（完成）');
    return 3;
  }

  console.log('状态不匹配，返回步骤0');
  return 0;
});

const canGenerateVideo = computed(() => {
  return currentVideo.value?.ai_gen_img_url &&
    (currentVideo.value.status === AIGCWordStatus.img_reviewing ||
      currentVideo.value.status > AIGCWordStatus.img_reviewing);
});

const canProcessFinal = computed(() => {
  return currentVideo.value?.ai_gen_video_url &&
    (currentVideo.value.status === AIGCWordStatus.video_reviewing ||
      currentVideo.value.status > AIGCWordStatus.video_reviewing);
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopPolling();
});

// 创建单词视频
const createWordVideo = async () => {
  try {
    await formRef.value?.validate();

    loading.value = true;
    // 移除自动触发标志重置

    // 创建视频
    const createResponse = await createAIGCWord({
      series_name: formData.value.series_name,
      title: formData.value.title,
      word: formData.value.word
    });

    if (createResponse.code === 200) {
      videoId.value = createResponse.data.aigc_word.id;

      // 生成图片
      const imgResponse = await operateAIGCWordGenImg({
        id: videoId.value,
        word_prompt: formData.value.word_prompt
      });

      if (imgResponse.code === 200) {
        currentVideo.value = imgResponse.data;

        // 调试当前数据
        console.log('=== 图片生成接口响应数据 ===');
        console.log('响应数据:', imgResponse.data);
        console.log('原始状态:', currentVideo.value.status);

        // 强制设置状态为图片生成中
        currentVideo.value.status = AIGCWordStatus.img_generating;

        console.log('设置后状态:', currentVideo.value.status);
        console.log('步骤索引:', currentStepIndex.value);
        console.log('AIGCWordStatus.img_generating 值:', AIGCWordStatus.img_generating);

        MessagePlugin.success('图片生成已开始，停留在生成图片步骤');

        // 启动自动状态检查
        startPolling();
      } else {
        MessagePlugin.error(imgResponse.message || '生成图片失败');
      }
    } else {
      MessagePlugin.error(createResponse.message || '创建视频失败');
    }
  } catch (error) {
    console.error('创建单词视频失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 生成视频
const generateVideo = async () => {
  if (!videoId.value) return;

  loading.value = true;

  try {
    console.log('=== 开始生成视频 ===');
    const response = await operateAIGCWordGenVideo(videoId.value);

    if (response.code === 200) {
      // 确保正确更新状态
      const updatedData = response.data;
      console.log('=== 生成视频接口响应 ===', updatedData);

      // 强制设置状态为视频生成中，确保步骤正确
      if (updatedData) {
        updatedData.status = AIGCWordStatus.video_generating;
      }

      currentVideo.value = updatedData;
      console.log('=== 更新后的视频数据 ===', currentVideo.value);
      console.log('=== 当前步骤索引 ===', currentStepIndex.value);

      MessagePlugin.success('视频生成已开始，请稍后检查状态');

      // 启动自动状态检查
      startPolling();
    } else {
      MessagePlugin.error(response.message || '生成视频失败');
    }
  } catch (error) {
    console.error('生成视频失败:', error);
    MessagePlugin.error('生成视频失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 生成最终视频（上传操作）
const generateFinalVideo = async () => {
  if (!videoId.value) return;

  loading.value = true;

  try {
    console.log('=== 开始上传最终视频 ===');
    const response = await operateAIGCWordGenFinalVideo(videoId.value);

    if (response.code === 200) {
      // 上传成功，直接设置为完成状态
      const updatedData = response.data;
      console.log('=== 最终视频上传成功 ===', updatedData);

      // 设置状态为已完成
      if (updatedData) {
        updatedData.status = AIGCWordStatus.finished;
      }

      currentVideo.value = updatedData;
      console.log('=== 更新后的视频数据 ===', currentVideo.value);
      console.log('=== 当前步骤索引 ===', currentStepIndex.value);

      MessagePlugin.success('视频保存成功！视频生成完成');

      // 无需轮询，直接完成
      stopPolling();
    } else {
      MessagePlugin.error(response.message || '上传最终视频失败');
    }
  } catch (error) {
    console.error('上传最终视频失败:', error);
    MessagePlugin.error('上传最终视频失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 重试最终生成
const retryFinalGeneration = () => {
  generateFinalVideo();
};

// 手动检查状态
const checkStatus = async (isPolling = false) => {
  if (!videoId.value) return;

  if (!isPolling) {
    loading.value = true;
  }

  try {
    const response = await getAIGCWord(videoId.value);
    if (response.code === 200) {
      const newData = response.data.aigc_word;
      const oldStatus = currentVideo.value?.status;

      // 调试信息
      console.log('=== 检查状态接口响应 ===');
      console.log('新数据:', newData);
      console.log('旧状态:', oldStatus);
      console.log('新状态:', newData.status);

      // 确保不丢失关键字段，只更新必要的状态信息
      if (currentVideo.value) {
        // 保持现有数据，只更新状态相关字段
        currentVideo.value = {
          ...currentVideo.value,
          ...newData,
          // 确保状态字段存在且有效
          status: newData.status || currentVideo.value.status || AIGCWordStatus.img_generating
        };
      } else {
        // 如果 currentVideo 为空，直接使用新数据
        currentVideo.value = newData;
      }

      // 特殊处理：如果返回了 ai_gen_img_url 但状态不是 img_reviewing，强制设置为 img_reviewing
      if (currentVideo.value.ai_gen_img_url && currentVideo.value.status === AIGCWordStatus.img_generating) {
        console.log('检测到图片URL存在但状态仍为生成中，强制更新状态为已完成');
        currentVideo.value.status = AIGCWordStatus.img_reviewing;
      }

      // 类似处理视频URL
      if (currentVideo.value.ai_gen_video_url && currentVideo.value.status === AIGCWordStatus.video_generating) {
        console.log('检测到视频URL存在但状态仍为生成中，强制更新状态为已完成');
        currentVideo.value.status = AIGCWordStatus.video_reviewing;
      }

      console.log('更新后视频数据:', currentVideo.value);
      console.log('当前步骤索引:', currentStepIndex.value);

      const newStatus = currentVideo.value.status;

      // 只在非轮询或状态发生变化时显示消息
      if (oldStatus !== newStatus) {
        // 根据状态显示提示
        if (newStatus === AIGCWordStatus.img_reviewing && oldStatus !== newStatus) {
          MessagePlugin.success('图片生成完成！');
          stopPolling(); // 停止轮询，等待用户操作
        } else if (newStatus === AIGCWordStatus.video_reviewing && oldStatus !== newStatus) {
          MessagePlugin.success('视频生成完成！');
          stopPolling(); // 停止轮询，等待用户操作
        } else if (newStatus === AIGCWordStatus.finished && oldStatus !== newStatus) {
          MessagePlugin.success('视频生成完成！');
          stopPolling(); // 完成后停止轮询
        } else if (newStatus === AIGCWordStatus.video_process_failed && oldStatus !== newStatus) {
          MessagePlugin.error('视频处理失败，请重试');
          stopPolling(); // 失败后停止轮询
        }
      }
    } else {
      if (!isPolling) {
        MessagePlugin.error(response.message || '获取状态失败');
      }
    }
  } catch (error) {
    console.error('检查状态失败:', error);
    if (!isPolling) {
      MessagePlugin.error('检查状态失败，请重试');
    }
  } finally {
    if (!isPolling) {
      loading.value = false;
    }
  }
};

// 启动轮询检查状态
const startPolling = () => {
  // 清除现有定时器
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }

  console.log('=== 启动状态轮询 ===');
  pollingTimer = setInterval(async () => {
    try {
      await checkStatus(true); // 传递 isPolling = true
    } catch (error) {
      console.error('轮询检查状态失败:', error);
    }
  }, 4000); // 每4秒检查一次
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
    console.log('=== 停止状态轮询 ===');
  }
};

// 查看视频库
const viewInLibrary = () => {
  // 导航到左侧栏中的视频库页面
  window.location.href = '/video-library/list';
};

// 创建新视频
const createAnother = () => {
  emit('back');
};

// 返回
const handleBack = () => {
  stopPolling();
  emit('back');
};
</script>

<style scoped>
.aigc-word-flow {
  max-width: 1000px;
  margin: 0 auto;
}

.flow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.flow-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.status-info {
  color: #6b7280;
  font-size: 14px;
}

.steps-indicator {
  margin-bottom: 32px;
}

.step-content {
  min-height: 500px;
}

.step-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-container {
  max-width: 600px;
}

.step-actions {
  margin-top: 24px;
  text-align: center;
}

.generation-container {
  text-align: center;
}

.generation-info {
  margin-bottom: 24px;
}

.prompt-display {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  text-align: left;
  margin-top: 16px;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin: 24px 0;
}

.video-preview video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin: 24px 0;
}

.generation-status {
  margin: 24px 0;
}

.generating-status,
.completion-status,
.review-status,
.error-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  margin: 16px 0;
}

.generating-status {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.completion-status {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.review-status {
  background-color: #fff7e6;
  border: 1px solid #ffd591;
  color: #f59e0b;
}

.error-status {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ef4444;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.process-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.completion-container {
  text-align: center;
}

.success-icon {
  color: #10b981;
  margin: 24px 0;
}

.completion-container h3 {
  margin: 16px 0;
  color: #1f2937;
}

.video-info {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin: 24px 0;
  text-align: left;
}

.video-info p {
  margin: 8px 0;
}

.final-video video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin: 24px 0;
}

.completion-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}
</style>
