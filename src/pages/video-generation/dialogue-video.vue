<!-- 对话视频生成页面 -->
<template>
  <div class="dialogue-video-container">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 顶部标题栏和步骤导航 -->
      <div class="page-header">
        <h2>对话视频生成</h2>

        <!-- 步骤条 -->
        <div class="step-progress">
          <div v-for="(step, index) in steps" :key="index"
            :class="['step-item', { active: currentStep >= index, completed: currentStep > index }]"
            @click="navigateToStep(index)">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>
      </div>

      <!-- 基础信息配置 -->
      <div class="basic-info-section">
        <div class="section-header">
          <h3>基础信息配置</h3>
          <p class="section-description">设置视频基本信息和场景描述</p>
        </div>
        <div class="header-controls">
          <div class="control-group">
            <label>视频所属合集：</label>
            <t-select v-model="videoCollection" placeholder="选择合集">
              <t-option value="chinese-dialogue" label="中文-对话视频" />
              <t-option value="chinese-single-word" label="中文-单词视频" />
              <t-option value="english-dialogue" label="English-Dialogue Videos" />
              <t-option value="english-single-word" label="English-Single Word Videos" />
            </t-select>
          </div>
          <div class="control-group">
            <label>视频名称：</label>
            <t-input v-model="videoName" placeholder="第4课-坐火车没有坐飞机快" />
            <div class="naming-examples">
              <p><strong>命名示例：</strong></p>
              <p>第4课-坐火车没有坐飞机快</p>
              <p>第4课-飞机</p>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="generate-section">
          <t-button theme="primary" size="large" :loading="isGeneratingFullScene" @click="generateFullVideo">
            下一步：生成图片
          </t-button>
        </div>
      </div>

      <!-- 图片预览区域 -->
      <div class="image-preview-section">
        <div class="section-header">
          <h3>图片预览区域</h3>
        </div>
        <div class="image-cards-container">
          <!-- 第一个图片 -->
          <div class="image-card">
            <ImageUpload v-model="imageUrls[0]" width="160px" height="120px" @upload-success="handleImageUpload" />
            <div class="image-actions">
              <t-button size="small" theme="primary" :loading="isGeneratingScene"
                @click="generateAIScene">生成AI场景</t-button>
            </div>
          </div>

          <!-- 第二个图片 -->
          <div class="image-card">
            <ImageUpload v-model="imageUrls[1]" width="160px" height="120px" @upload-success="handleImageUpload" />
            <div class="image-actions">
              <t-button size="small" theme="primary" :loading="isGeneratingScene"
                @click="generateAIScene">生成AI场景</t-button>
            </div>
          </div>

          <!-- 第三个图片 -->
          <div class="image-card">
            <ImageUpload v-model="imageUrls[2]" width="160px" height="120px" @upload-success="handleImageUpload" />
            <div class="image-actions">
              <t-button size="small" theme="primary" :loading="isGeneratingScene"
                @click="generateAIScene">生成AI场景</t-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话内容配置 -->
      <div class="dialogue-config-section">
        <div class="section-header">
          <h3>对话内容配置</h3>
        </div>
        <!-- 场景Prompt -->
        <div class="config-row">
          <div class="config-label">
            <label>场景Prompt：</label>
          </div>
          <div class="config-content">
            <t-textarea v-model="scenePrompt" placeholder="输入相关文字：对话学生场景，环境，人物"
              :autosize="{ minRows: 3, maxRows: 6 }" />
          </div>
        </div>

        <!-- 角色A配置 -->
        <div class="config-row">
          <div class="config-label">
            <label>角色A-1：</label>
          </div>
          <div class="config-content">
            <t-input v-model="roleA1" placeholder="输入相关文字：对话内容" />
          </div>
        </div>

        <div class="config-row">
          <div class="config-label">
            <label>角色A-2：</label>
          </div>
          <div class="config-content">
            <t-input v-model="roleA2" placeholder="" />
          </div>
        </div>

        <!-- 音色选择和参数 -->
        <div class="config-row">
          <div class="config-label">
            <label>音色选择：</label>
          </div>
          <div class="config-content voice-config">
            <t-select v-model="voiceType" placeholder="灿灿 2.0">
              <t-option value="BV700_V2_streaming" label="灿灿 2.0" />
              <t-option value="BV001_streaming" label="通用女声" />
              <t-option value="BV002_streaming" label="通用男声" />
              <t-option value="BV123_streaming" label="阳光青年" />
              <t-option value="BV007_streaming" label="亲切女声" />
              <t-option value="BV056_streaming" label="阳光男声" />
              <t-option value="BV005_streaming" label="活泼女声" />
            </t-select>
            <div class="voice-params">
              <label>倍速：</label>
              <t-select v-model="voiceSpeed" placeholder="1.0x">
                <t-option :value="0.5" label="0.5x" />
                <t-option :value="1.0" label="1.0x" />
                <t-option :value="1.5" label="1.5x" />
                <t-option :value="2.0" label="2x" />
              </t-select>
              <t-button size="small" @click="testVoice">试听</t-button>
            </div>
          </div>
        </div>

        <!-- 角色B配置 -->
        <div class="config-row">
          <div class="config-label">
            <label>角色B-1：</label>
          </div>
          <div class="config-content">
            <t-input v-model="roleB1" placeholder="输入相关文字：对话内容" />
          </div>
        </div>

        <div class="config-row">
          <div class="config-label">
            <label>角色B-2：</label>
          </div>
          <div class="config-content">
            <t-input v-model="roleB2" placeholder="" />
          </div>
        </div>

        <!-- 角色B音色选择 -->
        <div class="config-row">
          <div class="config-label">
            <label>音色选择：</label>
          </div>
          <div class="config-content voice-config">
            <t-select v-model="voiceTypeB" placeholder="通用男声">
              <t-option value="BV700_V2_streaming" label="灿灿 2.0" />
              <t-option value="BV001_streaming" label="通用女声" />
              <t-option value="BV002_streaming" label="通用男声" />
              <t-option value="BV123_streaming" label="阳光青年" />
              <t-option value="BV007_streaming" label="亲切女声" />
              <t-option value="BV056_streaming" label="阳光男声" />
              <t-option value="BV005_streaming" label="活泼女声" />
            </t-select>
            <div class="voice-params">
              <label>倍速：</label>
              <t-select v-model="voiceSpeedB" placeholder="1.0x">
                <t-option :value="0.5" label="0.5x" />
                <t-option :value="1.0" label="1.0x" />
                <t-option :value="1.5" label="1.5x" />
                <t-option :value="2.0" label="2x" />
              </t-select>
              <t-button size="small" @click="testVoiceB">试听</t-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频生成结果展示区域 -->
      <div class="video-results-section">
        <!-- 加载状态显示 -->
        <div v-if="isLoadingVideos" class="loading-status">
          <div class="loading-indicator">
            <t-loading size="large" />
            <div class="loading-text">{{ loadingMessage }}</div>
            <div class="loading-progress">
              <t-progress :percentage="loadingProgress" :show-info="true" />
            </div>
          </div>
        </div>

        <!-- 角色A视频列表 -->
        <div v-if="roleAVideos.length > 0 || generatingRoleAVideos" class="role-video-section">
          <div class="section-header">
            <h3>角色A视频列表</h3>
            <div class="section-actions">
              <t-button v-if="roleAVideos.length > 0" size="small" theme="primary" @click="selectAllRoleAVideos">
                全选角色A视频
              </t-button>
            </div>
          </div>

          <div class="video-list">
            <div v-if="generatingRoleAVideos && roleAVideos.length === 0" class="generating-state">
              <t-loading size="medium" />
              <p>正在生成角色A视频...</p>
            </div>

            <div v-for="(video, index) in roleAVideos" :key="`roleA-${index}`" class="video-item">
              <div class="video-preview">
                <video :src="video.url" controls class="video-player" />
              </div>
              <div class="video-info">
                <div class="video-title">{{ video.title || `角色A视频 ${index + 1}` }}</div>
                <div class="video-content">{{ video.content }}</div>
                <div class="video-actions">
                  <t-button size="small" @click="selectVideoForEdit('A', video, index)">
                    <template #icon><edit-icon /></template>
                    编辑
                  </t-button>
                  <t-button size="small" variant="outline" @click="downloadVideo(video)">
                    <template #icon><download-icon /></template>
                    下载
                  </t-button>
                  <t-button size="small" variant="outline"
                    :class="{ 'selected': selectedVideosForMerge.some(v => v.id === `A-${index}`) }"
                    @click="toggleVideoSelection('A', video, index)">
                    {{selectedVideosForMerge.some(v => v.id === `A-${index}`) ? '已选' : '选择'}}
                  </t-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 角色B视频列表 -->
        <div v-if="roleBVideos.length > 0 || generatingRoleBVideos" class="role-video-section">
          <div class="section-header">
            <h3>角色B视频列表</h3>
            <div class="section-actions">
              <t-button v-if="roleBVideos.length > 0" size="small" theme="primary" @click="selectAllRoleBVideos">
                全选角色B视频
              </t-button>
            </div>
          </div>

          <div class="video-list">
            <div v-if="generatingRoleBVideos && roleBVideos.length === 0" class="generating-state">
              <t-loading size="medium" />
              <p>正在生成角色B视频...</p>
            </div>

            <div v-for="(video, index) in roleBVideos" :key="`roleB-${index}`" class="video-item">
              <div class="video-preview">
                <video :src="video.url" controls class="video-player" />
              </div>
              <div class="video-info">
                <div class="video-title">{{ video.title || `角色B视频 ${index + 1}` }}</div>
                <div class="video-content">{{ video.content }}</div>
                <div class="video-actions">
                  <t-button size="small" @click="selectVideoForEdit('B', video, index)">
                    <template #icon><edit-icon /></template>
                    编辑
                  </t-button>
                  <t-button size="small" variant="outline" @click="downloadVideo(video)">
                    <template #icon><download-icon /></template>
                    下载
                  </t-button>
                  <t-button size="small" variant="outline"
                    :class="{ 'selected': selectedVideosForMerge.some(v => v.id === `B-${index}`) }"
                    @click="toggleVideoSelection('B', video, index)">
                    {{selectedVideosForMerge.some(v => v.id === `B-${index}`) ? '已选' : '选择'}}
                  </t-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 视频拼接预览 -->
        <div v-if="selectedVideosForMerge.length > 1" class="merge-preview-section">
          <div class="section-header">
            <h3>视频拼接预览</h3>
            <div class="section-actions">
              <t-button size="small" @click="clearVideoSelection">清空选择</t-button>
              <t-button size="small" theme="primary" @click="startVideoMerge">
                拼接 {{ selectedVideosForMerge.length }} 个视频
              </t-button>
            </div>
          </div>

          <div class="merge-preview-timeline">
            <div v-for="(video, index) in selectedVideosForMerge" :key="video.id" class="timeline-segment">
              <div class="segment-info">
                <div class="segment-title">{{ video.title }}</div>
                <div class="segment-role">{{ video.role === 'A' ? '角色A' : '角色B' }}</div>
                <div class="segment-order">{{ index + 1 }}</div>
              </div>
              <div class="segment-actions">
                <t-button size="small" variant="text" :disabled="index === 0" @click="moveVideoUp(index)">
                  ↑
                </t-button>
                <t-button size="small" variant="text" :disabled="index === selectedVideosForMerge.length - 1"
                  @click="moveVideoDown(index)">
                  ↓
                </t-button>
                <t-button size="small" variant="text" theme="danger" @click="removeFromMergeSelection(index)">
                  ✕
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-buttons-section">
      <div class="section-header">
        <h3>操作按钮</h3>
      </div>
      <div class="action-buttons-grid">
        <t-button theme="primary" size="large" :loading="isGeneratingFullScene" @click="generateFullVideo">
          创建并生成远景图
        </t-button>
        <t-button theme="default" size="large" :loading="isGeneratingPrompt" @click="generateAIPrompt">
          生成AI提示词
        </t-button>
        <t-button theme="default" size="large" :loading="isGeneratingRoleA" @click="generateRoleAVideo">
          生成A单人视频
        </t-button>
        <t-button theme="default" size="large" @click="testRoleAVoice">
          试听
        </t-button>
        <t-button theme="default" size="large" :loading="isGeneratingRoleB" @click="generateRoleBVideo">
          生成B单人视频
        </t-button>
        <t-button theme="success" size="large" :loading="isGeneratingFinal" @click="generateFinalVideo">
          生成最终对话视频
        </t-button>
      </div>
    </div>

    <!-- 视频编辑工具区域 -->
    <div class="video-tools-section">
      <div class="tools-header">
        <h3>视频编辑工具</h3>
      </div>

      <!-- 视频剪切工具 -->
      <div class="tool-section">
        <div class="tool-header" @click="toggleTool('cut')">
          <span>视频剪切</span>
          <span class="toggle-icon">{{ showCutTool ? '−' : '+' }}</span>
        </div>
        <div v-if="showCutTool" class="tool-content">
          <div class="cut-tool-placeholder">
            <div v-if="!selectedVideoForEdit" class="no-selection">
              <p>请先从列表中选择要剪切的视频，或者先创建一个视频</p>
            </div>
            <div v-else class="selected-video-info">
              <h4>已选择视频:</h4>
              <p>{{ selectedVideoForEdit.title }}</p>
              <video :src="selectedVideoForEdit.url" controls style="width: 100%; max-height: 200px;" />
              <div class="cut-controls" style="margin-top: 12px;">
                <p style="color: #6b7280; font-size: 12px;">视频剪切功能正在开发中...</p>
                <t-button size="small" @click="downloadVideo(selectedVideoForEdit)">
                  下载原视频
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频拼接工具 -->
      <div class="tool-section">
        <div class="tool-header" @click="toggleTool('merge')">
          <span>视频拼接</span>
          <span class="toggle-icon">{{ showMergeTool ? '−' : '+' }}</span>
        </div>
        <div v-if="showMergeTool" class="tool-content">
          <div class="merge-tool-content">
            <div v-if="selectedVideosForMerge.length === 0" class="no-selection">
              <p>请先从列表中选择要拼接的视频，或者先创建视频</p>
            </div>
            <div v-else>
              <div class="merge-settings">
                <div class="setting-group">
                  <label>输出格式:</label>
                  <t-select v-model="mergeOptions.outputFormat" style="width: 100%">
                    <t-option value="mp4" label="MP4" />
                    <t-option value="webm" label="WebM" />
                    <t-option value="avi" label="AVI" />
                  </t-select>
                </div>

                <div class="setting-group">
                  <label>视频质量:</label>
                  <t-select v-model="mergeOptions.quality" style="width: 100%">
                    <t-option value="high" label="高质量" />
                    <t-option value="medium" label="中等质量" />
                    <t-option value="low" label="低质量" />
                  </t-select>
                </div>

                <div class="setting-group">
                  <label>转场效果:</label>
                  <t-switch v-model="mergeOptions.enableTransition" />
                </div>

                <t-button theme="primary" :disabled="selectedVideosForMerge.length < 2 || processingMerge"
                  :loading="processingMerge" @click="executeVideoMerge" block>
                  {{ processingMerge ? '拼接中...' : `拼接 ${selectedVideosForMerge.length} 个视频` }}
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作按钮 -->
      <div class="quick-actions">
        <div v-if="roleAVideos.length > 0 && roleBVideos.length > 0">
          <t-button theme="default" size="large" @click="quickMergeAllVideos" block>
            快速拼接所有视频
          </t-button>
        </div>
        <t-button theme="default" size="large" @click="showTutorial" block>
          打开视频编辑工具
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { EditIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import ImageUpload from './components/ImageUpload.vue';
// import VideoCutTool from './components/VideoCutTool.vue'; // 暂时注释掉，稍后添加
import { getVideoCollections } from '@/api/video-generation';
import { mergeVideosWithFFmpeg } from '@/utils/videoProcessor';
import {
  createAIGCDialog,
  operateAIGCDialogGenFarImg,
  operateAIGCDialogGenNearImgA,
  operateAIGCDialogGenNearImgB,
  operateAIGCDialogGenVideo,
  operateAIGCDialogSubmitFinal,
  tryAIGCDialogAudio,
  getAIGCDialog,
  AIGCDialogOperation,
  type AIGCDialog,
  type AIGCDialogDetail
} from '@/api/aigc-video';

// 数据类型定义
interface VideoItem {
  url: string;
  title?: string;
  content?: string;
  file?: File;
  blob?: Blob;
  role?: 'A' | 'B';
  index?: number;
}

interface SelectedVideo {
  id: string;
  role: 'A' | 'B';
  video: VideoItem;
  index: number;
  title: string;
}

// 步骤管理
const steps = [
  { label: '基础信息', component: 'basic-info' },
  { label: '远景图生成', component: 'far-scene' },
  { label: '近景图生成', component: 'near-scene' },
  { label: '对话配置', component: 'dialog-config' },
  { label: '视频生成', component: 'video-generation' },
  { label: '完成', component: 'completed' }
];
const currentStep = ref(0);

// 导航到指定步骤
const navigateToStep = (stepIndex: number) => {
  // 只允许导航到已完成的步骤或下一个未完成的步骤
  if (stepIndex <= currentStep.value || stepIndex === currentStep.value + 1) {
    currentStep.value = stepIndex;
    console.log(`导航到步骤: ${steps[stepIndex].label}`);
    MessagePlugin.info(`已切换到步骤: ${steps[stepIndex].label}`);
    updateDocumentTitle();
  }
};

// 前进到下一步
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
    console.log(`前进到步骤: ${steps[currentStep.value].label}`);
    MessagePlugin.success(`已进入下一步: ${steps[currentStep.value].label}`);
    updateDocumentTitle();
  }
};

