<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加区间价格</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
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
        <t-form-item
          label="该时间段价格"
          name="specialValue"
        >
          <t-input
            v-model="formData.specialValue"
            style="width: 90px"
            placeholder="请输入"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template></t-input
          >
        </t-form-item>
        <t-form-item
          label="订单开始时间"
          name="orderst"
          ><t-date-picker
            v-model="formData.orderst"
            enable-time-picker
            allow-input
            clearable
          /> </t-form-item
        ><t-form-item
          label="订单结束时间"
          name="ordered"
        >
          <t-date-picker
            v-model="formData.ordered"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item :status-icon="false">
          <t-space
            size="small"
            style="margin: 40px 0px 0px 220px"
          >
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
import { customAlphabet } from 'nanoid';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save3 } from '@/api/user/houtaizhidingteshujiagejiekou';
import { useRenewDataStore } from '@/store/renewData';
// import { useRenewDataStore } from '@/store/renewData';

// const store = useRenewDataStore();

const emit = defineEmits(['add']);

const store = useRenewDataStore();
const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  venueId: [{ required: true, message: '该项必填' }],
  orderst: [{ required: true, message: '该项必填' }],
  ordered: [{ required: true, message: '该项必填' }],
  specialValue: [{ required: true, message: '该项必填' }],
};
// nanoid配置 纯数字，五位
const nanoid = customAlphabet('1234567890', 5);
// 在此定义表单数据
const formData = reactive({
  id: null,
  venueId: null,
  orderst: '',
  ordered: '',
  specialValue: null,
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
const add = async ({ validateResult, _ }) => {
  try {
    if (validateResult === true) {
      // // 第三方库随机生成id
      formData.id = nanoid();
      // formData.storeId = '9376';
      formData.venueId = store.storeId;
      const res = await save3(formData);
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

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
