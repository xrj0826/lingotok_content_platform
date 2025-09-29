<template>
  <div class="character-image-container" :style="containerStyle">
    <div class="image-header" v-if="title">
      <span class="title">{{ title }}</span>
      <slot name="header-actions"></slot>
    </div>
    <div class="image-content" :style="contentStyle">
      <AspectRatioImage :src="imageUrl" :maxHeight="maxImageHeight" :backgroundColor="backgroundColor" :border="true"
        :borderRadius="borderRadius" class="character-aspect-image">
        <template #placeholder>
          <div class="empty-placeholder">
            <t-icon :name="placeholderIcon" size="48px" />
            <p>{{ placeholderText }}</p>
            <slot name="placeholder-actions"></slot>
          </div>
        </template>
      </AspectRatioImage>
    </div>
    <div class="image-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
    <div v-if="$slots.footer" class="image-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AspectRatioImage from './AspectRatioImage.vue';

interface Props {
  imageUrl: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  maxImageHeight?: string | number;
  backgroundColor?: string;
  borderRadius?: string;
  placeholderIcon?: string;
  placeholderText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  title: '',
  width: '100%',
  height: 'auto',
  maxImageHeight: '300px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  placeholderIcon: 'image',
  placeholderText: '暂无图片'
});

// 计算容器样式
const containerStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    borderRadius: props.borderRadius,
    backgroundColor: props.backgroundColor,
  };
});

// 计算内容样式
const contentStyle = computed(() => {
  return {
    maxHeight: typeof props.maxImageHeight === 'number' ? `${props.maxImageHeight}px` : props.maxImageHeight,
  };
});
</script>

<style scoped>
.character-image-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid #e5e7eb;
}

.image-header .title {
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.image-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  overflow: hidden;
}

.character-aspect-image {
  width: 100%;
  height: 100%;
}

.image-actions {
  display: flex;
  justify-content: center;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  background-color: rgba(0, 0, 0, 0.01);
  gap: 8px;
}

.image-footer {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  background-color: rgba(0, 0, 0, 0.02);
  font-size: 12px;
  color: #6b7280;
}

.empty-placeholder {
  width: 100%;
  height: 100%;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #bfbfbf;
}

.empty-placeholder p {
  margin: 8px 0;
  font-size: 14px;
}
</style>


