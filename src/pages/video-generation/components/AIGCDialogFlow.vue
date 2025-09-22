<!-- AIGC对话视频流程组件 -->
<template>
  <div class="aigc-dialog-flow">
    <!-- 头部信息 -->
    <div class="flow-header">
      <div class="header-top">
        <t-button variant="text" @click="handleBack">
          <template #icon>
            <t-icon name="chevron-left" />
          </template>
          返回
        </t-button>
        <h2>对话视频生成</h2>
        <div class="status-info" v-if="currentVideo">
          <span>状态：{{ getDialogStatusText(currentVideo) }}</span>
        </div>
      </div>

      <!-- 步骤指示器 -->
      <div class="steps-indicator">
        <t-steps :current="currentStepIndex" theme="dot">
          <t-step-item title="基础信息" />
          <t-step-item title="生成图片" />
          <t-step-item title="配置对话" />
          <t-step-item title="生成视频" />
          <t-step-item title="完成" />
        </t-steps>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">

      <!-- 第一步：基础信息配置 -->
      <div v-if="currentStepIndex === 0" class="step-panel">
        <div class="step-title">
          <h3>基础信息配置</h3>
          <p>设置视频基本信息和场景描述</p>
        </div>

        <div class="form-section">
          <div class="form-row">
            <label>视频所属合集：</label>
            <t-input v-model="formData.series_name" placeholder="输入合集名称（可选）" style="width: 280px;" />
          </div>

          <div class="form-row">
            <label>视频名称：</label>
            <t-input v-model="formData.title" placeholder="输入框文本：第几课+视频名" style="width: 400px;" />
          </div>

          <div class="form-row">
            <label>场景描述：</label>
            <t-textarea v-model="formData.far_img_prompt" placeholder="输入框文本：对话发生场景、环境、人物（例如：在明亮的教室里，两个学生在讨论学习问题）"
              :autosize="{ minRows: 3, maxRows: 5 }" style="width: 500px;" />
          </div>
        </div>

        <div class="step-actions">
          <t-button theme="primary" @click="nextStep" :disabled="!canProceedStep1" :loading="loadingCreateDialog">
            下一步：生成图片
          </t-button>
        </div>
      </div>

      <!-- 第二步：生成图片 -->
      <div v-if="currentStepIndex === 1" class="step-panel">
        <div class="step-title">
          <h3>生成场景和角色图片</h3>
          <p>根据场景描述生成对话背景和角色形象</p>
        </div>

        <div class="images-grid">
          <!-- 远景图 -->
          <div class="image-card">
            <div class="image-header">
              <h4>场景远景图</h4>
              <t-button theme="primary" size="small" @click="generateFarImg" :loading="loadingFarImg">
                生成场景图
              </t-button>
            </div>
            <div class="image-content">
              <div class="image-placeholder" v-if="!currentVideo?.ai_far_img_url">
                <t-icon name="image" size="64px" />
                <p>点击按钮生成场景图</p>
              </div>
              <img v-else :src="currentVideo.ai_far_img_url" alt="远景图" />
            </div>
          </div>

          <!-- 角色A近景图 -->
          <div class="image-card">
            <div class="image-header">
              <h4>角色A形象</h4>
              <t-button theme="primary" size="small" @click="generateNearImgA" :loading="loadingNearA"
                :disabled="!currentVideo?.ai_far_img_url">
                生成角色A
              </t-button>
            </div>
            <div class="image-content">
              <div class="image-placeholder" v-if="!currentVideo?.detail_a?.near_ai_img_url">
                <t-icon name="image" size="64px" />
                <p>需要先生成场景图</p>
              </div>
              <img v-else :src="currentVideo.detail_a.near_ai_img_url" alt="角色A近景图" />
            </div>
          </div>

          <!-- 角色B近景图 -->
          <div class="image-card">
            <div class="image-header">
              <h4>角色B形象</h4>
              <t-button theme="primary" size="small" @click="generateNearImgB" :loading="loadingNearB"
                :disabled="!currentVideo?.ai_far_img_url">
                生成角色B
              </t-button>
            </div>
            <div class="image-content">
              <div class="image-placeholder" v-if="!currentVideo?.detail_b?.near_ai_img_url">
                <t-icon name="image" size="64px" />
                <p>需要先生成场景图</p>
              </div>
              <img v-else :src="currentVideo.detail_b.near_ai_img_url" alt="角色B近景图" />
            </div>
          </div>
        </div>

        <div class="step-actions">
          <t-button variant="outline" @click="prevStep">
            上一步
          </t-button>
          <t-button theme="primary" @click="nextStep" :disabled="!canProceedStep2">
            下一步：配置对话
          </t-button>
        </div>
      </div>

      <!-- 第三步：配置对话内容 -->
      <div v-if="currentStepIndex === 2" class="step-panel">
        <div class="step-title">
          <h3>配置对话内容</h3>
          <p>设置角色对话内容和语音参数</p>
        </div>

        <div class="dialog-config">
          <!-- 角色A配置 -->
          <div class="role-config">
            <h4>角色A配置</h4>
            <div class="dialog-inputs">
              <div class="dialog-row">
                <label>对话内容：</label>
                <t-input v-model="dialogConfig.roleA.content1" placeholder="输入角色A的对话内容" style="width: 400px;" />
              </div>
              <div class="audio-config">
                <div class="audio-row">
                  <label>音色选择：</label>
                  <t-select v-model="dialogConfig.roleA.audioType" placeholder="亲切女声" style="width: 150px;">
                    <t-option value="BV700_V2_streaming" label="灿灿 2.0" />
                    <t-option value="BV001_streaming" label="通用女声" />
                    <t-option value="BV002_streaming" label="通用男声" />
                    <t-option value="BV123_streaming" label="阳光青年" />
                    <t-option value="BV007_streaming" label="亲切女声" />
                    <t-option value="BV056_streaming" label="阳光男声" />
                    <t-option value="BV005_streaming" label="活泼女声" />
                  </t-select>

                  <label style="margin-left: 20px;">倍速：</label>
                  <t-select v-model="dialogConfig.roleA.audioRatio" placeholder="1.0x" style="width: 80px;">
                    <t-option :value="0.5" label="0.5x" />
                    <t-option :value="1.0" label="1.0x" />
                    <t-option :value="1.5" label="1.5x" />
                    <t-option :value="2.0" label="2.0x" />
                  </t-select>

                  <t-button @click="tryAudioA" :loading="loadingTryA" style="margin-left: 10px;">
                    试听
                  </t-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 角色B配置 -->
          <div class="role-config">
            <h4>角色B配置</h4>
            <div class="dialog-inputs">
              <div class="dialog-row">
                <label>对话内容：</label>
                <t-input v-model="dialogConfig.roleB.content1" placeholder="输入角色B的对话内容" style="width: 400px;" />
              </div>
              <div class="audio-config">
                <div class="audio-row">
                  <label>音色选择：</label>
                  <t-select v-model="dialogConfig.roleB.audioType" placeholder="通用男声" style="width: 150px;">
                    <t-option value="BV700_V2_streaming" label="灿灿 2.0" />
                    <t-option value="BV001_streaming" label="通用女声" />
                    <t-option value="BV002_streaming" label="通用男声" />
                    <t-option value="BV123_streaming" label="阳光青年" />
                    <t-option value="BV007_streaming" label="亲切女声" />
                    <t-option value="BV056_streaming" label="阳光男声" />
                    <t-option value="BV005_streaming" label="活泼女声" />
                  </t-select>

                  <label style="margin-left: 20px;">倍速：</label>
                  <t-select v-model="dialogConfig.roleB.audioRatio" placeholder="1.0x" style="width: 80px;">
                    <t-option :value="0.5" label="0.5x" />
                    <t-option :value="1.0" label="1.0x" />
                    <t-option :value="1.5" label="1.5x" />
                    <t-option :value="2.0" label="2.0x" />
                  </t-select>

                  <t-button @click="tryAudioB" :loading="loadingTryB" style="margin-left: 10px;">
                    试听
                  </t-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <t-button variant="outline" @click="prevStep">
            上一步
          </t-button>
          <t-button theme="primary" @click="nextStep" :disabled="!canProceedStep3">
            下一步：生成视频
          </t-button>
        </div>
      </div>

      <!-- 第四步：生成对话视频 -->
      <div v-if="currentStepIndex === 3" class="step-panel">
        <div class="step-title">
          <h3>生成对话视频</h3>
          <p>将图片和对话合成为完整的对话视频</p>
        </div>

        <div class="video-generation">
          <div class="generation-info">
            <div class="info-card">
              <h4>视频预览信息</h4>
              <div class="info-item">
                <span>场景：</span>
                <span>{{ formData.far_img_prompt || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span>角色A对话：</span>
                <span>{{ dialogConfig.roleA.content1 || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span>角色B对话：</span>
                <span>{{ dialogConfig.roleB.content1 || '未设置' }}</span>
              </div>
            </div>
          </div>

          <div class="generation-action">
            <t-button theme="primary" size="large" @click="generateDialogVideo" :loading="loadingVideo">
              <template #icon>
                <t-icon name="play-circle" />
              </template>
              生成对话视频
            </t-button>

            <!-- 新增视频编辑按钮 -->
            <t-button variant="outline" size="large" @click="openVideoEditDialog" style="margin-left: 16px;">
              <template #icon>
                <t-icon name="edit" />
              </template>
              打开视频编辑工具
            </t-button>
          </div>

          <!-- 视频预览区域 -->
          <div v-if="currentVideo?.play_url" class="video-preview">
            <h4>视频预览</h4>
            <video :src="currentVideo.play_url" controls style="width: 100%; max-width: 600px;"></video>
          </div>

          <!-- 生成状态显示 -->
          <div v-if="isLoadingVideos" class="loading-status">
            <div class="loading-indicator">
              <t-loading size="large" />
              <div class="loading-text">{{ loadingMessage }}</div>
            </div>
          </div>

          <!-- 角色视频列表展示 -->
          <div v-if="roleAVideos.length > 0 || roleBVideos.length > 0" class="role-videos-section">
            <!-- 角色A视频列表 -->
            <div v-if="roleAVideos.length > 0" class="role-video-list">
              <div class="role-header">
                <h4>角色A生成的视频</h4>
              </div>
              <div class="video-grid">
                <div v-for="(video, index) in roleAVideos" :key="`roleA-${index}`" class="video-card">
                  <div class="video-thumbnail">
                    <video :src="video.url" controls class="thumbnail-video" />
                  </div>
                  <div class="video-info">
                    <div class="video-title">{{ video.title || `角色A视频 ${index + 1}` }}</div>
                    <div class="video-content">{{ video.content }}</div>
                    <div class="video-actions">
                      <t-button size="small" variant="outline" @click="downloadVideo(video)">
                        下载
                      </t-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 角色B视频列表 -->
            <div v-if="roleBVideos.length > 0" class="role-video-list">
              <div class="role-header">
                <h4>角色B生成的视频</h4>
              </div>
              <div class="video-grid">
                <div v-for="(video, index) in roleBVideos" :key="`roleB-${index}`" class="video-card">
                  <div class="video-thumbnail">
                    <video :src="video.url" controls class="thumbnail-video" />
                  </div>
                  <div class="video-info">
                    <div class="video-title">{{ video.title || `角色B视频 ${index + 1}` }}</div>
                    <div class="video-content">{{ video.content }}</div>
                    <div class="video-actions">
                      <t-button size="small" variant="outline" @click="downloadVideo(video)">
                        下载
                      </t-button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- 视频编辑工具 -->
            <div class="video-tools-section">
              <div class="tools-header">
                <h4>视频编辑工具</h4>
              </div>

              <!-- 视频剪切工具 -->
              <div v-if="selectedVideoForEdit" class="tool-section">
                <div class="tool-header" @click="toggleTool('cut')">
                  <span>视频剪切</span>
                  <span class="toggle-icon">{{ showCutTool ? '−' : '+' }}</span>
                </div>
                <div v-if="showCutTool" class="tool-content">
                  <div class="cut-tool-advanced">
                    <h5>已选择视频: {{ selectedVideoForEdit.title }}</h5>

                    <!-- 视频预览 -->
                    <div class="video-preview-section">
                      <video :src="selectedVideoForEdit.url" controls style="width: 100%; max-height: 200px;"
                        @loadedmetadata="onVideoMetadataLoaded" ref="cutVideoRef" />
                    </div>

                    <!-- 剪切参数设置 -->
                    <div class="cut-settings">
                      <div class="setting-row">
                        <label>开始时间 (秒):</label>
                        <t-input-number v-model="cutOptions.startTime" :min="0" :max="cutOptions.endTime - 0.1"
                          :step="0.1" style="width: 120px;" />
                      </div>

                      <div class="setting-row">
                        <label>结束时间 (秒):</label>
                        <t-input-number v-model="cutOptions.endTime" :min="cutOptions.startTime + 0.1" :step="0.1"
                          style="width: 120px;" />
                      </div>

                      <div class="setting-row">
                        <label>输出格式:</label>
                        <t-select v-model="cutOptions.outputFormat" style="width: 100px;">
                          <t-option value="mp4" label="MP4" />
                          <t-option value="webm" label="WebM" />
                          <t-option value="avi" label="AVI" />
                        </t-select>
                      </div>

                      <div class="setting-row">
                        <label>剪切模式:</label>
                        <t-select v-model="cutOptions.mode" style="width: 120px;">
                          <t-option value="timeline" label="时间轴模式" />
                          <t-option value="fast" label="快速模式" />
                          <t-option value="precise" label="精确模式" />
                        </t-select>
                      </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="cut-actions">
                      <t-button theme="primary" size="small" @click="executeCutVideo" :loading="processingCut"
                        :disabled="!selectedVideoForEdit">
                        {{ processingCut ? '剪切中...' : '开始剪切' }}
                      </t-button>
                      <t-button size="small" variant="outline" @click="downloadVideo(selectedVideoForEdit)">
                        下载原视频
                      </t-button>
                    </div>

                    <!-- 剪切结果 -->
                    <div v-if="cutResultUrl" class="cut-result">
                      <h6>剪切结果:</h6>
                      <video :src="cutResultUrl" controls style="width: 100%; max-height: 150px;" />
                      <div class="result-actions">
                        <t-button size="small" @click="downloadCutResult">下载剪切结果</t-button>
                        <t-button size="small" variant="outline" @click="addCutResultToList">添加到视频列表</t-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="step-actions">
            <t-button variant="outline" @click="prevStep">
              上一步
            </t-button>
            <t-button theme="primary" @click="nextStep" :disabled="!canProceedStep4">
              下一步：完成
            </t-button>
          </div>
        </div>

        <!-- 第五步：完成 -->
        <div v-if="currentStepIndex === 4" class="step-panel">
          <div class="step-title">
            <h3>视频生成完成</h3>
            <p>确认视频信息并提交到视频库</p>
          </div>

          <div class="completion-info">
            <div class="video-summary">
              <h4>视频信息确认</h4>
              <div class="summary-item">
                <span>视频名称：</span>
                <span>{{ formData.title }}</span>
              </div>
              <div class="summary-item">
                <span>所属合集：</span>
                <span>{{ formData.series_name || '无' }}</span>
              </div>
              <div class="summary-item">
                <span>场景描述：</span>
                <span>{{ formData.far_img_prompt }}</span>
              </div>

              <!-- 显示最终视频来源信息 -->
              <div v-if="finalVideoUrl || currentVideo?.play_url" class="summary-item">
                <span>视频来源：</span>
                <span v-if="finalVideoUrl" class="video-source edited">
                  🎬 编辑后的最终视频
                  <small v-if="finalVideoUploadTime">({{ finalVideoUploadTime }})</small>
                </span>
                <span v-else class="video-source generated">
                  🤖 系统生成的视频
                </span>
              </div>
            </div>

            <!-- 视频上传区域 -->
            <div v-if="!finalVideoUrl" class="video-upload-area">
              <h4>上传最终视频</h4>
              <p class="upload-tip">请上传编辑完成的最终视频文件，支持 MP4、AVI、MOV、WebM 格式，最大 500MB</p>

              <HuaweiOBSUpload accept="video/mp4,video/avi,video/mov,video/webm" :max-size="500 * 1024 * 1024"
                button-text="上传最终视频" tips="支持拖拽上传" folder="final_videos" @success="handleFinalVideoUploadSuccess"
                @error="handleFinalVideoUploadError">
                <template #default>
                  <div class="upload-container">
                    <div class="upload-trigger">
                      <t-icon name="cloud-upload" size="48px" />
                      <div class="upload-text">
                        <p>上传最终视频</p>
                        <p>支持拖拽上传</p>
                      </div>
                    </div>
                  </div>
                </template>
              </HuaweiOBSUpload>

              <!-- 系统生成的视频预览 -->
              <div v-if="currentVideo?.play_url" class="system-video-preview">
                <h5>系统生成的视频预览</h5>
                <video :src="currentVideo.play_url" controls style="width: 100%; max-width: 600px;"></video>
                <div class="video-info">
                  <p class="video-tip">
                    <t-icon name="info-circle" style="color: #1890ff;" />
                    这是系统自动生成的对话视频，您可以下载后编辑
                  </p>
                  <t-button @click="downloadSystemVideo" size="small" variant="outline">
                    <t-icon name="download" />
                    下载系统视频
                  </t-button>
                </div>
              </div>
            </div>

            <!-- 已上传视频预览 -->
            <div v-else class="final-video">
              <h4>已上传的最终视频</h4>
              <video :src="finalVideoUrl" controls style="width: 100%; max-width: 600px;"></video>

              <div class="video-info">
                <p class="video-tip">
                  <t-icon name="check-circle" style="color: #52c41a;" />
                  此视频已上传到华为云OBS
                </p>
                <div class="video-details">
                  <p><strong>上传时间:</strong> {{ finalVideoUploadTime }}</p>
                  <p><strong>视频地址:</strong> <span class="url-text">{{ finalVideoUrl }}</span></p>
                </div>
                <div class="video-actions">
                  <t-button @click="removeUploadedVideo" variant="outline">
                    <t-icon name="delete" />
                    删除并重新上传
                  </t-button>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions" v-if="!submitSuccess">
            <t-button variant="outline" @click="prevStep">
              上一步
            </t-button>
            <t-button theme="primary" size="large" @click="submitFinalVideo" :loading="loadingSubmit">
              提交视频
            </t-button>
          </div>

          <!-- 提交成功后的操作按钮 -->
          <div v-if="submitSuccess" class="success-actions">
            <t-alert theme="success" message="视频提交成功！" description="您的视频已成功提交并保存到视频库中。" />
            <div class="action-buttons">
              <t-button theme="primary" size="large" @click="goToVideoLibrary">
                <template #icon><t-icon name="view-module" /></template>
                前往视频库查看
              </t-button>
              <t-button variant="outline" @click="handleBack">
                返回列表
              </t-button>
            </div>
          </div>
        </div>

      </div>


      <!-- 视频编辑弹窗 -->
      <VideoEditingDialog v-model:visible="videoEditDialogVisible" :initial-videos="editDialogInitialVideos"
        :hide-online-videos="true" @confirm="handleVideoEditConfirm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useRouter } from 'vue-router';
import HuaweiOBSUpload from '@/components/HuaweiOBSUpload/index.vue';
import VideoEditingDialog from './VideoEditingDialog.vue';
import { createVideoPolling, type SmartPolling } from '@/utils/smartPolling';
import { cutVideoWithFFmpeg, createPlayableVideoUrl, revokeVideoUrl, mergeVideosWithFFmpeg } from '@/utils/videoProcessor';
import { cutVideoWithTimeline } from '@/utils/advancedVideoProcessor';
import {
  createAIGCDialog,
  getAIGCDialog,
  operateAIGCDialogGenFarImg,
  operateAIGCDialogGenNearImgA,
  operateAIGCDialogGenNearImgB,
  operateAIGCDialogGenVideo,
  operateAIGCDialogSubmitFinal,
  tryAIGCDialogAudio,
  type AIGCDialog,
  type AIGCDialogDetail
} from '@/api/aigc-video';

// Props
interface Props {
  videoId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  videoId: ''
});

// Emits
interface Emits {
  (e: 'back'): void;
  (e: 'success', video: AIGCDialog): void;
}

const emit = defineEmits<Emits>();
const router = useRouter();

// 响应式数据
const currentStepIndex = ref(0);
const currentVideo = ref<AIGCDialog | null>(null);
const videoId = ref<string>(props.videoId || '');

// 表单数据
const formData = ref({
  series_name: '',
  title: '',
  far_img_prompt: ''
});

// 对话配置
const dialogConfig = ref({
  roleA: {
    content1: '',
    audioType: 'BV007_streaming', // 亲切女声
    audioRatio: 1.0
  },
  roleB: {
    content1: '',
    audioType: 'BV002_streaming', // 通用男声
    audioRatio: 1.0
  }
});

// 加载状态
const loadingFarImg = ref(false);
const loadingNearA = ref(false);
const loadingNearB = ref(false);
const loadingVideo = ref(false);
const loadingSubmit = ref(false);
const loadingTryA = ref(false);
const loadingTryB = ref(false);
const loadingCreateDialog = ref(false);


// 视频编辑弹窗相关状态
const videoEditDialogVisible = ref(false);
const editDialogInitialVideos = ref<Array<{ url: string; title: string; file?: File; blob?: Blob }>>([]);

// 视频数据类型定义
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

// 视频列表数据
const roleAVideos = ref<VideoItem[]>([]);
const roleBVideos = ref<VideoItem[]>([]);
const selectedVideosForMerge = ref<SelectedVideo[]>([]);
const selectedVideoForEdit = ref<VideoItem | null>(null);

// 加载和处理状态
const isLoadingVideos = ref(false);
const loadingMessage = ref('');
const generatingRoleAVideos = ref(false);
const generatingRoleBVideos = ref(false);
const processingMerge = ref(false);

// 工具展开状态
const showCutTool = ref(false);
const showMergeTool = ref(false);

// 拼接选项
const mergeOptions = reactive({
  outputFormat: 'mp4',
  quality: 'medium',
  enableTransition: false
});

// 视频剪切选项
const cutOptions = reactive({
  startTime: 0,
  endTime: 10,
  outputFormat: 'mp4',
  mode: 'timeline' as 'timeline' | 'fast' | 'precise',
  quality: 23
});

// 剪切状态
const processingCut = ref(false);
const cutResultUrl = ref('');

// 最终视频上传相关
const finalVideoUrl = ref('');
const finalVideoUploadTime = ref('');
const submittingFinalVideo = ref(false);
const submitSuccess = ref(false);

// 确保audio_ratio为浮点数格式（如1.0而非1）
const ensureFloat = (value: number): number => {
  // 如果是整数，转换为浮点数格式
  if (Number.isInteger(value)) {
    return parseFloat(value.toFixed(1)); // 确保有小数点
  }
  return value;
};


// 步骤进行条件
const canProceedStep1 = computed(() => {
  return formData.value.title.trim() !== '' && formData.value.far_img_prompt.trim() !== '';
});

const canProceedStep2 = computed(() => {
  return currentVideo.value?.ai_far_img_url &&
    currentVideo.value?.detail_a?.near_ai_img_url &&
    currentVideo.value?.detail_b?.near_ai_img_url;
});

const canProceedStep3 = computed(() => {
  return dialogConfig.value.roleA.content1.trim() !== '' &&
    dialogConfig.value.roleB.content1.trim() !== '';
});

const canProceedStep4 = computed(() => {
  // 修改按钮判断依据：检查是否已从接口获取到了视频链接
  // 包括完整的play_url或者角色A/B的视频链接
  const hasPlayUrl = !!(currentVideo.value?.play_url);

  // 检查角色A和角色B是否已生成视频 - 基于gen_ai_video_succeed字段
  const hasRoleAVideos = currentVideo.value?.detail_a?.gen_ai_video_succeed === true;
  const hasRoleBVideos = currentVideo.value?.detail_b?.gen_ai_video_succeed === true;

  // 只要有任意一种视频链接就可以进入完成步骤
  const hasAnyVideoLinks = hasPlayUrl || hasRoleAVideos || hasRoleBVideos;

  console.log('🎯 [完成按钮] 判断依据:', {
    hasPlayUrl,
    hasRoleAVideos,
    hasRoleBVideos,
    hasAnyVideoLinks,
    roleA_count: currentVideo.value?.detail_a?.ai_video_url_list?.length || 0,
    roleB_count: currentVideo.value?.detail_b?.ai_video_url_list?.length || 0
  });

  return hasAnyVideoLinks;
});

// 智能轮询器
let videoPolling: SmartPolling<any> | null = null;

// 方法
const handleBack = () => {
  emit('back');
};

// 跳转到视频库页面
const goToVideoLibrary = () => {
  router.push('/video-library/list');
};

const nextStep = async () => {
  // 如果是第一步，需要先创建对话
  if (currentStepIndex.value === 0) {
    loadingCreateDialog.value = true;
    try {
      const created = await createDialog();
      if (!created) return;
    } finally {
      loadingCreateDialog.value = false;
    }
  }

  // 跳转到下一步
  if (currentStepIndex.value < 4) {
    currentStepIndex.value++;
  }
};

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};

const getDialogStatusText = (video: AIGCDialog) => {
  // 根据视频各种状态返回描述文本
  if (video.play_url) return '已完成';
  if (video.detail_a?.gen_ai_video_succeed && video.detail_b?.gen_ai_video_succeed) return '视频生成中';
  if (video.detail_a?.near_ai_img_url && video.detail_b?.near_ai_img_url) return '图片已生成';
  if (video.ai_far_img_url) return '远景图已生成';
  return '等待生成';
};

// API调用方法
const createDialog = async () => {
  try {
    const response = await createAIGCDialog({
      title: formData.value.title,
      series_name: formData.value.series_name || '默认合集'
    });

    if (response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      videoId.value = response.data.aigc_dialog.id;
      MessagePlugin.success('对话视频创建成功');
      return true;
    } else {
      MessagePlugin.error(response.message || '创建失败');
      return false;
    }
  } catch (error) {
    console.error('创建对话视频失败:', error);
    MessagePlugin.error('创建对话视频失败，请重试');
    return false;
  }
};

const generateFarImg = async () => {
  if (!videoId.value) {
    MessagePlugin.warning('请先创建对话视频');
    return;
  }

  loadingFarImg.value = true;
  try {
    const response = await operateAIGCDialogGenFarImg({
      id: videoId.value,
      ai_far_img_prompt: formData.value.far_img_prompt
    });

    if (response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      MessagePlugin.success('远景图生成成功');
    } else {
      MessagePlugin.error(response.message || '远景图生成失败');
    }
  } catch (error) {
    console.error('生成远景图失败:', error);
    MessagePlugin.error('生成远景图失败，请重试');
  } finally {
    loadingFarImg.value = false;
  }
};

const generateNearImgA = async () => {
  if (!videoId.value) return;

  loadingNearA.value = true;
  try {
    const response = await operateAIGCDialogGenNearImgA({
      id: videoId.value
    });

    if (response.code === 200) {
      console.log('角色A生成响应:', response.data.aigc_dialog);
      // 保留原有的detail_b数据，只更新detail_a
      if (currentVideo.value && response.data.aigc_dialog) {
        currentVideo.value = {
          ...currentVideo.value,
          ...response.data.aigc_dialog,
          detail_b: currentVideo.value.detail_b // 确保保留角色B的数据
        };
      } else {
        currentVideo.value = response.data.aigc_dialog;
      }
      MessagePlugin.success('角色A近景图生成成功');
    } else {
      MessagePlugin.error(response.message || '角色A近景图生成失败');
    }
  } catch (error) {
    console.error('生成角色A近景图失败:', error);
    MessagePlugin.error('生成角色A近景图失败，请重试');
  } finally {
    loadingNearA.value = false;
  }
};

const generateNearImgB = async () => {
  if (!videoId.value) return;

  loadingNearB.value = true;
  try {
    const response = await operateAIGCDialogGenNearImgB({
      id: videoId.value
    });

    if (response.code === 200) {
      console.log('角色B生成响应:', response.data.aigc_dialog);
      // 保留原有的detail_a数据，只更新detail_b
      if (currentVideo.value && response.data.aigc_dialog) {
        const originalDetailA = currentVideo.value.detail_a;
        currentVideo.value = {
          ...currentVideo.value,
          ...response.data.aigc_dialog,
          detail_a: originalDetailA // 确保保留角色A的数据
        };
      } else {
        currentVideo.value = response.data.aigc_dialog;
      }
      MessagePlugin.success('角色B近景图生成成功');
    } else {
      MessagePlugin.error(response.message || '角色B近景图生成失败');
    }
  } catch (error) {
    console.error('生成角色B近景图失败:', error);
    MessagePlugin.error('生成角色B近景图失败，请重试');
  } finally {
    loadingNearB.value = false;
  }
};

const generateDialogVideo = async () => {
  if (!videoId.value) return;

  loadingVideo.value = true;
  try {
    const detailA: AIGCDialogDetail = {
      near_ai_img_url: currentVideo.value?.detail_a?.near_ai_img_url || '',
      audio_type: dialogConfig.value.roleA.audioType,
      audio_ratio: ensureFloat(dialogConfig.value.roleA.audioRatio),
      content_list: [dialogConfig.value.roleA.content1].filter(Boolean)
    } as AIGCDialogDetail;

    const detailB: AIGCDialogDetail = {
      near_ai_img_url: currentVideo.value?.detail_b?.near_ai_img_url || '',
      audio_type: dialogConfig.value.roleB.audioType,
      audio_ratio: ensureFloat(dialogConfig.value.roleB.audioRatio),
      content_list: [dialogConfig.value.roleB.content1].filter(Boolean)
    } as AIGCDialogDetail;

    console.log('=== 生成对话视频请求参数 ===', {
      id: videoId.value,
      detail_a: detailA,
      detail_b: detailB
    });

    // 验证audio_ratio的值类型
    console.log('=== audio_ratio类型检查 ===', {
      'roleA_ratio': detailA.audio_ratio,
      'roleA_type': typeof detailA.audio_ratio,
      'roleB_ratio': detailB.audio_ratio,
      'roleB_type': typeof detailB.audio_ratio
    });

    const response = await operateAIGCDialogGenVideo({
      id: videoId.value,
      detail_a: detailA,
      detail_b: detailB
    });

    if (response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      MessagePlugin.success('开始生成对话视频，请等待...');

      // 设置加载状态
      setLoadingState(true, '正在生成角色A和角色B的视频...');

      // 开始智能轮询检查视频生成状态
      startSmartVideoPolling();
    } else {
      MessagePlugin.error(response.message || '生成对话视频失败');
    }
  } catch (error) {
    console.error('生成对话视频失败:', error);
    MessagePlugin.error('生成对话视频失败，请重试');
  } finally {
    loadingVideo.value = false;
  }
};

// 处理华为云OBS上传成功
const handleFinalVideoUploadSuccess = (context: any) => {
  console.log('✅ 最终视频上传成功:', context);
  if (context && context.url) {
    finalVideoUrl.value = context.url;
    finalVideoUploadTime.value = new Date().toLocaleString();
    MessagePlugin.success('最终视频上传成功！');
  }
};

// 处理华为云OBS上传失败
const handleFinalVideoUploadError = (error: any) => {
  console.error('💥 最终视频上传失败:', error);
  MessagePlugin.error('最终视频上传失败，请重试');
};

// 删除已上传的视频
const removeUploadedVideo = () => {
  finalVideoUrl.value = '';
  finalVideoUploadTime.value = '';
  MessagePlugin.info('已删除上传的视频，可重新上传');
};

// 下载系统生成的视频
const downloadSystemVideo = () => {
  if (!currentVideo.value?.play_url) return;

  const link = document.createElement('a');
  link.href = currentVideo.value.play_url;
  link.download = `对话视频_${currentVideo.value.id || Date.now()}.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载系统生成的视频');
};

const submitFinalVideo = async () => {
  if (!videoId.value) {
    MessagePlugin.error('视频ID不存在');
    return;
  }

  // 检查是否已上传最终视频
  if (!finalVideoUrl.value) {
    MessagePlugin.warning('请先上传最终视频');
    return;
  }

  loadingSubmit.value = true;
  try {
    console.log('📤 提交最终视频:', {
      videoId: videoId.value,
      finalUrl: finalVideoUrl.value,
      uploadTime: finalVideoUploadTime.value
    });

    const response = await operateAIGCDialogSubmitFinal({
      id: videoId.value,
      series_name: formData.value.series_name || '默认合集',
      title: formData.value.title,
      final_video_url: finalVideoUrl.value
    });

    if (response.code === 200) {
      MessagePlugin.success('最终视频提交成功！');
      emit('success', response.data.aigc_dialog);

      // 显示提交成功的页面变化提示
      submitSuccess.value = true;
    } else {
      MessagePlugin.error(response.message || '视频提交失败');
    }
  } catch (error) {
    console.error('提交视频失败:', error);
    MessagePlugin.error('提交视频失败，请重试');
  } finally {
    loadingSubmit.value = false;
  }
};

const tryAudioA = async () => {
  if (!dialogConfig.value.roleA.content1) {
    MessagePlugin.warning('请先输入角色A的对话内容');
    return;
  }

  loadingTryA.value = true;
  try {
    const audioRatio = ensureFloat(dialogConfig.value.roleA.audioRatio);
    console.log('=== 试听音频A参数 ===', {
      'audio_ratio': audioRatio,
      'type': typeof audioRatio
    });

    const response = await tryAIGCDialogAudio({
      content: dialogConfig.value.roleA.content1,
      audio_type: dialogConfig.value.roleA.audioType,
      audio_ratio: audioRatio
    });

    if (response.code === 200) {
      // 播放试听音频
      const audio = new Audio(response.data.audio_url);
      audio.play();
      MessagePlugin.success('正在播放试听音频');
    } else {
      MessagePlugin.error(response.message || '试听失败');
    }
  } catch (error) {
    console.error('试听失败:', error);
    MessagePlugin.error('试听失败，请重试');
  } finally {
    loadingTryA.value = false;
  }
};

const tryAudioB = async () => {
  if (!dialogConfig.value.roleB.content1) {
    MessagePlugin.warning('请先输入角色B的对话内容');
    return;
  }

  loadingTryB.value = true;
  try {
    const audioRatio = ensureFloat(dialogConfig.value.roleB.audioRatio);
    console.log('=== 试听音频B参数 ===', {
      'audio_ratio': audioRatio,
      'type': typeof audioRatio
    });

    const response = await tryAIGCDialogAudio({
      content: dialogConfig.value.roleB.content1,
      audio_type: dialogConfig.value.roleB.audioType,
      audio_ratio: audioRatio
    });

    if (response.code === 200) {
      // 播放试听音频
      const audio = new Audio(response.data.audio_url);
      audio.play();
      MessagePlugin.success('正在播放试听音频');
    } else {
      MessagePlugin.error(response.message || '试听失败');
    }
  } catch (error) {
    console.error('试听失败:', error);
    MessagePlugin.error('试听失败，请重试');
  } finally {
    loadingTryB.value = false;
  }
};


// 启动智能视频轮询
const startSmartVideoPolling = () => {
  if (!videoId.value) {
    console.warn('⚠️ 没有视频ID，无法启动轮询');
    return;
  }

  // 停止之前的轮询
  stopSmartVideoPolling();

  console.log('🚀 [AIGCDialogFlow] 启动智能视频轮询', { videoId: videoId.value });

  videoPolling = createVideoPolling(
    // 轮询获取数据的函数
    async () => {
      const response = await getAIGCDialog(videoId.value);
      if (response.code === 200) {
        return response.data.aigc_dialog;
      }
      throw new Error(response.message || '获取视频状态失败');
    },
    {
      // 启用内容一致性检测 - 当接口返回内容与上一次一致时停止轮询
      stopOnContentChange: true,

      // 检查视频是否完成 - 基于新增视频检测
      checkVideoReady: (data) => {
        // 检查是否有完整的对话视频
        const hasPlayUrl = !!(data?.play_url);

        // 如果还没有当前视频数据，这是第一次生成
        if (!currentVideo.value) {
          const roleAVideoReady = data?.detail_a?.gen_ai_video_succeed === true;
          const roleBVideoReady = data?.detail_b?.gen_ai_video_succeed === true;
          const hasRoleVideos = roleAVideoReady && roleBVideoReady;

          console.log(`🎬 [AIGCDialogFlow] 第一次生成检查:`, {
            hasPlayUrl,
            hasRoleVideos,
            roleAVideoReady,
            roleBVideoReady,
            roleA_video_count: data?.detail_a?.ai_video_url_list?.length || 0,
            roleB_video_count: data?.detail_b?.ai_video_url_list?.length || 0
          });

          return hasPlayUrl || hasRoleVideos;
        }

        // 第二次及以后的生成，检查是否有新增视频
        const currentRoleACount = currentVideo.value?.detail_a?.ai_video_url_list?.length || 0;
        const currentRoleBCount = currentVideo.value?.detail_b?.ai_video_url_list?.length || 0;
        const newRoleACount = data?.detail_a?.ai_video_url_list?.length || 0;
        const newRoleBCount = data?.detail_b?.ai_video_url_list?.length || 0;

        // 检查是否有新增视频
        const hasNewRoleAVideos = newRoleACount > currentRoleACount;
        const hasNewRoleBVideos = newRoleBCount > currentRoleBCount;
        const hasNewVideos = hasNewRoleAVideos || hasNewRoleBVideos;

        console.log(`🎬 [AIGCDialogFlow] 新增视频检查:`, {
          hasPlayUrl,
          hasNewVideos,
          hasNewRoleAVideos,
          hasNewRoleBVideos,
          current_roleA_count: currentRoleACount,
          new_roleA_count: newRoleACount,
          current_roleB_count: currentRoleBCount,
          new_roleB_count: newRoleBCount,
          video_status: getDialogStatusText(data)
        });

        return hasPlayUrl || hasNewVideos;
      },

      // 数据变化时更新界面
      onDataChange: (data, isChanged) => {
        if (isChanged) {
          console.log('📊 [AIGCDialogFlow] 检测到数据变化，更新界面', {
            previous_status: currentVideo.value ? getDialogStatusText(currentVideo.value) : '无',
            new_status: getDialogStatusText(data),
            has_play_url: !!data?.play_url,
            roleA_videos: data?.detail_a?.ai_video_url_list?.length || 0,
            roleB_videos: data?.detail_b?.ai_video_url_list?.length || 0
          });

          // 先保存之前的状态
          const previousData = currentVideo.value;

          // 检查是否有新增视频
          const shouldUpdateVideos = !previousData || // 第一次
            (previousData?.detail_a?.ai_video_url_list?.length || 0) < (data?.detail_a?.ai_video_url_list?.length || 0) || // 角色A有新增
            (previousData?.detail_b?.ai_video_url_list?.length || 0) < (data?.detail_b?.ai_video_url_list?.length || 0); // 角色B有新增

          // 更新当前视频数据
          currentVideo.value = data;

          // 只在有新增视频时才重新提取和显示视频
          if (shouldUpdateVideos) {
            console.log('🎥 [AIGCDialogFlow] 检测到新增视频，重新提取视频列表');
            const roleAVideoReady = data?.detail_a?.gen_ai_video_succeed === true;
            const roleBVideoReady = data?.detail_b?.gen_ai_video_succeed === true;

            if (roleAVideoReady && roleBVideoReady) {
              const wasRoleAReady = previousData?.detail_a?.gen_ai_video_succeed;
              const wasRoleBReady = previousData?.detail_b?.gen_ai_video_succeed;

              if (!wasRoleAReady || !wasRoleBReady) {
                console.log('🎉 [AIGCDialogFlow] 角色视频首次生成完成，开始提取视频');
                extractRoleVideos(data, false); // 第一次生成，完全更新
                setLoadingState(false);
                MessagePlugin.success('角色视频生成完成！');
              } else {
                // 后续生成，增量更新视频
                console.log('🔄 [AIGCDialogFlow] 后续视频生成，增量更新视频列表');
                extractRoleVideos(data, true); // 后续生成，增量更新
                setLoadingState(false);

                // 计算新增视频数量
                const newRoleACount = (data?.detail_a?.ai_video_url_list?.length || 0) - (previousData?.detail_a?.ai_video_url_list?.length || 0);
                const newRoleBCount = (data?.detail_b?.ai_video_url_list?.length || 0) - (previousData?.detail_b?.ai_video_url_list?.length || 0);

                if (newRoleACount > 0 || newRoleBCount > 0) {
                  MessagePlugin.success(`新增视频生成完成！角色A新增${newRoleACount}个，角色B新增${newRoleBCount}个`);
                }
              }
            }

            // 如果完整视频生成完成，显示提示
            if (data?.play_url && !previousData?.play_url) {
              MessagePlugin.info('完整对话视频已生成');
            }
          } else {
            console.log('📊 [AIGCDialogFlow] 没有新增视频，仅更新数据不重新渲染视频列表');
          }
        } else {
          console.log('📊 [AIGCDialogFlow] 数据无变化，跳过处理');
        }
      },

      // 视频生成完成 - 此回调已在onDataChange中处理，避免重复
      onVideoReady: (data) => {
        console.log('🎉 [AIGCDialogFlow] onVideoReady回调触发，但处理已在onDataChange中完成', {
          play_url: data.play_url,
          video_status: getDialogStatusText(data),
          roleA_ready: data?.detail_a?.gen_ai_video_succeed,
          roleB_ready: data?.detail_b?.gen_ai_video_succeed
        });

        // 只处理完整视频的自动跳转逻辑
        if (data.play_url && currentStepIndex.value === 3) {
          setTimeout(() => {
            nextStep();
          }, 1000);
        }
      },

      // 轮询出错处理
      onError: (error) => {
        console.error('💥 [AIGCDialogFlow] 轮询出错:', error);
        MessagePlugin.warning('轮询视频状态时出错，请稍后重试');
      },

      // 轮询配置
      interval: 8000, // 8秒间隔
      // 移除maxAttempts限制，持续轮询直到有结果
    }
  );

  videoPolling.start();
};

// 停止智能视频轮询
const stopSmartVideoPolling = () => {
  if (videoPolling) {
    console.log('🛑 [AIGCDialogFlow] 停止智能视频轮询');
    videoPolling.stop();
    videoPolling = null;
  }
};


// 视频编辑弹窗相关方法
const openVideoEditDialog = () => {
  // 准备初始视频列表 (符合VideoEditingDialog的VideoItem类型)
  const initialVideos: Array<{ url: string; title: string; file?: File; blob?: Blob }> = [];

  // 添加角色A的视频
  roleAVideos.value.forEach((video, index) => {
    if (video.url) {
      initialVideos.push({
        url: video.url,
        title: video.title || `角色A视频 ${index + 1}`,
        file: video.file,
        blob: video.blob
      });
    }
  });

  // 添加角色B的视频
  roleBVideos.value.forEach((video, index) => {
    if (video.url) {
      initialVideos.push({
        url: video.url,
        title: video.title || `角色B视频 ${index + 1}`,
        file: video.file,
        blob: video.blob
      });
    }
  });

  editDialogInitialVideos.value = initialVideos;
  videoEditDialogVisible.value = true;

  console.log('🎬 打开视频编辑弹窗', {
    totalVideos: initialVideos.length,
    roleACount: roleAVideos.value.length,
    roleBCount: roleBVideos.value.length
  });
};

const handleVideoEditConfirm = (result: { url: string; title: string; file?: File; blob?: Blob } | null) => {
  if (result) {
    console.log('✅ 视频编辑完成，获得结果:', result);

    // 检查是否是云端URL（华为云OBS上传后的结果）
    if (result.url.startsWith('https://') && result.url.includes('obs.')) {
      // 这是上传到华为云OBS后的云端URL，设置为最终视频
      finalVideoUrl.value = result.url;
      finalVideoUploadTime.value = new Date().toLocaleString();

      console.log('🌐 设置云端视频URL为最终结果:', result.url);
      MessagePlugin.success('视频编辑完成，云端视频已设为最终结果！可以进入完成步骤进行提交');

      // 自动跳转到完成步骤
      if (currentStepIndex.value === 3) {
        setTimeout(() => {
          nextStep();
        }, 1500);
      }
    } else {
      // 这是本地URL，提示用户需要先上传
      MessagePlugin.info('视频编辑完成，请在编辑工具中点击"设为最终结果"来上传到云端');
    }
  }

  videoEditDialogVisible.value = false;
};

// 视频编辑相关方法
const setLoadingState = (loading: boolean, message?: string) => {
  isLoadingVideos.value = loading;
  loadingMessage.value = message || '';
};

const toggleTool = (tool: 'cut' | 'merge') => {
  if (tool === 'cut') {
    showCutTool.value = !showCutTool.value;
  } else {
    showMergeTool.value = !showMergeTool.value;
  }
};

const selectVideoForEdit = (role: 'A' | 'B', video: VideoItem, index: number) => {
  selectedVideoForEdit.value = {
    ...video,
    role,
    index,
    title: video.title || `角色${role}视频 ${index + 1}`
  };
  showCutTool.value = true;
  showMergeTool.value = false;
};

const downloadVideo = (video: VideoItem) => {
  if (!video.url) {
    MessagePlugin.warning('视频链接无效');
    return;
  }

  const link = document.createElement('a');
  link.href = video.url;
  link.download = video.title || '视频.mp4';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载视频');
};

const toggleVideoSelection = (role: 'A' | 'B', video: VideoItem, index: number) => {
  const id = `${role}-${index}`;
  const existingIndex = selectedVideosForMerge.value.findIndex(v => v.id === id);

  if (existingIndex > -1) {
    selectedVideosForMerge.value.splice(existingIndex, 1);
  } else {
    selectedVideosForMerge.value.push({
      id,
      role,
      video,
      index,
      title: video.title || `角色${role}视频 ${index + 1}`
    });
  }
};

const selectAllRoleAVideos = () => {
  roleAVideos.value.forEach((video, index) => {
    const id = `A-${index}`;
    if (!selectedVideosForMerge.value.some(v => v.id === id)) {
      selectedVideosForMerge.value.push({
        id,
        role: 'A',
        video,
        index,
        title: video.title || `角色A视频 ${index + 1}`
      });
    }
  });
};

const selectAllRoleBVideos = () => {
  roleBVideos.value.forEach((video, index) => {
    const id = `B-${index}`;
    if (!selectedVideosForMerge.value.some(v => v.id === id)) {
      selectedVideosForMerge.value.push({
        id,
        role: 'B',
        video,
        index,
        title: video.title || `角色B视频 ${index + 1}`
      });
    }
  });
};

const clearVideoSelection = () => {
  selectedVideosForMerge.value = [];
};

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

const executeVideoMerge = async () => {
  if (selectedVideosForMerge.value.length < 2) {
    MessagePlugin.warning('请至少选择2个视频进行拼接');
    return;
  }

  processingMerge.value = true;

  try {
    setLoadingState(true, '正在准备视频拼接...');

    // 清除之前的结果
    const existingResultUrls = roleAVideos.value.concat(roleBVideos.value)
      .filter(v => v.url.startsWith('blob:'))
      .map(v => v.url);
    existingResultUrls.forEach(url => revokeVideoUrl(url));

    console.log('🚀 开始视频拼接流程', {
      videoCount: selectedVideosForMerge.value.length,
      videos: selectedVideosForMerge.value.map(v => v.title)
    });

    // 转换为File对象数组（完全按照左侧栏的实现）
    const videoFiles: File[] = [];

    setLoadingState(true, '正在下载视频文件...');

    for (const selectedVideo of selectedVideosForMerge.value) {
      let videoFile: File;

      if (selectedVideo.video.file) {
        videoFile = selectedVideo.video.file;
      } else if (selectedVideo.video.blob) {
        videoFile = new File([selectedVideo.video.blob], `${selectedVideo.title}.mp4`, { type: 'video/mp4' });
      } else {
        // 从URL下载视频文件
        console.log('📥 下载视频文件:', selectedVideo.video.url);
        const response = await fetch(selectedVideo.video.url);
        const blob = await response.blob();
        videoFile = new File([blob], `${selectedVideo.title}.mp4`, { type: 'video/mp4' });
      }

      videoFiles.push(videoFile);
    }

    setLoadingState(true, '正在拼接视频...');

    let result: string;

    // 使用传统FFmpeg合并方法（与左侧栏一致）
    const options = {
      outputFormat: mergeOptions.outputFormat,
      videoCodec: 'libx264',
      audioCodec: 'aac',
      videoQuality: mergeOptions.quality === 'high' ? 18 : mergeOptions.quality === 'medium' ? 23 : 28,
      audioQuality: '128k',
      enableCrossfade: mergeOptions.enableTransition,
      fadeLength: 1.0,
      resolution: undefined
    };

    result = await mergeVideosWithFFmpeg(videoFiles, options);

    setLoadingState(true, '拼接完成！');

    console.log('✅ 视频拼接完成:', result);

    // 下载结果
    const link = document.createElement('a');
    link.href = result;
    link.download = `对话视频拼接-${selectedVideosForMerge.value.length}段-${Date.now()}.${mergeOptions.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    MessagePlugin.success('视频拼接完成并已开始下载！');

    // 清空选择
    clearVideoSelection();

  } catch (error) {
    console.error('💥 视频拼接失败:', error);
    MessagePlugin.error(`拼接失败: ${(error as Error).message}`);
  } finally {
    processingMerge.value = false;
    setLoadingState(false);
  }
};

const quickMergeAllVideos = () => {
  // 清空当前选择
  selectedVideosForMerge.value = [];

  // 按角色A、角色B交替选择
  const maxLength = Math.max(roleAVideos.value.length, roleBVideos.value.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < roleAVideos.value.length) {
      selectedVideosForMerge.value.push({
        id: `A-${i}`,
        role: 'A',
        video: roleAVideos.value[i],
        index: i,
        title: roleAVideos.value[i].title || `角色A视频 ${i + 1}`
      });
    }

    if (i < roleBVideos.value.length) {
      selectedVideosForMerge.value.push({
        id: `B-${i}`,
        role: 'B',
        video: roleBVideos.value[i],
        index: i,
        title: roleBVideos.value[i].title || `角色B视频 ${i + 1}`
      });
    }
  }

  showMergeTool.value = true;
  MessagePlugin.success(`已选择 ${selectedVideosForMerge.value.length} 个视频进行拼接`);
};

// 视频剪切相关方法
const cutVideoRef = ref<HTMLVideoElement>();

const onVideoMetadataLoaded = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  const duration = video.duration;
  if (duration && !isNaN(duration)) {
    cutOptions.endTime = Math.min(duration, cutOptions.endTime || duration);
    console.log('📹 视频元数据加载完成，时长:', duration);
  }
};

