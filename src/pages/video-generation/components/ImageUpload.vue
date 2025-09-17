<!-- 图片上传组件 -->
<template>
  <div class="image-upload-container">
    <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
      <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none" />

      <div v-if="!imageUrl" class="upload-placeholder">
        <t-icon name="cloud-upload" size="48px" />
        <p>点击或拖拽上传图片</p>
        <p class="upload-hint">支持 JPG、PNG、GIF 格式</p>
      </div>

      <div v-else class="image-preview">
        <img :src="imageUrl" alt="预览图片" />
        <div class="image-overlay">
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
    </div>

    <div v-if="uploading" class="upload-progress">
      <t-progress :percentage="uploadProgress" />
      <p>上传中... {{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

interface Props {
  modelValue?: string;
  width?: string;
  height?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'upload-success', file: File, url: string): void;
  (e: 'upload-error', error: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  width: '200px',
  height: '150px'
});

const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const imageUrl = ref(props.modelValue);
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
        imageUrl.value = url;
        emit('update:modelValue', url);
        emit('upload-success', file, url);
        MessagePlugin.success('图片上传成功');
      }, 500);
    }
  }, 200);
};

// 删除图片
const removeImage = () => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  imageUrl.value = '';
  emit('update:modelValue', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  MessagePlugin.success('图片已删除');
};
</script>

<style scoped>
.image-upload-container {
  display: inline-block;
}

.upload-area {
  width: v-bind(width);
  height: v-bind(height);
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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
  height: 100%;
  color: #8c8c8c;
  text-align: center;
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
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
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

.image-preview:hover .image-overlay {
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











































































