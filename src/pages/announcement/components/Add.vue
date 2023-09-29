<template>
  <div>
    <t-space>
      <t-button
        theme="primary"
        @click="handleAdd"
      >
        <template #icon><add-icon /></template>
        新建公告
      </t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      header="修改公告信息"
      body="保存中，请稍后"
      :confirm-btn="{
        content: '提交',
        theme: 'primary',
        loading,
      }"
      :on-confirm="add"
      :on-close="close"
    >
      <t-form
        ref="form"
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
        @reset="onReset"
      >
        <t-form-item
          label="通知标题"
          name="noticeTitle"
        >
          <t-input
            v-model="formData.noticeTitle"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <!-- <t-form-item
          label="通知人"
          name="noticePerson"
        >
          <t-input
            v-model="formData.noticePerson"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> -->

        <t-form-item
          label="通知内容"
          name="noticeContent"
        >
          <t-textarea
            v-model="formData.noticeContent"
            placeholder="填写你要展示的内容吧"
            clearable
          />
        </t-form-item>
        <t-form-item
          label="通知时间"
          name="noticeTime"
        >
          <t-date-picker
            v-model="formData.noticeTime"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item> </t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { customAlphabet } from 'nanoid';
import { AddIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save4 } from '@/api/user/xiaochengxugonggao';

const emit = defineEmits(['add']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  noticeTitle: [{ required: true, message: '门店id必填' }],
  noticeContent: [{ required: true, message: '门店名称必填' }],
  noticePerson: [{ required: true, message: '创建必填' }],
};
// nanoid配置 纯数字，五位
const nanoid = customAlphabet('1234567890', 5);

// 在此定义表单数据
const formData = reactive({
  id: null,
  storeId: '',
  noticeTitle: '',
  noticeContent: '',
  noticePerson: '',
  noticeTime: '',
});

const close = () => {
  console.error('突然的关闭');
  visible.value = false;
};

// 外部的添加按钮
const handleAdd = () => {
  visible.value = true;
};
// 确定添加
const add = async (validateResult) => {
  try {
    if (validateResult === true) {
      // // 第三方库随机生成id
      formData.storeId = nanoid();
      const res = await save4(formData);
      console.log('編輯返回', res);
      emit('add', 'emit传来喜报:组件通信成功', res);

      loading.value = true;
      // 加载一下
      const timer = setTimeout(() => {
        loading.value = false;
        visible.value = false;
        clearTimeout(timer);
      }, 200);
      MessagePlugin.success('添加成功');
    } else {
      console.log('Validate Errors: ');
      MessagePlugin.warning('error,请确认已填写所有必填信息!');
    }
  } catch (error) {
    console.log(error);
  }
};

const form = ref(null);

const onReset = () => {
  MessagePlugin.success('重置成功');
};

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