const executeCutVideo = async () => {
  if (!selectedVideoForEdit.value) {
    MessagePlugin.warning('请选择要剪切的视频');
    return;
  }

  if (cutOptions.startTime >= cutOptions.endTime) {
    MessagePlugin.warning('开始时间必须小于结束时间');
    return;
  }

  processingCut.value = true;
  setLoadingState(true, '正在准备视频剪切...');

  try {
    console.log('🎬 [DEBUG] 开始视频剪切流程', {
      video: selectedVideoForEdit.value.title,
      startTime: cutOptions.startTime,
      endTime: cutOptions.endTime,
      mode: cutOptions.mode
    });

    // 清除之前的结果
    if (cutResultUrl.value) {
      revokeVideoUrl(cutResultUrl.value);
      cutResultUrl.value = '';
    }

    let videoFile: File;

    // 获取视频文件
    if (selectedVideoForEdit.value.file) {
      videoFile = selectedVideoForEdit.value.file;
    } else if (selectedVideoForEdit.value.blob) {
      videoFile = new File([selectedVideoForEdit.value.blob], 'video.mp4', { type: 'video/mp4' });
    } else {
      // 从URL下载视频文件
      setLoadingState(true, '正在下载视频文件...');
      console.log('📥 下载视频文件:', selectedVideoForEdit.value.url);
      const response = await fetch(selectedVideoForEdit.value.url);
      const blob = await response.blob();
      videoFile = new File([blob], 'video.mp4', { type: 'video/mp4' });
    }

    setLoadingState(true, '正在剪切视频...');

    let result: string;

    // 根据模式选择剪切方法（完全按照左侧栏的实现）
    if (cutOptions.mode === 'timeline') {
      console.log('📅 [DEBUG] 使用时间轴剪切方法');
      const timelineOptions = {
        fastMode: false,
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality
      };

      result = await cutVideoWithTimeline(
        videoFile,
        cutOptions.startTime,
        cutOptions.endTime,
        timelineOptions
      );
    } else {
      console.log('🔧 [DEBUG] 使用传统FFmpeg剪切方法');
      const ffmpegOptions = {
        keepOriginalCodec: cutOptions.mode === 'fast',
        enableReEncode: cutOptions.mode === 'precise',
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality
      };

      result = await cutVideoWithFFmpeg(
        videoFile,
        cutOptions.startTime,
        cutOptions.endTime,
        ffmpegOptions
      );
    }

    cutResultUrl.value = result;
    setLoadingState(true, '剪切完成！');

    console.log('✅ 视频剪切完成:', result);
    MessagePlugin.success('视频剪切完成！');

  } catch (error) {
    console.error('💥 视频剪切失败:', error);
    MessagePlugin.error(`剪切失败: ${(error as Error).message}`);
  } finally {
    processingCut.value = false;
    setLoadingState(false);
  }
};

