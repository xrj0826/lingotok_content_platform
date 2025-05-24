<!-- 华为云OBS上传组件 -->
<template>
  <div class="upload-container">
    <t-upload v-model="files" :request-method="customUpload" :accept="accept" :multiple="multiple" :max="maxFiles"
      :disabled="disabled" :before-upload="beforeUpload" :on-success="handleSuccess" :on-error="handleError"
      :auto-upload="true">
      <t-button theme="primary" :loading="uploading">
        {{ buttonText }}
      </t-button>
      <template #tips>
        <p v-if="tips" class="tips-text">{{ tips }}</p>
      </template>
    </t-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import ObsClient from 'esdk-obs-browserjs';
import { MessagePlugin } from 'tdesign-vue-next';
import type { UploadFile, SuccessContext, RequestMethodResponse } from 'tdesign-vue-next';

// 定义组件属性
const props = defineProps({
  // 接受的文件类型
  accept: {
    type: String,
    default: 'image/*'
  },
  // 是否允许多文件上传
  multiple: {
    type: Boolean,
    default: false
  },
  // 最大上传文件数
  maxFiles: {
    type: Number,
    default: 1
  },
  // 上传按钮文字
  buttonText: {
    type: String,
    default: '上传文件'
  },
  // 提示文字
  tips: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 文件夹路径
  folder: {
    type: String,
    default: 'series_cover'
  }
});

// 定义事件
const emit = defineEmits(['success', 'error', 'exceed']);

// 组件状态
const files = ref([]);
const uploading = ref(false);

// 上传前验证
const beforeUpload = async (file: UploadFile): Promise<boolean> => {
  // 文件大小限制（10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    MessagePlugin.error('文件大小不能超过10MB');
    return false;
  }

  // 如果是图片，检查尺寸
  if (file.raw?.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file.raw as Blob);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width < 100 || img.height < 100) {
          MessagePlugin.error('图片尺寸不能小于100x100');
          resolve(false);
        }
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        MessagePlugin.error('图片加载失败');
        resolve(false);
      };

      img.src = objectUrl;
    });
  }

  return true;
};

// 自定义上传方法
const customUpload = async (file: File | UploadFile): Promise<RequestMethodResponse> => {
  // 确保我们有正确的文件对象
  const uploadFile = (file as any).raw || file;

  if (!uploadFile || !(uploadFile instanceof File)) {
    const errorMessage = '无效的文件';
    MessagePlugin.error(errorMessage);
    return { status: 'fail', response: null, error: errorMessage };
  }

  const timestamp = new Date().getTime();
  const originalName = uploadFile.name.substring(0, uploadFile.name.lastIndexOf('.'));
  const extensionName = uploadFile.name.substr(uploadFile.name.lastIndexOf('.'));
  const fileName = `${props.folder}/series_cover_${originalName}_${timestamp}${extensionName}`;

  uploading.value = true;
  try {
    // 配置 OBS 客户端
    const obsClient = new ObsClient({
      access_key_id: 'UI29JOFHTKQRBVVQ06TT',
      secret_access_key: 'vaMNt6dy5cJvXDlkzoWVNx3M8O0H5aIkneZSMZom',
      server: 'https://obs.me-east-1.myhuaweicloud.com',
      timeout: 60,
    });

    const result = await obsClient.putObject({
      Bucket: 'lingotok',
      Key: fileName,
      SourceFile: uploadFile,
      ACL: 'public-read',
      ContentType: uploadFile.type,
    });

    if (result.CommonMsg.Status === 200) {
      const fileUrl = `https://lingotok.obs.me-east-1.myhuaweicloud.com/${fileName}`;
      MessagePlugin.success('上传成功');
      return { status: 'success', response: { url: fileUrl } };
    } else {
      const errorMessage = '上传失败';
      MessagePlugin.error(errorMessage);
      return { status: 'fail', response: null, error: errorMessage };
    }
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    MessagePlugin.error(errorMessage);
    return { status: 'fail', response: null, error: errorMessage };
  } finally {
    uploading.value = false;
  }
};

// 上传成功回调
const handleSuccess = (context: SuccessContext) => {
  MessagePlugin.success('上传成功');
  emit('success', {
    url: context.response.url,
    file: context.file
  });
};

// 上传失败回调
const handleError = (error: Error) => {
  MessagePlugin.error('上传失败：' + error.message);
  emit('error', error);
};
</script>

<style scoped>
.upload-container {
  display: inline-block;
}

.tips-text {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}
</style>