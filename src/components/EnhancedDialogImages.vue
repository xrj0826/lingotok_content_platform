<template>
  <div class="enhanced-dialog-images">
    <div class="dialog-images-header">
      <h4>{{ title }}</h4>
      <slot name="header-actions"></slot>
    </div>

    <div class="dialog-images-content">
      <!-- 远景图区域 -->
      <div class="scene-image-container">
        <div class="image-title">远景图</div>
        <div class="scene-image" :class="{ 'has-image': !!farImageUrl }">
          <img v-if="farImageUrl" :src="farImageUrl" alt="远景图" @load="onImageLoad('far')"
            @error="onImageError('far')" />
          <div v-else class="image-placeholder">
            <t-icon name="image-add" size="48px" />
            <p>{{ farImagePlaceholder || '暂无远景图，请上传或生成' }}</p>
          </div>
          <div class="image-actions" v-if="$slots.farActions">
            <slot name="farActions"></slot>
          </div>
        </div>
      </div>

      <!-- 角色近景图区域 -->
      <div class="characters-container">
        <div class="character-image-box">
          <div class="image-title">角色A近景</div>
          <div class="character-image" :class="{ 'has-image': !!characterAImageUrl }">
            <img v-if="characterAImageUrl" :src="characterAImageUrl" alt="角色A近景图" @load="onImageLoad('characterA')"
              @error="onImageError('characterA')" />
            <div v-else class="image-placeholder">
              <t-icon name="user-circle" size="40px" />
              <p>{{ characterAPlaceholder || '角色A图片' }}</p>
            </div>
            <div class="image-actions" v-if="$slots.characterAActions">
              <slot name="characterAActions"></slot>
            </div>
          </div>
        </div>

        <div class="character-image-box">
          <div class="image-title">角色B近景</div>
          <div class="character-image" :class="{ 'has-image': !!characterBImageUrl }">
            <img v-if="characterBImageUrl" :src="characterBImageUrl" alt="角色B近景图" @load="onImageLoad('characterB')"
              @error="onImageError('characterB')" />
            <div v-else class="image-placeholder">
              <t-icon name="user-circle" size="40px" />
              <p>{{ characterBPlaceholder || '角色B图片' }}</p>
            </div>
            <div class="image-actions" v-if="$slots.characterBActions">
              <slot name="characterBActions"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-images-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
  title?: string;
  farImageUrl?: string;
  characterAImageUrl?: string;
  characterBImageUrl?: string;
  farImagePlaceholder?: string;
  characterAPlaceholder?: string;
  characterBPlaceholder?: string;
  autoRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '对话图片预览',
  farImageUrl: '',
  characterAImageUrl: '',
  characterBImageUrl: '',
  farImagePlaceholder: '',
  characterAPlaceholder: '',
  characterBPlaceholder: '',
  autoRefresh: false
});

const emits = defineEmits(['imageLoaded', 'imageError']);

// 图片加载状态
const imageLoadStatus = ref({
  far: false,
  characterA: false,
  characterB: false
});

// 图片加载处理
const onImageLoad = (type: 'far' | 'characterA' | 'characterB') => {
  imageLoadStatus.value[type] = true;
  emits('imageLoaded', { type, success: true });
};

// 图片加载错误处理
const onImageError = (type: 'far' | 'characterA' | 'characterB') => {
  imageLoadStatus.value[type] = false;
  emits('imageError', { type, success: false });
};

// 如果启用自动刷新，则使用图片缓存破坏技术
const getImageUrl = (url: string) => {
  if (!url || !props.autoRefresh) return url;
  return `${url}?t=${Date.now()}`;
};

// 导出方法
defineExpose({
  imageLoadStatus,
  refreshImages: () => {
    imageLoadStatus.value = {
      far: false,
      characterA: false,
      characterB: false
    };
  }
});
</script>

<style scoped>
.enhanced-dialog-images {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.dialog-images-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-images-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.dialog-images-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.scene-image-container {
  width: 100%;
}

.image-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.scene-image {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background-color: #f3f4f6;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e5e7eb;
}

.scene-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.characters-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.character-image-box {
  flex: 1;
  min-width: 200px;
}

.character-image {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  background-color: #f3f4f6;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e5e7eb;
}

.character-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  text-align: center;
  padding: 16px;
}

.image-placeholder p {
  margin-top: 8px;
  font-size: 14px;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px;
  display: flex;
  gap: 8px;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  transition: opacity 0.2s;
  opacity: 0;
}

.scene-image:hover .image-actions,
.character-image:hover .image-actions {
  opacity: 1;
}

.has-image {
  background-color: #e5e7eb;
}

.dialog-images-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

@media (max-width: 768px) {
  .characters-container {
    flex-direction: column;
  }

  .scene-image {
    height: 150px;
  }

  .character-image {
    height: 120px;
  }
}
</style>
