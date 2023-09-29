<template slot-scope="scope">
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handlerEdit"
        >编辑</t-link
      >
    </t-space>
    <t-radio-group
      :default-value="radio"
      class="radio-group-demo"
      @change="groupChangeFn"
    >
      <t-radio
        name="radio"
        value="2"
        label="单选"
      />
    </t-radio-group>
    <t-dialog
      v-model:visible="visible"
      header="修改场地信息"
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
          label="订单价格"
          name="orderPrice"
        >
          <t-input
            v-model="formData.orderPrice"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="预约开始时间"
          name="orderSt"
        >
          <t-date-picker
            v-model="formData.orderDate"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item
          label="预约结束时间"
          name="orderEd"
        >
          <t-date-picker
            v-model="formData.orderDate"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>

        <t-form-item
          label="删除标志"
          name="deleteFlag"
        >
          <t-radio-group
            v-model="formData.deleteFlag"
            :default-value="formData.deleteFlag"
          >
            <t-radio :value="true">删除</t-radio>
            <t-radio :value="false">恢复为未删除</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item
          v-for="(item, index) in orderState"
          :key="index"
          label="订单状态"
          name="orderState"
        >
          <t-radio-group
            v-model="formData.deleteFlag"
            :default-value="formData.deleteFlag"
          >
            <t-radio :value="true">使用中</t-radio>
            <t-radio :value="false">待使用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item
          label="订单价格"
          name="orderPrice"
        >
          <t-input
            v-model="formData.orderPrice"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="订单类型（枚举）"
          name="orderType"
        >
          <t-input
            v-model="formData.orderType"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="支付方式"
          name="paymentMethods"
        >
          <t-input
            v-model="formData.paymentMethods"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="分享次数"
          name="share"
        >
          <t-input
            v-model="formData.share"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="手机号码"
          name="phoneNumber"
        >
          <t-input
            v-model="formData.phoneNumber"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="用户进场时间"
          name="startTime"
        >
          <t-date-picker
            v-model="formData.startTime"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item
          label="用户离开时间"
          name="endTime"
        >
          <t-date-picker
            v-model="formData.endTime"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item
          label="预约日期"
          name="orderDate"
        >
          <t-date-picker
            v-model="formData.orderDate"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item> </t-form
    ></t-dialog>
  </div>
</template>

<script lang="ts" setup>
// 订单状态
const orderState = [
  { name: 'WAITING_TO_USE', label: '待使用' },
  { name: 'IN_USE', label: '使用中' },
  { name: 'USED', label: '已使用' },
  { name: 'EXPIRED', label: '已失效' },
  { name: 'REFUNDED', label: '待评价' },
  { name: 'complete', label: '退款' },
];

import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page4, update4 } from '@/api/user/dingdanguanlijiekou';

const props = defineProps({ editId: Number }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };
const radio = ref('3');
const groupChangeFn = (value: any, context: { e: Event }) => {
  console.log(value, context);
};
// 在此定义表单数据
const formData = reactive({
  id: null,
  storeId: '9376',
  orderPrice: null,
  orderDate: '',
  orderSt: '',
  orderEd: '',
  orderState: '',
  paymentMethods: '',
  orderType: '',
  share: null,
  phoneNumber: '',
  startTime: '',
  endTime: '',
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
    const res = await page4({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // for (const key in formData) {
    //   if (Object.prototype.hasOwnProperty.call(formData, key)) {
    //     formData[key] = data[formData[key]];
    //   }
    // }
    // 以下操作用于更新数据
    formData.id = data.id;
    formData.deleteFlag = data.deleteFlag;
    formData.storeId = data.storeId;
    formData.orderPrice = data.orderPrice;
    formData.orderDate = data.orderDate;
    formData.orderSt = data.orderSt;
    formData.orderEd = data.orderEd;
    formData.orderState = data.orderState;
    formData.paymentMethods = data.paymentMethods;
    formData.share = data.share;
    formData.startTime = data.startTime;
    formData.endTime = data.endTime;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  try {
    const res = await update4(formData);
    console.log('編輯返回', res);
    emit('edit', 'emit传来喜报:组件通信成功', res);

    loading.value = true;
    // 加载一下
    const timer = setTimeout(() => {
      loading.value = false;
      visible.value = false;
      clearTimeout(timer);
    }, 200);
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
