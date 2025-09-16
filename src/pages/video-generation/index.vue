<!-- AIGC视频生成主页面 -->
<template>
  <div class="video-generation-container">
    <!-- AIGC视频管理器 -->
    <AIGCVideoManager />
  </div>
</template>

<script setup lang="ts">
import AIGCVideoManager from './components/AIGCVideoManager.vue';
</script>

<style scoped>
.video-generation-container {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>