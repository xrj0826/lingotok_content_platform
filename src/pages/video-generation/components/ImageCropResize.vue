<!-- 图片裁剪放大组件 -->
<template>
  <div class="image-crop-resize-container">
    <div class="step-header">
      <h3>裁剪/放大</h3>
      <p>支持放大功能，点击后图片放大为全屏，预览效果</p>
    </div>

    <div class="main-content">
      <!-- 原图片显示 -->
      <div class="original-image-section">
        <h4>原图片</h4>
        <div class="image-preview">
          <img v-if="imageUrl" :src="imageUrl" alt="原图片" @click="openFullscreen" />
          <div v-else class="no-image">
            <t-icon name="image" size="48px" />
            <p>暂无图片</p>
          </div>
          <div class="image-actions">
            <t-button size="small" theme="primary" @click="openFullscreen" :disabled="!imageUrl">
              预览效果
            </t-button>
            <t-button size="small" theme="default" @click="openCropDialog" :disabled="!imageUrl">
              裁剪/放大
            </t-button>
          </div>
        </div>
      </div>

      <!-- 裁剪参数设置 -->
      <div class="crop-settings-section">
        <h4>裁剪设置</h4>
        <div class="settings-form">
          <div class="form-row">
            <label>宽高比：</label>
            <t-select v-model="aspectRatio" @change="handleAspectRatioChange">
              <t-option value="16:9" label="16:9 (推荐)" />
              <t-option value="4:3" label="4:3" />
              <t-option value="1:1" label="1:1 (正方形)" />
              <t-option value="custom" label="自定义" />
            </t-select>
          </div>
          
          <div v-if="aspectRatio === 'custom'" class="form-row">
            <label>自定义尺寸：</label>
            <div class="size-inputs">
              <t-input-number v-model="customWidth" :min="100" :max="4000" placeholder="宽度" />
              <span>×</span>
              <t-input-number v-model="customHeight" :min="100" :max="4000" placeholder="高度" />
            </div>
          </div>

          <div class="form-row">
            <label>放大倍数：</label>
            <t-slider 
              v-model="scaleRatio" 
              :min="0.5" 
              :max="3.0" 
              :step="0.1" 
              :marks="scaleMarks"
              show-tooltip
            />
            <span class="scale-display">{{ scaleRatio.toFixed(1) }}x</span>
          </div>

          <div class="form-row">
            <t-checkbox v-model="keepAspectRatio">保持纵横比</t-checkbox>
          </div>

          <div class="form-row">
            <t-checkbox v-model="keepOriginalContent">保留原角内容</t-checkbox>
          </div>
        </div>
      </div>
    </div>

    <!-- 裁剪对话框 -->
    <t-dialog
      v-model:visible="cropDialogVisible"
      header="图片裁剪"
      width="80%"
      :footer="false"
      @close="closeCropDialog"
    >
      <div class="crop-dialog-content">
        <div class="crop-canvas-container">
          <canvas 
            ref="cropCanvas" 
            :width="canvasWidth" 
            :height="canvasHeight"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
          ></canvas>
          <div class="crop-overlay" :style="overlayStyle"></div>
        </div>
        
        <div class="crop-controls">
          <t-button theme="primary" @click="applyCrop" :loading="isProcessing">
            应用裁剪
          </t-button>
          <t-button theme="default" @click="resetCrop">
            重置
          </t-button>
          <t-button theme="default" @click="closeCropDialog">
            取消
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 全屏预览对话框 -->
    <t-dialog
      v-model:visible="fullscreenVisible"
      header="预览效果"
      width="90%"
      :footer="false"
    >
      <div class="fullscreen-preview">
        <img v-if="croppedImageUrl" :src="croppedImageUrl" alt="预览图片" />
        <img v-else-if="imageUrl" :src="imageUrl" alt="预览图片" />
      </div>
    </t-dialog>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <t-button theme="default" size="large" @click="handlePrev">
        上一步
      </t-button>
      <t-button theme="primary" size="large" @click="handleNext">
        下一步
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { cropAndResize } from '@/api/video-generation';

// 定义 props 和 emits
interface Props {
  imageUrl: string;
}

