<template>
  <div class="ffmpeg-preloader-hidden">
    <!-- 不显示任何提示，但仍然进行后台加载 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { preloadFFmpeg, getFFmpegStatus } from '@/utils/ffmpegCache';
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

// 开始预加载FFmpeg（静默模式）
const startPreloading = async () => {
  // 始终保持隐藏状态
  showStatus.value = false;

  try {
    // 静默预加载，无进度显示
    if (getFFmpegStatus().isLoaded) {
      // FFmpeg已经加载完成
      emits('loaded');
      return;
    }

    // 开始预加载
    await preloadFFmpeg();

    // 加载成功
    emits('loaded');
  } catch (error) {
    // 加载失败，静默处理
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
  startPreloading();
};

// 组件挂载时开始预加载
onMounted(() => {
  // 仅在浏览器环境中执行预加载
  if (!isBrowser) {
    console.log('非浏览器环境，跳过FFmpeg预加载');
    return;
  }

  if (props.priority === 'high') {
    // 高优先级，立即开始加载
    startPreloading();
  } else {
    // 正常或低优先级，短暂延迟后加载
    const delay = props.priority === 'normal' ? 500 : 2000;
    setTimeout(startPreloading, delay);
  }
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
