<template>
  <div>
    <t-card class="notice-send-container" :bordered="false">
      <template #header>发送站内信</template>
      <t-form ref="form" :data="formData" :rules="rules" @submit="onSubmit">
        <t-form-item name="globalSend" label="批量发送">
          <t-switch v-model="formData.globalSend" />
        </t-form-item>

        <t-form-item v-if="!formData.globalSend" name="userIds" label="用户ID" :rules="rules.userIds">
          <t-textarea v-model="formData.userIds" placeholder="请输入用户ID，多个ID请用英文逗号分隔"
            :autosize="{ minRows: 2, maxRows: 5 }" />
        </t-form-item>

        <t-form-item name="titleEn" label="英文标题">
          <t-input v-model="formData.titleEn" placeholder="请输入英文标题" />
        </t-form-item>

        <t-form-item name="contentEn" label="英文内容">
          <t-textarea v-model="formData.contentEn" placeholder="请输入英文内容" :autosize="{ minRows: 3, maxRows: 10 }" />
        </t-form-item>

        <t-form-item name="titleAr" label="阿拉伯语标题">
          <t-input v-model="formData.titleAr" placeholder="请输入阿拉伯语标题" />
        </t-form-item>

        <t-form-item name="contentAr" label="阿拉伯语内容">
          <t-textarea v-model="formData.contentAr" placeholder="请输入阿拉伯语内容" :autosize="{ minRows: 3, maxRows: 10 }" />
        </t-form-item>

        <t-form-item name="sendType" label="发送类型">
          <t-radio-group v-model="formData.sendType">
            <t-radio-button value="notice">仅站内信</t-radio-button>
            <t-radio-button value="push">仅推送</t-radio-button>
            <t-radio-button value="both">站内信+推送</t-radio-button>
          </t-radio-group>
        </t-form-item>

        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" :loading="loading">发送</t-button>
            <t-button theme="default" @click="resetForm">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import type { FormRule } from 'tdesign-vue-next';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const form = ref();
const loading = ref(false);

interface FormData {
  globalSend: boolean;
  userIds: string;
  titleEn: string;
  contentEn: string;
  titleAr: string;
  contentAr: string;
  sendType: 'notice' | 'push' | 'both';
}

interface NoticeRequestData {
  notice: boolean;
  push: boolean;
  global_send: boolean;
  user_id_list?: string[];
  title_en: string;
  content_en: string;
  title_ar: string;
  content_ar: string;
}

const formData = reactive<FormData>({
  globalSend: false,
  userIds: '',
  titleEn: '',
  contentEn: '',
  titleAr: '',
  contentAr: '',
  sendType: 'notice'
});

const rules: Record<string, FormRule[]> = {
  userIds: [{
    required: true, message: '请输入用户ID', validator: (val) => {
      // 当globalSend为true时，不校验userIds
      if (formData.globalSend) return true;
      return !!val;
    }
  }],
  titleEn: [{ required: true, message: '请输入英文标题' }],
  contentEn: [{ required: true, message: '请输入英文内容' }],
  titleAr: [{ required: true, message: '请输入阿拉伯语标题' }],
  contentAr: [{ required: true, message: '请输入阿拉伯语内容' }],
  sendType: [{ required: true, message: '请选择发送类型' }]
};

// 生成签名
function generateSignature(timestamp: string): string {
  const apiName = 'create_notice';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 发送站内信
async function sendNotice(data: any) {
  const timestamp = Date.now().toString();
  const headers = {
    Timestamp: timestamp,
    Signature: generateSignature(timestamp)
  };

  try {
    const response = await axios.post(
      'https://api.lingotok.ai/api/v1/notice/create_notice',
      data,
      { headers }
    );

    if (response.data?.code === 200) {
      MessagePlugin.success('发送成功');
      resetForm();
    } else {
      throw new Error(response.data?.message || '发送失败');
    }
  } catch (error) {
    console.error('发送失败:', error);
    MessagePlugin.error('发送失败：' + (error.message || '未知错误'));
  }
}

// 表单提交
async function onSubmit({ validateResult, firstError }) {
  if (validateResult === true) {
    const confirmText = formData.globalSend ? '确定要向所有用户发送站内信吗？' : '确定要发送站内信吗？';

    const dialog = DialogPlugin.confirm({
      header: '确认发送',
      body: confirmText,
      onConfirm: async () => {
        loading.value = true;
        try {
          const requestData: NoticeRequestData = {
            notice: formData.sendType === 'notice' || formData.sendType === 'both',
            push: formData.sendType === 'push' || formData.sendType === 'both',
            global_send: formData.globalSend,
            title_en: formData.titleEn,
            content_en: formData.contentEn,
            title_ar: formData.titleAr,
            content_ar: formData.contentAr
          };

          // 只有在非批量发送时才添加user_id_list
          if (!formData.globalSend) {
            requestData.user_id_list = formData.userIds.split(',').map(id => id.trim());
          }

          await sendNotice(requestData);
          // 关闭确认对话框
          dialog.destroy();
        } finally {
          loading.value = false;
        }
      },
      onClose: () => {
        dialog.destroy();
      },
      closeOnOverlayClick: true,
    });
  } else {
    MessagePlugin.error(firstError);
  }
}

// 重置表单
function resetForm() {
  form.value?.reset();
  formData.globalSend = false;
  formData.sendType = 'notice';
}
</script>

<style scoped>
.notice-send-container {
  padding: 20px;
}

:deep(.t-form__controls) {
  width: 600px;
}
</style>