// 返回上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    console.log(`返回到步骤: ${steps[currentStep.value].label}`);
    MessagePlugin.info(`已返回上一步: ${steps[currentStep.value].label}`);
    updateDocumentTitle();
  }
};

// 更新文档标题以显示当前步骤
const updateDocumentTitle = () => {
  document.title = `对话视频生成 - ${steps[currentStep.value].label}`;
};

// 表单数据
const videoCollection = ref('chinese-dialogue');
const videoName = ref('');
const scenePrompt = ref('');
const roleA1 = ref('');
const roleA2 = ref('');
const roleB1 = ref('');
const roleB2 = ref('');
const voiceType = ref('BV700_V2_streaming');
const voiceTypeB = ref('BV002_streaming');
const voiceSpeed = ref(1.0);
const voiceSpeedB = ref(1.0);

// 图片数据
const imageUrls = ref(['', '', '']);

// 生成状态
const isGeneratingScene = ref(false);
const isGeneratingFullScene = ref(false);
const isGeneratingPrompt = ref(false);
const isGeneratingRoleA = ref(false);
const isGeneratingRoleB = ref(false);
const isGeneratingFinal = ref(false);

// 生成结果
const fullSceneUrl = ref('');
const closeUpSceneUrl = ref('');
const generatedPrompt = ref('');
const roleAVideoUrl = ref('');
const roleBVideoUrl = ref('');
const finalVideoUrl = ref('');

