<template>
  <div class="aigc-dialog-flow">
    <!-- 基础信息输入 -->
    <div class="basic-info-section">
      <div class="section-header">
        <h3>基础信息</h3>
      </div>
      <div class="info-form">
        <div class="form-row">
          <span>视频合集名：</span>
          <t-input v-model="formData.series_name" placeholder="xx教材 对话视频" readonly style="width: 200px;" />
        </div>
        <div class="form-row">
          <span>视频名称：</span>
          <t-input v-model="formData.title" placeholder="输入框文本：第几课+视频名" style="width: 300px;" />
        </div>
      </div>
    </div>

    <!-- 生成视频步骤 -->
    <div v-if="videoId" class="video-generation-section">
      <!-- 加载状态显示 -->
      <div v-if="isLoadingVideos" class="loading-section">
        <div class="loading-container">
          <t-loading size="large" />
          <div class="loading-info">
            <h4>{{ loadingMessage }}</h4>
            <t-progress :percentage="loadingProgress" :show-info="true" />
            <p class="loading-details">轮询间隔: 8秒 | 当前尝试: {{ currentPollingAttempt }}</p>
          </div>
        </div>
      </div>

      <!-- 角色视频列表 -->
      <div class="role-videos-container">
        <!-- 角色A视频 -->
        <div v-if="roleAVideos.length > 0" class="role-videos-section">
          <div class="section-header">
            <h3>角色A视频 ({{ roleAVideos.length }}个)</h3>
            <div class="section-actions">
              <t-button size="small" @click="selectAllRoleAVideos">全选</t-button>
              <t-button size="small" variant="outline" @click="clearVideoSelection">清空选择</t-button>
            </div>
          </div>
          <div class="video-list">
            <div v-for="(video, index) in roleAVideos" :key="index" class="video-item">
              <div class="video-content">
                <video :src="video.url" controls class="video-preview" />
                <div class="video-meta">
                  <h4>{{ video.title }}</h4>
                  <p v-if="video.content">{{ video.content }}</p>
                </div>
              </div>
              <div class="video-actions">
                <t-checkbox :checked="isVideoSelected('A', index)"
                  @change="(checked) => toggleVideoSelection('A', video, index, checked)">
                  选择
                </t-checkbox>
                <t-button size="small" variant="outline" @click="downloadVideo(video)">
                  下载
                </t-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 角色B视频 -->
        <div v-if="roleBVideos.length > 0" class="role-videos-section">
          <div class="section-header">
            <h3>角色B视频 ({{ roleBVideos.length }}个)</h3>
            <div class="section-actions">
              <t-button size="small" @click="selectAllRoleBVideos">全选</t-button>
              <t-button size="small" variant="outline" @click="clearVideoSelection">清空选择</t-button>
            </div>
          </div>
          <div class="video-list">
            <div v-for="(video, index) in roleBVideos" :key="index" class="video-item">
              <div class="video-content">
                <video :src="video.url" controls class="video-preview" />
                <div class="video-meta">
                  <h4>{{ video.title }}</h4>
                  <p v-if="video.content">{{ video.content }}</p>
                </div>
              </div>
              <div class="video-actions">
                <t-checkbox :checked="isVideoSelected('B', index)"
                  @change="(checked) => toggleVideoSelection('B', video, index, checked)">
                  选择
                </t-checkbox>
                <t-button size="small" variant="outline" @click="downloadVideo(video)">
                  下载
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频编辑工具栏 -->
      <div class="video-tools-section">
        <div class="tools-header">
          <h3>视频编辑工具</h3>
          <div class="tools-info">
            <span>已选择 {{ totalSelectedVideos }} 个视频</span>
          </div>
        </div>
        <div class="tools-actions">
          <t-button theme="primary" @click="openVideoEditingDialog">
            <t-icon name="edit" />
            打开视频编辑工具
          </t-button>
          <t-button @click="quickMergeAllVideos" :disabled="totalSelectedVideos < 2">
            <t-icon name="layers" />
            快速拼接选中视频
          </t-button>
        </div>
      </div>

      <!-- 最终视频上传区域 -->
      <div v-if="roleAVideos.length > 0 || roleBVideos.length > 0" class="final-video-section">
        <div class="section-header">
          <h3>最终视频提交</h3>
        </div>

        <div v-if="!finalVideoUrl" class="video-upload-area">
          <HuaweiOBSUpload accept="video/mp4,video/avi,video/mov,video/webm" :max-size="500 * 1024 * 1024"
            button-text="上传最终视频" tips="请上传编辑完成的最终视频文件，支持 MP4、AVI、MOV、WebM 格式，最大 500MB" folder="final_videos"
            @success="handleFinalVideoUploadSuccess" @error="handleFinalVideoUploadError">
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
        </div>

        <div v-else class="uploaded-video-preview">
          <h4>最终视频预览</h4>
          <video :src="finalVideoUrl" controls class="final-video" />
          <div class="video-info">
            <p>上传时间: {{ finalVideoUploadTime }}</p>
          </div>
          <div class="video-actions">
            <t-button @click="downloadFinalVideo">下载视频</t-button>
            <t-button variant="outline" @click="removeFinalVideo">重新上传</t-button>
          </div>
        </div>
      </div>
    </div>


    <!-- 视频编辑弹窗 -->
    <VideoEditingDialog v-model:visible="videoEditingDialogVisible" :initial-videos="getSelectedVideosForEditing()"
      :hide-online-videos="true" @confirm="handleVideoEditingResult" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import VideoEditingDialog from './VideoEditingDialog.vue';
