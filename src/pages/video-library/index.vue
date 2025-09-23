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
          <div v-for="video in videoList" :key="video.id" class="video-card">
            <!-- 视频封面 - 使用安全媒体组件处理HTTPS证书问题 -->
            <div class="video-cover">
              <div class="video-preview">
                <img v-if="getVideoCoverImage(video)" :src="getVideoCoverImage(video)" :alt="video.title"
                  style="width: 100%; height: 100%; object-fit: cover;" @error="handleImageError" />
                <div v-else class="thumbnail-placeholder">
                  <t-icon name="video" size="32px" />
                </div>
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
                <t-button size="small" variant="outline" @click.stop="downloadVideo(video); $event.stopPropagation();">
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

        <!-- AI生成图片 -->
        <div class="details-section">
          <h4>AI生成内容</h4>
          <div class="media-grid">
            <!-- 单词视频的AI生成图片 -->
            <div v-if="isWordVideo(detailVideo) && (detailVideo as AIGCWord).ai_gen_img_url" class="media-item">
              <label>AI生成图片:</label>
              <img :src="(detailVideo as AIGCWord).ai_gen_img_url" alt="AI生成图片"
                style="max-width: 100%; max-height: 200px;" @error="handleImageError" />
            </div>

            <!-- 对话视频的远景图 -->
            <div v-if="isDialogVideo(detailVideo) && (detailVideo as AIGCDialog).ai_far_img_url" class="media-item">
              <label>远景图:</label>
              <img :src="(detailVideo as AIGCDialog).ai_far_img_url" alt="远景图"
                style="max-width: 100%; max-height: 200px;" @error="handleImageError" />
            </div>
          </div>
        </div>


        <!-- 操作按钮 -->
        <div class="details-actions">
          <t-button theme="primary" @click="downloadVideo(detailVideo)">
            <template #icon>
              <t-icon name="download" />
            </template>
            查看并下载视频
          </t-button>
        </div>
      </div>
    </t-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
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
// 引入安全媒体显示组件，处理HTTPS证书问题
import SafeMediaDisplay from '@/components/SafeMediaDisplay.vue';

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
const showVideoDetails = ref(false);
const detailVideo = ref<AIGCWord | AIGCDialog | null>(null);

// 错误状态
const detailVideoError = ref(false);


// 默认封面 - 使用src/assets文件夹下的图片作为占位图
import neirongweikongSvg from '@/assets/neirongweikong.svg';
import assetsEmptySvg from '@/assets/assets-empty.svg';
// 直接使用本地资源，不通过mediaResourceLoader处理
const defaultCover = neirongweikongSvg;

// 类型守卫函数
const isWordVideo = (video: AIGCWord | AIGCDialog): video is AIGCWord => {
  return filterType.value === AIGCType.word;
};

const isDialogVideo = (video: AIGCWord | AIGCDialog): video is AIGCDialog => {
  return filterType.value === AIGCType.dialog;
};

// 获取视频封面图片 - 优先使用AI图片
const getVideoCoverImage = (video: AIGCWord | AIGCDialog): string | null => {
  // 优先级：AI生成图片 > 远景图 > 封面图
  if (isWordVideo(video) && (video as AIGCWord).ai_gen_img_url) {
    return (video as AIGCWord).ai_gen_img_url;
  }

  if (isDialogVideo(video) && (video as AIGCDialog).ai_far_img_url) {
    return (video as AIGCDialog).ai_far_img_url;
  }

  if (video.cover_url) {
    return video.cover_url;
  }

  return null;
};


// 标记是否正在加载中，避免重复请求
let isLoading = false;