// 视频合集列表
const videoCollections = ref([]);

// 新增：视频列表和编辑功能
const roleAVideos = ref<VideoItem[]>([]);
const roleBVideos = ref<VideoItem[]>([]);
const selectedVideosForMerge = ref<SelectedVideo[]>([]);
const selectedVideoForEdit = ref<VideoItem | null>(null);

// 新增：加载和处理状态
const isLoadingVideos = ref(false);
const loadingMessage = ref('');
const loadingProgress = ref(0);
const generatingRoleAVideos = ref(false);
const generatingRoleBVideos = ref(false);
const processingMerge = ref(false);

// 新增：工具展开状态
const showCutTool = ref(false);
const showMergeTool = ref(false);

// 新增：拼接选项
const mergeOptions = reactive({
  outputFormat: 'mp4',
  quality: 'medium',
  enableTransition: false
});

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

// 生成AI场景
const generateAIScene = async () => {
  if (!scenePrompt.value.trim()) {
    MessagePlugin.warning('请先输入场景Prompt');
    return;
  }

  isGeneratingScene.value = true;
  try {
    MessagePlugin.loading('正在生成AI场景...');
    // 此功能暂未实现，仅显示成功消息
    MessagePlugin.success('AI场景生成成功');
  } catch (error) {
    console.error('生成AI场景失败:', error);
    MessagePlugin.error('生成失败，请稍后重试');
  } finally {
    isGeneratingScene.value = false;
  }
};

