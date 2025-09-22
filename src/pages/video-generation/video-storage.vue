<!-- 视频存储库页面 -->
<template>
  <div class="video-storage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>视频存储库</h2>
      <p>管理和查看所有已生成的视频内容</p>
    </div>

    <!-- 视频合集下拉框 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>视频合集：</label>
        <t-select v-model="selectedCollection" placeholder="选择视频合集" @change="handleCollectionChange"
          style="width: 300px">
          <t-option value="" label="全部合集" />
          <t-option v-for="collection in videoCollections" :key="collection.id" :value="collection.id"
            :label="collection.name" />
        </t-select>
      </div>

      <!-- 查询按钮 -->
      <div class="filter-group">
        <t-button theme="primary" :loading="isSearching" @click="searchVideos">
          查询
        </t-button>
        <t-button theme="default" @click="resetSearch">
          重置
        </t-button>
      </div>
    </div>

    <!-- 视频展示区 -->
    <div class="video-display-section">
      <div class="section-header">
        <h3>视频展示区</h3>
        <div class="video-count">
          <span>视频条数：{{ totalVideos }}</span>
        </div>
      </div>

      <!-- 视频列表 -->
      <div class="video-list" v-if="videoList.length > 0">
        <div v-for="video in videoList" :key="video.id" class="video-item" @click="selectVideo(video)">
          <!-- 视频缩略图 -->
          <div class="video-thumbnail">
            <img v-if="video.thumbnailUrl" :src="video.thumbnailUrl" :alt="video.title" @error="handleImageError" />
            <div v-else class="no-thumbnail">
              <t-icon name="video" size="32px" />
            </div>
            <div class="video-duration" v-if="video.duration">
              {{ formatDuration(video.duration) }}
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="video-info">
            <h4 class="video-title">{{ video.title }}</h4>
            <p class="video-description">{{ video.description || '暂无描述' }}</p>
            <div class="video-meta">
              <span class="video-type">{{ getVideoTypeText(video.type) }}</span>
              <span class="video-collection">{{ getCollectionName(video.collectionId) }}</span>
              <span class="video-date">{{ formatDate(video.createTime) }}</span>
            </div>
          </div>

          <!-- 视频操作 -->
          <div class="video-actions">
            <t-button size="small" theme="primary" variant="outline" @click.stop="playVideo(video)">
              播放
            </t-button>
            <t-button size="small" theme="default" variant="outline" @click.stop="downloadVideo(video)">
              下载
            </t-button>
            <t-button size="small" theme="danger" variant="outline" @click.stop="deleteVideo(video)">
              删除
            </t-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <t-icon name="video" size="64px" />
          <h3>{{ isSearching ? '正在加载...' : (selectedCollection ? '该合集暂无视频' : '暂无视频') }}</h3>
          <p>{{ selectedCollection ? '请选择其他合集或创建新视频' : '开始创建您的第一个视频吧' }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalVideos > pageSize" class="pagination-section">
        <t-pagination v-model="currentPage" :total="totalVideos" :page-size="pageSize" :show-jumper="true"
          :show-page-size="true" :page-size-options="[10, 20, 50, 100]" @change="handlePageChange"
          @page-size-change="handlePageSizeChange" />
      </div>
    </div>

    <!-- 视频播放对话框 -->
    <t-dialog v-model:visible="videoPlayerVisible" :header="currentVideo?.title || '视频播放'" width="80%" :footer="false"
      @close="closeVideoPlayer">
      <div class="video-player-container">
        <video v-if="currentVideo?.videoUrl" :src="currentVideo.videoUrl" controls autoplay
          style="width: 100%; max-height: 70vh;">
          您的浏览器不支持视频播放
        </video>
        <div v-else class="video-error">
          <t-icon name="close-circle" size="48px" />
          <p>视频加载失败</p>
        </div>
      </div>
    </t-dialog>

    <!-- 删除确认对话框 -->
    <t-dialog v-model:visible="deleteConfirmVisible" header="删除确认" width="400px" @confirm="confirmDelete"
      @cancel="cancelDelete">
      <p>确定要删除视频 "{{ videoToDelete?.title }}" 吗？</p>
      <p style="color: #ff4d4f; font-size: 12px;">此操作不可恢复</p>
      <template #footer>
        <t-button theme="default" @click="cancelDelete">取消</t-button>
        <t-button theme="danger" @click="confirmDelete">确定删除</t-button>
      </template>
    </t-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { getVideoCollections, getStorageVideoList, deleteStorageVideo } from '@/api/video-generation';
import { getAIGCFinalVideoList, AIGCType } from '@/api/aigc-video';

// 接口定义
interface VideoCollection {
  id: string;
  name: string;
  description: string;
  type: 'dialogue' | 'word' | 'mixed';
  count: number;
}

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  type: 'dialogue' | 'word';
  collectionId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  createTime: number;
  updateTime: number;
  fileSize?: number;
}

// 响应式数据
const selectedCollection = ref('');
const videoCollections = ref<VideoCollection[]>([]);
const videoList = ref<VideoItem[]>([]);
const totalVideos = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const isSearching = ref(false);

