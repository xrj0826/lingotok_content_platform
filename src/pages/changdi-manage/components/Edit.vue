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
          label="修改者"
          name="updateBy"
        >
          <t-input
            v-model="formData.updateBy"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
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
        <t-form-item
          label="半场价格"
          name="halfPrice"
        >
          <t-input
            v-model="formData.halfPrice"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="全场价格"
          name="allPrice"
        >
          <t-input
            v-model="formData.allPrice"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="普通场价格"
          name="price"
        >
          <t-input
            v-model="formData.price"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
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
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };

// 在此定义表单数据
const formData = reactive({
  id: null,
  storeId: '9376',
  venueName: '',
  updateBy: '',
  // updateTime: '',
  halfPrice: null,
  allPrice: null,
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
    formData.venueName = data.venueName;
    formData.updateBy = data.updateBy;
    formData.halfPrice = data.halfPrice;
    formData.allPrice = data.allPrice;
    formData.price = data.price;
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
