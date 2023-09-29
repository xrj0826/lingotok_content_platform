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
      header="修改储值卡信息"
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
        ><t-form-item
          label="储值卡名称"
          name="cardName"
        >
          <t-input
            v-model="formData.cardName"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="储值卡类型"
          name="cardType"
        >
          <t-radio-group v-model="formData.cardType">
            <t-radio value="储值卡">储值卡</t-radio>
            <t-radio value="月卡">月卡</t-radio>
            <t-radio value="次卡">次卡</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item
          label="生效时间"
          name="days"
        >
          <t-input
            v-model="formData.days"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="生效时间"
          name="days"
        >
          <t-input
            v-model="formData.days"
            theme="normal"
            align="right"
            style="width: 70px"
            @enter="onEnter"
          >
            <template #suffix><span>天</span></template>
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
          />
        </t-form-item> </t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page6, update6 } from '@/api/user/chuzhikaguanli';

const props = defineProps({ editId: Number }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };

// 在此定义表单数据
const formData = reactive({
  id: null,
  cardType: '',
  cardName: '',
  days: null,
  startDate: '',
  endDate: '',
  faceValue: null,
  discountValue: null,
  currentBalance: null,
  bonusAmount: null,
  // openId: '',
  // avatar: '',
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
    const res = await page6({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // for (const key in formData) {
    //   if (Object.prototype.hasOwnProperty.call(formData, key)) {
    //     formData[key] = data[formData[key]];
    //   }
    // }
    // 以下操作用于更新数据
    formData.id = data.id;
    formData.cardType = data.cardType;
    formData.cardName = data.cardName;
    formData.days = data.days;
    formData.startDate = data.startDate;
    formData.endDate = data.endDate;
    formData.faceValue = data.faceValue;
    formData.discountValue = data.discountValue;
    formData.currentBalance = data.currentBalance;
    formData.bonusAmount = data.bonusAmount;
    // formData.openId = data.openId;
    // formData.avatar = data.avatar;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  try {
    const res = await update6(formData);
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
