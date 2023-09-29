<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加场地</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      header="添加场地"
      body="订单保存中，请稍后"
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

        <!-- <t-form-item
          label="场地id"
          name="storeId"
        >
          <t-input
            v-model="formData.storeId"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> -->
        <t-form-item
          label="场地名称"
          name="venueName"
        >
          <t-input
            v-model="formData.venueName"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="修改者"
          name="createBy"
        >
          <t-input
            v-model="formData.createBy"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="半场价格"
          name="halfPrice"
        >
          <t-input
            v-model="formData.halfPrice"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="全场价格"
          name="allPrice"
        >
          <t-input
            v-model="formData.allPrice"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="价格"
          name="price"
        >
          <t-input
            v-model="formData.price"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> </t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { customAlphabet } from 'nanoid';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page, save, update } from '@/api/user/changdeguanli';

const emit = defineEmits(['add']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  storeId: [{ required: true, message: '门店id必填' }],
  venueName: [{ required: true, message: '门店名称必填' }],
  createBy: [{ required: true, message: '创建必填' }],
  price: [{ required: true, message: '价格必填' }],
};
// nanoid配置 纯数字，五位
const nanoid = customAlphabet('1234567890', 5);
// 在此定义表单数据
const formData = reactive({
  // id: null,
  storeId: null,
  venueName: '',
  createBy: '',
  halfPrice: null,
  allPrice: null,
  price: null,
  specialValue: '',
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
const add = async () => {
  try {
    // 第三方库随机生成id
    formData.storeId = nanoid();
    console.log('storeId', formData);

    const res = await save(formData);
    console.log('編輯返回', res);
    emit('add', 'emit传来喜报:组件通信成功', res);

    loading.value = true;
    // 加载一下
    const timer = setTimeout(() => {
      loading.value = false;
      visible.value = false;
      clearTimeout(timer);
    }, 200);
  } catch (error) {
    console.log(error);
  }
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
