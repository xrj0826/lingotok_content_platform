<template>
  <div class="aspect-ratio-image-container" :style="containerStyle">
    <div class="image-wrapper" :style="wrapperStyle">
      <img v-if="src" :src="src" alt="图片" class="aspect-ratio-image" :style="imageStyle" @load="handleImageLoad"
        ref="imageRef" />
      <slot v-if="!src" name="placeholder">
        <div class="empty-placeholder">
          <t-icon name="image" size="48px" />
          <p>暂无图片</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { isBrowser } from '@/utils/isBrowser';

interface Props {
  src: string;
  maxWidth?: string | number;
  maxHeight?: string | number;
  backgroundColor?: string;
  border?: boolean;
  borderRadius?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  maxWidth: '100%',
  maxHeight: '100%',
  backgroundColor: 'transparent',
  border: false,
  borderRadius: '0',
});

// 图片元素引用
const imageRef = ref<HTMLImageElement | null>(null);
// 图片宽高比
const aspectRatio = ref(16 / 9); // 默认宽高比
// 图片是否已加载
const imageLoaded = ref(false);
// 图片原始宽度和高度
const originalWidth = ref(0);
const originalHeight = ref(0);

// 容器样式
const containerStyle = computed(() => {
  return {
    maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
  };
});

// 包装器样式
const wrapperStyle = computed(() => {
  return {
    backgroundColor: props.backgroundColor,
    border: props.border ? '1px solid #e5e7eb' : 'none',
    borderRadius: props.borderRadius,
    overflow: 'hidden',
    position: 'relative' as const,
  };
});

// 图片样式
const imageStyle = computed(() => {
  if (!imageLoaded.value) return {};

  return {
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
  };
});

// 图片加载完成事件
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  originalWidth.value = img.naturalWidth;
  originalHeight.value = img.naturalHeight;
  aspectRatio.value = img.naturalWidth / img.naturalHeight;
  imageLoaded.value = true;
};

// 监听src变化，重置图片加载状态
watch(() => props.src, () => {
  imageLoaded.value = false;
  originalWidth.value = 0;
  originalHeight.value = 0;
});

// 组件挂载后，检查图片是否已经加载
onMounted(() => {
  // 确保在浏览器环境中运行
  if (!isBrowser) return;

  if (imageRef.value && imageRef.value.complete) {
    originalWidth.value = imageRef.value.naturalWidth;
    originalHeight.value = imageRef.value.naturalHeight;
    aspectRatio.value = imageRef.value.naturalWidth / imageRef.value.naturalHeight;
    imageLoaded.value = true;
  }
});

// 暴露组件方法
defineExpose({
  aspectRatio,
  originalWidth,
  originalHeight,
  imageLoaded,
});
</script>

<style scoped>
.aspect-ratio-image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.aspect-ratio-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 保持原始比例 */
  display: block;
}

.empty-placeholder {
  width: 100%;
  height: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #bfbfbf;
  background-color: #f9f9f9;
}

.empty-placeholder p {
  margin-top: 8px;
  font-size: 14px;
}
</style>
