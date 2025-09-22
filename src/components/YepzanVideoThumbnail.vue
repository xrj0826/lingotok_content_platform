<template>
  <div class="yepzan-video-thumbnail">
    <template v-if="loading">
      <div class="loading-placeholder">
        <t-icon name="loading" class="loading-icon" />
        <div class="loading-text">加载中...</div>
      </div>
    </template>

    <template v-else-if="error">
      <div class="thumbnail-error">
        <img v-if="placeholderUrl" :src="placeholderUrl" :alt="alt || '视频封面'" class="fallback-image" />
        <div v-else class="error-placeholder">
          <t-icon name="video" class="video-icon" />
          <span class="video-title">{{ title || '视频封面' }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="processedUrl">
      <img :src="processedUrl" :alt="alt" class="thumbnail-image" @error="handleImageError" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  src: string;
  alt?: string;
  title?: string;
}>();

const loading = ref(true);
const error = ref(false);
const processedUrl = ref<string>('');
const placeholderUrl = ref<string>('/images/video-placeholder.svg');

// 处理yepzan域名的图片
const loadYepzanImage = async () => {
  if (!props.src) {
    error.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = false;

  try {
    // 检测是否是yepzan域名
    if (props.src.includes('hs-cover.yepzan.cn')) {
      // 尝试HTTP协议
      if (props.src.startsWith('https://')) {
        const httpUrl = props.src.replace('https://', 'http://');
        processedUrl.value = httpUrl;
      } else {
        processedUrl.value = props.src;
      }
    } else {
      processedUrl.value = props.src;
    }
  } catch (err) {
    console.error('处理yepzan视频封面失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const handleImageError = () => {
  console.error('图片加载失败:', processedUrl.value);
  error.value = true;
};

onMounted(() => {
  loadYepzanImage();
});
</script>

<style lang="less" scoped>
.yepzan-video-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 120px;
  background-color: #f0f9ff;
  border-radius: 8px;

  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .loading-placeholder,
  .error-placeholder,
  .thumbnail-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 120px;
    text-align: center;
    padding: 16px;
  }

  .loading-placeholder {
    .loading-icon {
      font-size: 36px;
      margin-bottom: 8px;
      color: #1e88e5;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      color: #0369a1;
      font-size: 14px;
    }
  }

  .thumbnail-error {
    .fallback-image {
      width: 100%;
      height: auto;
      max-height: 160px;
      object-fit: contain;
    }
  }

  .error-placeholder {
    .video-icon {
      font-size: 48px;
      color: #1e88e5;
      margin-bottom: 12px;
    }

    .video-title {
      font-size: 14px;
      color: #0369a1;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
</style>









