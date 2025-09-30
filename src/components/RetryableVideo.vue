<template>
  <div class="retryable-video-container">
    <!-- 视频元素 -->
    <video v-if="!hasError || isRetrying" :src="currentSrc" :controls="controls" :autoplay="autoplay" :loop="loop"
      :muted="muted" :style="videoStyle" class="retryable-video" @error="handleVideoError"
      @loadeddata="handleVideoLoaded" @canplay="handleCanPlay" preload="auto" ref="videoRef"></video>

    <!-- 加载中状态 -->
    <div v-if="isLoading" class="video-loading-overlay">
      <t-loading theme="dots" size="medium" />
      <p v-if="isRetrying">正在重试 ({{ retryCount }}/{{ maxRetries }})</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError && !isRetrying" class="video-error-overlay">
      <t-icon name="error-circle-filled" size="24px" />
      <p>{{ errorMessage }}</p>
      <t-button size="small" @click="retry" theme="primary" variant="outline">
        重试
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface Props {
  src: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  width?: string;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  controls: true,
  autoplay: false,
  loop: false,
  muted: false,
  maxRetries: 3,
  retryDelay: 2000,
  width: '100%',
  height: 'auto'
});

const emit = defineEmits(['loaded', 'error', 'retry']);

// 状态变量
const isLoading = ref(true);
const hasError = ref(false);
const isRetrying = ref(false);
const retryCount = ref(0);
const videoRef = ref<HTMLVideoElement | null>(null);
const errorMessage = ref('视频加载失败');
const canPlayState = ref(false);

// 计算当前视频源URL（添加时间戳以避免缓存）
const currentSrc = computed(() => {
  if (isRetrying.value) {
    const timestamp = new Date().getTime();
    return props.src.includes('?')
      ? `${props.src}&_retry=${timestamp}_${retryCount.value}`
      : `${props.src}?_retry=${timestamp}_${retryCount.value}`;
  }
  return props.src;
});

// 计算视频样式
const videoStyle = computed(() => ({
  width: props.width,
  height: props.height,
  display: (hasError.value && !isRetrying.value) ? 'none' : 'block',
  opacity: canPlayState.value || !isLoading.value ? 1 : 0,
  transition: 'opacity 0.3s ease'
}));

// 处理视频可以播放
const handleCanPlay = () => {
  if (!canPlayState.value) {
    canPlayState.value = true;
    isLoading.value = false;
    console.log('视频可以播放:', props.src);
  }
};

// 处理视频加载成功
const handleVideoLoaded = () => {
  isLoading.value = false;
  hasError.value = false;
  isRetrying.value = false;
  emit('loaded');
  console.log('视频加载完成:', props.src);
};

// 处理视频加载错误
const handleVideoError = (event: Event) => {
  const target = event.target as HTMLVideoElement;
  console.error('视频加载失败:', target.error?.message || '未知错误');

  if (retryCount.value < props.maxRetries) {
    retryWithDelay();
  } else {
    isLoading.value = false;
    hasError.value = true;
    isRetrying.value = false;
    errorMessage.value = `视频加载失败 (已重试${retryCount.value}次)`;
    emit('error', { src: props.src, error: target.error });
  }
};

// 延迟重试
const retryWithDelay = () => {
  isRetrying.value = true;
  retryCount.value++;
  console.log(`视频加载失败，正在进行第 ${retryCount.value} 次重试...`);

  setTimeout(() => {
    if (videoRef.value) {
      videoRef.value.load(); // 强制重新加载视频
    }
  }, props.retryDelay);

  emit('retry', { count: retryCount.value, maxRetries: props.maxRetries });
};

// 手动重试
const retry = () => {
  isLoading.value = true;
  hasError.value = false;
  retryCount.value = 0;
  retryWithDelay();
};

// 监听src变化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    isLoading.value = true;
    hasError.value = false;
    isRetrying.value = false;
    retryCount.value = 0;
    canPlayState.value = false;

    // 预加载视频
    if (videoRef.value) {
      videoRef.value.load();
    }
  }
});

// 组件挂载时初始化
onMounted(() => {
  if (props.src) {
    isLoading.value = true;

    // 预加载视频
    setTimeout(() => {
      if (videoRef.value && !canPlayState.value && !hasError.value) {
        videoRef.value.load();
      }
    }, 100);
  }
});
</script>

<style scoped>
.retryable-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.retryable-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.video-loading-overlay,
.video-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
}

.video-error-overlay {
  gap: 12px;
}

.video-loading-overlay p,
.video-error-overlay p {
  margin: 8px 0;
  font-size: 14px;
}
</style>
