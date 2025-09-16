<!-- 华为云OBS上传组件 -->
<template>
  <div class="upload-container">
    <t-upload ref="uploadRef" v-model="files" theme="file" :multiple="multiple" :max="maxFiles" :accept="accept"
      :disabled="disabled" :auto-upload="true" :request-method="customUpload" :before-upload="beforeUpload"
      @success="handleSuccess" @fail="handleError">
      <template #default>
        <slot>
          <t-button theme="primary" :loading="uploading">
            {{ buttonText }}
          </t-button>
        </slot>
      </template>
      <template #tip>
        <slot name="tip">
          <p v-if="tips" class="tips-text">{{ tips }}</p>
        </slot>
      </template>
    </t-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import ObsClient from 'esdk-obs-browserjs';
import { MessagePlugin } from 'tdesign-vue-next';
import type { UploadFile, SuccessContext, RequestMethodResponse, UploadFailContext } from 'tdesign-vue-next';
import { PropType } from 'vue';

// 定义组件属性
const props = defineProps({
  // 接受的文件类型
  accept: {
    type: String,
    default: 'video/mp4,video/avi'
  },
  // 是否允许多文件上传
  multiple: {
    type: Boolean,
    default: true
  },
  // 最大上传文件数
  maxFiles: {
    type: Number,
    default: 10
  },
  // 最大文件大小（默认1GB）
  maxSize: {
    type: Number,
    default: 1024 * 1024 * 1024
  },
  // 上传按钮文字
  buttonText: {
    type: String,
    default: '上传视频'
  },
  // 提示文字
  tips: {
    type: String,
    default: '支持视频格式：MP4、AVI等，单个文件不超过1GB'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 文件夹路径
  folder: {
    type: String,
    default: 'videos'
  }
});

// 定义事件
const emit = defineEmits(['success', 'error', 'exceed', 'remove']);

// 组件状态
const files = ref([]);
const uploading = ref(false);
const uploadRef = ref(null);

// 上传前验证
const beforeUpload = async (file: UploadFile): Promise<boolean> => {
  console.log('开始验证文件:', file);

  // 检查文件大小
  if (file.size > props.maxSize) {
    const maxSizeGB = props.maxSize / (1024 * 1024 * 1024);
    console.error('文件过大:', { fileSize: file.size, maxSize: props.maxSize });
    MessagePlugin.error(`文件大小不能超过${maxSizeGB}GB`);
    return false;
  }

  // 检查文件类型
  const fileType = file.raw?.type || file.type;
  const acceptedTypes = props.accept.split(',');
  console.log('文件类型检查:', { fileType, acceptedTypes });

  if (!fileType) {
    console.error('无法获取文件类型');
    MessagePlugin.error('无法识别文件类型');
    return false;
  }

  // 检查文件扩展名
  const fileName = file.raw?.name || file.name;
  const extension = fileName.toLowerCase().split('.').pop();
  const isValidExtension = ['mp4', 'avi'].includes(extension || '');
  console.log('文件扩展名检查:', { fileName, extension, isValidExtension });

  if (!acceptedTypes.includes(fileType) && !isValidExtension) {
    console.error('不支持的文件类型:', { fileType, extension });
    MessagePlugin.error('不支持的文件格式，请上传MP4或AVI格式的视频');
    return false;
  }

  console.log('文件验证通过');
  return true;
};

// 自定义上传方法
const customUpload = async (file: File | UploadFile): Promise<RequestMethodResponse> => {
  console.log('开始上传文件:', file);

  // 确保我们有正确的文件对象
  let uploadFile: File | null = null;

  if (file instanceof File) {
    uploadFile = file;
  } else if (Array.isArray(file)) {
    uploadFile = file[0]?.raw;
  } else if ('raw' in file) {
    uploadFile = file.raw;
  }

  console.log('处理后的文件对象:', uploadFile);

  if (!uploadFile || !(uploadFile instanceof File)) {
    console.error('文件对象无效:', uploadFile);
    const errorMessage = '无效的文件';
    MessagePlugin.error(errorMessage);
    return { status: 'fail', response: null, error: errorMessage };
  }

  const timestamp = new Date().getTime();
  const username = localStorage.getItem('username') || 'unknown';
  const originalName = uploadFile.name.substring(0, uploadFile.name.lastIndexOf('.'));
  const extensionName = uploadFile.name.substr(uploadFile.name.lastIndexOf('.'));
  const fileName = `${props.folder}/video_${originalName}_${username}_${timestamp}${extensionName}`;

  console.log('准备上传到OBS:', {
    fileName,
    fileType: uploadFile.type,
    fileSize: uploadFile.size
  });

  uploading.value = true;
  try {
    // 配置 OBS 客户端
    const obsClient = new ObsClient({
      access_key_id: 'UI29JOFHTKQRBVVQ06TT',
      secret_access_key: 'vaMNt6dy5cJvXDlkzoWVNx3M8O0H5aIkneZSMZom',
      server: 'https://obs.me-east-1.myhuaweicloud.com',
      timeout: 600, // 增加超时时间到10分钟
    });

    console.log('开始OBS上传...');
    const result = await obsClient.putObject({
      Bucket: 'lingotok',
      Key: fileName,
      SourceFile: uploadFile,
      ACL: 'public-read',
      ContentType: uploadFile.type,
    });

    console.log('OBS上传结果:', result);

    if (result.CommonMsg.Status === 200) {
      const fileUrl = `https://lingotok.obs.me-east-1.myhuaweicloud.com/${fileName}`;
      console.log('上传成功，文件URL:', fileUrl);
      return {
        status: 'success',
        response: {
          url: fileUrl,
          key: fileName
        }
      };
    } else {
      const errorMessage = '上传失败: ' + result.CommonMsg.Message;
      console.error('上传失败:', result);
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
  console.log('上传成功回调:', context);
  emit('success', context.file, context.response);
};

// 上传失败回调
const handleError = (options: UploadFailContext) => {
  console.error('上传失败回调:', options);
  const errorMessage = options.response?.error || '上传失败';
  MessagePlugin.error('上传失败：' + errorMessage);
  emit('error', options);
};

// 提供删除文件的方法
const removeFile = (fileName: string) => {
  const index = files.value.findIndex(file => file.name === fileName);
  if (index > -1) {
    files.value.splice(index, 1);
    emit('remove', fileName);
  }
};

// 导出方法供父组件调用
defineExpose({
  removeFile,
  files
});
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