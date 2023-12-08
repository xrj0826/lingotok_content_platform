<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加管理员</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      attach="body"
      header="添加管理员"
      body="保存中，请稍后"
      :confirm-btn="null"
      :cancel-btn="null"
      :on-confirm="close"
    >
      <!-- @vue-ignore -->
      <t-form
        ref="form"
        label-width="120px"
        label-align="left"
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
        @submit="add"
      >
        <t-form-item
          label="管理员用户名"
          name="username"
        >
          <t-input
            v-model="formData.username"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <!-- <t-form-item
          label="管理员昵称"
          name="nickName"
        >
          <t-input
            v-model="formData.nickName"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> -->
        <t-form-item
          label="密码"
          name="password"
        >
          <t-input
            v-model="formData.password"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="管理员手机号"
          name="mobile"
        >
          <t-input
            v-model="formData.mobile"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item :status-icon="false">
          <t-space size="small">
            <t-button
              :loading="reClick"
              theme="primary"
              type="submit"
              style="margin: 20px 100px 0 0"
              >提交</t-button
            >
          </t-space>
        </t-form-item></t-form
      ></t-dialog
    >
  </div>
</template>
<script lang="ts" setup>
import { customAlphabet } from 'nanoid';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save10 } from '@/api/user/guanliyuan';

const emit = defineEmits(['add']);
const form = ref(null);
const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  username: [{ required: true, message: '该项必填' }],
  password: [{ required: true, message: '该项必填' }],
  mobile: [
    { required: true, message: '该项必填' },
    { min: 11, message: '应输入11位手机号', type: 'error', trigger: 'blur' },
    // { max: 11, message: '应输入11位手机号', type: 'error', trigger: 'blur' },
  ],
};

// nanoid配置

const nanoid = customAlphabet('1234567890', 2);
// 在此定义表单数据
const formData = reactive({
  id: null,
  // storeId: '', // 添加管理员必须传storeId
  username: '',
  // nickName: '',
  mobile: '',
  password: '',
});
const close = () => {
  console.error('===close');
  visible.value = false;
};

// 外部的添加按钮
const handleAdd = () => {
  visible.value = true;
};
const reClick = ref(false);

// 确定添加
const add = async ({ validateResult, _ }) => {
  try {
    if (validateResult === true) {
      // // 第三方库随机生成id
      formData.id = nanoid();
      // formData.storeId = '9376';

      const res = await save10(formData);

      console.log('編輯返回', res);
      emit('add', 'emit传来喜报:组件通信成功', res);
      reClick.value = true;
      loading.value = true;
      // 加载一下
      const timer = setTimeout(() => {
        loading.value = false;
        visible.value = false;
        reClick.value = false;
        clearTimeout(timer);
      }, 800);
      MessagePlugin.success('添加成功');
    } else {
      console.log('Validate Errors: ');
      MessagePlugin.warning('请确认已填写所有必填信息!');
    }
  } catch (error) {
    console.log(error);
    MessagePlugin.warning(error);
  }
};

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
