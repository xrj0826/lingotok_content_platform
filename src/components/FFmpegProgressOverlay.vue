<template>
  <div v-if="visible" class="ffmpeg-overlay">
    <div class="ffmpeg-overlay-content">
      <div class="ffmpeg-overlay-header">
        <t-icon name="video" size="24px" style="margin-right: 8px;" />
        <span>{{ title }}</span>
      </div>

      <div class="ffmpeg-overlay-body">
        <template v-if="status === 'loading'">
          <div class="loading-animation">
            <div v-for="i in 5" :key="i" class="dot" :style="{ animationDelay: `${i * 0.15}s` }"></div>
          </div>
          <t-progress theme="line" :percentage="progress" :label="false" />
          <div class="loading-message">{{ message }}</div>
        </template>

        <template v-else-if="status === 'error'">
          <t-icon name="error-circle" size="32px" style="color: #d54941; margin-bottom: 12px;" />
          <div class="error-message">{{ errorMessage }}</div>
          <t-button theme="primary" @click="$emit('retry')">重试</t-button>
        </template>

        <template v-else-if="status === 'success'">
          <t-icon name="check-circle-filled" size="32px" style="color: #00a870; margin-bottom: 12px;" />
          <div class="success-message">{{ message || '操作已完成' }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'loading'
  },
  title: {
    type: String,
    default: '处理中'
  },
  message: {
    type: String,
    default: '正在加载视频处理引擎...'
  },
  errorMessage: {
    type: String,
    default: '加载失败，请重试'
  },
  progress: {
    type: Number,
    default: 0
  }
});

defineEmits(['retry']);
</script>

<style scoped>
.ffmpeg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.ffmpeg-overlay-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.ffmpeg-overlay-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #0052d9;
}

.ffmpeg-overlay-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-message,
.error-message,
.success-message {
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.6;
}

.error-message {
  color: #d54941;
}

.loading-animation {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  margin: 0 4px;
  background: #0052d9;
  border-radius: 50%;
  animation: bounce 1.2s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>




