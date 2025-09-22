<template>
  <div class="video-library">
    <!-- 顶部标题栏 -->
    <div class="library-header">
      <h1>视频库</h1>
      <div class="header-controls">
        <t-select v-model="filterType" style="width: 200px;" @change="handleFilterChange">
          <t-option :value="AIGCType.word" label="单词视频" />
          <t-option :value="AIGCType.dialog" label="对话视频" />
        </t-select>
        <t-button theme="primary" @click="refreshVideoList" :loading="loading">
          <template #icon>
            <t-icon name="refresh" />
          </template>
          刷新
        </t-button>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <VideoBottomNav />

    <!-- 视频列表 -->
    <div class="video-content">
      <t-loading :loading="loading" size="large">
        <div v-if="!loading && videoList.length === 0" class="empty-state">
          <t-icon name="video" size="48px" style="color: #d1d5db;" />
          <p>暂无{{ filterType === AIGCType.word ? '单词' : '对话' }}视频</p>
          <t-button theme="primary" @click="goToGeneration">
            {{ filterType === AIGCType.word ? '创建单词视频' : '创建对话视频' }}
          </t-button>
        </div>

        <div v-else class="video-grid">
          <div v-for="video in videoList" :key="video.id" class="video-card" @click="playVideo(video)">
            <!-- 视频封面 -->
            <div class="video-cover">
              <img :src="video.cover_url || defaultCover" :alt="video.title" @error="handleImageError" />
              <div class="play-overlay">
                <t-icon name="play-circle-filled" size="48px" />
              </div>
              <div class="video-type-badge">
                {{ filterType === AIGCType.word ? '单词' : '对话' }}
              </div>
            </div>

            <!-- 视频信息 -->
            <div class="video-info">
              <h3 class="video-title" :title="video.title">{{ video.title }}</h3>

              <!-- 单词视频额外信息 -->
              <div v-if="filterType === AIGCType.word && isWordVideo(video)" class="video-details">
                <p class="video-word">单词: {{ (video as AIGCWord).word }}</p>
              </div>

              <!-- 对话视频额外信息 -->
              <div v-if="filterType === AIGCType.dialog && isDialogVideo(video)" class="video-details">
                <p class="video-description">对话视频</p>
              </div>

              <div class="video-actions">
                <t-button size="small" theme="primary" @click.stop="playVideo(video)">
                  <template #icon>
                    <t-icon name="play-circle" />
                  </template>
                  播放
                </t-button>
                <t-button size="small" variant="outline" @click.stop="downloadVideo(video)">
                  <template #icon>
                    <t-icon name="download" />
                  </template>
                  下载
                </t-button>
                <t-button size="small" variant="outline" @click.stop="viewDetails(video)">
                  详情
                </t-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页器 -->
        <div v-if="total > 0" class="pagination-wrapper">
          <t-pagination v-model="currentPage" :total="total" :page-size="pageSize" :show-total="true"
            :show-jumper="true" :show-size-changer="true" :page-size-options="[12, 24, 48]" @change="handlePageChange"
            @page-size-change="handlePageSizeChange" />
          <div v-if="loading" class="loading-indicator">
            <t-loading size="small" />
            <span>加载中...</span>
          </div>
        </div>
      </t-loading>
    </div>

    <!-- 视频播放弹窗 -->
    <t-dialog v-model:visible="showVideoPlayer" :header="playingVideo?.title || '视频播放'" width="80%" :footer="false"
      :close-on-overlay-click="true" @close="stopPlayingVideo">
      <div v-if="playingVideo" class="video-player-container">
        <video :src="playingVideo.play_url" controls autoplay style="width: 100%; max-height: 70vh;"
          @error="handleVideoError">
          您的浏览器不支持视频播放
        </video>

        <div class="player-info">
          <h3>{{ playingVideo.title }}</h3>
          <div v-if="isWordVideo(playingVideo)" class="word-info">
            <p><strong>单词:</strong> {{ (playingVideo as AIGCWord).word }}</p>
          </div>
          <div class="player-actions">
            <t-button @click="downloadVideo(playingVideo)">
              <template #icon>
                <t-icon name="download" />
              </template>
              下载视频
            </t-button>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 视频详情弹窗 -->
    <t-dialog v-model:visible="showVideoDetails" :header="detailVideo?.title || '视频详情'" width="60%" :footer="false"
      @close="stopDetailVideo">
      <div v-if="detailVideo" class="video-details-container">
        <!-- 基本信息 -->
        <div class="details-section">
          <h4>基本信息</h4>
          <div class="details-grid">
            <div class="detail-item">
              <label>标题:</label>
              <span>{{ detailVideo.title }}</span>
            </div>
            <div class="detail-item">
              <label>ID:</label>
              <span>{{ detailVideo.id }}</span>
            </div>

            <!-- 单词视频特有信息 -->
            <template v-if="isWordVideo(detailVideo)">
              <div class="detail-item">
                <label>单词:</label>
                <span>{{ (detailVideo as AIGCWord).word }}</span>
              </div>
              <div class="detail-item">
                <label>状态:</label>
                <span>{{ getWordStatusText((detailVideo as AIGCWord).status) }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- 媒体文件 -->
        <div class="details-section">
          <h4>媒体文件</h4>
          <div class="media-grid">
            <!-- 视频预览 -->
            <div v-if="detailVideo.play_url" class="media-item">
              <label>视频:</label>
              <video :src="detailVideo.play_url" controls style="width: 100%; max-height: 200px;">
                您的浏览器不支持视频播放
              </video>
            </div>

            <!-- 封面图片 -->
            <div v-if="detailVideo.cover_url" class="media-item">
              <label>封面:</label>
              <img :src="detailVideo.cover_url" alt="视频封面" style="max-width: 100%; max-height: 200px;" />
            </div>

            <!-- 单词视频的AI生成图片 -->
            <div v-if="isWordVideo(detailVideo) && (detailVideo as AIGCWord).ai_gen_img_url" class="media-item">
              <label>AI生成图片:</label>
              <img :src="(detailVideo as AIGCWord).ai_gen_img_url" alt="AI生成图片"
                style="max-width: 100%; max-height: 200px;" />
            </div>

            <!-- 对话视频的远景图 -->
            <div v-if="isDialogVideo(detailVideo) && (detailVideo as AIGCDialog).ai_far_img_url" class="media-item">
              <label>远景图:</label>
              <img :src="(detailVideo as AIGCDialog).ai_far_img_url" alt="远景图"
                style="max-width: 100%; max-height: 200px;" />
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="details-actions">
          <t-button theme="primary" @click="playVideo(detailVideo)">
            <template #icon>
              <t-icon name="play-circle" />
            </template>
            播放视频
          </t-button>
          <t-button variant="outline" @click="downloadVideo(detailVideo)">
            <template #icon>
              <t-icon name="download" />
            </template>
            下载视频
          </t-button>
        </div>
      </div>
    </t-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import CryptoJS from 'crypto-js';
import {
  getAIGCFinalVideoList,
  AIGCType,
  type AIGCWord,
  type AIGCDialog,
  getWordStatusText
} from '@/api/aigc-video';

// 路由
const router = useRouter();

// 响应式数据
const loading = ref(false);
const filterType = ref<AIGCType>(AIGCType.word);
const videoList = ref<(AIGCWord | AIGCDialog)[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);

// 弹窗状态
const showVideoPlayer = ref(false);
const playingVideo = ref<AIGCWord | AIGCDialog | null>(null);
const showVideoDetails = ref(false);
const detailVideo = ref<AIGCWord | AIGCDialog | null>(null);

// 默认封面
const defaultCover = '/images/video-thumbnail-placeholder.svg';

// 类型守卫函数
const isWordVideo = (video: AIGCWord | AIGCDialog): video is AIGCWord => {
  return filterType.value === AIGCType.word;
};

const isDialogVideo = (video: AIGCWord | AIGCDialog): video is AIGCDialog => {
  return filterType.value === AIGCType.dialog;
};

// 获取视频列表
const fetchVideoList = async () => {
  try {
    loading.value = true;
    const offset = (currentPage.value - 1) * pageSize.value;

    // 生成签名和请求头，与视频合集管理页面使用相同的方法
    function generateSignature(timestamp: string, apiName: string): string {
      const signStr = `${apiName}${timestamp}lingotok`;
      return CryptoJS.SHA256(signStr).toString();
    }

    function getRequestHeaders(apiName: string) {
      const timestamp = Date.now().toString();
      return {
        Timestamp: timestamp,
        Signature: generateSignature(timestamp, apiName)
      };
    }

    // 使用与视频合集管理页面相同的请求头逻辑
    const headers = getRequestHeaders('get_aigc_videos');

    // 请求视频列表数据
    const response = await getAIGCFinalVideoList({
      offset,
      limit: pageSize.value,
      aigc_type: filterType.value
    });

    if (response.code === 200) {
      // 根据类型选择对应的列表
      if (filterType.value === AIGCType.word) {
        videoList.value = response.data.aigc_word_list || [];
      } else {
        videoList.value = response.data.aigc_dialog_list || [];
      }
      total.value = response.data.total || 0;

      // 处理视频缩略图，确保每个视频都有缩略图
      videoList.value.forEach(video => {
        if (!video.cover_url && video.play_url) {
          // 如果没有缩略图但有播放地址，可以考虑生成缩略图
          // 这里可以在将来实现自动生成缩略图的功能
          console.log('视频缺少缩略图:', video.title);
        }
      });
    } else {
      throw new Error(response.message || '获取视频列表失败');
    }
  } catch (error: any) {
    console.error('获取视频列表失败:', error);
    MessagePlugin.error(error.message || '获取视频列表失败，请重试');
    videoList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理筛选类型变化
const handleFilterChange = () => {
  currentPage.value = 1;
  fetchVideoList();
};

// 刷新视频列表
const refreshVideoList = () => {
  fetchVideoList();
};

// 分页处理
const handlePageChange = (pageInfo: any) => {
  // 兼容页面组件传入的参数格式
  if (typeof pageInfo === 'object') {
    currentPage.value = pageInfo.current;
  } else {
    currentPage.value = pageInfo;
  }

  // 滚动到页面顶部，提供更好的用户体验
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 获取新页面数据
  fetchVideoList();

  console.log(`正在加载第 ${currentPage.value} 页数据，每页 ${pageSize.value} 条`);
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // 切换页面大小后，返回第1页

  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 获取新的数据
  fetchVideoList();

  console.log(`页面大小已变更为 ${size} 条/页，正在加载第 1 页数据`);
};

// 播放视频
const playVideo = (video: AIGCWord | AIGCDialog) => {
  if (!video.play_url) {
    MessagePlugin.warning('该视频暂无播放地址');
    return;
  }
  playingVideo.value = video;
  showVideoPlayer.value = true;
  // 关闭详情弹窗
  showVideoDetails.value = false;
};

// 下载视频
const downloadVideo = (video: AIGCWord | AIGCDialog) => {
  if (!video.play_url) {
    MessagePlugin.warning('该视频暂无下载地址');
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = video.play_url;
    link.download = `${video.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    MessagePlugin.success('开始下载视频');
  } catch (error) {
    console.error('下载失败:', error);
    MessagePlugin.error('下载失败，请重试');
  }
};

// 查看详情
const viewDetails = (video: AIGCWord | AIGCDialog) => {
  detailVideo.value = video;
  showVideoDetails.value = true;
};

// 跳转到视频生成页面
const goToGeneration = () => {
  if (filterType.value === AIGCType.word) {
    router.push('/video-generation/word');
  } else {
    router.push('/video-generation/create');
  }
};

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = defaultCover;
  console.log('使用默认视频封面:', defaultCover);
};

// 处理视频播放错误
const handleVideoError = (event: Event) => {
  console.error('视频播放错误:', event);
  MessagePlugin.error('视频播放失败，请检查网络连接');
};

// 停止播放弹窗中的视频
const stopPlayingVideo = () => {
  const videoElement = document.querySelector('.video-player-container video') as HTMLVideoElement;
  if (videoElement && !videoElement.paused) {
    videoElement.pause();
    console.log('已停止播放视频');
  }
};

// 停止详情弹窗中的视频
const stopDetailVideo = () => {
  const videoElements = document.querySelectorAll('.video-details-container video') as NodeListOf<HTMLVideoElement>;
  videoElements.forEach(video => {
    if (!video.paused) {
      video.pause();
      console.log('已停止详情页视频播放');
    }
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchVideoList();
});
</script>

<style scoped lang="less">
.video-library {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
    }

    .header-controls {
      display: flex;
      gap: 16px;
      align-items: center;
    }
  }

  .video-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 24px;
    min-height: 400px;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: #6b7280;

      p {
        margin: 16px 0 24px 0;
        font-size: 16px;
      }
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;

      .video-card {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        background: white;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #3b82f6;
        }

        .video-cover {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #f3f4f6;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .play-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            opacity: 0;
            transition: opacity 0.3s ease;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            padding: 8px;
          }

          .video-type-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(59, 130, 246, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
          }

          &:hover {
            .play-overlay {
              opacity: 1;
            }

            img {
              transform: scale(1.05);
            }
          }
        }

        .video-info {
          padding: 16px;

          .video-title {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.4;
          }

          .video-details {
            margin-bottom: 12px;

            p {
              margin: 0;
              font-size: 14px;
              color: #6b7280;
            }

            .video-word {
              font-weight: 500;
              color: #3b82f6;
            }
          }

          .video-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }
  }
}

// 弹窗样式
.video-player-container {
  .player-info {
    margin-top: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;

    h3 {
      margin: 0 0 12px 0;
      color: #1f2937;
    }

    .word-info {
      margin-bottom: 16px;

      p {
        margin: 0;
        color: #374151;
      }
    }

    .player-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.video-details-container {
  .details-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;

      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-weight: 500;
          color: #374151;
          min-width: 80px;
        }

        span {
          color: #6b7280;
          word-break: break-all;
        }
      }
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;

      .media-item {
        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        img,
        video {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
      }
    }
  }

  .details-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }
}

// 分页容器
.pagination-wrapper {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.loading-indicator {
  position: absolute;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}


// 响应式设计
@media (max-width: 768px) {
  .video-library {
    padding: 16px;

    .library-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .header-controls {
        justify-content: space-between;
      }
    }

    .video-content .video-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
  }

  .video-details-container .details-section .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
