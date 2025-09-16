<template>
  <t-dialog v-model:visible="visible" :header="title" :width="800" :destroyOnClose="true" placement="center"
    :showOverlay="true" :closeOnOverlayClick="true">
    <div class="image-preview-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <t-loading text="图片加载中..." />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <t-icon name="error-circle" size="48px" />
        <p class="error-text">{{ error }}</p>
        <t-button theme="primary" variant="outline" @click="retryLoad">
          重新加载
        </t-button>
      </div>

      <!-- 图片显示 -->
      <div v-else-if="imageUrl" class="image-container">
        <!-- 直接图片显示（用于预览） -->
        <img 
          v-if="processedImageUrl" 
          :src="processedImageUrl" 
          :alt="title" 
          class="preview-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        
        <!-- 备选：SafeMediaDisplay -->
        <SafeMediaDisplay 
          v-else
          :src="imageUrl" 
          media-type="image" 
          :alt="title" 
          image-class="preview-image"
          @load="handleImageLoad" 
          @error="handleImageError" 
        />

        <!-- 图片信息 -->
        <div class="image-info" v-if="showInfo">
          <div class="info-item">
            <span class="info-label">原始URL:</span>
            <span class="info-value" :title="imageUrl">{{ truncateUrl(imageUrl) }}</span>
          </div>
          <div class="info-item" v-if="processedImageUrl && processedImageUrl !== imageUrl">
            <span class="info-label">处理后URL:</span>
            <span class="info-value" :title="processedImageUrl">{{ truncateUrl(processedImageUrl) }}</span>
          </div>
          <div class="info-item" v-if="imageSize">
            <span class="info-label">尺寸:</span>
            <span class="info-value">{{ imageSize }}</span>
          </div>
        </div>
      </div>

      <!-- 暂无图片 -->
      <div v-else class="no-image-container">
        <t-icon name="image" size="64px" />
        <p>暂无图片</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <t-button variant="outline" @click="handleClose">
          关闭
        </t-button>
        <t-button theme="primary" @click="downloadImage" v-if="imageUrl && !loading && !error">
          下载图片
        </t-button>
        <t-button variant="text" @click="toggleInfo">
          {{ showInfo ? '隐藏' : '显示' }}详情
        </t-button>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import SafeMediaDisplay from './SafeMediaDisplay.vue';
import { smartImageLoader } from '@/utils/imageLoader';

interface Props {
  visible: boolean;
  imageUrl?: string;
  title?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  title: '图片预览'
});

const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const error = ref('');
const showInfo = ref(false);
const imageSize = ref('');
const processedImageUrl = ref('');

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

// 方法
const handleClose = () => {
  visible.value = false;
  emit('close');
};

const handleImageLoad = (event: Event) => {
  loading.value = false;
  error.value = '';

  // 获取图片尺寸
  const img = event.target as HTMLImageElement;
  if (img) {
    imageSize.value = `${img.naturalWidth} × ${img.naturalHeight}`;
  }
};

const handleImageError = (errorMsg: string) => {
  loading.value = false;
  error.value = errorMsg || '图片加载失败';
};

const retryLoad = async () => {
  if (!props.imageUrl) return;
  
  loading.value = true;
  error.value = '';
  processedImageUrl.value = '';
  
  try {
    // 重新加载图片
    await loadImageWithStrategies();
  } catch (err) {
    error.value = '重新加载失败';
    loading.value = false;
  }
};

// 使用智能图片加载器加载图片
const loadImageWithStrategies = async () => {
  if (!props.imageUrl) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const url = await smartImageLoader(props.imageUrl);
    processedImageUrl.value = url;
    loading.value = false;
  } catch (err) {
    console.error('图片加载失败:', err);
    error.value = '图片加载失败';
    loading.value = false;
    // 降级到SafeMediaDisplay
    processedImageUrl.value = '';
  }
};

const toggleInfo = () => {
  showInfo.value = !showInfo.value;
};

const truncateUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};

const downloadImage = async () => {
  const urlToDownload = processedImageUrl.value || props.imageUrl;
  if (!urlToDownload) return;
  
  try {
    loading.value = true;
    
    let blob: Blob;
    
    if (urlToDownload.startsWith('blob:')) {
      // 如果是blob URL，直接fetch
      const response = await fetch(urlToDownload);
      blob = await response.blob();
    } else {
      // 使用智能加载器获取图片
      const processedUrl = await smartImageLoader(urlToDownload);
      const response = await fetch(processedUrl);
      blob = await response.blob();
    }
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    MessagePlugin.success('图片下载成功');
  } catch (error) {
    console.error('下载图片失败:', error);
    MessagePlugin.error('下载失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 监听图片URL变化
watch(() => props.imageUrl, (newUrl) => {
  if (newUrl && props.visible) {
    loadImageWithStrategies();
  }
}, { immediate: true });

// 监听弹窗显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible && props.imageUrl) {
    loadImageWithStrategies();
  }
  if (!newVisible) {
    showInfo.value = false;
    // 清理状态
    processedImageUrl.value = '';
    imageSize.value = '';
    error.value = '';
  }
});
</script>

<style scoped lang="less">
.image-preview-content {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  flex-direction: column;
  gap: 16px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
  color: #e34d59;

  .error-text {
    margin: 0;
    font-size: 16px;
    color: #6b7280;
  }
}

.no-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
  color: #9ca3af;

  p {
    margin: 0;
    font-size: 16px;
  }
}

.image-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  :deep(.preview-image) {
    max-width: 100%;
    max-height: 500px;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.image-info {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-weight: 500;
      color: #374151;
      min-width: 80px;
    }

    .info-value {
      color: #6b7280;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      word-break: break-all;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-preview-content {
    min-height: 300px;
  }

  .loading-container,
  .error-container,
  .no-image-container {
    height: 300px;
  }

  .image-container {
    :deep(.preview-image) {
      max-height: 300px;
    }
  }

  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>













