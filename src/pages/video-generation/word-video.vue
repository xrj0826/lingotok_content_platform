<!-- 单词视频生成页面 -->
<template>
  <div class="word-video-container">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 顶部标题栏 -->
      <div class="content-header">
        <h2>单词视频生成</h2>
        <div class="header-controls">
          <div class="control-group">
            <label>视频合集：</label>
            <t-select v-model="videoCollection" placeholder="选择合集">
              <t-option value="chinese-word" label="中文-单词视频" />
              <t-option value="english-word" label="English-Word Videos" />
              <t-option value="japanese-word" label="日语-単語ビデオ" />
              <t-option value="korean-word" label="한국어-단어 비디오" />
            </t-select>
          </div>
          <div class="control-group">
            <label>视频名称：</label>
            <t-input v-model="videoName" placeholder="视频名称" />
          </div>
        </div>
      </div>

      <!-- 步骤指示器 - 新样式 -->
      <div class="steps-indicator" style="z-index: 999;">
        <div class="custom-steps">
          <div v-for="(step, index) in ['基础信息', '生成图片', '生成视频', '完成']" :key="index" :class="['step-item', {
            'active': currentStepIndex >= index,
            'completed': currentStepIndex > index,
            'current': currentStepIndex === index
          }]">
            <div class="step-circle">{{ index + 1 }}</div>
            <div class="step-label">{{ step }}</div>
            <div v-if="index < 3" class="step-line"></div>
          </div>
        </div>
      </div>

      <!-- 单词输入区域 -->
      <div class="word-input-section">
        <div class="section-header">
          <h3>单词输入框</h3>
        </div>
        <div class="input-content">
          <label>输入想学习的单词：</label>
          <t-input v-model="wordInput" placeholder="单词" size="large" />
        </div>
      </div>

      <!-- 提示词输入区域 -->
      <div class="prompt-input-section">
        <div class="section-header">
          <h3>提示词输入框</h3>
        </div>
        <div class="input-content">
          <label>由单词生成视频的提示词：</label>
          <t-textarea v-model="promptInput" placeholder="提示词" :autosize="{ minRows: 4, maxRows: 8 }" />
        </div>
      </div>

      <!-- 单词图片按钮 -->
      <div class="generate-section">
        <div class="section-header">
          <h3>生成单词图片按钮</h3>
        </div>
        <div class="generate-content">
          <t-button theme="primary" size="large" :loading="isGeneratingImage" @click="generateWordImage">
            生成图片
          </t-button>
          <!-- 下一步操作按钮 -->
          <div v-if="currentAIGCWordId && currentStatus !== null" class="status-section">
            <div v-if="currentStatus === AIGCWordStatus.img_reviewing" class="next-operation">
              <t-button theme="primary" size="small" @click="generateVideo">
                生成视频
              </t-button>
            </div>

            <div v-if="currentStatus === AIGCWordStatus.video_reviewing" class="next-operation">
              <t-button theme="primary" size="small" @click="generateFinalVideo">
                完成并保存
              </t-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片展示区域 -->
      <div class="image-display-section">
        <div class="section-header">
          <h3>图片展示区</h3>
        </div>
        <div class="image-content">
          <div class="image-preview" v-if="generatedImageUrl">
            <img :src="generatedImageUrl" alt="生成的单词图片" />
          </div>
          <div class="no-image" v-else>
            <t-icon name="image" size="48px" />
          </div>
        </div>
      </div>

      <!-- 视频展示区域 -->
      <div class="video-display-section">
        <div class="section-header">
          <h3>视频展示区</h3>
        </div>
        <div class="video-content">
          <div class="video-preview" v-if="generatedVideoUrl">
            <video :src="generatedVideoUrl" controls preload="metadata">
              您的浏览器不支持视频播放
            </video>
          </div>
          <div class="no-video" v-else>
            <t-icon name="video" size="48px" />
          </div>
        </div>
      </div>

      <!-- 保存视频按钮 -->
      <div class="save-section">
        <div class="section-header">
          <h3>保存视频按钮</h3>
        </div>
        <div class="save-content">
          <t-button theme="success" size="large" :loading="isSaving" :disabled="!generatedVideoUrl" @click="saveVideo">
            保存视频
          </t-button>
        </div>
      </div>
    </div>

    <!-- 生成失败弹窗 -->
    <t-dialog v-model:visible="failureDialogVisible" header="生成结果" width="400px" :close-btn="true"
      @close="closeFailureDialog">
      <div class="failure-content">
        <div v-if="generateStatus === 'success'" class="success-message">
          <t-icon name="check-circle" color="#52c41a" size="24px" />
          <span>生成成功！</span>
        </div>
        <div v-else class="failure-message">
          <t-icon name="close-circle" color="#ff4d4f" size="24px" />
          <span>生成失败，重新尝试</span>
        </div>
      </div>
      <template #footer>
        <t-button theme="primary" @click="closeFailureDialog">确定</t-button>
        <t-button v-if="generateStatus === 'failed'" theme="default" @click="retryGeneration">重新尝试</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
