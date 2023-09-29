<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加储值卡</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      header="添加储值卡"
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
          <t-radio-group v-model="formData.cardType">
            <t-radio value="STORED_VALUE">储值卡</t-radio>
            <t-radio value="MONTHLY">月卡</t-radio>
            <t-radio value="TIME_BASED">次卡</t-radio>
          </t-radio-group>
        </t-form-item>

        <!-- <t-form-item
          label="有效期"
          name="days"
        >
          <t-input
            v-model="formData.days"
            theme="normal"
            align="right"
            style="width: 88px"
            @enter="onEnter"
          >
            <template #suffix><span>天</span></template>
          </t-input>
        </t-form-item> -->
        <t-form-item
          label="面值"
          name="faceValue"
        >
          <t-input
            v-model="formData.faceValue"
            theme="normal"
            align="right"
            style="width: 88px"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="赠送金额"
          name="bonusAmount"
        >
          <t-input
            v-model="formData.bonusAmount"
            theme="normal"
            align="right"
            style="width: 88px"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
        <!-- <t-form-item
          label="当前余额"
          name="currentBalance"
        >
          <t-input
            v-model="formData.currentBalance"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> -->
        <t-form-item
          label="折扣值"
          name="discountValue"
        >
          <t-input
            v-model="formData.discountValue"
            theme="normal"
            align="right"
            style="width: 70px"
            @enter="onEnter"
          >
            <template #suffix><span>折</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="生效时间"
          name="startDate"
          ><t-date-picker
            v-model="formData.startDate"
            enable-time-picker
            allow-input
            clearable
          /> </t-form-item
        ><t-form-item
          label="结束时间"
          name="endDate"
        >
          <t-date-picker
            v-model="formData.endDate"
            enable-time-picker
            allow-input
            clearable
          /> </t-form-item
        ><t-form-item :status-icon="false">
          <t-space size="small">
            <t-button
              theme="primary"
              type="submit"
              >提交</t-button
            >
          </t-space>
        </t-form-item>
      </t-form></t-dialog
    >
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save8 } from '@/api/user/chuzhikaguanli';

const emit = defineEmits(['add']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  cardType: [{ required: true, message: '卡类型必填' }],
  cardName: [{ required: true, message: '卡名称必填' }],
  days: [{ required: true, message: '生效时间必填' }],
  discountValue: [
    { required: true, message: '该项必填' },
    { min: 1.0, message: '折扣应在1~10之间', type: 'error', trigger: 'blur' },
    { max: 10.0, message: '折扣应在1~10之间', type: 'error', trigger: 'blur' },
  ],
  faceValue: [{ required: true, message: '面值必填' }],
  bonusAmount: [{ required: true, message: '赠送金额必填' }],
};

// 在此定义表单数据
const formData = reactive({
  // id: '',
  storeId: '',
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
const add = async ({ validateResult, _ }) => {
  if (validateResult === true) {
    formData.storeId = '9376';
    const res = await save8(formData);
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
