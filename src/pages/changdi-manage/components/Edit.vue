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
        label-width="280px"
        label-align="left"
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
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

        <!-- <t-form-item
          label="修改者"
          name="updateBy"
        >
          <t-input
            v-model="formData.updateBy"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> -->
        <!-- 
        <t-form-item
          label="修改时间"
          name="updateTime"
        > -->
        <!-- <t-input
            v-model="formData.updateTime"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input> -->
        <!-- </t-form-item> -->

        <!-- <t-form-item
          v-if="formData.venueType === '0'"
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
          v-if="formData.venueType === '0'"
          label="18:00-22:00篮球场半场价格"
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
        </t-form-item> -->
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
          label="18:00-22:00全场价格"
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
        <!-- <t-form-item
          label="篮球半场关联篮球全场id"
          name="relevancyId"
        >
          <t-input
            v-model="formData.relevancyId"
            placeholder="请输入"
            style="width: 100px"
            @enter="onEnter"
          >
          </t-input>
        </t-form-item> -->
        <!-- <t-form-item
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
        </t-form-item> -->
        <t-form-item
          label="场地购买须知"
          name="purchaseInstructions"
        >
          <t-textarea
            v-model="formData.purchaseInstructions"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-textarea> </t-form-item></t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page, update } from '@/api/user/changdeguanli';

const props = defineProps({ editId: Number }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {
  venueName: [
    { required: true, message: '门店名称必填' },
    { max: 7, message: '门店名称超过限制长度,小程序将会显示异常', type: 'error', trigger: 'blur' },
  ],
};

// 在此定义表单数据
const formData = reactive({
  id: null,
  storeId: '9376',
  venueName: '',
  venueType: '',
  updateBy: '',
  // updateTime: '',
  amHalfPrice: null,
  pmHalfPrice: null,
  amAllPrice: null,
  pmAllPrice: null,
  relevancyId: null,
  price: null,
  purchaseInstructions: '',
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
    const res = await page({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // for (const key in formData) {
    //   if (Object.prototype.hasOwnProperty.call(formData, key)) {
    //     formData[key] = data[formData[key]];
    //   }
    // }
    // 以下操作用于更新数据
    formData.id = data.id;
    formData.storeId = data.storeId;
    formData.relevancyId = data.relevancyId;
    formData.venueName = data.venueName;
    formData.venueType = data.venueType;
    formData.updateBy = data.updateBy;
    formData.amHalfPrice = data.amHalfPrice;
    formData.pmHalfPrice = data.pmHalfPrice;
    formData.amAllPrice = data.amAllPrice;
    formData.pmAllPrice = data.pmAllPrice;
    // formData.price = data.price;
    formData.purchaseInstructions = data.purchaseInstructions;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  try {
    const res = await update(formData);
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

// const onSubmit = ({ validateResult, firstError }) => {
//   if (validateResult === true) {
//     MessagePlugin.success('提交成功');
//   } else {
//     console.log('Validate Errors: ', fitrstError, validateResult);
//     MessagePlugin.warning(firstError);
//   }
// };

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