import { getVideoCollections, saveWordVideo } from '@/api/video-generation';

// 表单数据
const videoCollection = ref('chinese-word');
const videoName = ref('');
const wordInput = ref('');
const promptInput = ref('');

// 生成状态
const isGeneratingImage = ref(false);
const isSaving = ref(false);
const generateStatus = ref<'success' | 'failed' | null>(null);
const failureDialogVisible = ref(false);

// 步骤管理
const currentStepIndex = ref(0);

// 已移除自动触发逻辑，改为手动操作

// 生成结果
const generatedImageUrl = ref('');
const generatedVideoUrl = ref('');
const currentAIGCWordId = ref('');
const currentStatus = ref<AIGCWordStatus | null>(null);

// 视频合集列表
const videoCollections = ref([]);

// 组件挂载时获取视频合集
onMounted(async () => {
  try {
    const response = await getVideoCollections();
    if (response.code === 0) {
      videoCollections.value = response.data;
    }
  } catch (error) {
    console.error('获取视频合集失败:', error);
  }
});

// 手动检查状态
const checkCurrentStatus = async (isAuto = false) => {
  if (!currentAIGCWordId.value) {
    if (!isAuto) {
      MessagePlugin.warning('请先生成单词视频');
    }
    return;
  }

  try {
    const response = await getAIGCWord(currentAIGCWordId.value);
    const wordData = response.data.aigc_word;
    const oldStatus = currentStatus.value;

    // 调试信息
    console.log('=== word-video 状态检查 ===');
    console.log('获取到的数据:', wordData);
    console.log('旧状态:', oldStatus);
    console.log('新状态:', wordData.status);

    currentStatus.value = wordData.status;

    // 根据状态更新步骤指示器
    switch (wordData.status) {
      case AIGCWordStatus.img_reviewing:
        currentStepIndex.value = 1; // 图片已生成，等待审核
        break;
      case AIGCWordStatus.video_reviewing:
        currentStepIndex.value = 2; // 视频已生成，等待审核
        break;
      case AIGCWordStatus.finished:
        currentStepIndex.value = 3; // 已完成
        break;
      default:
        // 其他状态保持当前步骤
        break;
    }

    if (wordData.ai_gen_img_url) {
      generatedImageUrl.value = wordData.ai_gen_img_url;
      // 特殊处理：如果有图片URL但状态还是生成中，强制设置为完成状态
      if (currentStatus.value === AIGCWordStatus.img_generating) {
        console.log('检测到图片URL存在但状态仍为生成中，强制更新状态为已完成');
        currentStatus.value = AIGCWordStatus.img_reviewing;
        currentStepIndex.value = 1; // 同时更新步骤
      }
    }

    if (wordData.play_url) {
      generatedVideoUrl.value = wordData.play_url;
    }

    // 只在状态发生变化时显示消息
    if (oldStatus !== currentStatus.value) {
      // 根据状态给出提示
      if (currentStatus.value === AIGCWordStatus.img_reviewing && oldStatus !== currentStatus.value) {
        MessagePlugin.success('图片生成完成！');
        stopAutoStatusCheck(); // 停止自动检查，等待用户操作
      } else if (currentStatus.value === AIGCWordStatus.video_reviewing && oldStatus !== currentStatus.value) {
        MessagePlugin.success('视频生成完成！');
        stopAutoStatusCheck(); // 停止自动检查，等待用户操作
      } else if (currentStatus.value === AIGCWordStatus.finished && oldStatus !== currentStatus.value) {
        MessagePlugin.success('视频生成完成！');
        stopAutoStatusCheck(); // 完成后停止自动检查
      } else if (currentStatus.value === AIGCWordStatus.video_process_failed && oldStatus !== currentStatus.value) {
        MessagePlugin.error('视频处理失败，请重试');
        stopAutoStatusCheck(); // 失败后停止自动检查
      }
    }

  } catch (error) {
    console.error('获取状态失败:', error);
    if (!isAuto) {
      MessagePlugin.error('检查状态失败，请重试');
    }
  }
};