interface Emits {
  (e: 'update:croppedImage', value: string): void;
  (e: 'next'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 组件状态
const aspectRatio = ref('16:9');
const customWidth = ref(1920);
const customHeight = ref(1080);
const scaleRatio = ref(1.0);
const keepAspectRatio = ref(true);
const keepOriginalContent = ref(true);
const cropDialogVisible = ref(false);
const fullscreenVisible = ref(false);
const isProcessing = ref(false);
const croppedImageUrl = ref('');

// Canvas 相关
const cropCanvas = ref<HTMLCanvasElement>();
const canvasWidth = ref(800);
const canvasHeight = ref(600);
const cropArea = ref({
  x: 0,
  y: 0,
  width: 400,
  height: 300
});
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// 放大标记
const scaleMarks = {
  0.5: '0.5x',
  1.0: '1x',
  1.5: '1.5x',
  2.0: '2x',
  3.0: '3x'
};

// 裁剪区域样式
const overlayStyle = computed(() => ({
  left: cropArea.value.x + 'px',
  top: cropArea.value.y + 'px',
  width: cropArea.value.width + 'px',
  height: cropArea.value.height + 'px'
}));

// 处理宽高比变化
const handleAspectRatioChange = () => {
  if (aspectRatio.value === '16:9') {
    customWidth.value = 1920;
    customHeight.value = 1080;
  } else if (aspectRatio.value === '4:3') {
    customWidth.value = 1200;
    customHeight.value = 900;
  } else if (aspectRatio.value === '1:1') {
    customWidth.value = 1080;
    customHeight.value = 1080;
  }
  
  updateCropArea();
};

// 更新裁剪区域
const updateCropArea = () => {
  let width, height;
  
  if (aspectRatio.value === '16:9') {
    width = 400;
    height = 225;
  } else if (aspectRatio.value === '4:3') {
    width = 400;
    height = 300;
  } else if (aspectRatio.value === '1:1') {
    width = 300;
    height = 300;
  } else {
    // 自定义比例
    const ratio = customWidth.value / customHeight.value;
    width = 400;
    height = width / ratio;
  }
  
  cropArea.value = {
    x: (canvasWidth.value - width) / 2,
    y: (canvasHeight.value - height) / 2,
    width,
    height
  };
};

// 打开裁剪对话框
const openCropDialog = async () => {
  if (!props.imageUrl) return;
  
  cropDialogVisible.value = true;
  
  await nextTick();
  
  // 初始化canvas
  if (cropCanvas.value) {
    const ctx = cropCanvas.value.getContext('2d');
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        // 设置canvas尺寸
        canvasWidth.value = Math.min(img.width, 800);
        canvasHeight.value = Math.min(img.height, 600);
        
        // 绘制图片
        ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
        ctx.drawImage(img, 0, 0, canvasWidth.value, canvasHeight.value);
        
        // 初始化裁剪区域
        updateCropArea();
      }
    };
    img.src = props.imageUrl;
  }
};

// 关闭裁剪对话框
const closeCropDialog = () => {
  cropDialogVisible.value = false;
};

// 打开全屏预览
const openFullscreen = () => {
  fullscreenVisible.value = true;
};

// 鼠标事件处理
const handleMouseDown = (event: MouseEvent) => {
  const rect = cropCanvas.value?.getBoundingClientRect();
  if (!rect) return;
  
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 检查是否在裁剪区域内
  if (
    x >= cropArea.value.x &&
    x <= cropArea.value.x + cropArea.value.width &&
    y >= cropArea.value.y &&
    y <= cropArea.value.y + cropArea.value.height
  ) {
    isDragging.value = true;
    dragStart.value = { x: x - cropArea.value.x, y: y - cropArea.value.y };
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;
  
  const rect = cropCanvas.value?.getBoundingClientRect();
  if (!rect) return;
  
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  cropArea.value.x = Math.max(0, Math.min(x - dragStart.value.x, canvasWidth.value - cropArea.value.width));
  cropArea.value.y = Math.max(0, Math.min(y - dragStart.value.y, canvasHeight.value - cropArea.value.height));
};

const handleMouseUp = () => {
  isDragging.value = false;
};

// 应用裁剪
const applyCrop = async () => {
  if (!props.imageUrl) return;
  
  isProcessing.value = true;
  
  try {
    const response = await cropAndResize({
      imageUrl: props.imageUrl,
      width: customWidth.value * scaleRatio.value,
      height: customHeight.value * scaleRatio.value,
      keepAspectRatio: keepAspectRatio.value
    });
    
    if (response.code === 0) {
      croppedImageUrl.value = response.data.croppedUrl;
      emit('update:croppedImage', croppedImageUrl.value);
      MessagePlugin.success('图片裁剪成功');
      closeCropDialog();
    } else {
      MessagePlugin.error(response.message || '裁剪失败');
    }
  } catch (error) {
    console.error('裁剪失败:', error);
    MessagePlugin.error('裁剪失败，请稍后重试');
  } finally {
    isProcessing.value = false;
  }
};

// 重置裁剪
const resetCrop = () => {
  scaleRatio.value = 1.0;
  aspectRatio.value = '16:9';
  updateCropArea();
};

// 处理上一步
const handlePrev = () => {
  emit('prev');
};

// 处理下一步
const handleNext = () => {
  emit('next');
};
</script>

<style scoped>
.image-crop-resize-container {
  max-width: 1000px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h3 {
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.step-header p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.original-image-section h4,
.crop-settings-section h4 {
  color: #374151;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.image-preview {
  background: #f8fafc;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.no-image {
  color: #9ca3af;
  text-align: center;
}

.no-image .t-icon {
  margin-bottom: 12px;
}

.image-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.settings-form {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row label {
  min-width: 80px;
  color: #374151;
  font-weight: 500;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scale-display {
  color: #374151;
  font-weight: 600;
  min-width: 40px;
}

.crop-dialog-content {
  text-align: center;
}

.crop-canvas-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.crop-canvas-container canvas {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: crosshair;
}

.crop-overlay {
  position: absolute;
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  pointer-events: none;
}

.crop-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.fullscreen-preview {
  text-align: center;
}

.fullscreen-preview img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .image-crop-resize-container {
    padding: 0 16px;
  }
  
  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .form-row label {
    min-width: auto;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .step-actions .t-button {
    width: 100%;
  }
}
</style>






