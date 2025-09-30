<template>
  <t-dialog :visible="localVisible" :header="title" :footer="false" width="auto" class="image-preview-dialog"
    placement="center" :close-btn="true" :show-overlay="true" :show-overlay-close-icon="true"
    @update:visible="handleVisibleChange" @close="onClose">
    <template #body>
      <div class="image-preview-content">
        <img :src="imageUrl" :alt="title" class="preview-image" @load="onImageLoad" @error="onImageError"
          :style="imageStyles" />
        <div class="loading-container" v-if="isLoading">
          <t-loading theme="dots" size="medium" />
        </div>
        <div class="error-container" v-if="hasError">
          <t-icon name="error" size="24px" />
          <p>加载图片失败</p>
        </div>
      </div>
      <div class="preview-tools">
        <t-button theme="primary" shape="circle" variant="outline" title="缩小" @click="zoomOut">
          <template #icon><t-icon name="remove" /></template>
        </t-button>
        <t-button theme="primary" shape="circle" variant="outline" title="放大" @click="zoomIn">
          <template #icon><t-icon name="add" /></template>
        </t-button>
        <t-button theme="primary" shape="circle" variant="outline" title="下载图片" @click="downloadImage">
          <template #icon><t-icon name="download" /></template>
        </t-button>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  visible: boolean;
  imageUrl: string;
  title?: string;
  allowZoom?: boolean;
  allowDownload?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  imageUrl: '',
  title: '图片预览',
  allowZoom: true,
  allowDownload: true
});

const emit = defineEmits(['update:visible', 'close']);

// 本地状态
const localVisible = ref(props.visible);
const isLoading = ref(true);
const hasError = ref(false);
const zoomLevel = ref(1);

// 记录已加载过的图片URL
const loadedImages = ref(new Set<string>());

// 监听props可见性变化，更新本地状态
watch(() => props.visible, (newValue) => {
  console.log('ImagePreviewDialog: 可见性变化', newValue);
  localVisible.value = newValue;
  if (newValue) {
    // 重置重试计数器
    retryCount.value = 0;

    // 检查图片是否已经加载过
    const alreadyLoaded = loadedImages.value.has(props.imageUrl);

    // 只有未加载过的图片才显示加载状态
    if (!alreadyLoaded) {
      isLoading.value = true;
      hasError.value = false;
    } else {
      isLoading.value = false;
    }

    // 重置缩放级别
    zoomLevel.value = 1;

    // 打印调试信息
    console.log('ImagePreviewDialog: 显示预览', {
      url: props.imageUrl,
      title: props.title,
      alreadyLoaded
    });
  }
}, { immediate: true });

// 监听图片URL变化
watch(() => props.imageUrl, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl && newUrl && props.visible) {
    // 重置重试计数器
    retryCount.value = 0;

    // 检查新URL是否已加载过
    if (!loadedImages.value.has(newUrl)) {
      isLoading.value = true;
      hasError.value = false;
    }
  }
});

// 处理本地可见性变化，发送更新事件
const handleVisibleChange = (value: boolean) => {
  localVisible.value = value;
  emit('update:visible', value);
};

// 缩放控制
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

const zoomIn = () => {
  if (zoomLevel.value < MAX_ZOOM) {
    zoomLevel.value = Math.min(MAX_ZOOM, zoomLevel.value + ZOOM_STEP);
  }
};

const zoomOut = () => {
  if (zoomLevel.value > MIN_ZOOM) {
    zoomLevel.value = Math.max(MIN_ZOOM, zoomLevel.value - ZOOM_STEP);
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
};

// 计算图片样式
const imageStyles = computed(() => {
  return {
    transform: `scale(${zoomLevel.value})`,
    opacity: isLoading.value ? 0 : 1,
    display: hasError.value ? 'none' : 'block',
  };
});

// 图片加载事件
const onImageLoad = () => {
  isLoading.value = false;
  hasError.value = false;

  // 将已加载的图片URL添加到缓存集合中
  if (props.imageUrl) {
    loadedImages.value.add(props.imageUrl);
    console.log('图片加载完成，添加到缓存:', props.imageUrl);
  }
};

// 图片加载错误重试机制
const maxRetries = 3;
const retryDelay = 1500; // 1.5秒
const retryCount = ref(0);

const onImageError = () => {
  if (retryCount.value < maxRetries) {
    retryCount.value++;
    console.log(`图片加载失败，正在进行第 ${retryCount.value} 次重试...`);

    // 保持加载状态
    isLoading.value = true;
    hasError.value = false;

    // 添加时间戳或随机参数以避免缓存
    setTimeout(() => {
      // 创建一个新的图片元素进行预加载
      const img = new Image();
      const timestamp = new Date().getTime();
      const url = props.imageUrl.includes('?')
        ? `${props.imageUrl}&_retry=${timestamp}`
        : `${props.imageUrl}?_retry=${timestamp}`;

      img.onload = () => {
        // 预加载成功，更新原始图片
        const imgElement = document.querySelector('.image-preview-content img') as HTMLImageElement;
        if (imgElement) {
          imgElement.src = url;
          onImageLoad();
        }
      };

      img.onerror = () => {
        // 继续重试或最终失败
        if (retryCount.value >= maxRetries) {
          isLoading.value = false;
          hasError.value = true;
          console.error(`图片加载失败，已重试 ${maxRetries} 次`);
        } else {
          onImageError();
        }
      };

      img.src = url;
    }, retryDelay);
  } else {
    isLoading.value = false;
    hasError.value = true;
    console.error(`图片加载失败，已达到最大重试次数 ${maxRetries}`);
  }
};

// 关闭对话框
const onClose = () => {
  console.log('ImagePreviewDialog: 关闭对话框');
  localVisible.value = false;
  emit('update:visible', false);
  emit('close');
};

// 下载图片
const downloadImage = () => {
  try {
    const link = document.createElement('a');
    link.href = props.imageUrl;
    // 提取文件名或使用默认名称
    const fileName = props.imageUrl.split('/').pop() || 'image.png';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('下载图片失败:', error);
  }
};
</script>

<style scoped>
.image-preview-dialog :deep(.t-dialog__body) {
  padding: 0;
  max-height: 90vh;
  overflow: hidden;
}

.image-preview-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 300px;
  background-color: #f3f4f6;
  max-height: calc(90vh - 100px);
  overflow: hidden;
}

.preview-image {
  max-width: 90vw;
  max-height: calc(90vh - 100px);
  object-fit: contain;
  transition: transform 0.3s ease;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.error-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #d9363e;
}

.error-container p {
  margin-top: 8px;
  font-size: 14px;
}

.preview-tools {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
}

/* 添加适配移动设备的样式 */
@media (max-width: 768px) {
  .preview-image {
    max-width: 100%;
  }

  .preview-tools {
    padding: 12px 0;
    gap: 12px;
  }
}
</style>