// 生成全景图
const generateFullVideo = async () => {
  if (!videoName.value.trim()) {
    MessagePlugin.warning('请先输入视频名称');
    return;
  }

  if (!scenePrompt.value.trim()) {
    MessagePlugin.warning('请先输入场景Prompt');
    return;
  }

  // 先创建对话视频
  let dialogId = '';
  isGeneratingFullScene.value = true;
  try {
    MessagePlugin.loading('正在创建对话视频...');
    // 创建对话视频
    const createResponse = await createAIGCDialog({
      series_name: videoCollection.value,
      title: videoName.value
    });

    if (createResponse.code === 200 || createResponse.code === 0) {
      dialogId = createResponse.data?.aigc_dialog?.id || '';
      MessagePlugin.info('开始生成远景图...');

      // 生成远景图
      const farImgResponse = await operateAIGCDialogGenFarImg({
        id: dialogId,
        ai_far_img_prompt: scenePrompt.value
      });

      if (farImgResponse.code === 200 || farImgResponse.code === 0) {
        // 保存对话ID到本地，即使没有直接获取到URL也可以继续
        fullSceneUrl.value = dialogId;
        MessagePlugin.success('远景图生成任务已提交成功');

        // 由于返回的数据不包含ai_far_img_url，我们直接保存对话ID
        closeUpSceneUrl.value = ''; // 清空近景图URL，以便后续生成

        // 保存对话数据以备后续使用
        const currentDialog = farImgResponse.data.aigc_dialog;
        console.log('对话数据:', currentDialog);

        // 显式手动延迟执行nextStep，确保DOM更新完毕
        setTimeout(() => {
          // 前进到下一步
          nextStep();
          console.log('已手动触发步骤前进，当前步骤:', currentStep.value);
        }, 500);
      } else {
        MessagePlugin.error(farImgResponse.message || '远景图生成失败');
      }
    } else {
      MessagePlugin.error(createResponse.message || '创建视频失败');
    }
  } catch (error) {
    console.error('生成远景图失败:', error);
    MessagePlugin.error('生成失败，请稍后重试');
  } finally {
    isGeneratingFullScene.value = false;
  }
};

// 生成AI提示词
const generateAIPrompt = async () => {
  if (!scenePrompt.value.trim() || !fullSceneUrl.value) {
    MessagePlugin.warning('请先生成全景图');
    return;
  }

  isGeneratingPrompt.value = true;
  try {
    MessagePlugin.loading('正在生成AI提示词...');
    // 此功能暂未实现，仅显示成功消息
    generatedPrompt.value = "AI生成的场景提示词...";
    MessagePlugin.success('AI提示词生成成功');
  } catch (error) {
    console.error('生成AI提示词失败:', error);
    MessagePlugin.error('生成失败，请稍后重试');
  } finally {
    isGeneratingPrompt.value = false;
  }
};

