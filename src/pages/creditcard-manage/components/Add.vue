<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加场地</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      header="添加储值卡"
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
        <t-form-item
          label="卡名称"
          name="cardName"
        >
          <t-input
            v-model="formData.cardName"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="卡类型"
          name="cardType"
        >
          <t-input
            v-model="formData.cardType"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="面值"
          name="faceValue"
        >
          <t-input
            :v-model="formData.faceValue"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="赠送金额"
          name="bonusAmount"
        >
          <t-input
            v-model="formData.bonusAmount"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="当前余额"
          name="currentBalance"
        >
          <t-input
            v-model="formData.currentBalance"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="折扣值"
          name="discountValue"
        >
          <t-input
            v-model="formData.discountValue"
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

import { save6 } from '@/api/user/chuzhikaguanli';

const emit = defineEmits(['add']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  storeId: [{ required: true, message: '门店id必填' }],
  venueName: [{ required: true, message: '门店名称必填' }],
  createBy: [{ required: true, message: '创建必填' }],
  price: [{ required: true, message: '价格必填' }],
};

// 在此定义表单数据
const formData = reactive({
  // id: '',
  cardType: '',
  cardName: '',
  days: null,
  startDate: '',
  endDate: '',
  faceValue: null,
  discountValue: null,
  currentBalance: null,
  bonusAmount: null,
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
const add = async () => {
  try {
    const res = await save6(formData);
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
