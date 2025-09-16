<!-- AIGC视频列表组件 -->
<template>
  <div class="aigc-video-list">
    <!-- 头部 -->
    <div class="list-header">
      <h2>AIGC视频库</h2>
      <t-button theme="primary" @click="handleCreateNew">
        <template #icon>
          <t-icon name="add" />
        </template>
        创建新视频
      </t-button>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <t-space>
        <t-select v-model="filterType" placeholder="视频类型" style="width: 150px" @change="handleFilterChange">
          <t-option value="" label="全部类型" />
          <t-option :value="AIGCType.WORD" label="单词视频" />
          <t-option :value="AIGCType.DIALOG" label="对话视频" />
        </t-select>

        <t-input v-model="searchKeyword" placeholder="搜索标题或关键词" style="width: 300px" @enter="loadVideos">
          <template #suffix>
            <t-icon name="search" />
          </template>
        </t-input>

        <t-button @click="loadVideos">搜索</t-button>
        <t-button theme="default" @click="resetFilter">重置</t-button>
      </t-space>
    </div>

    <!-- 视频列表 -->
    <div class="video-grid" v-loading="loading">
      <div v-if="videoList.length === 0 && !loading" class="empty-state">
        <t-icon name="video" size="64px" />
        <h3>暂无视频</h3>
        <p>开始创建您的第一个AIGC视频吧</p>
        <t-button theme="primary" @click="handleCreateNew">创建视频</t-button>
      </div>

      <div v-else class="video-cards">
        <!-- 单词视频卡片 -->
        <div v-for="video in wordVideos" :key="video.id" class="video-card word-video">
          <div class="video-thumbnail">
            <img v-if="video.cover_url" :src="video.cover_url" :alt="video.title" @error="handleImageError" />
            <div v-else class="thumbnail-placeholder">
              <t-icon name="video" size="32px" />
            </div>
            <div class="video-type-badge">单词</div>
            <div class="status-badge" :class="getStatusClass(video.status)">
              {{ getWordStatusText(video.status) }}
            </div>
          </div>

          <div class="video-info">
            <h4 class="video-title">{{ video.title }}</h4>
            <p class="video-word">{{ video.word }}</p>
            <div class="video-meta">
              <span class="meta-item">ID: {{ video.id }}</span>
            </div>
          </div>

          <div class="video-actions">
            <t-button v-if="video.play_url" size="small" theme="primary" variant="outline" @click="playVideo(video)">
              播放
            </t-button>
            <t-button size="small" theme="default" variant="outline" @click="viewDetails(video)">
              详情
            </t-button>
            <!-- 移除基于状态的重试按钮，因为不再使用状态枚举 -->
          </div>
        </div>

        <!-- 对话视频卡片 -->
        <div v-for="video in dialogVideos" :key="video.id" class="video-card dialog-video">
          <div class="video-thumbnail">
            <img v-if="video.cover_url" :src="video.cover_url" :alt="video.title" @error="handleImageError" />
            <div v-else class="thumbnail-placeholder">
              <t-icon name="video" size="32px" />
            </div>
            <div class="video-type-badge">对话</div>
            <div class="status-badge" :class="getDialogStatusClass(video.status)">
              {{ getDialogStatusText(video.status) }}
            </div>
          </div>

          <div class="video-info">
            <h4 class="video-title">{{ video.title }}</h4>
            <div class="dialog-preview" v-if="video.detail_a?.text_list || video.detail_b?.text_list">
              <p class="dialog-line">
                A: {{ (video.detail_a?.text_list || [])[0] || '...' }}
              </p>
              <p class="dialog-line">
                B: {{ (video.detail_b?.text_list || [])[0] || '...' }}
              </p>
            </div>
            <div class="video-meta">
              <span class="meta-item">ID: {{ video.id }}</span>
              <span v-if="video.subtitles" class="meta-item">
                字幕: {{ Object.keys(video.subtitles).join(', ') }}
              </span>
            </div>
          </div>

          <div class="video-actions">
            <t-button v-if="video.play_url" size="small" theme="primary" variant="outline" @click="playVideo(video)">
              播放
            </t-button>
            <t-button size="small" theme="default" variant="outline" @click="viewDetails(video)">
              详情
            </t-button>
            <t-button v-if="video.status === AIGCDialogStatus.VIDEO_PROCESS_FAILED" size="small" theme="warning"
              variant="outline" @click="retryGeneration(video)">
              重试
            </t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalCount > pageSize" class="pagination-section">
      <t-pagination v-model="currentPage" :total="totalCount" :page-size="pageSize" :show-jumper="true"
        :show-page-size="true" :page-size-options="[10, 20, 50]" @change="handlePageChange"
        @page-size-change="handlePageSizeChange" />
    </div>

    <!-- 视频播放对话框 -->
    <t-dialog v-model:visible="playerVisible" :header="currentPlayingVideo?.title || '视频播放'" width="80%" :footer="false"
      @close="closePlayer">
      <div class="video-player">
        <video v-if="currentPlayingVideo?.play_url" :src="currentPlayingVideo.play_url" controls autoplay
          style="width: 100%; max-height: 70vh;">
          您的浏览器不支持视频播放
        </video>
      </div>
    </t-dialog>

    <!-- 详情对话框 -->
    <t-dialog v-model:visible="detailsVisible" :header="currentDetailVideo?.title || '视频详情'" width="70%" :footer="false"
      @close="closeDetails">
      <div class="video-details" v-if="currentDetailVideo">
        <!-- 单词视频详情 -->
        <div v-if="'word' in currentDetailVideo" class="word-details">
          <div class="detail-row">
            <strong>单词：</strong>
            <span>{{ currentDetailVideo.word }}</span>
          </div>
          <div class="detail-row">
            <strong>状态：</strong>
            <span :class="getStatusClass(currentDetailVideo.status)">
              {{ getWordStatusText(currentDetailVideo.status) }}
            </span>
          </div>
          <div class="detail-row" v-if="currentDetailVideo.ai_gen_img_url">
            <strong>生成图片：</strong>
            <div class="detail-image">
              <img :src="currentDetailVideo.ai_gen_img_url" alt="生成的图片" />
            </div>
          </div>
          <div class="detail-row" v-if="currentDetailVideo.ai_gen_video_url">
            <strong>生成视频：</strong>
            <div class="detail-video">
              <video :src="currentDetailVideo.ai_gen_video_url" controls>
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
        </div>

        <!-- 对话视频详情 -->
        <div v-else class="dialog-details">
          <div class="detail-row">
            <strong>状态：</strong>
            <span :class="getDialogStatusClass(currentDetailVideo.status)">
              {{ getDialogStatusText(currentDetailVideo.status) }}
            </span>
          </div>
          <div class="detail-row" v-if="currentDetailVideo.far_img_url">
            <strong>远景图：</strong>
            <div class="detail-image">
              <img :src="currentDetailVideo.far_img_url" alt="远景图" />
            </div>
          </div>
          <div class="detail-row" v-if="currentDetailVideo.detail_a || currentDetailVideo.detail_b">
            <strong>角色配置：</strong>
            <div class="roles-config">
              <div v-if="currentDetailVideo.detail_a" class="role-detail">
                <h5>角色A</h5>
                <img v-if="currentDetailVideo.detail_a.near_img_url" :src="currentDetailVideo.detail_a.near_img_url"
                  alt="角色A" class="role-image" />
                <p><strong>音频类型：</strong>{{ currentDetailVideo.detail_a.audio_type }}</p>
                <p><strong>语速：</strong>{{ currentDetailVideo.detail_a.audio_ratio }}x</p>
                <div class="dialog-texts">
                  <p v-for="(text, index) in currentDetailVideo.detail_a.text_list" :key="index" class="dialog-text">
                    {{ index + 1 }}. {{ text }}
                  </p>
                </div>
              </div>
              <div v-if="currentDetailVideo.detail_b" class="role-detail">
                <h5>角色B</h5>
                <img v-if="currentDetailVideo.detail_b.near_img_url" :src="currentDetailVideo.detail_b.near_img_url"
                  alt="角色B" class="role-image" />
                <p><strong>音频类型：</strong>{{ currentDetailVideo.detail_b.audio_type }}</p>
                <p><strong>语速：</strong>{{ currentDetailVideo.detail_b.audio_ratio }}x</p>
                <div class="dialog-texts">
                  <p v-for="(text, index) in currentDetailVideo.detail_b.text_list" :key="index" class="dialog-text">
                    {{ index + 1 }}. {{ text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="detail-row" v-if="currentDetailVideo.subtitles">
            <strong>字幕信息：</strong>
            <div class="subtitles-info">
              <span v-for="(subtitle, lang) in currentDetailVideo.subtitles" :key="lang" class="subtitle-tag">
                {{ lang }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  getAIGCFinalVideoList,
  getDialogStatusText,
  AIGCDialogStatus,
  AIGCType,
  type AIGCWord,
  type AIGCDialog
} from '@/api/aigc-video';

// 定义 emits
interface Emits {
  (e: 'create-new'): void;
}

const emit = defineEmits<Emits>();

// 状态数据
const loading = ref(false);
const videoList = ref<(AIGCWord | AIGCDialog)[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);

// 筛选数据
const filterType = ref<AIGCType | ''>('');
const searchKeyword = ref('');

// 对话框状态
const playerVisible = ref(false);
const detailsVisible = ref(false);
const currentPlayingVideo = ref<AIGCWord | AIGCDialog | null>(null);
const currentDetailVideo = ref<AIGCWord | AIGCDialog | null>(null);

// 计算属性
const wordVideos = computed(() => {
  return videoList.value.filter(video => 'word' in video) as AIGCWord[];
});

const dialogVideos = computed(() => {
  return videoList.value.filter(video => 'detail_a' in video || 'detail_b' in video) as AIGCDialog[];
});

// 组件挂载时加载数据
onMounted(() => {
  loadVideos();
});

// 加载视频列表
const loadVideos = async () => {
  loading.value = true;

  try {
    // 如果有筛选类型，分别加载
    if (filterType.value) {
      const response = await getAIGCFinalVideoList({
        offset: (currentPage.value - 1) * pageSize.value,
        limit: pageSize.value,
        aigc_type: filterType.value
      });

      if (response.code === 0) {
        if (filterType.value === AIGCType.WORD) {
          videoList.value = response.data.aigc_word_list;
        } else {
          videoList.value = response.data.aigc_dialog_list;
        }
        totalCount.value = response.data.total;
      } else {
        MessagePlugin.error(response.message || '加载视频列表失败');
      }
    } else {
      // 加载所有类型
      const [wordResponse, dialogResponse] = await Promise.all([
        getAIGCFinalVideoList({
          offset: 0,
          limit: 100,
          aigc_type: AIGCType.WORD
        }),
        getAIGCFinalVideoList({
          offset: 0,
          limit: 100,
          aigc_type: AIGCType.DIALOG
        })
      ]);

      const allVideos: (AIGCWord | AIGCDialog)[] = [];

      if (wordResponse.code === 0) {
        allVideos.push(...wordResponse.data.aigc_word_list);
      }

      if (dialogResponse.code === 0) {
        allVideos.push(...dialogResponse.data.aigc_dialog_list);
      }

      // 分页处理
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;

      videoList.value = allVideos.slice(startIndex, endIndex);
      totalCount.value = allVideos.length;
    }
  } catch (error) {
    console.error('加载视频列表失败:', error);
    MessagePlugin.error('加载视频列表失败');
  } finally {
    loading.value = false;
  }
};

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1;
  loadVideos();
};

// 重置筛选
const resetFilter = () => {
  filterType.value = '';
  searchKeyword.value = '';
  currentPage.value = 1;
  loadVideos();
};

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadVideos();
};

