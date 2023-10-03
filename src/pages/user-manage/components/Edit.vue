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
        :rules="FORM_RULES"
        :data="formData"
        :colon="true"
        @reset="onReset"
      >
        <t-form-item
          label="姓名"
          name="name"
        >
          <t-input
            v-model="formData.name"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="状态"
          name="status"
        >
          <t-radio-group v-model="formData.status">
            <t-radio :value="false">禁用</t-radio>
            <t-radio :value="true">正常</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item
          label="昵称"
          name="nickName"
        >
          <t-input
            v-model="formData.nickName"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="手机号"
          name="phoneNumber"
        >
          <t-input
            v-model="formData.phoneNumber"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="邮件"
          name="email"
        >
          <t-input
            v-model="formData.email"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="性别"
          name="sex"
        >
          <t-input
            v-model="formData.sex"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item> </t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page1, update1 } from '@/api/user/yonghuguanlixiangguanjiekou';

const props = defineProps({ editId: String }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {};

// 在此定义表单数据
const formData = reactive({
  id: null,
  name: '',
  credit: '',
  status: true,
  nickName: '',
  phoneNumber: '',
  email: '',
  sex: null,
  birthday: '',
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
    const res = await page1({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // for (const key in formData) {
    //   if (Object.prototype.hasOwnProperty.call(formData, key)) {
    //     formData[key] = data[formData[key]];
    //   }
    // }
    // 以下操作用于更新数据
    formData.id = data.id;
    formData.name = data.name;
    formData.credit = data.credit;
    formData.status = data.status;
    formData.nickName = data.nickName;
    formData.phoneNumber = data.phoneNumber;
    formData.email = data.email;
    formData.sex = data.sex;
    // formData.birthday = data.birthday;
    // formData.openId = data.openId;
    // formData.avatar = data.avatar;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  try {
    const res = await update1(formData);
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

// const onSubmit = ({ validateResult, firstError }) => {
//   if (validateResult === true) {
//     MessagePlugin.success('提交成功');
//   } else {
//     console.log('Validate Errors: ', firstError, validateResult);
//     MessagePlugin.warning(firstError);
//   }
// };

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
