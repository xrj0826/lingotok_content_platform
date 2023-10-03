<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加场地</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      attach="body"
      header="添加场地"
      body="订单保存中，请稍后"
      :confirm-btn="null"
      :cancel-btn="null"
      :on-confirm="close"
    >
      <t-form
        ref="form"
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
        @submit="add"
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
        </t-form-item>
        <t-form-item :status-icon="false">
          <t-space size="small">
            <t-button
              theme="primary"
              type="submit"
              >提交</t-button
            >
          </t-space>
        </t-form-item></t-form
      ></t-dialog
    >
  </div>
</template>
<script lang="ts" setup>
// import { customAlphabet } from 'nanoid';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save1 } from '@/api/user/yonghuguanlixiangguanjiekou';

const emit = defineEmits(['add']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  // storeId: [{ required: true, message: '门店id必填' }],
  venueName: [{ required: true, message: '门店名称必填' }],
  createBy: [{ required: true, message: '创建必填' }],
  price: [{ required: true, message: '价格必填' }],
};
// nanoid配置
// const nanoid = customAlphabet('1234567890', 10);
// 在此定义表单数据
const formData = reactive({
  // id: '',
  storeId: '9376',
  venueName: '',
  createBy: '',
  createTime: '',
  halfPrice: null,
  allPrice: null,
  price: null,
});

const close = () => {
  console.error('===close');
  visible.value = false;
};

// 外部的添加按钮
const handleAdd = () => {
  visible.value = true;
};
// 确定添加
const add = async ({ validateResult, _ }) => {
  try {
    if (validateResult === true) {
      // 第三方库随机生成id
      // formData.storeId = nanoid();
      const res = await save1(formData);
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
