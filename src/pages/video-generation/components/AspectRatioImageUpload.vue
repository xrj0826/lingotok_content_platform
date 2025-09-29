<template>
  <div class="aspect-ratio-upload">
    <div class="upload-area" :style="containerStyle" @click="triggerFileInput" @dragover.prevent
      @drop.prevent="handleDrop">
      <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none" />

      <div v-if="!modelValue" class="upload-placeholder">
        <t-icon name="cloud-upload" size="48px" />
        <p>{{ uploadText }}</p>
        <p class="upload-hint">{{ uploadHint }}</p>
      </div>

      <AspectRatioImage v-else :src="modelValue" :maxWidth="width" :maxHeight="height" class="image-preview">
        <template #placeholder>
          <div class="upload-placeholder">
            <t-icon name="cloud-upload" size="48px" />
            <p>{{ uploadText }}</p>
          </div>
        </template>
      </AspectRatioImage>

      <div v-if="modelValue" class="image-overlay">
        <t-button theme="primary" size="small" @click.stop="triggerFileInput">
          <t-icon name="edit" />
          更换
        </t-button>
        <t-button theme="danger" size="small" @click.stop="removeImage">
          <t-icon name="delete" />
          删除
        </t-button>
      </div>
    </div>

    <div v-if="uploading" class="upload-progress">
      <t-progress :percentage="uploadProgress" />
      <p>上传中... {{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { AspectRatioImage } from '@/components';

interface Props {
  modelValue: string;
  width?: string | number;
  height?: string | number;
  uploadText?: string;
  uploadHint?: string;
  backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  width: '200px',
  height: '200px',
  uploadText: '点击或拖拽上传图片',
  uploadHint: '支持 JPG、PNG、GIF 格式',
  backgroundColor: '#f9fafb'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'upload-success': [file: File, url: string];
  'upload-error': [error: string];
}>();

// 容器样式
const containerStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    backgroundColor: props.backgroundColor
  };
});

const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);
const uploadProgress = ref(0);

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleFile(file);
  }
};

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]);
  }
};

// 处理文件
const handleFile = (file: File) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    MessagePlugin.error('请选择图片文件');
    return;
  }

  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    MessagePlugin.error('图片文件大小不能超过 5MB');
    return;
  }

  // 开始上传
  uploadFile(file);
};

// 模拟文件上传
const uploadFile = (file: File) => {
  uploading.value = true;
  uploadProgress.value = 0;

  // 创建预览URL
  const url = URL.createObjectURL(file);

  // 模拟上传进度
  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 30;
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100;
      clearInterval(interval);

      setTimeout(() => {
        uploading.value = false;
        emit('update:modelValue', url);
        emit('upload-success', file, url);
        MessagePlugin.success('图片上传成功');
      }, 500);
    }
  }, 200);
};

// 删除图片
const removeImage = () => {
  if (props.modelValue && props.modelValue.startsWith('blob:')) {
    URL.revokeObjectURL(props.modelValue);
  }
  emit('update:modelValue', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  MessagePlugin.success('图片已删除');
};
</script>

<style scoped>
.aspect-ratio-upload {
  display: inline-block;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-area:hover {
  border-color: #1890ff;
  background-color: #fafafa;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8c8c8c;
  text-align: center;
  padding: 12px;
}

.upload-placeholder .t-icon {
  margin-bottom: 12px;
  color: #d9d9d9;
}

.upload-placeholder p {
  margin: 4px 0;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px !important;
  color: #bfbfbf !important;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-area:hover .image-overlay {
  opacity: 1;
}

.upload-progress {
  margin-top: 12px;
  text-align: center;
}

.upload-progress p {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
}
</style>




