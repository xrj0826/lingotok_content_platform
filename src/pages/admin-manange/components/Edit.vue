<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handlerEdit"
        >编辑</t-link
      >
    </t-space>
    <t-dialog
      v-model:visible="visible"
      attach="body"
      header="修改场地信息"
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
        @reset="onReset"
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

        <t-form-item
          label="昵称"
          name="nickName"
        >
          <t-input
            v-model="formData.nickName"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="管理员手机号"
          name="mobile"
        >
          <t-input
            :v-model="formData.mobile"
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

import { page9 } from '@/api/user/guanliyuan';

const props = defineProps({ editId: String || Number }); // 为什么这里类型只能用大写，不然会警告?

// const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {};

// 在此定义表单数据
const formData = reactive({
  // id: null,
  username: '',
  nickName: '',
  mobile: '',
});

const close = () => {
  console.error('===close');
  visible.value = false;
};

// 外部的编辑按钮
const handlerEdit = async () => {
  try {
    visible.value = true;
    console.log(props.editId);
    // @ts-ignore
    const res = await page9({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // 以下操作用于更新数据
    // formData.id = data.id;
    formData.username = data.username;
    formData.nickName = data.nickName;
    formData.mobile = data.mobile;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  visible.value = false;
  // try {
  //   const res = await update1(formData);
  //   console.log('編輯返回', res);
  //   emit('edit', 'emit传来喜报:组件通信成功', res);
  //   loading.value = true;
  //   // 加载一下
  //   const timer = setTimeout(() => {
  //     loading.value = false;
  //     visible.value = false;
  //     clearTimeout(timer);
  //   }, 150);
  //   MessagePlugin.success('编辑成功');
  // } catch (error) {
  //   console.log(error);
  // }
};

const form = ref(null);

const onReset = () => {
  MessagePlugin.success('重置成功');
};

// const onSubmit = ({ validateResult, firstError }) => {
//   if (validateResult === true) {
//     MessagePlugin.success('提交成功');
//   } else {
//     console.log('Validate Errors: ', firstError, validateResult);
//     MessagePlugin.warning(firstError);
//   }
// };

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