// 生成单词图片/视频
const generateWordImage = async () => {
  if (!wordInput.value.trim()) {
    MessagePlugin.warning('请先输入单词');
    return;
  }

  if (!promptInput.value.trim()) {
    MessagePlugin.warning('请输入提示词');
    return;
  }

  if (!videoName.value.trim()) {
    MessagePlugin.warning('请输入视频名称');
    return;
  }

  currentStepIndex.value = 1; // 进入生成图片步骤
  isGeneratingImage.value = true;

  try {
    MessagePlugin.loading('正在创建AIGC单词任务...');

    // 第一步：创建AIGC单词任务
    const createResponse = await createAIGCWord({
      series_name: videoCollection.value,
      title: videoName.value,
      word: wordInput.value
    });

    if (createResponse.code === 200) {
      currentAIGCWordId.value = createResponse.data.aigc_word.id;

      // 生成图片
      const imgResponse = await operateAIGCWordGenImg({
        id: currentAIGCWordId.value,
        word_prompt: promptInput.value
      });

      if (imgResponse.code === 200) {
        MessagePlugin.success('图片生成已开始，将自动检查状态');
        generateStatus.value = 'success';
        // 启动自动状态检查
        startAutoStatusCheck();
      } else {
        MessagePlugin.error(imgResponse.message || '生成失败');
        generateStatus.value = 'failed';
      }
    } else {
      MessagePlugin.error(createResponse.message || '创建失败');
      generateStatus.value = 'failed';
    }


  } catch (error) {
    console.error('生成失败:', error);
    generateStatus.value = 'failed';
    failureDialogVisible.value = true;
    MessagePlugin.error('任务创建失败，请稍后重试');
  } finally {
    isGeneratingImage.value = false;
  }
};

// 生成视频（第二步）
const generateVideo = async () => {
  if (!currentAIGCWordId.value) return;

  currentStepIndex.value = 2; // 进入生成视频步骤

  try {
    MessagePlugin.loading('正在生成视频...');

    await operateAIGCWordGenVideo(currentAIGCWordId.value);

    MessagePlugin.success('视频生成已开始，将自动检查状态');
    // 启动自动状态检查
    startAutoStatusCheck();
  } catch (error) {
    console.error('生成视频失败:', error);
    MessagePlugin.error('生成视频失败，请稍后重试');
  }
};

// 生成最终视频（第三步 - 上传操作）
const generateFinalVideo = async () => {
  if (!currentAIGCWordId.value) return;

  currentStepIndex.value = 3; // 进入完成步骤

  try {
    MessagePlugin.loading('正在上传最终视频...');

    const response = await operateAIGCWordGenFinalVideo(currentAIGCWordId.value);

    if (response.code === 200) {
      // 上传成功，直接设置为完成状态
      currentStatus.value = AIGCWordStatus.finished;

      // 更新视频数据
      const wordData = response.data;
      if (wordData.play_url) {
        generatedVideoUrl.value = wordData.play_url;
      }

      MessagePlugin.success('视频保存成功！视频生成完成');

      // 停止自动检查
      stopAutoStatusCheck();
    } else {
      MessagePlugin.error(response.message || '上传最终视频失败');
    }
  } catch (error) {
    console.error('上传最终视频失败:', error);
    MessagePlugin.error('上传最终视频失败，请稍后重试');
  }
};

// 重新尝试生成
const retryGeneration = () => {
  closeFailureDialog();
  generateWordImage();
};

// 关闭失败弹窗
const closeFailureDialog = () => {
  failureDialogVisible.value = false;
};

