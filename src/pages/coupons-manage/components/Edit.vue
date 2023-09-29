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
      header="修改优惠卷信息"
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
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page5, update5 } from '@/api/user/youhuiquanguanlijiekou';

const props = defineProps({ editId: Number }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };

// 在此定义表单数据
const formData = reactive({
  // id: '',
  discountValue: '',
  discountType: '',
  days: null, // 优惠天数
  usageLimit: '', // 使用次数限制
  numberInvitees: null, // 邀请人数
  overlay: null,
  isActive: true, // 是否有效
  startDate: '',
  endDate: '',
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
    const res = await page5({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // for (const key in formData) {
    //   if (Object.prototype.hasOwnProperty.call(formData, key)) {
    //     formData[key] = data[formData[key]];
    //   }
    // }
    // 以下操作用于更新数据
    formData.discountValue = data.discountValue;
    formData.days = data.days;
    formData.startDate = data.startDate;
    formData.endDate = data.endDate;
    formData.discountType = data.discountType;
    formData.discountValue = data.discountValue;
    formData.usageLimit = data.usageLimit;
    formData.numberInvitees = data.numberInvitees;
    formData.overlay = data.overlay;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  try {
    const res = await update5(formData);
    console.log('編輯返回', res);
    emit('edit', 'emit传来喜报:组件通信成功', res);
    loading.value = true;
    // 加载一下
    const timer = setTimeout(() => {
      loading.value = false;
      visible.value = false;
      clearTimeout(timer);
    }, 150);
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
<style lang="less" scoped></style>