// 视频播放相关
const videoPlayerVisible = ref(false);
const currentVideo = ref<VideoItem | null>(null);

// 删除确认相关
const deleteConfirmVisible = ref(false);
const videoToDelete = ref<VideoItem | null>(null);

// 组件挂载时初始化数据
onMounted(async () => {
  await loadVideoCollections();
  await loadVideos();
});

// 加载视频合集
const loadVideoCollections = async () => {
  try {
    const response = await getVideoCollections();
    if (response.code === 0) {
      videoCollections.value = response.data;
    } else {
      MessagePlugin.error(response.message || '获取视频合集失败');
    }
  } catch (error) {
    console.error('加载视频合集失败:', error);
    MessagePlugin.error('加载视频合集失败');
  }
};

// 加载视频列表
const loadVideos = async () => {
  isSearching.value = true;

  try {
    // 使用与视频合集管理页面一致的数据获取逻辑
    const params = {
      collectionId: selectedCollection.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value
    };

    // 使用视频存储API获取数据
    const response = await getStorageVideoList(params);

    if (response.code === 0) {
      videoList.value = response.data.list;
      totalVideos.value = response.data.total;

      // 不处理缩略图，直接使用原始URL
      videoList.value.forEach(video => {
        if (!video.thumbnailUrl && video.videoUrl) {
          // 在没有缩略图的情况下，直接显示默认图像
          console.log('视频缺少缩略图，将使用默认图像:', video.title);
        }
      });
    } else {
      MessagePlugin.error(response.message || '获取视频列表失败');
    }
  } catch (error) {
    console.error('加载视频失败:', error);
    MessagePlugin.error('加载视频失败');
  } finally {
    isSearching.value = false;
  }
};

// 处理合集变化
const handleCollectionChange = () => {
  currentPage.value = 1;
  loadVideos();
};

// 搜索视频
const searchVideos = () => {
  currentPage.value = 1;
  loadVideos();
};

// 重置搜索
const resetSearch = () => {
  selectedCollection.value = '';
  currentPage.value = 1;
  loadVideos();
};

// 选择视频
const selectVideo = (video: VideoItem) => {
  console.log('选择视频:', video);
  // 这里可以添加选择视频的逻辑
};

// 播放视频
const playVideo = (video: VideoItem) => {
  currentVideo.value = video;
  videoPlayerVisible.value = true;
};

// 关闭视频播放器
const closeVideoPlayer = () => {
  videoPlayerVisible.value = false;
  currentVideo.value = null;
};

// 下载视频
const downloadVideo = (video: VideoItem) => {
  try {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `${video.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    MessagePlugin.success('开始下载视频');
  } catch (error) {
    console.error('下载失败:', error);
    MessagePlugin.error('下载失败');
  }
};

// 删除视频
const deleteVideo = (video: VideoItem) => {
  videoToDelete.value = video;
  deleteConfirmVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (!videoToDelete.value) return;

  try {
    const response = await deleteStorageVideo(videoToDelete.value.id);

    if (response.code === 0) {
      MessagePlugin.success('视频删除成功');
      deleteConfirmVisible.value = false;
      videoToDelete.value = null;

      // 重新加载视频列表
      await loadVideos();
    } else {
      MessagePlugin.error(response.message || '删除失败');
    }
  } catch (error) {
    console.error('删除失败:', error);
    MessagePlugin.error('删除失败');
  }
};

// 取消删除
const cancelDelete = () => {
  deleteConfirmVisible.value = false;
  videoToDelete.value = null;
};

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadVideos();
};

// 处理页面大小变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadVideos();
};

// 处理图片错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

// 工具函数
const getVideoTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'dialogue': '对话视频',
    'word': '单词视频'
  };
  return typeMap[type] || type;
};

const getCollectionName = (collectionId: string) => {
  const collection = videoCollections.value.find(c => c.id === collectionId);
  return collection?.name || '未知合集';
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.video-storage-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

/* 过滤区域 */
.filter-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
}

/* 视频展示区域 */
.video-display-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.video-count {
  color: #6b7280;
  font-size: 14px;
}

/* 视频列表 */
.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.video-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
}

.video-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-thumbnail {
  color: #9ca3af;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 16px;
}

.video-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-description {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.video-meta span {
  padding: 2px 8px;
  border-radius: 12px;
  background: #f3f4f6;
  color: #6b7280;
}

.video-actions {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 8px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-content {
  color: #9ca3af;
}

.empty-content h3 {
  margin: 16px 0 8px 0;
  color: #6b7280;
}

.empty-content p {
  margin: 0;
  color: #9ca3af;
}

/* 分页 */
.pagination-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

/* 视频播放器 */
.video-player-container {
  text-align: center;
}

.video-error {
  padding: 40px;
  color: #9ca3af;
}

.video-error p {
  margin: 12px 0 0 0;
  color: #6b7280;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .video-storage-container {
    padding: 12px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .video-list {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>
