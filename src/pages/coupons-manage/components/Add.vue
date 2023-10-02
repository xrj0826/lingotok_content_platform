<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加优惠卷</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      attach="body"
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
          label="折扣值"
          name="discountValue"
        >
          <t-input
            v-model="formData.discountValue"
            theme="normal"
            align="right"
            style="width: 150px"
            @enter="onEnter"
          >
            <template #label><span>金额：</span></template>
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>

        <t-form-item
          label="折扣类型"
          name="discountType"
        >
          <t-input
            v-model="formData.discountType"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="优惠天数"
          name="days"
        >
          <t-input
            v-model="formData.days"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="使用次数限制"
          name="usageLimit"
        >
          <t-input
            v-model="formData.usageLimit"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="邀请人数"
          name="numberInvitees"
        >
          <t-input
            v-model="formData.numberInvitees"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="是否可叠加"
          name="overlay"
        >
          <t-radio-group v-model="formData.overlay">
            <t-radio :value="0">否</t-radio>
            <t-radio :value="1">是</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item
          label="是否有效"
          name="isActive"
        >
          <t-switch
            v-model="formData.isActive"
            size="large"
          >
            <template #label="slotProps">{{ slotProps.value ? '是' : '否' }}</template>
          </t-switch>
        </t-form-item>
        <t-form-item
          label="生效日期"
          name="startDate"
          ><t-date-picker
            v-model="formData.startDate"
            enable-time-picker
            allow-input
            clearable
          /> </t-form-item
        ><t-form-item
          label="结束日期"
          name="endDate"
        >
          <t-date-picker
            v-model="formData.endDate"
            enable-time-picker
            allow-input
            clearable
          /> </t-form-item></t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { customAlphabet } from 'nanoid';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save7 } from '@/api/user/youhuiquanguanlijiekou';

const emit = defineEmits(['add']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  discountValue: [{ required: true, message: '折扣值必填' }],
  discountType: [{ required: true, message: '折扣值必填' }],
  usageCount: [{ required: true, message: '优惠卷使用次数必填' }],
  startDate: [{ required: true, message: '生效日期必填' }],
  endDate: [{ required: true, message: '结束日期必填' }],
};
// nanoid配置
const nanocode = customAlphabet('1234567890ABCDEF', 9);
const nanoid = customAlphabet('1234567890', 5);

// 在此定义表单数据
const formData = reactive({
  id: null,
  discountValue: null,
  discountType: '',
  days: null, // 优惠天数
  usageLimit: '', // 使用次数限制
  numberInvitees: null, // 邀请人数
  overlay: null,
  isActive: true, // 是否有效（0、1）
  code: null,
  startDate: '',
  endDate: '',
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
    // 第三方库随机生成兑换码
    formData.code = nanocode();
    formData.id = nanoid();
    const res = await save7(formData);
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