// 生成角色A视频
const generateRoleAVideo = async () => {
  if (!roleA1.value.trim()) {
    MessagePlugin.warning('请先输入角色A对话内容');
    return;
  }

  if (!fullSceneUrl.value) {
    MessagePlugin.warning('请先生成远景图');
    return;
  }

  isGeneratingRoleA.value = true;
  generatingRoleAVideos.value = true;
  setLoadingState(true, '正在生成角色A对话视频...', 10);

  try {
    const dialogId = fullSceneUrl.value;
    console.log('开始生成角色A对话视频，对话ID:', dialogId);

    // 先生成近景图（如果需要的话）
    if (!closeUpSceneUrl.value) {
      setLoadingState(true, '正在生成角色A近景图...', 20);
      const nearImgResponse = await operateAIGCDialogGenNearImgA({
        id: dialogId
      });

      if (nearImgResponse.code === 200 || nearImgResponse.code === 0) {
        closeUpSceneUrl.value = dialogId + "_A";
      }
    }

    setLoadingState(true, '正在生成角色A对话视频...', 40);

    // 构建角色A详情
    const detailA: AIGCDialogDetail = {
      audio_type: voiceType.value,
      audio_ratio: voiceSpeed.value,
      content_list: [roleA1.value, roleA2.value].filter(text => text.trim())
    };

    // 构建角色B详情（作为占位符）
    const detailB: AIGCDialogDetail = {
      audio_type: voiceTypeB.value,
      audio_ratio: voiceSpeedB.value,
      content_list: [roleB1.value || '占位符', roleB2.value].filter(text => text.trim())
    };

    // 生成对话视频
    const response = await operateAIGCDialogGenVideo({
      id: dialogId,
      detail_a: detailA,
      detail_b: detailB
    });

    if (response.code === 200 || response.code === 0) {
      setLoadingState(true, '视频生成中，请等待...', 60);

      // 启动智能轮询检查角色A视频生成状态
      await pollRoleAVideos(dialogId);

      MessagePlugin.success('角色A视频生成完成！');

      // 前进到下一步
      setTimeout(() => {
        nextStep();
      }, 500);
    } else {
      throw new Error(response.message || '生成失败');
    }
  } catch (error) {
    console.error('生成角色A视频失败:', error);
    MessagePlugin.error(`生成失败: ${error}`);
  } finally {
    isGeneratingRoleA.value = false;
    generatingRoleAVideos.value = false;
    setLoadingState(false);
  }
};

// 生成角色B视频
const generateRoleBVideo = async () => {
  if (!roleB1.value.trim()) {
    MessagePlugin.warning('请先输入角色B对话内容');
    return;
  }

  if (!fullSceneUrl.value) {
    MessagePlugin.warning('请先生成远景图');
    return;
  }

  isGeneratingRoleB.value = true;
  generatingRoleBVideos.value = true;
  setLoadingState(true, '正在生成角色B对话视频...', 10);

  try {
    const dialogId = fullSceneUrl.value;
    console.log('开始生成角色B对话视频，对话ID:', dialogId);

    // 先生成近景图（如果需要的话）
    if (!roleBVideoUrl.value) {
      setLoadingState(true, '正在生成角色B近景图...', 20);
      const nearImgResponse = await operateAIGCDialogGenNearImgB({
        id: dialogId
      });

      if (nearImgResponse.code === 200 || nearImgResponse.code === 0) {
        roleBVideoUrl.value = dialogId + "_B";
      }
    }

    setLoadingState(true, '正在生成角色B对话视频...', 40);

    // 构建角色A详情（作为占位符）
    const detailA: AIGCDialogDetail = {
      audio_type: voiceType.value,
      audio_ratio: voiceSpeed.value,
      content_list: [roleA1.value || '占位符', roleA2.value].filter(text => text.trim())
    };

    // 构建角色B详情
    const detailB: AIGCDialogDetail = {
      audio_type: voiceTypeB.value,
      audio_ratio: voiceSpeedB.value,
      content_list: [roleB1.value, roleB2.value].filter(text => text.trim())
    };

    // 生成对话视频
    const response = await operateAIGCDialogGenVideo({
      id: dialogId,
      detail_a: detailA,
      detail_b: detailB
    });

    if (response.code === 200 || response.code === 0) {
      setLoadingState(true, '视频生成中，请等待...', 60);

      // 启动智能轮询检查角色B视频生成状态
      await pollRoleBVideos(dialogId);

      MessagePlugin.success('角色B视频生成完成！');

      // 前进到下一步
      setTimeout(() => {
        nextStep();
      }, 500);
    } else {
      throw new Error(response.message || '生成失败');
    }
  } catch (error) {
    console.error('生成角色B视频失败:', error);
    MessagePlugin.error(`生成失败: ${error}`);
  } finally {
    isGeneratingRoleB.value = false;
    generatingRoleBVideos.value = false;
    setLoadingState(false);
  }
};

// 试听音色
const testVoice = async () => {
  if (!roleA1.value.trim()) {
    MessagePlugin.warning('请先输入角色A对话内容');
    return;
  }

  try {
    MessagePlugin.loading('正在生成试听音频...');
    const response = await tryAIGCDialogAudio({
      content: roleA1.value,
      audio_type: voiceType.value,
      audio_ratio: voiceSpeed.value
    });

    if (response.code === 0) {
      // 播放音频
      const audio = new Audio(response.data.audio_url);
      audio.play();
      MessagePlugin.success('开始播放试听音频');
    } else {
      MessagePlugin.error(response.message || '生成失败');
    }
  } catch (error) {
    console.error('试听失败:', error);
    MessagePlugin.error('试听失败，请稍后重试');
  }
};

// 试听角色B音色
const testVoiceB = async () => {
  if (!roleB1.value.trim()) {
    MessagePlugin.warning('请先输入角色B对话内容');
    return;
  }

  try {
    MessagePlugin.loading('正在生成试听音频...');
    const response = await tryAIGCDialogAudio({
      content: roleB1.value,
      audio_type: voiceTypeB.value,
      audio_ratio: voiceSpeedB.value
    });

    if (response.code === 0) {
      // 播放音频
      const audio = new Audio(response.data.audio_url);
      audio.play();
      MessagePlugin.success('开始播放试听音频');
    } else {
      MessagePlugin.error(response.message || '生成失败');
    }
  } catch (error) {
    console.error('试听失败:', error);
    MessagePlugin.error('试听失败，请稍后重试');
  }
};

// 试听角色A语音（步骤9）
const testRoleAVoice = () => {
  testVoice();
};

