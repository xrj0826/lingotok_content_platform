<!-- 用户视频管理 -->
<template>
  <div>
    <t-card class="row-container" :bordered="false">
      <t-space direction="vertical" style="width: 100%">
        <!-- 搜索区域 -->
        <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">用户ID</div>
            <t-input v-model="searchUserId" placeholder="搜索用户ID" style="width: 240px" clearable />
          </div>

          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">用户邮箱</div>
            <t-input v-model="searchEmail" placeholder="搜索用户邮箱" style="width: 240px" clearable />
          </div>

          <div style="display: flex; gap: 8px; margin-left: auto;">
            <t-button theme="default" @click="handleReset">重置</t-button>
            <t-button theme="primary" @click="handleSearch">搜索</t-button>
          </div>
        </div>

        <!-- 视频列表表格 -->
        <t-table row-key="id" :data="videoList" :columns="columns" :bordered="true" size="small" :loading="loading"
          :hover="true" :pagination="pagination" @page-change="onPageChange">
          <!-- 状态列 -->
          <template #status="{ row }">
            <t-tag :theme="getStatusTheme(row.status)">
              {{ getStatusText(row.status) }}
            </t-tag>
          </template>
          <!-- 单词卡列 -->
          <template #wordResult="{ row }">
            <div v-if="row.gen_word_result">
              <div v-for="(word, lang) in row.gen_word_result" :key="lang">
                {{ lang }}: {{ word }}
              </div>
            </div>
            <span v-else>-</span>
          </template>
          <!-- 链接列 -->
          <template #link="{ row }">
            <span>{{ row.gen_video_play || '-' }}</span>
          </template>
        </t-table>
      </t-space>
    </t-card>

    <!-- 视频详情弹窗 -->
    <t-dialog v-model:visible="showDetailDialog" header="视频详情" :footer="false" width="1200px"
      :close-on-overlay-click="true">
      <template v-if="currentVideo">
        <div class="video-detail">
          <!-- 视频预览 -->
          <div class="video-preview-section">
            <div class="video-player-box">
              <div v-if="currentVideo.video_url" class="video-container">
                <video ref="videoPlayer" class="video-player" :src="currentVideo.video_url" controls preload="metadata">
                  您的浏览器不支持 HTML5 视频播放
                </video>
              </div>
              <div v-else class="video-placeholder">
                暂无视频
              </div>
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="video-info-section">
            <div class="info-group">
              <div class="detail-item">
                <span class="label">视频ID:</span>
                <span class="value">{{ currentVideo.video_id || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">标题:</span>
                <span class="value">{{ currentVideo.title || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">上传时间:</span>
                <span class="value">{{ formatDate(currentVideo.upload_time) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">状态:</span>
                <span class="value">
                  <t-tag :theme="getStatusTheme(currentVideo.status)">
                    {{ getStatusText(currentVideo.status) }}
                  </t-tag>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </t-dialog>

    <!-- 删除确认弹窗 -->
    <t-dialog v-model:visible="showDeleteDialog" header="删除确认" theme="warning"
      :confirm-btn="{ content: '确认', theme: 'danger' }" :cancel-btn="{ content: '取消' }" @confirm="confirmDelete">
      <template #body>
        <p>确定要删除该视频吗？此操作不可恢复。</p>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// 定义视频状态枚举
enum VideoStatus {
  GEN_WORD_PROCESSING = 1,
  GEN_WORD_FAILED = 2,
  GEN_VIDEO_PROCESSING = 3,
  GEN_VIDEO_FAILED = 4,
  FINISHED = 5
}

// 基础数据
const videoList = ref([]);
const loading = ref(false);
const searchUserId = ref('');
const searchEmail = ref('');
const showDetailDialog = ref(false);
const showDeleteDialog = ref(false);
const currentVideo = ref(null);
const videoToDelete = ref(null);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  pageSizeOptions: [10, 20, 50]
});

// 表格列配置
const columns = [
  {
    colKey: 'id',
    title: '视频ID',
    width: 180,
    ellipsis: true
  },
  {
    colKey: 'user_id',
    title: '用户ID',
    width: 180,
    ellipsis: true
  },
  {
    colKey: 'createTime',
    title: '创建时间',
    width: 180,
    cell: (h, { row }) => formatDate(row.createTime)
  },
  {
    colKey: 'status',
    title: '状态',
    width: 120,
    cell: 'status'
  },
  {
    colKey: 'gen_word_result',
    title: '单词卡',
    width: 200,
    cell: 'wordResult'
  },
  {
    colKey: 'gen_video_asset_id',
    title: '生成视频AssetID',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'gen_video_play',
    title: '生成视频链接',
    width: 400,
    cell: 'link',
    ellipsis: true
  }
];

// 获取状态主题
const getStatusTheme = (status: string): 'default' | 'warning' | 'success' | 'danger' | 'primary' => {
  const themeMap: Record<string, 'default' | 'warning' | 'success' | 'danger' | 'primary'> = {
    'gen_word_processing': 'warning',
    'gen_word_failed': 'danger',
    'gen_video_processing': 'primary',
    'gen_video_failed': 'danger',
    'finished': 'success'
  };
  return themeMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'gen_word_processing': '单词卡生成中',
    'gen_word_failed': '单词卡生成失败',
    'gen_video_processing': '视频生成中',
    'gen_video_failed': '视频生成失败',
    'finished': '已完成'
  };
  return textMap[status] || '未知状态';
};

// 格式化日期
function formatDate(timestamp: number) {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

// 生成签名
function generateSignature(timestamp: string): string {
  const apiName = 'search_self_video';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 获取视频列表
async function fetchVideoList() {
  try {
    loading.value = true;
    const timestamp = Date.now().toString();
    const headers = {
      Timestamp: timestamp,
      Signature: generateSignature(timestamp)
    };

    const params = {
      user_id: searchUserId.value || undefined,
      email: searchEmail.value || undefined,
      offset: (pagination.current - 1) * pagination.pageSize,
      limit: pagination.pageSize
    };

    const response = await axios.post(
      'https://api.lingotok.ai/api/v1/self_video/search_self_video',
      params,
      { headers }
    );

    if (response.data?.code === 200) {
      // 确保返回的数据中包含所需的字段
      videoList.value = (response.data.data.self_video_list || []).map((item: any) => ({
        ...item,
        create_time: item.create_time || null
      }));
      pagination.total = response.data.data.total || 0;
    } else {
      throw new Error(response.data?.message || '获取视频列表失败');
    }
  } catch (error) {
    console.error('获取视频列表失败:', error);
    MessagePlugin.error('获取视频列表失败：' + (error.message || '未知错误'));
    // 出错时设置空数组，避免显示旧数据
    videoList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
}

// 显示视频详情
const showVideoDetail = (video: any) => {
  currentVideo.value = video;
  showDetailDialog.value = true;
};

// 处理删除视频
const handleDeleteVideo = (video: any) => {
  videoToDelete.value = video;
  showDeleteDialog.value = true;
};

// 确认删除视频
const confirmDelete = async () => {
  if (!videoToDelete.value) return;

  try {
    const username = localStorage.getItem('username') || '';
    const headers = {
      Timestamp: Date.now().toString(),
      Signature: generateSignature(Date.now().toString())
    };

    const params = {
      user_id: username,
      video_id: videoToDelete.value.video_id
    };

    const response = await axios.post(
      'https://api.lingotok.ai/api/v1/self_video/delete_self_video',
      params,
      { headers }
    );

    if (response.data?.code === 200) {
      MessagePlugin.success('删除成功');
      showDeleteDialog.value = false;
      fetchVideoList();
    } else {
      throw new Error(response.data?.message || '删除失败');
    }
  } catch (error) {
    console.error('删除失败:', error);
    MessagePlugin.error('删除失败：' + (error.message || '未知错误'));
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchVideoList();
};

// 处理重置
const handleReset = () => {
  searchUserId.value = '';
  searchEmail.value = '';
  handleSearch();
};

// 处理分页变化
const onPageChange = (pageInfo: { current: number, pageSize: number }) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchVideoList();
};

// 组件挂载时获取视频列表
onMounted(() => {
  fetchVideoList();
});
</script>

<style scoped>
.video-title {
  color: #0052d9;
  cursor: pointer;
}

.video-title:hover {
  text-decoration: underline;
}

.video-detail {
  display: flex;
  gap: 24px;
  padding: 20px;
}

.video-preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 600px;
}

.video-player-box {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.video-info-section {
  width: 400px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.label {
  width: 100px;
  color: #666;
}

.value {
  flex: 1;
  word-break: break-all;
}

.video-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 67.5px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.t-link {
  cursor: pointer;
}

.t-link:hover {
  text-decoration: underline;
}
</style>