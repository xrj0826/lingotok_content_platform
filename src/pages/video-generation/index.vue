<!-- AIGC视频生成主页面 -->
<template>
  <div class="video-generation-container">
    <!-- FFmpeg预加载组件 -->
    <FFmpegPreloader priority="high" :show-details="true" :auto-hide="true" @loaded="handleFFmpegLoaded"
      @error="handleFFmpegError" />

    <!-- AIGC视频管理器 -->
    <AIGCVideoManager :ffmpeg-ready="ffmpegReady" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import AIGCVideoManager from './components/AIGCVideoManager.vue';
import FFmpegPreloader from '@/components/FFmpegPreloader.vue';

// FFmpeg状态
const ffmpegReady = ref(false);

// 处理FFmpeg加载成功
const handleFFmpegLoaded = () => {
  ffmpegReady.value = true;
  console.log('✅ FFmpeg预加载成功，视频处理已准备就绪');
};

// 处理FFmpeg加载失败
const handleFFmpegError = (error: any) => {
  console.error('❌ FFmpeg加载失败:', error);
  MessagePlugin.error('视频处理引擎加载失败，部分功能可能无法使用');
};
</script>

<style scoped>
.video-generation-container {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>