<template>
  <div>
    <t-space>
      <t-button @click="handleAdd">添加门店</t-button>
    </t-space>
    <t-dialog
      v-model:visible="visible"
      header="添加门店"
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
        @submit="add"
      >
        <t-form-item
          label="门店名称"
          name="storeName"
        >
          <t-input
            v-model="formData.storeName"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="场馆介绍"
          name="venueIntroduction"
        >
          <t-input
            v-model="formData.venueIntroduction"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>

        <t-form-item
          label="门店地址"
          name="address"
        >
          <t-input
            v-model="formData.address"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="开店时间"
          name="openingTime"
          ><t-date-picker
            v-model="formData.openingTime"
            enable-time-picker
            allow-input
            clearable
          /> </t-form-item
        ><t-form-item
          label="关店时间"
          name="closingTime"
        >
          <t-date-picker
            v-model="formData.closingTime"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item
          label="起订时间"
          name="leadTime"
        >
          <t-date-picker
            v-model="formData.leadTime"
            enable-time-picker
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item
          label="门店图片"
          name="storeImages"
        >
          <!-- action="http://139.9.38.185:8887/v3/api-docs/user/common/upload" -->
          <t-upload
            ref="uploadRef"
            v-model="file"
            :request-method="requestMethod"
            placeholder="上传一张图片"
            :on-fail="handleFail"
          ></t-upload>
        </t-form-item>
        <t-form-item
          label="提前预订天数"
          name="advanceDays"
        >
          <t-input
            v-model="formData.advanceDays"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="服务热线"
          name="serviceHotline"
        >
          <t-input
            v-model="formData.serviceHotline"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <t-form-item
          label="订场须知"
          name="scheduledNotice"
        >
          <t-textarea
            v-model="formData.scheduledNotice"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-textarea> </t-form-item
        ><t-form-item :status-icon="false">
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
import { customAlphabet } from 'nanoid';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { save2 } from '@/api/user/mendianguanlijiekou';
import { save6 } from '@/api/user/mendiantupianjiekou';
// import { upload } from '@/api/user/wenjianxiangguanjiekou';
import { useRenewDataStore } from '@/store/renewData';

const emit = defineEmits(['add']);
const form = ref(null);
const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = {};
const file = ref([]);
const store = useRenewDataStore();

// nanoid配置 纯数字，五位
const nanoid = customAlphabet('1234567890', 3);

// 在此定义表单数据
const formData = reactive({
  id: '9376',
  // storeId: '9376',
  deleteFlag: 0,
  storeName: '',
  address: '',
  venueIntroduction: '',
  openingTime: null,
  closingTime: null,
  storeImages: '',
  serviceHotline: '',
  advanceDays: '',
  leadTime: null,
  announcement: null,
  scheduledNotice: '',
});
const ImageParams = reactive({ id: null, storeImage: '' });
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
    if (store.imgNum < 4) {
      // // 第三方库随机生成id

      formData.id = '9377';
      const res = await save2(formData);
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
      // formData.storeImages = tempSrc.value;
    } else {
      console.log('Validate Errors: ');
      MessagePlugin.warning('最多只能添加4个图片!');
    }
  } catch (error) {
    console.log(error);
  }
};
const handleFail = ({ file }) => {
  MessagePlugin.error(`文件 ${file.name} 上传失败`);
};

// file 为等待上传的文件信息，用于提供给上传接口。file.raw 表示原始文件
const requestMethod = async (file) => {
  const reader = new FileReader();
  // 当文件加载完成时触发事件
  reader.onload = (event) => {
    // event.target.result包含了Base64编码的图片数据
    const base64String = event.target.result;
    // tempSrc.value = base64String; // 暂存src，用于储存原始图片
    // console.log(base64String);
    const storeImages = base64String;
    // @ts-ignore
    ImageParams.storeImage = storeImages;
    ImageParams.imageId = store.imgNum;
    // ImageParams.imageId = nanoid();
    // console.log(ImageParams.storeImage);
    if (store.imgNum !== 4) {
      save6(ImageParams);
    } else MessagePlugin.warning('error,最多设置四张图片');

    // const storeImages = { images: [base64String] };
    // const toJsonString = JSON.stringify({ storeImages });
    // const formattedJsonString = `"storeImages": ${JSON.stringify(toJsonString)}`;
    // formData.storeImages = formattedJsonString;
    // formData.storeImages = storeImages;
  };

  // 以DataURL格式读取文件（即Base64格式）
  reader.readAsDataURL(file.raw);
  // save2(formData);
  return new Promise((resolve) => {
    // resolve 参数为关键代码
    resolve({ status: 'success' });
  });
};

// 禁用 Input 组件，按下 Enter 键时，触发 submit 事件
const onEnter = (_, { e }) => {
  e.preventDefault();
};
</script>
