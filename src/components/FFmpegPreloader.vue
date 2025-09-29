<template>
  <div class="ffmpeg-preloader-hidden">
    <!-- 不显示任何提示，但仍然进行后台加载 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { preloadSharedFFmpeg, getSharedFFmpegStatus } from '@/utils/ffmpegSharedInstance';
import { isBrowser } from '@/utils/isBrowser';

const props = defineProps({
  autoHide: {
    type: Boolean,
    default: true
  },
  showDetails: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    default: 'normal' // 'high', 'normal', 'low'
  }
});

const emits = defineEmits(['loaded', 'error']);

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const loadingProgress = ref(0);
const loadingText = ref('加载视频处理引擎...');
const loadingDetails = ref('');
const errorMessage = ref('');
const showStatus = ref(true);
const loadingStages = [
  { stage: '检查环境', weight: 0.1 },
  { stage: '准备资源', weight: 0.2 },
  { stage: '加载核心文件', weight: 0.5 },
  { stage: '初始化引擎', weight: 0.2 }
];
let currentStageIndex = 0;
let progressInterval: number | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

// 开始预加载FFmpeg（增强版）
const startPreloading = async () => {
  // 始终保持隐藏状态
  showStatus.value = false;

  try {
    // 先检查是否已经加载
    const status = getSharedFFmpegStatus();
    if (status.isLoaded) {
      console.log('✅ [FFmpegPreloader] FFmpeg已经加载完成，无需重新加载');
      emits('loaded');
      return;
    }

    console.log('🚀 [FFmpegPreloader] 开始预加载FFmpeg - 使用共享实例');

    // 设置加载超时提醒（但不中断加载）
    const timeoutWarning = setTimeout(() => {
      console.log('⚠️ [FFmpegPreloader] FFmpeg加载时间较长，但仍在继续...');
    }, 10000); // 10秒后提示

    try {
      // 尝试加载FFmpeg
      const ffmpegPromise = preloadSharedFFmpeg();
      await ffmpegPromise;
      clearTimeout(timeoutWarning);

      console.log('✅ [FFmpegPreloader] FFmpeg预加载成功');
      emits('loaded');
    } catch (error) {
      clearTimeout(timeoutWarning);

      // 如果加载失败，尝试重试
      console.warn(`⚠️ [FFmpegPreloader] FFmpeg加载失败，尝试重试 (${retryCount + 1}/${MAX_RETRIES})`, error);

      if (retryCount < MAX_RETRIES) {
        retryCount++;
        // 延迟1秒后重试
        setTimeout(() => {
          startPreloading();
        }, 1000);
      } else {
        console.error('❌ [FFmpegPreloader] FFmpeg预加载失败，已达到最大重试次数:', error);
        emits('error', error);
      }
    }
  } catch (error) {
    console.error('❌ [FFmpegPreloader] FFmpeg预加载失败:', error);
    emits('error', error);
  }
};

// 这些函数在静默模式下不再需要，但保留空实现以维持API兼容性
const startProgressSimulation = () => {
  // 静默模式，不执行任何操作
};

const stopProgressSimulation = () => {
  // 静默模式，不执行任何操作
};

// 重试加载
const retryLoading = () => {
  // 静默调用预加载
  retryCount = 0; // 重置重试计数
  startPreloading();
};

// 组件挂载时开始预加载
onMounted(() => {
  // 仅在浏览器环境中执行预加载
  if (!isBrowser) {
    console.log('非浏览器环境，跳过FFmpeg预加载');
    return;
  }

  // 无论优先级如何，始终立即开始加载
  console.log('📣 [FFmpegPreloader] 立即开始预加载FFmpeg');
  startPreloading();
});

// 组件卸载时清理
onUnmounted(() => {
  stopProgressSimulation();
});
</script>

<style scoped>
.ffmpeg-preloader {
  margin: 12px 0;
}

.ffmpeg-alert {
  margin-bottom: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.loading-details {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.retry-action {
  margin-top: 8px;
}
</style>