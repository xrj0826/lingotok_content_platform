<template>
  <div>
    <t-space>
      <t-link @click="handlerEdit">修改密码</t-link>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      attach="body"
      header="修改密码"
      body="保存中，请稍后"
      :confirm-btn="{
        content: '提交',
        theme: 'primary',
        loading,
      }"
      :on-confirm="edit"
      :on-close="close"
    >
      <t-form
        ref="form"
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
      >
        <t-form-item
          label="原密码"
          name="password "
        >
          <t-input
            v-model="formData.password"
            placeholder="请输入内容:"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="新密码"
          name="newPassword "
        >
          <t-input
            v-model="formData.newPassword"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> </t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { editPassword } from '@/api/user/guanliyuan';

// import { page4, update4 } from '@/api/user/xiaochengxugonggao';

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false); // 加载
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };

// 在此定义表单数据
const formData = reactive({
  password: '',
  newPassword: '',
});

const close = () => {
  console.error('===close');
  visible.value = false;
};

// 外部的编辑按钮
const handlerEdit = async () => {
  try {
    visible.value = true;

    // 以下操作用于更新数据
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  try {
    const res = await editPassword(formData);
    console.log('編輯返回', res);
    emit('edit', 'emit传来喜报:组件通信成功', formData.newPassword);
    loading.value = true;
    // 加载一下
    const timer = setTimeout(() => {
      loading.value = false;
      visible.value = false;
      clearTimeout(timer);
    }, 200);
    MessagePlugin.success('编辑成功');
  } catch (error) {
    console.log(error);
  }
};

const form = ref(null);

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
