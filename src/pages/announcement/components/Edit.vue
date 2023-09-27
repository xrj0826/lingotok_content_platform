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
      header="修改公告信息"
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
          label="通知标题"
          name="noticeTitle"
        >
          <t-input
            v-model="formData.noticeTitle"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="通知人"
          name="noticePerson"
        >
          <t-input
            v-model="formData.noticePerson"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="修改人"
          name="updateBy"
        >
          <t-input
            v-model="formData.updateBy"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="通知内容"
          name="noticeContent"
        >
          <t-textarea
            v-model="formData.noticeContent"
            placeholder="填写你要展示的内容吧"
            clearable
          />
        </t-form-item> </t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page4, update4 } from '@/api/user/xiaochengxugonggao';

const props = defineProps({ editId: Number }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false); // 加载
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };

// 在此定义表单数据
const formData = reactive({
  id: null,
  storeId: '',
  updateBy: '',
  noticeTitle: '',
  noticeContent: '',
  noticePerson: '',
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
    // 以下操作用于更新数据
    formData.id = data.id;
    formData.storeId = data.storeId;
    formData.noticeTitle = data.noticeTitle;
    formData.noticeContent = data.noticeContent;
    formData.noticePerson = data.noticePerson;
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

const onReset = () => {
  MessagePlugin.success('重置成功');
};

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
