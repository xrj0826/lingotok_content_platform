<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handleAdd"
        >修改区间价格</t-link
      >
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
        <t-form-item
          label="生效日期"
          name="orderSt"
          :disable-date="[setOrderSt.values]"
          ><t-date-picker
            v-model="formData.orderSt"
            enable-time-picker
            allow-input
            clearable
          /> </t-form-item
        ><t-form-item
          label="结束日期"
          name="orderEd"
        >
          <t-date-picker
            v-model="formData.orderEd"
            :disable-date="[setOrderEd.values]"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item
          label="价格"
          name="customRateValue"
        >
          <t-input
            v-model="formData.customRateValue"
            theme="normal"
            align="right"
            style="width: 89px"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
      </t-form></t-dialog
    >
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save } from '@/api/user/changdeguanli';

const emit = defineEmits(['add']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  storeId: [{ required: true, message: '门店id必填' }],
};

// 在此定义表单数据
const formData = reactive({
  // id: null,
  orderSt: '',
  orderEd: '',
  customRateValue: '',
});
const setOrderSt = ref([]);
const setOrderEd = ref([]);

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
    // 记录添加值
    setOrderSt.value.push(formData.orderSt);
    setOrderEd.value.push(formData.orderEd);
    console.log('开始时间数组', setOrderSt.value);
    console.log('结束时间数组', setOrderEd.value);

    // 一系列的转化
    const specialValue = {
      customRateTable: [
        { orderSt: formData.orderSt, orderEd: formData.orderEd, customRateValue: formData.customRateValue },
      ],
    };
    const jsonString = JSON.stringify({ specialValue });
    const formattedJsonString = `"specialValue": ${JSON.stringify(jsonString)}`;
    const newFormData = reactive({ specialValue: formattedJsonString });
    console.log('看看你得', newFormData);

    const res = await save(newFormData);
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

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
