<template>
  <div class="dialog-images-enhanced">
    <div class="dialog-images-header">
      <h4>{{ title }}</h4>
      <slot name="header-actions"></slot>
    </div>

    <div class="dialog-images-content">
      <!-- 远景图区域 -->
      <div class="scene-image-container">
        <div class="image-title">{{ sceneTitle || '远景图' }}</div>
        <div class="scene-image" :class="{ 'has-image': !!sceneImageUrl }">
          <img v-if="sceneImageUrl" :src="sceneImageUrl" alt="远景图" @load="onImageLoad('scene')"
            @error="onImageError('scene')" @click="showPreview('scene')" class="preview-enabled"
            style="cursor: pointer;" />
          <div v-else class="image-placeholder">
            <t-icon name="image-add" size="48px" />
            <p>{{ scenePlaceholder || '暂无远景图，请上传或生成' }}</p>
          </div>
          <div class="image-actions" v-if="$slots.sceneActions">
            <slot name="sceneActions"></slot>
          </div>
          <div class="preview-hint" v-if="sceneImageUrl">
            <t-icon name="zoom-in" size="16px" />
            <span>点击查看大图</span>
          </div>
        </div>
      </div>

      <!-- 角色近景图区域 -->
      <div class="characters-container">
        <div class="character-image-box">
          <div class="image-title">{{ characterATitle || '角色A近景图' }}</div>
          <div class="character-image" :class="{ 'has-image': !!characterAImageUrl }">
            <img v-if="characterAImageUrl" :src="characterAImageUrl" alt="角色A近景图" @load="onImageLoad('characterA')"
              @error="onImageError('characterA')" @click="showPreview('characterA')" class="preview-enabled"
              style="cursor: pointer;" />
            <div v-else class="image-placeholder">
              <t-icon name="user-circle" size="40px" />
              <p>{{ characterAPlaceholder || '角色A图片' }}</p>
            </div>
            <div class="image-actions" v-if="$slots.characterAActions">
              <slot name="characterAActions"></slot>
            </div>
            <div class="preview-hint" v-if="characterAImageUrl">
              <t-icon name="zoom-in" size="16px" />
              <span>点击查看大图</span>
            </div>
          </div>
        </div>

        <div class="character-image-box">
          <div class="image-title">{{ characterBTitle || '角色B近景图' }}</div>
          <div class="character-image" :class="{ 'has-image': !!characterBImageUrl }">
            <img v-if="characterBImageUrl" :src="characterBImageUrl" alt="角色B近景图" @load="onImageLoad('characterB')"
              @error="onImageError('characterB')" @click="showPreview('characterB')" class="preview-enabled"
              style="cursor: pointer;" />
            <div v-else class="image-placeholder">
              <t-icon name="user-circle" size="40px" />
              <p>{{ characterBPlaceholder || '角色B图片' }}</p>
            </div>
            <div class="image-actions" v-if="$slots.characterBActions">
              <slot name="characterBActions"></slot>
            </div>
            <div class="preview-hint" v-if="characterBImageUrl">
              <t-icon name="zoom-in" size="16px" />
              <span>点击查看大图</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-images-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>

    <!-- 图片预览弹窗 -->
    <ImagePreviewDialog :visible="previewVisible" @update:visible="previewVisible = $event" :image-url="previewImageUrl"
      :title="previewTitle" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ImagePreviewDialog from './ImagePreviewDialog.vue';

interface Props {
  title?: string;
  sceneTitle?: string;
  characterATitle?: string;
  characterBTitle?: string;
  sceneImageUrl?: string;
  characterAImageUrl?: string;
  characterBImageUrl?: string;
  scenePlaceholder?: string;
  characterAPlaceholder?: string;
  characterBPlaceholder?: string;
  autoRefresh?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '对话图片预览',
  sceneTitle: '对话场景远景图',
  characterATitle: '角色A近景图',
  characterBTitle: '角色B近景图',
  sceneImageUrl: '',
  characterAImageUrl: '',
  characterBImageUrl: '',
  scenePlaceholder: '',
  characterAPlaceholder: '',
  characterBPlaceholder: '',
  autoRefresh: false
});

const emits = defineEmits(['imageLoaded', 'imageError', 'preview']);

// 图片加载状态
const imageLoadStatus = ref({
  scene: false,
  characterA: false,
  characterB: false
});

// 图片预览状态
const previewVisible = ref(false);
const previewImageUrl = ref('');
const previewType = ref<'scene' | 'characterA' | 'characterB' | null>(null);

// 预览标题
const previewTitle = computed(() => {
  switch (previewType.value) {
    case 'scene':
      return props.sceneTitle || '远景图预览';
    case 'characterA':
      return props.characterATitle || '角色A近景图预览';
    case 'characterB':
      return props.characterBTitle || '角色B近景图预览';
    default:
      return '图片预览';
  }
});

// 显示预览
const showPreview = (type: 'scene' | 'characterA' | 'characterB') => {
  let imageUrl = '';

  switch (type) {
    case 'scene':
      imageUrl = props.sceneImageUrl;
      break;
    case 'characterA':
      imageUrl = props.characterAImageUrl;
      break;
    case 'characterB':
      imageUrl = props.characterBImageUrl;
      break;
  }

  if (!imageUrl) return;

  // 确保预览类型和URL在设置可见性之前就已更新
  previewType.value = type;
  previewImageUrl.value = getImageUrl(imageUrl);

  // 设置为可见 - 确保在下一个微任务中执行以避免DOM更新顺序问题
  setTimeout(() => {
    previewVisible.value = true;
    console.log('预览弹窗已触发:', { type, url: imageUrl, visible: previewVisible.value });
  }, 0);

  // 发出预览事件
  emits('preview', { type, url: imageUrl });
};

// 图片加载处理
const onImageLoad = (type: 'scene' | 'characterA' | 'characterB') => {
  imageLoadStatus.value[type] = true;
  emits('imageLoaded', { type, success: true });
};

// 图片加载错误处理
const onImageError = (type: 'scene' | 'characterA' | 'characterB') => {
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
      scene: false,
      characterA: false,
      characterB: false
    };
  },
  showPreview
});
</script>

<style scoped>
.dialog-images-enhanced {
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
  padding: 16px 20px;
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
  padding: 20px;
  gap: 20px;
}

.scene-image-container {
  width: 100%;
}

.image-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 10px;
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

.scene-image img.preview-enabled,
.character-image img.preview-enabled {
  cursor: zoom-in;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.scene-image img.preview-enabled:hover,
.character-image img.preview-enabled:hover {
  transform: scale(1.03);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.scene-image img.preview-enabled:active,
.character-image img.preview-enabled:active {
  transform: scale(0.99);
  filter: brightness(1.05);
}

.characters-container {
  display: flex;
  gap: 20px;
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
  margin-top: 10px;
  margin-bottom: 0;
  font-size: 14px;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  display: flex;
  gap: 8px;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  transition: transform 0.2s;
  transform: translateY(100%);
}

.scene-image:hover .image-actions,
.character-image:hover .image-actions {
  transform: translateY(0);
}

.has-image {
  background-color: #e5e7eb;
}

.dialog-images-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

/* 预览提示 */
.preview-hint {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
  transform: translateY(-5px);
}

.scene-image:hover .preview-hint,
.character-image:hover .preview-hint {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .characters-container {
    flex-direction: column;
  }

  .scene-image {
    height: 160px;
  }

  .character-image {
    height: 140px;
  }
}
</style>
