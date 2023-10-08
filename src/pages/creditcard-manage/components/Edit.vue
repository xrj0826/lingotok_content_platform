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
      attach="body"
      header="修改储值卡信息"
      body="保存中，请稍后"
      :confirm-btn="null"
      :cancel-btn="null"
      :on-confirm="close"
    >
      <t-form
        ref="form"
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
        @submit="edit"
      >
        <t-form-item
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
            <t-radio value="STORED_VALUE">储值卡</t-radio>
            <t-radio value="MONTHLY">月卡</t-radio>
            <t-radio value="TICKET">次卡</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item
          label="有效期"
          name="days"
        >
          <t-input
            v-model="formData.days"
            theme="normal"
            align="right"
            style="width: 70px"
            placeholder=""
            @enter="onEnter"
          >
            <template #suffix><span>天</span></template>
          </t-input>
        </t-form-item>
        <!-- <t-form-item
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
        </t-form-item> -->
        <t-form-item
          label="面值"
          name="faceValue"
        >
          <t-input
            v-model="formData.faceValue"
            theme="normal"
            align="right"
            style="width: 120px"
            @enter="onEnter"
          >
            <template #suffix><span>元</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          v-if="formData.cardType === 'STORED_VALUE'"
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
        <t-form-item
          v-if="formData.cardType === 'TICKET'"
          label="次卡次数"
          name="times"
        >
          <t-input
            v-model="formData.times"
            theme="normal"
            align="right"
            style="width: 88px"
            @enter="onEnter"
          >
            <template #suffix><span>次</span></template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="详情简介"
          name="detailedIntroduction"
        >
          <t-textarea
            v-model="formData.detailedIntroduction"
            placeholder="填写你要展示的内容吧"
            clearable
          />
        </t-form-item>
        <t-form-item
          label="使用说明"
          name="usageInstructions"
        >
          <t-textarea
            v-model="formData.usageInstructions"
            placeholder="填写你要展示的内容吧"
            clearable
          />
        </t-form-item>
        <!-- <t-form-item
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
        </t-form-item> -->
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
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page8, update9 } from '@/api/user/guanliyuanguanlichuzhikajiekou';

const props = defineProps({ editId: Number }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  discountValue: [
    { min: 1.0, message: '折扣应在0~1之间', type: 'error', trigger: 'blur' },
    { max: 10.0, message: '折扣应在0~1之间', type: 'error', trigger: 'blur' },
  ],
};

// 在此定义表单数据
const formData = reactive({
  id: null,
  storeId: '9376',
  cardType: '',
  cardName: '',
  days: null,
  faceValue: null,
  discountValue: null,
  // currentBalance: null,
  bonusAmount: null,
  times: null,
  detailedIntroduction: '',
  usageInstructions: '',
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
    const res = await page8({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // for (const key in formData) {
    //   if (Object.prototype.hasOwnProperty.call(formData, key)) {
    //     formData[key] = data[formData[key]];
    //   }
    // }

    // 以下操作用于更新数据
    formData.id = data.id;
    // formData.storeId = data.storeId;
    formData.cardType = data.cardType;
    formData.cardName = data.cardName;
    formData.days = data.days;
    formData.faceValue = data.faceValue;
    if (formData.cardType === 'STORED_VALUE') {
      formData.bonusAmount = data.bonusAmount;
    }
    formData.discountValue = data.discountValue;

    formData.times = data.times;
    formData.detailedIntroduction = data.detailedIntroduction;
    formData.usageInstructions = data.usageInstructions;
    // formData.openId = data.openId;
    // formData.avatar = data.avatar;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async ({ validateResult, _ }) => {
  try {
    if (validateResult === true) {
      if (formData.cardType !== 'STORED_VALUE') {
        formData.bonusAmount = 0;
      }
      if (formData.cardType !== 'TICKET') {
        formData.times = 0;
      }
      const res = await update9(formData);
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
    } else {
      MessagePlugin.warning('请检查填写信息');
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