// 页面大小变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadVideos();
};

// 播放视频
const playVideo = (video: AIGCWord | AIGCDialog) => {
  currentPlayingVideo.value = video;
  playerVisible.value = true;
};

// 关闭播放器
const closePlayer = () => {
  playerVisible.value = false;
  currentPlayingVideo.value = null;
};

// 查看详情
const viewDetails = (video: AIGCWord | AIGCDialog) => {
  currentDetailVideo.value = video;
  detailsVisible.value = true;
};

// 关闭详情
const closeDetails = () => {
  detailsVisible.value = false;
  currentDetailVideo.value = null;
};

// 重试生成
const retryGeneration = (video: AIGCWord | AIGCDialog) => {
  MessagePlugin.info('重试功能开发中...');
};

// 创建新视频
const handleCreateNew = () => {
  emit('create-new');
};

// 处理图片错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

// 获取状态样式类
const getStatusClass = (status: AIGCWordStatus) => {
  if (status === AIGCWordStatus.FINISHED) return 'status-success';
  if (status === AIGCWordStatus.VIDEO_PROCESS_FAILED) return 'status-error';
  return 'status-processing';
};

const getDialogStatusClass = (status: AIGCDialogStatus) => {
  if (status === AIGCDialogStatus.FINISHED) return 'status-success';
  if (status === AIGCDialogStatus.VIDEO_PROCESS_FAILED) return 'status-error';
  return 'status-processing';
};
</script>