// 获取视频列表
const fetchVideoList = async () => {
  // 如果已经在加载中，则不重复请求
  if (isLoading) {
    console.log('已有请求正在进行中，跳过此次请求');
    return;
  }

  console.log('开始加载视频列表 - 类型:', filterType.value);

  try {
    isLoading = true;
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

      // 记录视频信息，SafeMediaDisplay组件会自动处理URL错误
      videoList.value.forEach((video, index) => {
        console.log(`视频 ${index + 1} 信息:`);
        console.log('- 标题:', video.title);
        console.log('- 封面URL:', video.cover_url);
        console.log('- 视频URL:', video.play_url);

        // 确保URL是字符串格式，对象类型的URL会由SafeMediaDisplay自动处理
        if (video.play_url && typeof video.play_url === 'object') {
          console.warn('检测到播放URL是对象类型，SafeMediaDisplay会自动处理');
        }
        if (video.cover_url && typeof video.cover_url === 'object') {
          console.warn('检测到封面URL是对象类型，SafeMediaDisplay会自动处理');
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
    isLoading = false;
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

// 计算属性: 处理后的视频URL
const processedVideoUrl = ref('');
const processedDetailVideoUrl = ref('');

// 处理视频URL - 直接使用视频地址链接而不进行任何处理
// 添加缓存避免重复加载
const urlCache = new Map<string, string>();
const processVideoUrl = async (url: string): Promise<string> => {
  // 检查URL是否为字符串
  if (typeof url !== 'string') {
    console.error('视频URL不是字符串:', url);
    return '';
  }

  // 检查URL是否是一个有效的地址
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  } else {
    console.error('视频URL格式不正确:', url);
    return '';
  }
};


// 下载视频 - 参考对话视频生成页面的下载逻辑
const downloadVideo = (video: AIGCWord | AIGCDialog) => {
  if (!video.play_url || typeof video.play_url !== 'string') {
    MessagePlugin.warning('该视频暂无下载地址');
    return;
  }

  // 简化的下载逻辑，不进行任何额外处理，直接触发浏览器下载
  const link = document.createElement('a');
  link.href = video.play_url;
  link.setAttribute('download', `${video.title || '视频'}.mp4`); // 明确设置download属性
  link.setAttribute('target', '_blank'); // 新窗口打开但会被download属性覆盖为下载

  // 将链接添加到DOM然后模拟点击并立即移除
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 显示下载开始提示
  MessagePlugin.success('视频下载已开始');

  // 阻止事件冒泡
  return false;
};

// 查看详情
const viewDetails = async (video: AIGCWord | AIGCDialog) => {
  detailVideo.value = video;
  detailVideoError.value = false; // 重置错误状态

  // 检查并处理视频URL
  if (typeof video.play_url === 'string' && video.play_url.length > 0) {
    processedDetailVideoUrl.value = video.play_url;
  } else {
    console.error('详情页视频URL无效:', video.play_url);
    processedDetailVideoUrl.value = '';
  }

  showVideoDetails.value = true;
};

// 跳转到视频生成页面 - 统一导航到创建页面
const goToGeneration = () => {
  router.push('/video-generation/create');
};

// 处理媒体资源加载错误的统一处理函数
let errorLogCounter = 0;
const handleMediaError = (url: string, type: 'image' | 'video' = 'image') => {
  // 限制错误日志输出次数，避免重复打印
  if (errorLogCounter < 5) {
    console.warn(`[媒体加载错误] ${type}资源加载失败:`, url);

    // 特别标记yepzan域名的证书问题
    if (url.includes('yepzan.cn') && url.startsWith('https://')) {
      console.warn('[证书问题] 检测到yepzan.cn域名的HTTPS证书错误，SafeMediaDisplay组件会自动降级到HTTP协议');
    }

    errorLogCounter++;

    if (errorLogCounter === 5) {
      console.warn('[媒体加载错误] 后续错误将被抑制以避免日志溢出');
    }
  }
};

// 处理图片加载错误 - 与视频生成页面保持一致
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};


// 处理详情页视频的加载事件
const handleDetailVideoError = (error: string) => {
  console.error('详情页视频加载失败:', error);
  detailVideoError.value = true;
};

const handleDetailVideoLoad = (event: Event) => {
  console.log('详情页视频加载成功:', event);
  detailVideoError.value = false;
};






// 停止详情弹窗中的视频
const stopDetailVideo = () => {
  // 因为现在使用SafeMediaDisplay组件，需要查找其内部的video元素
  const videoElements = document.querySelectorAll('.video-details-container .safe-media-display video') as NodeListOf<HTMLVideoElement>;
  videoElements.forEach(video => {
    if (!video.paused) {
      video.pause();
      console.log('已停止详情页视频播放');
    }
  });
};



// 清理函数 - 不再需要处理blob URL
const cleanupResources = () => {
  console.log('清理视频库资源');
  // 清空缓存
  urlCache.clear();
};


// 组件挂载时获取数据
onMounted(() => {
  console.log('视频库页面已加载');
  fetchVideoList();
});

// 组件卸载时清理资源
onUnmounted(() => {
  cleanupResources();
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

          .video-preview {
            width: 100%;
            height: 100%;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }

            .thumbnail-placeholder {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f3f4f6;
              color: #9ca3af;
            }
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
            .video-preview img {
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

        .video-player-wrapper {
          position: relative;
          width: 100%;
          max-height: 200px;

          .video-player {
            width: 100%;
            max-height: 200px;
            display: block;
          }

          .video-error-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 8px;

            img {
              width: 60px;
              height: 60px;
              margin-bottom: 8px;
            }

            p {
              font-size: 14px;
              margin: 0;
            }
          }
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