// 生成最终对话视频
const generateFinalVideo = async () => {
  if (!closeUpSceneUrl.value || !roleBVideoUrl.value) {
    MessagePlugin.warning('请先生成角色A和角色B的近景图');
    return;
  }

  if (!videoName.value.trim()) {
    MessagePlugin.warning('请输入视频名称');
    return;
  }

  // 准备对话内容
  const dialogId = fullSceneUrl.value;
  console.log('生成最终对话视频，使用对话ID:', dialogId);

  isGeneratingFinal.value = true;
  try {
    MessagePlugin.loading('正在生成对话视频...');

    // 构建角色A的对话详情
    const detailA: AIGCDialogDetail = {
      near_ai_img_url: closeUpSceneUrl.value,
      audio_type: voiceType.value,
      audio_ratio: voiceSpeed.value,
      content_list: [roleA1.value, roleA2.value].filter(text => text.trim()),
      ai_video_url_list: [],
      gen_ai_video_succeed: false
    };

    // 构建角色B的对话详情
    const detailB: AIGCDialogDetail = {
      near_ai_img_url: roleBVideoUrl.value,
      audio_type: voiceTypeB.value,
      audio_ratio: voiceSpeedB.value,
      content_list: [roleB1.value, roleB2.value].filter(text => text.trim()),
      ai_video_url_list: [],
      gen_ai_video_succeed: false
    };

    // 调用生成对话视频API
    const response = await operateAIGCDialogGenVideo({
      id: dialogId,
      detail_a: detailA,
      detail_b: detailB
    });

    if (response.code === 200 || response.code === 0) {
      console.log('对话视频生成响应:', response.data);

      // 设置视频URL
      finalVideoUrl.value = response.data.aigc_dialog.play_url || dialogId;
      MessagePlugin.success('对话视频生成任务已提交，请稍后查看结果');

      // 开始轮询检查视频生成状态
      pollVideoStatus(dialogId);

      // 显式手动延迟执行nextStep，确保DOM更新完毕
      setTimeout(() => {
        // 前进到下一步
        nextStep();
        console.log('已手动触发步骤前进，当前步骤:', currentStep.value);
      }, 500);
    } else {
      MessagePlugin.error(response.message || '生成失败');
    }
  } catch (error) {
    console.error('生成对话视频失败:', error);
    MessagePlugin.error('生成失败，请稍后重试');
  } finally {
    isGeneratingFinal.value = false;
  }
};

// 轮询检查视频生成状态
const pollVideoStatus = async (dialogId: string) => {
  let attempts = 0;
  const maxAttempts = 30; // 最大轮询次数
  const interval = 5000; // 轮询间隔（毫秒）

  const checkStatus = async () => {
    try {
      if (attempts >= maxAttempts) {
        MessagePlugin.error('视频生成超时，请手动检查状态');
        return;
      }

      const response = await getAIGCDialog(dialogId);
      if (response.code === 200 || response.code === 0) {
        const dialog = response.data.aigc_dialog;
        console.log('轮询获取的对话状态:', dialog);

        // 检查对话视频是否都生成成功
        if (dialog.detail_a?.gen_ai_video_succeed && dialog.detail_b?.gen_ai_video_succeed) {
          MessagePlugin.success('对话视频生成成功！');
          finalVideoUrl.value = dialog.play_url || dialogId;

          // 前进到最后一步
          currentStep.value = steps.length - 1;
          return;
        }

        // 继续轮询
        attempts++;
        setTimeout(checkStatus, interval);
      } else {
        MessagePlugin.error('获取视频状态失败');
      }
    } catch (error) {
      console.error('轮询视频状态失败:', error);
      MessagePlugin.error('检查视频状态失败，将继续尝试');
      attempts++;
      setTimeout(checkStatus, interval);
    }
  };

  // 开始轮询
  setTimeout(checkStatus, interval);
};

// 处理图片上传
const handleImageUpload = (file: File, url: string) => {
  console.log('图片上传成功:', file.name, url);
};

// 新增：设置加载状态
const setLoadingState = (loading: boolean, message: string = '', progress: number = 0) => {
  isLoadingVideos.value = loading;
  loadingMessage.value = message;
  loadingProgress.value = progress;
};

// 新增：轮询角色A视频状态
const pollRoleAVideos = async (dialogId: string) => {
  const { pollRoleAVideos: createPolling } = await import('@/utils/smartVideoPolling');

  const polling = createPolling(dialogId, {
    onProgress: (attempt, maxAttempts, message) => {
      const progress = 60 + (attempt / maxAttempts) * 30;
      setLoadingState(true, message, progress);
    },
    onDataChange: (videos, content) => {
      roleAVideos.value = videos.map((url, index) => ({
        url,
        title: `角色A - ${content[index] || `视频${index + 1}`}`,
        content: content[index]
      }));
    },
    config: {
      maxAttempts: 30,
      initialInterval: 3000,
      enableBackoff: true
    }
  });

  try {
    await polling.start();
    setLoadingState(true, '角色A视频获取成功！', 100);
  } catch (error) {
    console.error('角色A视频轮询失败:', error);
    throw new Error(`角色A视频生成失败: ${error}`);
  }
};

// 新增：轮询角色B视频状态
const pollRoleBVideos = async (dialogId: string) => {
  const { pollRoleBVideos: createPolling } = await import('@/utils/smartVideoPolling');

  const polling = createPolling(dialogId, {
    onProgress: (attempt, maxAttempts, message) => {
      const progress = 60 + (attempt / maxAttempts) * 30;
      setLoadingState(true, message, progress);
    },
    onDataChange: (videos, content) => {
      roleBVideos.value = videos.map((url, index) => ({
        url,
        title: `角色B - ${content[index] || `视频${index + 1}`}`,
        content: content[index]
      }));
    },
    config: {
      maxAttempts: 30,
      initialInterval: 3000,
      enableBackoff: true
    }
  });

  try {
    await polling.start();
    setLoadingState(true, '角色B视频获取成功！', 100);
  } catch (error) {
    console.error('角色B视频轮询失败:', error);
    throw new Error(`角色B视频生成失败: ${error}`);
  }
};

// 新增：工具展开/收起
const toggleTool = (tool: 'cut' | 'merge') => {
  if (tool === 'cut') {
    showCutTool.value = !showCutTool.value;
    if (showCutTool.value) showMergeTool.value = false;
  } else {
    showMergeTool.value = !showMergeTool.value;
    if (showMergeTool.value) showCutTool.value = false;
  }
};