const downloadCutResult = () => {
  if (!cutResultUrl.value) return;

  const link = document.createElement('a');
  link.href = cutResultUrl.value;
  link.download = `${selectedVideoForEdit.value?.title || 'video'}-剪切版本.${cutOptions.outputFormat}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载剪切结果');
};

const addCutResultToList = () => {
  if (!cutResultUrl.value || !selectedVideoForEdit.value) return;

  const newVideo: VideoItem = {
    url: cutResultUrl.value,
    title: `${selectedVideoForEdit.value.title} - 剪切版本`,
    content: `剪切时间: ${cutOptions.startTime}s - ${cutOptions.endTime}s`,
    role: selectedVideoForEdit.value.role,
    index: selectedVideoForEdit.value.role === 'A' ? roleAVideos.value.length : roleBVideos.value.length
  };

  if (selectedVideoForEdit.value.role === 'A') {
    roleAVideos.value.push(newVideo);
  } else {
    roleBVideos.value.push(newVideo);
  }

  MessagePlugin.success('剪切结果已添加到视频列表');

  // 清空剪切结果
  cutResultUrl.value = '';
};

// 从API响应中提取角色视频 - 支持增量更新
const extractRoleVideos = (data: AIGCDialog, isIncremental = false) => {
  console.log('🎬 [AIGCDialogFlow] 开始提取角色视频', {
    data,
    isIncremental,
    currentRoleACount: roleAVideos.value.length,
    currentRoleBCount: roleBVideos.value.length
  });

  // 如果不是增量更新，清空现有视频
  if (!isIncremental) {
    roleAVideos.value = [];
    roleBVideos.value = [];
  }

  try {
    // 提取角色A的视频
    if (data.detail_a) {
      // 从生成的视频中提取角色A的所有视频片段
      if (data.detail_a.ai_video_url_list && data.detail_a.ai_video_url_list.length > 0) {
        if (isIncremental) {
          // 增量更新：只添加新视频
          const currentCount = roleAVideos.value.length;
          const newVideos = data.detail_a.ai_video_url_list.slice(currentCount);
          newVideos.forEach((videoUrl, index) => {
            if (videoUrl) {
              const actualIndex = currentCount + index;
              roleAVideos.value.push({
                url: videoUrl,
                title: `角色A视频 ${actualIndex + 1}`,
                content: data.detail_a?.content_list?.[actualIndex] || `角色A对话内容 ${actualIndex + 1}`,
                role: 'A',
                index: actualIndex
              });
            }
          });
        } else {
          // 完全更新：重新添加所有视频
          data.detail_a.ai_video_url_list.forEach((videoUrl, index) => {
            if (videoUrl) {
              roleAVideos.value.push({
                url: videoUrl,
                title: `角色A视频 ${index + 1}`,
                content: data.detail_a?.content_list?.[index] || `角色A对话内容 ${index + 1}`,
                role: 'A',
                index: index
              });
            }
          });
        }
      } else if (!isIncremental && data.detail_a.content_list && data.detail_a.content_list.length > 0) {
        // 如果还没有生成视频但有内容，则显示占位（仅在非增量模式）
        data.detail_a.content_list.forEach((content, index) => {
          roleAVideos.value.push({
            url: data.play_url || '', // 使用主视频URL作为临时占位
            title: `角色A视频 ${index + 1}`,
            content: content,
            role: 'A',
            index: index
          });
        });
      }
    }

    // 提取角色B的视频
    if (data.detail_b) {
      // 从生成的视频中提取角色B的所有视频片段
      if (data.detail_b.ai_video_url_list && data.detail_b.ai_video_url_list.length > 0) {
        if (isIncremental) {
          // 增量更新：只添加新视频
          const currentCount = roleBVideos.value.length;
          const newVideos = data.detail_b.ai_video_url_list.slice(currentCount);
          newVideos.forEach((videoUrl, index) => {
            if (videoUrl) {
              const actualIndex = currentCount + index;
              roleBVideos.value.push({
                url: videoUrl,
                title: `角色B视频 ${actualIndex + 1}`,
                content: data.detail_b?.content_list?.[actualIndex] || `角色B对话内容 ${actualIndex + 1}`,
                role: 'B',
                index: actualIndex
              });
            }
          });
        } else {
          // 完全更新：重新添加所有视频
          data.detail_b.ai_video_url_list.forEach((videoUrl, index) => {
            if (videoUrl) {
              roleBVideos.value.push({
                url: videoUrl,
                title: `角色B视频 ${index + 1}`,
                content: data.detail_b?.content_list?.[index] || `角色B对话内容 ${index + 1}`,
                role: 'B',
                index: index
              });
            }
          });
        }
      } else if (!isIncremental && data.detail_b.content_list && data.detail_b.content_list.length > 0) {
        // 如果还没有生成视频但有内容，则显示占位（仅在非增量模式）
        data.detail_b.content_list.forEach((content, index) => {
          roleBVideos.value.push({
            url: data.play_url || '', // 使用主视频URL作为临时占位
            title: `角色B视频 ${index + 1}`,
            content: content,
            role: 'B',
            index: index
          });
        });
      }
    }

    console.log('🎬 [AIGCDialogFlow] 视频提取完成', {
      roleACount: roleAVideos.value.length,
      roleBCount: roleBVideos.value.length,
      roleAVideos: roleAVideos.value,
      roleBVideos: roleBVideos.value
    });

    if (roleAVideos.value.length > 0 || roleBVideos.value.length > 0) {
      MessagePlugin.info(`已提取到 ${roleAVideos.value.length} 个角色A视频和 ${roleBVideos.value.length} 个角色B视频`);
    }

  } catch (error) {
    console.error('💥 [AIGCDialogFlow] 提取角色视频失败:', error);
    MessagePlugin.warning('提取角色视频时出错');
  }
};

// 生命周期
onMounted(() => {
  // 如果有videoId，获取视频详情
  if (props.videoId) {
    videoId.value = props.videoId;
    getAIGCDialog(props.videoId).then(response => {
      if (response.code === 200) {
        currentVideo.value = response.data.aigc_dialog;

        // 填充对话配置（如果存在的话）
        const video = response.data.aigc_dialog;
        if (video.detail_a?.content_list?.[0]) {
          dialogConfig.value.roleA.content1 = video.detail_a.content_list[0];
        }
        if (video.detail_a?.audio_type) {
          dialogConfig.value.roleA.audioType = video.detail_a.audio_type;
        }
        if (video.detail_a?.audio_ratio) {
          dialogConfig.value.roleA.audioRatio = video.detail_a.audio_ratio;
        }

        if (video.detail_b?.content_list?.[0]) {
          dialogConfig.value.roleB.content1 = video.detail_b.content_list[0];
        }
        if (video.detail_b?.audio_type) {
          dialogConfig.value.roleB.audioType = video.detail_b.audio_type;
        }
        if (video.detail_b?.audio_ratio) {
          dialogConfig.value.roleB.audioRatio = video.detail_b.audio_ratio;
        }

        // 根据视频状态设置当前步骤
        if (response.data.aigc_dialog.play_url) {
          currentStepIndex.value = 4;
        } else if (response.data.aigc_dialog.detail_a?.gen_ai_video_succeed) {
          currentStepIndex.value = 3;
        } else if (response.data.aigc_dialog.detail_a?.near_ai_img_url) {
          currentStepIndex.value = 2;
        } else if (response.data.aigc_dialog.ai_far_img_url) {
          currentStepIndex.value = 1;
        }
      }
    });
  }
});

onUnmounted(() => {
  stopSmartVideoPolling();
});
</script>

<style scoped lang="less">
.aigc-dialog-flow {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);

  .flow-header {
    padding: 16px 0;
    margin-bottom: 24px;

    .header-top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    h2 {
      margin: 0;
      flex: 1;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    .status-info {
      color: #6b7280;
      font-size: 14px;
    }

    .steps-indicator {
      width: 100%;
    }
  }

  .step-content {
    .step-panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 32px;

      .step-title {
        margin-bottom: 24px;
        text-align: center;

        h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
      }

      .form-section {
        max-width: 600px;
        margin: 0 auto;

        .form-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 24px;

          label {
            min-width: 120px;
            padding-top: 8px;
            font-weight: 500;
            color: #374151;
          }
        }
      }

      .images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
        margin-bottom: 32px;

        .image-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;

          .image-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;

            h4 {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              color: #374151;
            }
          }

          .image-content {
            aspect-ratio: 16/9;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;

            .image-placeholder {
              text-align: center;
              color: #9ca3af;

              p {
                margin-top: 8px;
                font-size: 14px;
              }
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }

      .dialog-config {
        max-width: 800px;
        margin: 0 auto;

        .role-config {
          margin-bottom: 32px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;

          h4 {
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 500;
            color: #374151;
          }

          .dialog-inputs {
            .dialog-row {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;

              label {
                min-width: 120px;
                font-weight: 500;
                color: #374151;
              }
            }

            .audio-config {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;

              .audio-row {
                display: flex;
                align-items: center;
                gap: 12px;

                label {
                  font-weight: 500;
                  color: #374151;
                }
              }
            }
          }
        }
      }

      .video-generation {
        max-width: 700px;
        margin: 0 auto;

        .generation-info {
          margin-bottom: 24px;

          .info-card {
            padding: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;

            h4 {
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 500;
              color: #374151;
            }

            .info-item {
              display: flex;
              gap: 12px;
              margin-bottom: 8px;

              span:first-child {
                min-width: 100px;
                font-weight: 500;
                color: #6b7280;
              }

              span:last-child {
                color: #374151;
              }
            }
          }
        }

        .generation-action {
          text-align: center;
          margin-bottom: 24px;
        }

        .video-preview {
          text-align: center;

          h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 500;
            color: #374151;
          }
        }
      }

      .completion-info {
        max-width: 700px;
        margin: 0 auto;

        .video-summary {
          margin-bottom: 24px;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;

          h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 500;
            color: #374151;
          }

          .summary-item {
            display: flex;
            gap: 12px;
            margin-bottom: 8px;

            span:first-child {
              min-width: 100px;
              font-weight: 500;
              color: #6b7280;
            }

            span:last-child {
              color: #374151;
            }
          }
        }

        .video-upload-area {
          margin-bottom: 24px;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;

          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 500;
            color: #374151;
          }

          .upload-tip {
            margin-bottom: 20px;
            color: #6b7280;
            font-size: 14px;
          }

          .upload-container {
            .upload-trigger {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 40px;
              border: 2px dashed #d1d5db;
              border-radius: 12px;
              background: #f9fafb;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover {
                border-color: #3b82f6;
                background: #f0f9ff;
              }

              .upload-text {
                text-align: center;
                margin-top: 16px;

                p {
                  margin: 4px 0;
                  font-size: 16px;
                  font-weight: 500;
                  color: #374151;
                }
              }
            }
          }

          .system-video-preview {
            margin-top: 24px;
            padding: 16px;
            background: #f0f9ff;
            border-radius: 8px;
            border: 1px solid #bae6fd;

            h5 {
              margin-top: 0;
              margin-bottom: 12px;
              font-size: 15px;
              font-weight: 500;
              color: #0369a1;
            }

            video {
              border-radius: 8px;
              margin-bottom: 12px;
              width: 100%;
              max-width: 600px;
            }

            .video-info {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .video-tip {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #4b5563;
              }
            }
          }
        }

        .final-video {
          text-align: center;
          margin-bottom: 24px;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;

          h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 500;
            color: #374151;
          }

          video {
            border-radius: 8px;
            margin-bottom: 16px;
            width: 100%;
            max-width: 600px;
          }

          .video-info {
            margin-top: 16px;
            text-align: left;

            .video-tip {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
              padding: 8px 12px;
              background: #f6ffed;
              border: 1px solid #b7eb8f;
              border-radius: 6px;
              font-size: 14px;
            }

            .video-details {
              background: #fafafa;
              padding: 12px;
              border-radius: 6px;
              font-size: 13px;
              margin-bottom: 16px;

              p {
                margin: 4px 0;
                color: #666;
              }

              .url-text {
                word-break: break-all;
                color: #1890ff;
                background: #e6f7ff;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
              }
            }

            .video-actions {
              display: flex;
              gap: 8px;
            }
          }
        }

        // 视频来源样式
        .video-source {
          &.edited {
            color: #52c41a;
            font-weight: 500;
          }

          &.generated {
            color: #1890ff;
            font-weight: 500;
          }

          small {
            color: #999;
            font-weight: normal;
            margin-left: 8px;
          }
        }
      }

      .step-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
      }

      // 新增：加载状态样式
      .loading-status {
        text-align: center;
        padding: 24px;
        background: #f9fafb;
        border-radius: 8px;
        margin: 20px 0;

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

      }

      // 新增：角色视频列表样式
      .role-videos-section {
        margin-top: 24px;
        padding: 20px;
        background: #f9fafb;
        border-radius: 8px;

        .role-video-list {
          margin-bottom: 24px;

          .role-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;

            h4 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #374151;
            }

            .role-actions {
              display: flex;
              gap: 8px;
            }
          }

          .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;

            .video-card {
              background: white;
              border-radius: 8px;
              padding: 16px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;

              .video-thumbnail {
                margin-bottom: 12px;

                .thumbnail-video {
                  width: 100%;
                  max-height: 200px;
                  border-radius: 4px;
                }
              }

              .video-info {
                .video-title {
                  font-size: 14px;
                  font-weight: 600;
                  color: #374151;
                  margin-bottom: 8px;
                }

                .video-content {
                  font-size: 12px;
                  color: #6b7280;
                  margin-bottom: 12px;
                  line-height: 1.4;
                  max-height: 40px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .video-actions {
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;

                  .t-button.selected {
                    background: #dbeafe;
                    border-color: #3b82f6;
                    color: #3b82f6;
                  }
                }
              }
            }
          }
        }

        // 视频编辑工具样式
        .video-tools-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          border: 1px solid #e5e7eb;

          .tools-header {
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;

            h4 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #374151;
            }
          }

          .tool-section {
            margin-bottom: 20px;

            .tool-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 16px;
              background: #f3f4f6;
              border-radius: 6px;
              cursor: pointer;
              transition: background-color 0.2s;

              &:hover {
                background: #e5e7eb;
              }

              span:first-child {
                font-weight: 600;
                color: #374151;
              }

              .toggle-icon {
                font-weight: bold;
                color: #6b7280;
              }
            }

            .tool-content {
              padding: 16px;
              background: white;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 6px 6px;
            }
          }

          // 剪切工具样式
          .cut-tool-simple {
            text-align: center;

            h5 {
              margin: 0 0 12px 0;
              font-size: 14px;
              font-weight: 600;
              color: #374151;
            }

            .cut-controls {
              margin-top: 16px;

              p {
                margin: 8px 0;
                font-size: 12px;
                color: #6b7280;
              }
            }
          }

          // 拼接工具样式
          .merge-tool-simple {
            .merge-preview {
              margin-bottom: 20px;

              h5 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
              }

              .merge-sequence {
                .sequence-item {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 8px 12px;
                  background: #f9fafb;
                  border-radius: 4px;
                  margin-bottom: 8px;
                  border: 1px solid #e5e7eb;

                  .sequence-number {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                  }

                  .sequence-title {
                    flex: 1;
                    font-weight: 500;
                    color: #374151;
                  }

                  .sequence-role {
                    font-size: 12px;
                    color: #6b7280;
                    background: #e5e7eb;
                    padding: 2px 8px;
                    border-radius: 12px;
                  }

                  .sequence-actions {
                    display: flex;
                    gap: 4px;
                  }
                }
              }
            }

            .merge-settings {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
              flex-wrap: wrap;

              .setting-row {
                display: flex;
                align-items: center;
                gap: 8px;

                label {
                  font-size: 14px;
                  color: #374151;
                  font-weight: 500;
                  white-space: nowrap;
                }
              }
            }

            .merge-actions {
              display: flex;
              justify-content: center;
              gap: 12px;
            }
          }

          .quick-actions {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          }
        }
      }
    }
  }
}

/* 剪切工具样式 */
.cut-tool-advanced {
  padding: 16px;
}

.cut-tool-advanced h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.video-preview-section {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.cut-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.cut-settings .setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cut-settings .setting-row label {
  min-width: 100px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.cut-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.cut-result {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.cut-result h6 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #0369a1;
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.success-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .t-alert {
    width: 100%;
    margin-bottom: 20px;
  }

  .action-buttons {
    display: flex;
    gap: 16px;
  }
}
</style>