import HuaweiOBSUpload from '@/components/HuaweiOBSUpload/index.vue';
import { createVideoPolling, SmartPolling } from '@/utils/smartPolling';

// 接口定义
interface VideoItem {
  url: string;
  title: string;
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

interface AIGCDialogData {
  aigc_dialog: {
    id: string;
    title: string;
    ai_far_img_url?: string;
    detail_a?: {
      near_ai_img_url?: string;
      audio_type?: string;
      audio_ratio?: number;
      content_list?: string[];
      ai_video_url_list?: string[];
      gen_ai_video_succeed?: boolean;
    };
    detail_b?: {
      near_ai_img_url?: string;
      audio_type?: string;
      audio_ratio?: number;
      content_list?: string[];
      ai_video_url_list?: string[];
      gen_ai_video_succeed?: boolean;
    };
    play_url?: string;
    cover_url?: string;
  };
}

// Props
interface Props {
  videoId?: string;
  formData?: {
    series_name: string;
    title: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  videoId: '',
  formData: () => ({
    series_name: 'AI对话视频',
    title: ''
  })
});

const emit = defineEmits<{
  'video-ready': [data: any];
  'final-submit': [videoUrl: string];
}>();

// 响应式数据
const formData = reactive({
  series_name: props.formData?.series_name || 'AI对话视频',
  title: props.formData?.title || ''
});

// 视频相关状态
const currentVideo = ref<AIGCDialogData | null>(null);
const roleAVideos = ref<VideoItem[]>([]);
const roleBVideos = ref<VideoItem[]>([]);
const selectedVideosForMerge = ref<SelectedVideo[]>([]);

// 轮询相关状态
const isLoadingVideos = ref(false);
const loadingMessage = ref('');
const loadingProgress = ref(0);
const currentPollingAttempt = ref(0);
const videoPolling = ref<SmartPolling<any> | null>(null);
// 是否是第一次请求生成视频的标志
const isFirstVideoGeneration = ref(true);


// 视频编辑弹窗
const videoEditingDialogVisible = ref(false);

// 最终视频
const finalVideoUrl = ref('');
const finalVideoUploadTime = ref('');
const submittingFinalVideo = ref(false);

// 计算属性
const totalSelectedVideos = computed(() => selectedVideosForMerge.value.length);

// 判断是否可以进入完成步骤的计算属性（基于是否已从接口获取到视频链接）
const canProceedToComplete = computed(() => {
  // 检查是否已从接口获取到了视频链接
  const hasPlayUrl = !!(currentVideo.value?.data?.aigc_dialog?.play_url);

  // 检查角色A和角色B是否有视频链接
  const hasRoleAVideos = roleAVideos.value.length > 0;
  const hasRoleBVideos = roleBVideos.value.length > 0;

  // 只要有任意一种视频链接就可以进入完成步骤
  const hasAnyVideoLinks = hasPlayUrl || hasRoleAVideos || hasRoleBVideos;

  console.log('🎯 [完成条件] 判断依据:', {
    hasPlayUrl,
    hasRoleAVideos,
    hasRoleBVideos,
    hasAnyVideoLinks,
    roleA_count: roleAVideos.value.length,
    roleB_count: roleBVideos.value.length
  });

  return hasAnyVideoLinks;
});

// 工具方法
const setLoadingState = (message: string, progress: number) => {
  loadingMessage.value = message;
  loadingProgress.value = progress;
};

// 开始智能轮询 - 修复版本，基于数据变化检测
const startVideoPollingForRole = (role: 'A' | 'B') => {
  if (videoPolling.value) {
    videoPolling.value.stop();
  }

  isLoadingVideos.value = true;

  // 根据是否是第一次生成设置不同的提示信息
  if (isFirstVideoGeneration.value) {
    setLoadingState(`首次生成视频：检测到角色A和B视频时将停止轮询`, 10);
  } else {
    setLoadingState(`正在生成角色${role}视频...`, 10);
  }

  currentPollingAttempt.value = 0;

  // 获取轮询接口
  const fetchVideoData = async () => {
    const response = await fetch(`https://api.lingotok.ai/api/v1/aigc/get_aigc_dialog?id=${props.videoId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  };

  // 创建轮询，重点是正确的数据比较逻辑
  videoPolling.value = createVideoPolling(fetchVideoData, {
    interval: 8000, // 8秒间隔
    enableTimeout: false, // 不设置超时，直到有新视频产出

    // 自定义比较函数，比较角色视频列表的变化
    customCompareFn: (oldData: any, newData: any) => {
      if (!oldData?.data?.aigc_dialog || !newData?.data?.aigc_dialog) {
        return false; // 数据结构不同
      }

      const oldDialog = oldData.data.aigc_dialog;
      const newDialog = newData.data.aigc_dialog;

      // 比较角色A的视频列表
      const oldVideoListA = oldDialog.detail_a?.ai_video_url_list || [];
      const newVideoListA = newDialog.detail_a?.ai_video_url_list || [];

      // 比较角色B的视频列表
      const oldVideoListB = oldDialog.detail_b?.ai_video_url_list || [];
      const newVideoListB = newDialog.detail_b?.ai_video_url_list || [];

      // 比较视频生成状态
      const oldStatusA = oldDialog.detail_a?.gen_ai_video_succeed || false;
      const newStatusA = newDialog.detail_a?.gen_ai_video_succeed || false;
      const oldStatusB = oldDialog.detail_b?.gen_ai_video_succeed || false;
      const newStatusB = newDialog.detail_b?.gen_ai_video_succeed || false;

      // 如果视频列表或状态有任何变化，则认为数据不同
      return (
        JSON.stringify(oldVideoListA) === JSON.stringify(newVideoListA) &&
        JSON.stringify(oldVideoListB) === JSON.stringify(newVideoListB) &&
        oldStatusA === newStatusA &&
        oldStatusB === newStatusB
      );
    },

    // 检查是否有新视频生成完成
    checkVideoReady: (data: any) => {
      const dialog = data?.data?.aigc_dialog;
      if (!dialog) return false;

      // 检查是否有新的视频内容
      const hasNewVideoA = dialog.detail_a?.gen_ai_video_succeed &&
        dialog.detail_a?.ai_video_url_list?.length > 0;
      const hasNewVideoB = dialog.detail_b?.gen_ai_video_succeed &&
        dialog.detail_b?.ai_video_url_list?.length > 0;

      // 第一次请求生成视频时，如果同时有角色A和角色B的视频，则停止轮询
      if (isFirstVideoGeneration.value) {
        console.log('🔍 首次生成视频轮询检查', { hasVideoA: hasNewVideoA, hasVideoB: hasNewVideoB });
        return hasNewVideoA && hasNewVideoB;
      }

      // 第二次及以后的请求保持原有的停止轮询条件（任一角色有视频即可）
      return hasNewVideoA || hasNewVideoB;
    },

    onDataChange: (data, isChanged) => {
      currentPollingAttempt.value++;
      console.log('🔄 轮询数据更新', {
        attempt: currentPollingAttempt.value,
        isChanged,
        videoCountA: data?.data?.aigc_dialog?.detail_a?.ai_video_url_list?.length || 0,
        videoCountB: data?.data?.aigc_dialog?.detail_b?.ai_video_url_list?.length || 0
      });

      if (isChanged) {
        currentVideo.value = data;
        MessagePlugin.info('检测到视频数据更新');

        // 更新进度
        const progress = Math.min(50 + currentPollingAttempt.value * 2, 90);
        setLoadingState('检测到新数据，继续监听...', progress);
      }
    },

    onVideoReady: (data) => {
      console.log('🎉 检测到新视频生成完成');
      currentVideo.value = data;
      extractRoleVideos(data);

      isLoadingVideos.value = false;
      setLoadingState('视频生成完成！', 100);
      MessagePlugin.success('视频生成完成！');

      // 标记第一次视频生成已完成
      if (isFirstVideoGeneration.value) {
        console.log('✅ 第一次视频生成完成，后续将使用不同的停止条件');
        isFirstVideoGeneration.value = false;
      }

      emit('video-ready', data);
    },

    onError: (error) => {
      console.error('💥 轮询出错:', error);
      currentPollingAttempt.value++;

      // 错误不停止轮询，继续尝试
      const progress = Math.min(20 + currentPollingAttempt.value, 80);
      setLoadingState(`网络错误，继续重试... (${currentPollingAttempt.value})`, progress);
    }
  });

  videoPolling.value.start();
};

// 提取角色视频
const extractRoleVideos = (data: any) => {
  if (!data?.data?.aigc_dialog) return;

  const dialog = data.data.aigc_dialog;

  // 提取角色A的视频
  if (dialog.detail_a?.ai_video_url_list?.length > 0) {
    const newVideosA = dialog.detail_a.ai_video_url_list.map((url: string, index: number) => ({
      url,
      title: `角色A-视频${index + 1}`,
      content: dialog.detail_a.content_list?.[index] || '',
      role: 'A',
      index
    }));

    // 只添加新的视频，避免重复
    newVideosA.forEach((newVideo: VideoItem) => {
      const exists = roleAVideos.value.some(existing => existing.url === newVideo.url);
      if (!exists) {
        roleAVideos.value.push(newVideo);
      }
    });
  }

  // 提取角色B的视频
  if (dialog.detail_b?.ai_video_url_list?.length > 0) {
    const newVideosB = dialog.detail_b.ai_video_url_list.map((url: string, index: number) => ({
      url,
      title: `角色B-视频${index + 1}`,
      content: dialog.detail_b.content_list?.[index] || '',
      role: 'B',
      index
    }));

    // 只添加新的视频，避免重复
    newVideosB.forEach((newVideo: VideoItem) => {
      const exists = roleBVideos.value.some(existing => existing.url === newVideo.url);
      if (!exists) {
        roleBVideos.value.push(newVideo);
      }
    });
  }

  console.log('📹 视频提取完成', {
    roleACount: roleAVideos.value.length,
    roleBCount: roleBVideos.value.length
  });
};

// 生成单个角色视频
const generateSingleVideoA = async () => {
  console.log('🎬 开始生成角色A视频', { isFirstGeneration: isFirstVideoGeneration.value });
  startVideoPollingForRole('A');
};

const generateSingleVideoB = async () => {
  console.log('🎬 开始生成角色B视频', { isFirstGeneration: isFirstVideoGeneration.value });
  startVideoPollingForRole('B');
};

// 视频选择相关方法
const isVideoSelected = (role: 'A' | 'B', index: number): boolean => {
  return selectedVideosForMerge.value.some(selected =>
    selected.role === role && selected.index === index
  );
};

const toggleVideoSelection = (role: 'A' | 'B', video: VideoItem, index: number, checked: boolean) => {
  const existingIndex = selectedVideosForMerge.value.findIndex(selected =>
    selected.role === role && selected.index === index
  );

  if (checked && existingIndex === -1) {
    selectedVideosForMerge.value.push({
      id: `${role}-${index}`,
      role,
      video,
      index,
      title: video.title
    });
  } else if (!checked && existingIndex > -1) {
    selectedVideosForMerge.value.splice(existingIndex, 1);
  }
};

const selectAllRoleAVideos = () => {
  roleAVideos.value.forEach((video, index) => {
    toggleVideoSelection('A', video, index, true);
  });
};

const selectAllRoleBVideos = () => {
  roleBVideos.value.forEach((video, index) => {
    toggleVideoSelection('B', video, index, true);
  });
};

const clearVideoSelection = () => {
  selectedVideosForMerge.value = [];
};

// 下载视频
const downloadVideo = (video: VideoItem) => {
  const link = document.createElement('a');
  link.href = video.url;
  link.download = video.title;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载视频');
};

// 视频编辑相关方法
const openVideoEditingDialog = () => {
  videoEditingDialogVisible.value = true;
};

const getSelectedVideosForEditing = () => {
  return selectedVideosForMerge.value.map(selected => selected.video);
};

const handleVideoEditingResult = (result: VideoItem | null) => {
  if (result) {
    finalVideoUrl.value = result.url;
    finalVideoUploadTime.value = new Date().toLocaleString();
    MessagePlugin.success('视频编辑完成，已设置为最终视频');
  }
  videoEditingDialogVisible.value = false;
};

// 快速拼接
const quickMergeAllVideos = async () => {
  if (selectedVideosForMerge.value.length < 2) {
    MessagePlugin.warning('请至少选择2个视频进行拼接');
    return;
  }

  try {
    MessagePlugin.info('开始快速拼接视频...');

    // 这里可以调用快速拼接的API或者打开编辑弹窗
    openVideoEditingDialog();

  } catch (error) {
    console.error('💥 快速拼接失败:', error);
    MessagePlugin.error('快速拼接失败，请尝试使用编辑工具');
  }
};


// 最终视频上传相关方法
const handleFinalVideoUploadSuccess = (context: any) => {
  console.log('✅ 最终视频上传成功:', context);
  if (context && context.url) {
    finalVideoUrl.value = context.url;
    finalVideoUploadTime.value = new Date().toLocaleString();
    MessagePlugin.success('最终视频上传成功！');
  }
};

const handleFinalVideoUploadError = (error: any) => {
  console.error('💥 最终视频上传失败:', error);
  MessagePlugin.error('最终视频上传失败，请重试');
};

const downloadFinalVideo = () => {
  if (!finalVideoUrl.value) return;

  const link = document.createElement('a');
  link.href = finalVideoUrl.value;
  link.download = '最终对话视频.mp4';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  MessagePlugin.success('开始下载最终视频');
};

const removeFinalVideo = () => {
  finalVideoUrl.value = '';
  finalVideoUploadTime.value = '';
  MessagePlugin.info('已清除最终视频，可重新上传');
};

const submitFinalDialogVideo = async () => {
  if (!finalVideoUrl.value) {
    MessagePlugin.warning('请先上传最终视频');
    return;
  }

  try {
    submittingFinalVideo.value = true;

    const response = await fetch('https://api.lingotok.ai/api/v1/aigc/operate_aigc_dialog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: props.videoId,
        operation: 5, // submit_final_video
        series_name: formData.series_name,
        title: formData.title,
        final_video_url: finalVideoUrl.value
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 最终视频提交成功:', result);

    MessagePlugin.success('最终对话视频提交成功！');
    emit('final-submit', finalVideoUrl.value);

  } catch (error) {
    console.error('💥 最终视频提交失败:', error);
    MessagePlugin.error('提交失败，请重试');
  } finally {
    submittingFinalVideo.value = false;
  }
};

// 生命周期
onMounted(() => {
  console.log('AIGCDialogFlow-new mounted', { videoId: props.videoId });

  // 如果有videoId，开始轮询
  if (props.videoId) {
    generateSingleVideoA();
  }
});

onUnmounted(() => {
  // 停止轮询
  if (videoPolling.value) {
    videoPolling.value.stop();
  }
});

// 暴露方法和属性给父组件
defineExpose({
  generateSingleVideoA,
  generateSingleVideoB,
  submitFinalDialogVideo,
  canProceedToComplete,
  roleAVideos,
  roleBVideos,
  finalVideoUrl
});
</script>

<style lang="less" scoped>
.aigc-dialog-flow {
  .basic-info-section {
    margin-bottom: 32px;
    padding: 24px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .section-header {
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
      }
    }

    .info-form {
      .form-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        span {
          min-width: 120px;
          font-weight: 500;
          color: #374151;
        }
      }
    }
  }

  .video-generation-section {
    .loading-section {
      margin-bottom: 32px;
      padding: 40px;
      background: #f8fafc;
      border-radius: 12px;
      text-align: center;

      .loading-container {
        max-width: 400px;
        margin: 0 auto;

        .loading-info {
          margin-top: 24px;

          h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
          }

          .loading-details {
            margin-top: 12px;
            font-size: 14px;
            color: #6b7280;
          }
        }
      }
    }

    .role-videos-container {
      display: grid;
      gap: 32px;
      margin-bottom: 32px;
    }

    .role-videos-section {
      padding: 24px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .section-actions {
          display: flex;
          gap: 8px;
        }
      }

      .video-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }

      .video-item {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        background: #ffffff;
        transition: box-shadow 0.2s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .video-content {
          .video-preview {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }

          .video-meta {
            padding: 12px;

            h4 {
              margin: 0 0 8px 0;
              font-size: 14px;
              font-weight: 600;
              color: #374151;
            }

            p {
              margin: 0;
              font-size: 12px;
              color: #6b7280;
              line-height: 1.4;
            }
          }
        }

        .video-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
        }
      }
    }

    .video-tools-section {
      margin-bottom: 32px;
      padding: 24px;
      background: #f0f9ff;
      border-radius: 12px;
      border: 1px solid #bae6fd;

      .tools-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #0369a1;
        }

        .tools-info {
          font-size: 14px;
          color: #0369a1;
        }
      }

      .tools-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .tools-tips {
        p {
          margin: 0;
          font-size: 14px;
          color: #0369a1;
        }
      }
    }

    .final-video-section {
      padding: 24px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .section-header {
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
      }

      .video-upload-area {
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
      }

      .uploaded-video-preview {
        text-align: center;

        h4 {
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .final-video {
          width: 100%;
          max-width: 600px;
          max-height: 400px;
          border-radius: 8px;
        }

        .video-info {
          margin: 12px 0;

          p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
          }
        }

        .video-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
      }
    }
  }
}
</style>

<!-- 头部信息 -->
<div class="flow-header">
      <h2>对话视频</h2>
      <div class="video-info">
        <span>视频所属合集：</span>
        <t-select v-model="formData.series_name" placeholder="xx教材-对话视频" style="width: 200px;">
          <t-option value="xx教材-对话视频" label="xx教材-对话视频" />
        </t-select>
        <span class="step-badge">12</span>

        <span style="margin-left: 20px;">视频名称：</span>
        <t-input v-model="formData.title" placeholder="输入框文本：第几课+视频名" style="width: 300px;" />
        <span class="step-badge">13</span>
      </div>
</div>

<!-- 主要内容区域 -->
<div class="main-content">
      <!-- 左侧图片区域 -->
      <div class="image-section">
        <!-- 远景图区域 -->
        <div class="image-card">
          <div class="image-placeholder" v-if="!currentVideo?.ai_far_img_url">
            <t-icon name="image" size="64px" />
            <span class="step-badge">3</span>
          </div>
<img v-else :src="currentVideo.ai_far_img_url" alt="远景图" />
<div class="image-overlay" v-if="showFarImgOverlay">
            <span class="step-badge">4</span>
          </div>
</div>

<!-- 近景图A区域 -->
<div class="image-card">
          <div class="image-placeholder" v-if="!currentVideo?.detail_a?.near_ai_img_url">
            <t-icon name="image" size="64px" />
            <span class="step-badge">6</span>
          </div>
<img v-else :src="currentVideo.detail_a.near_ai_img_url" alt="角色A近景图" />
<t-button class="generate-btn" size="small" @click="generateNearImgA" :loading="loadingNearA">
            生成A近景图
            <span class="step-badge">5</span>
          </t-button>
</div>

<!-- 近景图B区域 -->
<div class="image-card">
          <div class="image-placeholder" v-if="!currentVideo?.detail_b?.near_ai_img_url">
            <t-icon name="image" size="64px" />
          </div>
<img v-else :src="currentVideo.detail_b.near_ai_img_url" alt="角色B近景图" />
<t-button class="generate-btn" size="small" @click="generateNearImgB" :loading="loadingNearB">
            生成B近景图
          </t-button>
</div>
</div>

<!-- 右侧配置区域 -->
<div class="config-section">
        <!-- 场景Prompt -->
        <div class="config-card">
          <div class="config-header">
            <span>场景Prompt：</span>
            <span class="step-badge">1</span>
          </div>
<t-textarea v-model="formData.far_img_prompt" placeholder="输入框文本：对话发生场景、环境、人物" :autosize="{ minRows: 3, maxRows: 5 }" />
<t-button theme="primary" @click="generateFarImg" :loading="loadingFarImg" style="margin-top: 10px;">
            生成全景图
            <span class="step-badge">2</span>
          </t-button>
</div>

<!-- 角色A配置 -->
<div class="config-card">
          <div class="dialog-input">
            <span>角色A-1：</span>
            <span class="step-badge">7</span>
            <t-input v-model="dialogConfig.roleA.content1" placeholder="输入框文本：对话内容" />
            <t-button class="generate-single-btn" size="small" @click="generateSingleVideoA" :loading="loadingSingleA">
              生成单人视频
              <span class="step-badge">11</span>
            </t-button>
          </div>

<div class="dialog-input">
            <span>角色A-2：</span>
            <t-input v-model="dialogConfig.roleA.content2" placeholder="" />
          </div>

<div class="audio-config">
            <span>音色选择：</span>
            <span class="step-badge">8</span>
            <t-select v-model="dialogConfig.roleA.audioType" placeholder="温柔知性女声">
              <t-option value="温柔知性女声" label="温柔知性女声" />
              <t-option value="活泼可爱女声" label="活泼可爱女声" />
              <t-option value="成熟男声" label="成熟男声" />
            </t-select>

            <span style="margin-left: 20px;">倍速：</span>
            <span class="step-badge">9</span>
            <t-select v-model="dialogConfig.roleA.audioRatio" placeholder="0.5x">
              <t-option :value="0.5" label="0.5x" />
              <t-option :value="1.0" label="1.0x" />
              <t-option :value="1.5" label="1.5x" />
              <t-option :value="2.0" label="2.0x" />
            </t-select>

            <t-button @click="tryAudioA" :loading="loadingTryA" style="margin-left: 10px;">
              试听
              <span class="step-badge">10</span>
            </t-button>
          </div>
</div>

<!-- 角色B配置 -->
<div class="config-card">
          <div class="dialog-input">
            <span>角色B-1：</span>
            <t-input v-model="dialogConfig.roleB.content1" placeholder="输入框文本：对话内容" />
            <t-button class="generate-single-btn" size="small" @click="generateSingleVideoB" :loading="loadingSingleB">
              生成单人视频
            </t-button>
          </div>

<div class="dialog-input">
            <span>角色B-2：</span>
            <t-input v-model="dialogConfig.roleB.content2" placeholder="" />
          </div>

<div class="audio-config">
            <span>音色选择：</span>
            <t-select v-model="dialogConfig.roleB.audioType" placeholder="温柔知性女声">
              <t-option value="温柔知性女声" label="温柔知性女声" />
              <t-option value="活泼可爱女声" label="活泼可爱女声" />
              <t-option value="成熟男声" label="成熟男声" />
            </t-select>

            <span style="margin-left: 20px;">倍速：</span>
            <t-select v-model="dialogConfig.roleB.audioRatio" placeholder="0.5x">
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

<!-- 底部创建按钮 -->
<div class="bottom-actions">
      <span>视频合集名：</span>
      <t-input v-model="formData.series_name" placeholder="xx教材 对话视频" readonly style="width: 200px;" />
      <span class="step-badge">12</span>

      <span style="margin-left: 20px;">视频名称：</span>
      <t-input v-model="formData.title" placeholder="输入框文本：第几课+视频名" style="width: 300px;" />
      <span class="step-badge">13</span>

      <t-button theme="primary" @click="createDialogVideo" :loading="loading" style="margin-left: 20px;">
        创建视频
      </t-button>
    </div>

<!-- 音频试听弹窗 -->
<t-dialog v-model:visible="audioDialogVisible" header="音频试听" :width="400">
      <div class="audio-preview">
        <audio v-if="previewAudioUrl" :src="previewAudioUrl" controls autoplay style="width: 100%;" />
        <div v-else class="loading-audio">正在生成音频...</div>
      </div>
      <template #footer>
        <t-button @click="audioDialogVisible = false">关闭</t-button>
      </template>
    </t-dialog>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  createAIGCDialog,
  operateAIGCDialogGenFarImg,
  operateAIGCDialogGenNearImgA,
  operateAIGCDialogGenNearImgB,
  operateAIGCDialogGenVideo,
  operateAIGCDialogSubmitFinal,
  tryAIGCDialogAudio,
  getAIGCDialog,
  getDialogStatusText,
  AIGCDialogStatus,
  type AIGCDialog,
  type AIGCDialogDetail
} from '@/api/aigc-video';

// 定义 emits
const emit = defineEmits(['back']);

// 响应式数据
const loading = ref(false);
const videoId = ref('');
const currentVideo = ref<AIGCDialog | null>(null);

// 表单数据
const formData = ref({
  series_name: 'xx教材-对话视频',
  title: '',
  far_img_prompt: ''
});

// 对话配置数据
const dialogConfig = ref({
  roleA: {
    content1: '',
    content2: '',
    audioType: '温柔知性女声',
    audioRatio: 0.5
  },
  roleB: {
    content1: '',
    content2: '',
    audioType: '温柔知性女声',
    audioRatio: 0.5
  }
});

// 加载状态
const loadingFarImg = ref(false);
const loadingNearA = ref(false);
const loadingNearB = ref(false);
const loadingSingleA = ref(false);
const loadingSingleB = ref(false);
const loadingTryA = ref(false);
const loadingTryB = ref(false);

// 界面状态
const showFarImgOverlay = ref(false);
const audioDialogVisible = ref(false);
const previewAudioUrl = ref('');

// 计算属性
const canCreateVideo = computed(() => {
  return formData.value.series_name &&
    formData.value.title &&
    formData.value.far_img_prompt &&
    dialogConfig.value.roleA.content1 &&
    dialogConfig.value.roleB.content1;
});

// 方法实现
const handleBack = () => {
  emit('back');
};

// 生成远景图
const generateFarImg = async () => {
  if (!formData.value.far_img_prompt.trim()) {
    MessagePlugin.warning('请输入场景Prompt');
    return;
  }

  loadingFarImg.value = true;
  try {
    // 如果还没有创建视频，先创建
    if (!videoId.value) {
      if (!formData.value.series_name || !formData.value.title) {
        MessagePlugin.warning('请先输入系列名称和视频标题');
        return;
      }

      const createResponse = await createAIGCDialog({
        series_name: formData.value.series_name,
        title: formData.value.title
      });

      if (createResponse.code === 0 || createResponse.code === 200) {
        videoId.value = createResponse.data?.aigc_dialog?.id || '';
      } else {
        MessagePlugin.error(createResponse.message || '创建视频失败');
        return;
      }
    }

    // 生成远景图
    const response = await operateAIGCDialogGenFarImg({
      id: videoId.value,
      ai_far_img_prompt: formData.value.far_img_prompt
    });

    if (response.code === 0 || response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      MessagePlugin.success('远景图生成任务已提交');
      showFarImgOverlay.value = true;
    } else {
      MessagePlugin.error(response.message || '生成远景图失败');
    }
  } catch (error) {
    console.error('生成远景图失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loadingFarImg.value = false;
  }
};

// 生成角色A近景图
const generateNearImgA = async () => {
  if (!videoId.value) {
    MessagePlugin.warning('请先生成远景图');
    return;
  }

  loadingNearA.value = true;
  try {
    const response = await operateAIGCDialogGenNearImgA({
      id: videoId.value,
      ai_near_img_prompt_a: '生成角色A近景图',
      character_desc_a: '对话角色A'
    });

    if (response.code === 0 || response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      MessagePlugin.success('角色A近景图生成任务已提交');
    } else {
      MessagePlugin.error(response.message || '生成角色A近景图失败');
    }
  } catch (error) {
    console.error('生成角色A近景图失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loadingNearA.value = false;
  }
};

// 生成角色B近景图
const generateNearImgB = async () => {
  if (!videoId.value) {
    MessagePlugin.warning('请先生成远景图');
    return;
  }

  loadingNearB.value = true;
  try {
    const response = await operateAIGCDialogGenNearImgB({
      id: videoId.value,
      ai_near_img_prompt_b: '生成角色B近景图',
      character_desc_b: '对话角色B'
    });

    if (response.code === 0 || response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      MessagePlugin.success('角色B近景图生成任务已提交');
    } else {
      MessagePlugin.error(response.message || '生成角色B近景图失败');
    }
  } catch (error) {
    console.error('生成角色B近景图失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loadingNearB.value = false;
  }
};

// 试听角色A音频
const tryAudioA = async () => {
  if (!dialogConfig.value.roleA.content1.trim()) {
    MessagePlugin.warning('请输入角色A对话内容');
    return;
  }

  loadingTryA.value = true;
  try {
    const response = await tryAIGCDialogAudio({
      content: dialogConfig.value.roleA.content1,
      audio_type: dialogConfig.value.roleA.audioType,
      audio_ratio: dialogConfig.value.roleA.audioRatio
    });

    if (response.code === 0 || response.code === 200) {
      previewAudioUrl.value = response.data.audio_url;
      audioDialogVisible.value = true;
    } else {
      MessagePlugin.error(response.message || '生成音频失败');
    }
  } catch (error) {
    console.error('试听音频失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loadingTryA.value = false;
  }
};

// 试听角色B音频
const tryAudioB = async () => {
  if (!dialogConfig.value.roleB.content1.trim()) {
    MessagePlugin.warning('请输入角色B对话内容');
    return;
  }

  loadingTryB.value = true;
  try {
    const response = await tryAIGCDialogAudio({
      content: dialogConfig.value.roleB.content1,
      audio_type: dialogConfig.value.roleB.audioType,
      audio_ratio: dialogConfig.value.roleB.audioRatio
    });

    if (response.code === 0 || response.code === 200) {
      previewAudioUrl.value = response.data.audio_url;
      audioDialogVisible.value = true;
    } else {
      MessagePlugin.error(response.message || '生成音频失败');
    }
  } catch (error) {
    console.error('试听音频失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loadingTryB.value = false;
  }
};

// 生成单人视频A  
const generateSingleVideoA = async () => {
  if (!videoId.value) {
    MessagePlugin.warning('请先创建视频');
    return;
  }

  if (!dialogConfig.value.roleA.content1.trim()) {
    MessagePlugin.warning('请输入角色A对话内容');
    return;
  }

  loadingSingleA.value = true;
  try {
    // 构造detail_a数据
    const detailA: AIGCDialogDetail = {
      near_ai_img_url: currentVideo.value?.detail_a?.near_ai_img_url,
      audio_type: dialogConfig.value.roleA.audioType,
      audio_ratio: dialogConfig.value.roleA.audioRatio,
      content_list: [dialogConfig.value.roleA.content1, dialogConfig.value.roleA.content2].filter(Boolean),
      ai_video_url_list: [],
      gen_ai_video_succeed: false
    };

    const response = await operateAIGCDialogGenVideo({
      id: videoId.value,
      detail_a: detailA,
      detail_b: currentVideo.value?.detail_b || {
        gen_ai_video_succeed: false
      }
    });

    if (response.code === 0 || response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      MessagePlugin.success('单人视频A生成任务已提交');
    } else {
      MessagePlugin.error(response.message || '生成单人视频失败');
    }
  } catch (error) {
    console.error('生成单人视频A失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loadingSingleA.value = false;
  }
};

// 生成单人视频B
const generateSingleVideoB = async () => {
  if (!videoId.value) {
    MessagePlugin.warning('请先创建视频');
    return;
  }

  if (!dialogConfig.value.roleB.content1.trim()) {
    MessagePlugin.warning('请输入角色B对话内容');
    return;
  }

  loadingSingleB.value = true;
  try {
    // 构造detail_b数据
    const detailB: AIGCDialogDetail = {
      near_ai_img_url: currentVideo.value?.detail_b?.near_ai_img_url,
      audio_type: dialogConfig.value.roleB.audioType,
      audio_ratio: dialogConfig.value.roleB.audioRatio,
      content_list: [dialogConfig.value.roleB.content1, dialogConfig.value.roleB.content2].filter(Boolean),
      ai_video_url_list: [],
      gen_ai_video_succeed: false
    };

    const response = await operateAIGCDialogGenVideo({
      id: videoId.value,
      detail_a: currentVideo.value?.detail_a || {
        gen_ai_video_succeed: false
      },
      detail_b: detailB
    });

    if (response.code === 0 || response.code === 200) {
      currentVideo.value = response.data.aigc_dialog;
      MessagePlugin.success('单人视频B生成任务已提交');
    } else {
      MessagePlugin.error(response.message || '生成单人视频失败');
    }
  } catch (error) {
    console.error('生成单人视频B失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loadingSingleB.value = false;
  }
};

// 创建最终对话视频
const createDialogVideo = async () => {
  if (!canCreateVideo.value) {
    MessagePlugin.warning('请完整填写所有必要信息');
    return;
  }

  loading.value = true;
  try {
    // 如果已经有视频ID，说明是最终提交
    if (videoId.value && currentVideo.value) {
      const response = await operateAIGCDialogSubmitFinal({
        id: videoId.value,
        series_name: formData.value.series_name,
        title: formData.value.title,
        final_video_url: currentVideo.value.play_url || ''
      });

      if (response.code === 0 || response.code === 200) {
        MessagePlugin.success('对话视频创建成功');
        emit('back');
      } else {
        MessagePlugin.error(response.message || '创建最终视频失败');
      }
    } else {
      // 否则只是创建基础视频
      const createResponse = await createAIGCDialog({
        series_name: formData.value.series_name,
        title: formData.value.title
      });

      if (createResponse.code === 0 || createResponse.code === 200) {
        videoId.value = createResponse.data?.aigc_dialog?.id || '';
        currentVideo.value = createResponse.data.aigc_dialog;
        MessagePlugin.success('视频创建成功，请继续完成配置');
      } else {
        MessagePlugin.error(createResponse.message || '创建视频失败');
      }
    }
  } catch (error) {
    console.error('创建视频失败:', error);
    MessagePlugin.error('操作失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.aigc-dialog-flow {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.flow-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.flow-header h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #1f2937;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-badge {
  background: #3b82f6;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.main-content {
  display: flex;
  gap: 20px;
}

.image-section {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.image-card {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 200px;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
  color: #9ca3af;
  position: relative;
}

.image-placeholder .step-badge {
  position: absolute;
  top: 10px;
  right: 10px;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.generate-btn {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.config-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-weight: 600;
}

.dialog-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.dialog-input span:first-child {
  min-width: 80px;
  font-weight: 500;
}

.generate-single-btn {
  margin-left: auto;
}

.audio-config {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bottom-actions {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.audio-preview {
  padding: 20px;
  text-align: center;
}

.loading-audio {
  color: #6b7280;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .image-section {
    flex: none;
  }

  .video-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .audio-config {
    flex-direction: column;
    align-items: flex-start;
  }

  .bottom-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>
