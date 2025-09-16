<template>
  <div class="safe-media-display">
    <!-- 图片显示 -->
    <div v-if="mediaType === 'image'" class="image-container">
      <img v-if="accessibleUrl && !error" :src="accessibleUrl" :alt="alt" :class="imageClass" @load="handleLoad"
        @error="handleError" v-bind="$attrs" />
      <div v-else-if="loading" class="loading-placeholder">
        <t-icon name="loading" class="loading-icon" />
        <div class="loading-text">加载图片中...</div>
      </div>
      <div v-else-if="error" class="error-placeholder">
        <t-icon name="error-circle" class="error-icon" />
        <div class="error-text">图片加载失败</div>
        <div class="error-details">{{ error }}</div>
        <div class="error-actions">
          <t-button size="small" theme="primary" variant="outline" @click="retry">
            重试 ({{ retryCount }}/{{ maxRetries }})
          </t-button>
          <t-button size="small" theme="default" variant="outline" @click="forceOriginalUrl">
            使用原图
          </t-button>
        </div>
      </div>
    </div>

    <!-- 视频显示 -->
    <div v-else-if="mediaType === 'video'" class="video-container">
      <video v-if="accessibleUrl && !error" ref="videoRef" :src="accessibleUrl" :class="videoClass"
        @loadedmetadata="handleLoad" @error="handleError" v-bind="$attrs">
        您的浏览器不支持视频播放
      </video>
      <div v-else-if="loading" class="loading-placeholder">
        <t-icon name="loading" class="loading-icon" />
        <div class="loading-text">加载视频中...</div>
      </div>
      <div v-else-if="error" class="error-placeholder">
        <t-icon name="error-circle" class="error-icon" />
        <div class="error-text">视频加载失败</div>
        <t-button size="small" theme="primary" variant="outline" @click="retry">
          重试
        </t-button>
      </div>
    </div>

    <!-- 调试信息 -->
    <div v-if="showDebugInfo" class="debug-info">
      <details>
        <summary>调试信息</summary>
        <div class="debug-content">
          <div><strong>原始URL:</strong> {{ originalUrl }}</div>
          <div><strong>可访问URL:</strong> {{ accessibleUrl }}</div>
          <div><strong>媒体类型:</strong> {{ mediaType }}</div>
          <div><strong>加载状态:</strong> {{ loading ? '加载中' : '完成' }}</div>
          <div><strong>错误状态:</strong> {{ error || '无' }}</div>
          <div><strong>重试次数:</strong> {{ retryCount }}</div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { getAccessibleMediaUrl } from '@/utils/mediaResourceLoader';
import { smartImageLoader } from '@/utils/imageLoader';

interface Props {
  src: string;
  mediaType: 'image' | 'video';
  alt?: string;
  imageClass?: string;
  videoClass?: string;
  showDebugInfo?: boolean;
  maxRetries?: number;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  imageClass: '',
  videoClass: '',
  showDebugInfo: false,
  maxRetries: 3
});

const emit = defineEmits<{
  load: [event: Event];
  error: [error: string];
  retry: [count: number];
}>();

const loading = ref(false);
const error = ref('');
const accessibleUrl = ref('');
const retryCount = ref(0);
const videoRef = ref<HTMLVideoElement>();

const originalUrl = computed(() => props.src);

// 加载媒体资源
const loadMedia = async () => {
  if (!props.src) {
    error.value = '没有提供媒体URL';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    console.log('🎬 [SafeMediaDisplay] 开始加载媒体:', props.src);
    
    let url: string;
    if (props.mediaType === 'image') {
      // 对图片使用智能加载器
      console.log('🖼️ [SafeMediaDisplay] 使用智能图片加载器');
      url = await smartImageLoader(props.src);
    } else {
      // 对视频使用原来的媒体资源加载器
      console.log('🎬 [SafeMediaDisplay] 使用媒体资源加载器');
      url = await getAccessibleMediaUrl(props.src);
    }
    accessibleUrl.value = url;
    console.log('✅ [SafeMediaDisplay] 媒体加载成功:', url);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    error.value = errorMsg;
    console.error('💥 [SafeMediaDisplay] 媒体加载失败:', errorMsg);
    emit('error', errorMsg);
  } finally {
    loading.value = false;
  }
};

// 重试加载
const retry = async () => {
  if (retryCount.value >= props.maxRetries) {
    error.value = `重试次数已达上限 (${props.maxRetries})`;
    return;
  }

  retryCount.value++;
  console.log(`🔄 [SafeMediaDisplay] 重试加载 (${retryCount.value}/${props.maxRetries}):`, props.src);
  emit('retry', retryCount.value);

  await loadMedia();
};

// 强制使用原始URL
const forceOriginalUrl = () => {
  console.log('🔄 [SafeMediaDisplay] 强制使用原始URL:', props.src);
  accessibleUrl.value = props.src;
  error.value = '';
  loading.value = false;
};

// 处理加载成功
const handleLoad = (event: Event) => {
  loading.value = false; // 确保loading状态被重置
  console.log('✅ [SafeMediaDisplay] 媒体元素加载完成:', props.src);
  emit('load', event);
};

// 处理加载错误
const handleError = (event: Event) => {
  loading.value = false; // 确保loading状态被重置
  const errorMsg = `${props.mediaType}元素加载失败`;
  error.value = errorMsg;
  console.error('💥 [SafeMediaDisplay] 媒体元素错误:', event);
  emit('error', errorMsg);
};

// 监听URL变化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    retryCount.value = 0;
    loadMedia();
  }
}, { immediate: true });

onMounted(() => {
  console.log('🎬 [SafeMediaDisplay] 组件已挂载:', props.src);
});

onUnmounted(() => {
  // 清理video元素
  if (videoRef.value) {
    videoRef.value.src = '';
    videoRef.value.load();
  }

  // 如果使用了blob URL，释放它
  if (accessibleUrl.value && accessibleUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(accessibleUrl.value);
  }
});
</script>

<style lang="less" scoped>
.safe-media-display {
  width: 100%;
  height: 100%;

  .image-container,
  .video-container {
    width: 100%;
    height: 100%;
    position: relative;

    img,
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .loading-placeholder,
  .error-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 120px;
    background: #fef2f2;
    border: 1px dashed #fecaca;
    border-radius: 6px;
    color: #dc2626;
    padding: 16px;
    text-align: center;

    .loading-icon {
      font-size: 24px;
      margin-bottom: 8px;
      animation: spin 1s linear infinite;
    }

    .error-icon {
      font-size: 24px;
      margin-bottom: 8px;
      color: #ef4444;
    }

    .loading-text,
    .error-text {
      font-size: 14px;
      margin-bottom: 8px;
    }
  }

  .debug-info {
    margin-top: 12px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 12px;

    summary {
      cursor: pointer;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .debug-content {
      div {
        margin-bottom: 4px;
        word-break: break-all;
      }

      strong {
        color: #374151;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.error-details {
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0;
  max-width: 100%;
  word-break: break-all;
  line-height: 1.4;
}

.error-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 12px;
}
</style>