// 保存视频
const saveVideo = async () => {
  if (!generatedVideoUrl.value) {
    MessagePlugin.warning('没有可保存的视频');
    return;
  }

  if (!videoName.value.trim()) {
    MessagePlugin.warning('请输入视频名称');
    return;
  }

  isSaving.value = true;

  try {
    MessagePlugin.loading('正在保存视频...');

    const response = await saveWordVideo({
      videoUrl: generatedVideoUrl.value,
      imageUrl: generatedImageUrl.value,
      word: wordInput.value,
      videoCollection: videoCollection.value,
      videoName: videoName.value
    });

    if (response.code === 0) {
      MessagePlugin.success('视频已保存至视频存储展示部分');
      // 重置表单
      resetForm();
    } else {
      MessagePlugin.error(response.message || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    MessagePlugin.error('保存失败，请稍后重试');
  } finally {
    isSaving.value = false;
  }
};

// 自动状态检查定时器
let autoStatusTimer: NodeJS.Timeout | null = null;

// 启动自动状态检查
const startAutoStatusCheck = () => {
  // 清除现有定时器
  if (autoStatusTimer) {
    clearInterval(autoStatusTimer);
  }

  console.log('=== 启动自动状态检查 ===');
  autoStatusTimer = setInterval(async () => {
    try {
      await checkCurrentStatus(true); // 传递 isAuto = true
    } catch (error) {
      console.error('自动状态检查失败:', error);
    }
  }, 4000); // 每4秒检查一次
};

// 停止自动状态检查
const stopAutoStatusCheck = () => {
  if (autoStatusTimer) {
    clearInterval(autoStatusTimer);
    autoStatusTimer = null;
    console.log('=== 停止自动状态检查 ===');
  }
};

// 重置表单
const resetForm = () => {
  wordInput.value = '';
  promptInput.value = '';
  generatedImageUrl.value = '';
  generatedVideoUrl.value = '';
  generateStatus.value = null;
  currentStepIndex.value = 0; // 重置步骤到初始状态
  currentStatus.value = null;
  currentAIGCWordId.value = '';
  stopAutoStatusCheck(); // 重置时停止定时器
};
</script>

<style scoped>
.word-video-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部标题栏 */
.content-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.content-header h2 {
  margin: 0 0 20px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
}

.header-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.naming-examples {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #0ea5e9;
  font-size: 12px;
}

.naming-examples p {
  margin: 2px 0;
  color: #0c4a6e;
}

.naming-examples strong {
  font-weight: 600;
}

/* 通用区域样式 */
.word-input-section,
.prompt-input-section,
.generate-section,
.image-display-section,
.video-display-section,
.save-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* 输入区域 */
.input-content label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
}

.input-tips {
  margin-top: 8px;
  color: #6b7280;
  font-size: 13px;
}

.prompt-examples {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.prompt-examples h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.example-item {
  margin-bottom: 8px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.5;
}

.example-item strong {
  color: #1f2937;
}

/* 生成区域 */
.generate-content {
  text-align: center;
}

.generate-status {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
}

.status-success {
  background: #f0f9ff;
  border: 1px solid #93c5fd;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-failed {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图片展示区域 */
.image-content,
.video-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.video-preview video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.no-image,
.no-video {
  text-align: center;
  color: #9ca3af;
}

.no-image .t-icon,
.no-video .t-icon {
  margin-bottom: 12px;
}

/* 保存区域 */
.save-content {
  text-align: center;
}

/* 弹窗样式 */
.failure-content {
  text-align: center;
  padding: 20px;
}

.success-message,
.failure-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
}

.success-message {
  color: #52c41a;
}

.failure-message {
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .header-controls {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .content-header,
  .word-input-section,
  .prompt-input-section,
  .generate-section,
  .image-display-section,
  .video-display-section,
  .save-section {
    padding: 16px;
  }
}

/* 步骤指示器样式 */
.word-video-container .steps-indicator {
  margin-bottom: 20px !important;
  padding: 20px !important;
  background: white !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  position: relative !important;

  .custom-steps {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    position: relative !important;
    padding: 0 20px !important;

    .step-item {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      position: relative !important;
      flex: 1 !important;

      .step-circle {
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        background: #e5e7eb !important;
        color: #9ca3af !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        margin-bottom: 8px !important;
        transition: all 0.3s ease !important;
        border: 2px solid #e5e7eb !important;
      }

      .step-label {
        font-size: 14px !important;
        color: #6b7280 !important;
        text-align: center !important;
        transition: all 0.3s ease !important;
      }

      .step-line {
        position: absolute !important;
        top: 16px !important;
        left: calc(50% + 20px) !important;
        right: calc(-50% + 20px) !important;
        height: 2px !important;
        background: #e5e7eb !important;
        transition: all 0.3s ease !important;
        z-index: 1 !important;
      }

      &.active {
        .step-circle {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }

        .step-label {
          color: #3b82f6 !important;
          font-weight: 600 !important;
        }
      }

      &.completed {
        .step-line {
          background: #3b82f6 !important;
        }
      }

      &.current {
        .step-circle {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
        }
      }
    }
  }
}
</style>