// 新增：选择视频进行编辑
const selectVideoForEdit = (role: 'A' | 'B', video: VideoItem, index: number) => {
  selectedVideoForEdit.value = { ...video, role, index };
  showCutTool.value = true;
  showMergeTool.value = false;
  MessagePlugin.info(`已选择${role}角色第${index + 1}个视频进行编辑`);
};

// 新增：处理视频剪切完成
const handleVideoCut = (cutVideo: VideoItem) => {
  MessagePlugin.success('视频剪切完成');
  // 添加剪切后的视频到对应列表
  if (selectedVideoForEdit.value?.role === 'A') {
    roleAVideos.value.push({
      ...cutVideo,
      title: `${cutVideo.title.replace(/\.(mp4|avi|mov|webm)$/i, '')}.mp4`
    });
  } else if (selectedVideoForEdit.value?.role === 'B') {
    roleBVideos.value.push({
      ...cutVideo,
      title: `${cutVideo.title.replace(/\.(mp4|avi|mov|webm)$/i, '')}.mp4`
    });
  }
};

// 新增：下载视频
const downloadVideo = (video: VideoItem) => {
  const link = document.createElement('a');
  link.href = video.url;
  link.download = `${video.title || 'video'}.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('视频下载已开始');
};

// 新增：切换视频选择状态（用于拼接）
const toggleVideoSelection = (role: 'A' | 'B', video: VideoItem, index: number) => {
  const id = `${role}-${index}`;
  const existingIndex = selectedVideosForMerge.value.findIndex(v => v.id === id);

  if (existingIndex >= 0) {
    selectedVideosForMerge.value.splice(existingIndex, 1);
  } else {
    selectedVideosForMerge.value.push({
      id,
      role,
      video,
      index,
      title: video.title || `${role}角色视频${index + 1}`
    });
  }
};

// 新增：全选角色A视频
const selectAllRoleAVideos = () => {
  roleAVideos.value.forEach((video, index) => {
    const id = `A-${index}`;
    if (!selectedVideosForMerge.value.some(v => v.id === id)) {
      selectedVideosForMerge.value.push({
        id,
        role: 'A',
        video,
        index,
        title: video.title || `角色A视频${index + 1}`
      });
    }
  });
  MessagePlugin.info('已选择所有角色A视频');
};

// 新增：全选角色B视频
const selectAllRoleBVideos = () => {
  roleBVideos.value.forEach((video, index) => {
    const id = `B-${index}`;
    if (!selectedVideosForMerge.value.some(v => v.id === id)) {
      selectedVideosForMerge.value.push({
        id,
        role: 'B',
        video,
        index,
        title: video.title || `角色B视频${index + 1}`
      });
    }
  });
  MessagePlugin.info('已选择所有角色B视频');
};

// 新增：清空视频选择
const clearVideoSelection = () => {
  selectedVideosForMerge.value = [];
  MessagePlugin.info('已清空视频选择');
};

// 新增：移动视频位置
const moveVideoUp = (index: number) => {
  if (index > 0) {
    const temp = selectedVideosForMerge.value[index];
    selectedVideosForMerge.value[index] = selectedVideosForMerge.value[index - 1];
    selectedVideosForMerge.value[index - 1] = temp;
  }
};

const moveVideoDown = (index: number) => {
  if (index < selectedVideosForMerge.value.length - 1) {
    const temp = selectedVideosForMerge.value[index];
    selectedVideosForMerge.value[index] = selectedVideosForMerge.value[index + 1];
    selectedVideosForMerge.value[index + 1] = temp;
  }
};

const removeFromMergeSelection = (index: number) => {
  selectedVideosForMerge.value.splice(index, 1);
};

// 新增：执行视频拼接
const executeVideoMerge = async () => {
  if (selectedVideosForMerge.value.length < 2) {
    MessagePlugin.warning('请至少选择2个视频进行拼接');
    return;
  }

  processingMerge.value = true;
  setLoadingState(true, '正在准备视频拼接...', 10);

  try {
    // 转换为File对象数组
    const videoFiles: File[] = [];

    for (const selectedVideo of selectedVideosForMerge.value) {
      let videoFile: File;

      if (selectedVideo.video.file) {
        videoFile = selectedVideo.video.file;
      } else if (selectedVideo.video.blob) {
        videoFile = new File([selectedVideo.video.blob], 'video.mp4', { type: 'video/mp4' });
      } else {
        // 从URL下载视频文件
        const response = await fetch(selectedVideo.video.url);
        const blob = await response.blob();
        videoFile = new File([blob], 'video.mp4', { type: 'video/mp4' });
      }

      videoFiles.push(videoFile);
    }

    setLoadingState(true, '正在拼接视频...', 50);

    // 执行拼接
    const resultUrl = await mergeVideosWithFFmpeg(videoFiles, {
      outputFormat: mergeOptions.outputFormat,
      videoQuality: mergeOptions.quality === 'high' ? 18 : mergeOptions.quality === 'medium' ? 23 : 28,
      enableCrossfade: mergeOptions.enableTransition
    });

    setLoadingState(true, '拼接完成！', 100);

    // 下载结果
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `对话视频拼接-${selectedVideosForMerge.value.length}段.${mergeOptions.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    MessagePlugin.success('视频拼接完成并已开始下载！');

    // 清空选择
    clearVideoSelection();

  } catch (error) {
    console.error('视频拼接失败:', error);
    MessagePlugin.error(`拼接失败: ${error}`);
  } finally {
    processingMerge.value = false;
    setLoadingState(false);
  }
};

// 新增：快速拼接所有视频
const quickMergeAllVideos = () => {
  // 先清空选择
  selectedVideosForMerge.value = [];

  // 按交替顺序选择所有视频
  const maxLength = Math.max(roleAVideos.value.length, roleBVideos.value.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < roleAVideos.value.length) {
      selectedVideosForMerge.value.push({
        id: `A-${i}`,
        role: 'A',
        video: roleAVideos.value[i],
        index: i,
        title: roleAVideos.value[i].title || `角色A视频${i + 1}`
      });
    }
    if (i < roleBVideos.value.length) {
      selectedVideosForMerge.value.push({
        id: `B-${i}`,
        role: 'B',
        video: roleBVideos.value[i],
        index: i,
        title: roleBVideos.value[i].title || `角色B视频${i + 1}`
      });
    }
  }

  MessagePlugin.info(`已选择 ${selectedVideosForMerge.value.length} 个视频，请在拼接工具中执行拼接`);
  showMergeTool.value = true;
  showCutTool.value = false;
};