<style scoped>
.aigc-video-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-header h2 {
  margin: 0;
  font-size: 28px;
  color: #1f2937;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.video-grid {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #6b7280;
}

.empty-state p {
  margin: 0 0 24px 0;
}

.video-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.video-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.video-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
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

.thumbnail-placeholder {
  color: #9ca3af;
}

.video-type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-success {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.status-error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.status-processing {
  background: rgba(245, 158, 11, 0.9);
  color: white;
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

.video-word {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 500;
  color: #3b82f6;
}

.dialog-preview {
  margin: 0 0 12px 0;
}

.dialog-line {
  margin: 4px 0;
  font-size: 14px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-item {
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 12px;
  color: #6b7280;
}

.video-actions {
  padding: 0 16px 16px 16px;
  display: flex;
  gap: 8px;
}

.pagination-section {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.video-player {
  text-align: center;
}

.video-details {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-row {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  display: inline-block;
  width: 100px;
  color: #374151;
}

.detail-image img,
.detail-video video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-top: 8px;
}

.word-details,
.dialog-details {
  padding: 16px;
}

.roles-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.role-detail {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
}

.role-detail h5 {
  margin: 0 0 12px 0;
  color: #1f2937;
}

.role-image {
  width: 100%;
  max-width: 150px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 12px;
}

.dialog-texts {
  margin-top: 12px;
}

.dialog-text {
  margin: 4px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #374151;
}

.subtitles-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.subtitle-tag {
  padding: 4px 12px;
  background: #e5e7eb;
  border-radius: 12px;
  font-size: 12px;
  color: #374151;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .aigc-video-list {
    padding: 12px;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .video-cards {
    grid-template-columns: 1fr;
  }

  .roles-config {
    grid-template-columns: 1fr;
  }
}
</style>
