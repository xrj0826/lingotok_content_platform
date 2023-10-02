<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加场地</t-button>
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
        label-width="280px"
        label-align="top"
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
        @submit="add"
      >
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
          label="场地类型"
          name="venueType"
        >
          <t-radio-group v-model="formData.venueType">
            <t-radio value="0">篮球场</t-radio>
            <t-radio value="1">羽毛球场</t-radio>
            <t-radio value="2">乒乓球场</t-radio>
          </t-radio-group>
        </t-form-item>
        <!-- 
        <t-form-item
          label="创建者"
          name="createBy"
        >
          <t-input
            v-model="formData.createBy"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> -->

        <t-form-item
          label="9:30-11:30与16:00-18:00篮球场半场价格"
          name="amHalfPrice"
        >
          <t-input
            v-model="formData.amHalfPrice"
            placeholder="请输入"
            style="width: 100px"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="下午篮球场半场价格"
          name="pmHalfPrice"
        >
          <t-input
            v-model="formData.pmHalfPrice"
            placeholder="请输入"
            style="width: 100px"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="9:30-11:30与16:00-18:00全场价格"
          name="amAllPrice"
        >
          <t-input
            v-model="formData.amAllPrice"
            placeholder="请输入"
            style="width: 100px"
            @enter="onEnter"
            ><template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="下午全场价格"
          name="pmAllPrice"
        >
          <t-input
            v-model="formData.pmAllPrice"
            placeholder="请输入"
            style="width: 100px"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="价格"
          name="price"
        >
          <t-input
            v-model="formData.price"
            placeholder="请输入"
            style="width: 100px"
            @enter="onEnter"
            ><template #suffix><span>元</span></template></t-input
          >
        </t-form-item>
        <t-form-item
          label="场地购买须知"
          name="purchaseInstructions"
        >
          <t-textarea
            v-model="formData.purchaseInstructions"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-textarea>
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

import { save } from '@/api/user/changdeguanli';
// import { useRenewDataStore } from '@/store/renewData';

// const store = useRenewDataStore();

const emit = defineEmits(['add']);

// const select = ref('');
const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  storeId: [{ required: true, message: '门店id必填' }],
  venueName: [{ required: true, message: '门店名称必填' }],
  venueType: [{ required: true, message: '门店类型必选' }],
  amHalfPrice: [{ required: true, message: '必填' }],
  pmHalfPrice: [{ required: true, message: '必填' }],
  amAllPrice: [{ required: true, message: '必填' }],
  pmAllPrice: [{ required: true, message: '必填' }],
  // createBy: [{ required: true, message: '创建必填' }],
  price: [{ required: true, message: '价格必填' }],
};
// nanoid配置 纯数字，五位
// const nanoid = customAlphabet('1234567890', 5);
// 在此定义表单数据
const formData = reactive({
  // id: null,
  storeId: '9376',
  venueName: '',
  venueType: '',
  createBy: '',
  amHalfPrice: null,
  pmHalfPrice: null,
  amAllPrice: null,
  pmAllPrice: null,
  price: null,
  specialValue: '',
  purchaseInstructions: '',
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
      // formData.storeId = nanoid();
      formData.storeId = '9376';

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