// 显示视频编辑教程
const showTutorial = () => {
  MessagePlugin.info({
    content: '视频编辑功能教程：\n1. 创建角色A或角色B的单人视频\n2. 使用剪切工具编辑单个视频\n3. 选择多个视频进行拼接\n4. 调整拼接顺序生成最终视频',
    duration: 5000,
    closeBtn: true
  });
  
  // 打开拼接工具展示使用方法
  showMergeTool.value = true;
};

// 新增：开始视频拼接（从预览区域触发）
const startVideoMerge = () => {
  showMergeTool.value = true;
  showCutTool.value = false;
  MessagePlugin.info('已打开视频拼接工具，请配置拼接选项');
};
</script>

<style scoped>
.dialogue-video-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题区域 */
.page-header {
  padding: 20px 0;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 20px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
}

/* 基础信息配置区域 */
.basic-info-section {
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
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.section-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
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

/* 生成按钮区域 */
.generate-section {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* 图片预览区域 */
.image-preview-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.image-preview-section .section-header {
  margin-bottom: 20px;
}

.image-preview-section .section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.image-cards-container {
  display: flex;
  gap: 20px;
}

.image-card {
  position: relative;
  background: #f9fafb;
  border-radius: 8px;
  padding: 15px;
  border: 2px dashed #d1d5db;
  min-width: 200px;
}



.image-placeholder {
  width: 160px;
  height: 120px;
  background: #f5f5f5;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.placeholder-content {
  text-align: center;
  color: #bfbfbf;
}

.image-actions {
  text-align: center;
}

/* 对话配置区域 */
.dialogue-config-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.dialogue-config-section .section-header {
  margin-bottom: 20px;
}

.dialogue-config-section .section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.config-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 15px;
}

.config-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  padding-top: 8px;
}

.config-label label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}



.config-content {
  flex: 1;
}

.voice-config {
  display: flex;
  align-items: center;
  gap: 15px;
}

.voice-params {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-params label {
  font-size: 14px;
  color: #374151;
}

/* 操作按钮区域 */
.action-buttons-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

/* 视频编辑工具区域 */
.video-tools-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 步骤条样式 */
.step-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 20px 0;
  padding: 0 20px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  cursor: pointer;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 15px;
  right: 0;
  width: calc(100% - 30px);
  height: 2px;
  background-color: #e0e0e0;
  transform: translateX(50%);
}

.step-item.completed:not(:last-child)::after {
  background-color: #0052d9;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  margin-bottom: 8px;
  z-index: 1;
}

.step-item.active .step-number {
  background-color: #0052d9;
}

.step-item.completed .step-number {
  background-color: #0052d9;
}

.step-label {
  font-size: 14px;
  color: #888;
  white-space: nowrap;
}

.step-item.active .step-label {
  color: #0052d9;
  font-weight: 500;
}

.step-item.completed .step-label {
  color: #0052d9;
}



/* 响应式设计 */
@media (max-width: 1200px) {
  .header-controls {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .image-cards-container {
    flex-wrap: wrap;
  }

  .action-buttons-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .basic-info-section,
  .image-preview-section,
  .dialogue-config-section,
  .video-results-section,
  .action-buttons-section,
  .video-tools-section {
    padding: 16px;
  }

  .config-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .config-label {
    min-width: auto;
    padding-top: 0;
  }

  .action-buttons-grid {
    grid-template-columns: 1fr;
  }
}

/* 新增样式：视频结果展示区域 */
.video-results-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 加载状态 */
.loading-status {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 16px;
  color: #374151;
  font-weight: 500;
}

.loading-progress {
  width: 300px;
  max-width: 100%;
}

/* 角色视频区域 */
.role-video-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.generating-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6b7280;
}

.video-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.video-preview {
  margin-bottom: 12px;
}

.video-player {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  background: #000;
}

.video-info {
  text-align: center;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
  word-break: break-all;
}

.video-content {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  word-break: break-all;
}

.video-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.video-actions .selected {
  background-color: #3b82f6;
  color: white;
}

/* 拼接预览区域 */
.merge-preview-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.merge-preview-timeline {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.timeline-segment {
  min-width: 120px;
  padding: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  text-align: center;
  position: relative;
}

.segment-info {
  margin-bottom: 8px;
}

.segment-title {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
}

.segment-role {
  font-size: 11px;
  color: #6b7280;
}

.segment-order {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.segment-actions {
  display: flex;
  justify-content: center;
  gap: 2px;
}

/* 视频编辑工具样式 */
.video-tools-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.tools-header {
  margin-bottom: 16px;
  text-align: center;
}

.tools-header h3 {
  margin: 0;
  font-size: 16px;
  color: #374151;
}

.tool-section {
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.tool-header:hover {
  background: #e9ecef;
}

.tool-header span:first-child {
  font-weight: 500;
  color: #374151;
}

.toggle-icon {
  font-size: 18px;
  color: #6b7280;
}

.tool-content {
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.merge-tool-content {
  padding: 0;
}

.no-selection {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

.merge-settings {
  padding: 16px;
}

.setting-group {
  margin-bottom: 12px;
}

.setting-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.quick-actions {
  margin-top: 16px;
}

/* 视频剪切占位符样式 */
.cut-tool-placeholder {
  background: #f9fafb;
  border-radius: 4px;
  padding: 16px;
}

.selected-video-info h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.selected-video-info p {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 12px;
}

.cut-controls {
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .video-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .merge-preview-timeline {
    flex-wrap: wrap;
  }

  .timeline-segment {
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .video-list {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .video-actions {
    flex-direction: column;
  }

  .merge-preview-timeline {
    flex-direction: column;
  }

  .timeline-segment {
    min-width: auto;
  }
}
</style>
