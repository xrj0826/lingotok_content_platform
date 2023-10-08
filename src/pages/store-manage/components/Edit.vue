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
      header="修改门店信息"
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
          ><t-time-picker
            v-model="formData.openingTime"
            allow-input
            clearable
          /> </t-form-item
        ><t-form-item
          label="关店时间"
          name="closingTime"
        >
          <t-time-picker
            v-model="formData.closingTime"
            allow-input
            clearable
          />
        </t-form-item>
        <t-form-item
          label="起订时间/分"
          name="leadTime"
        >
          <t-input
            v-model="formData.leadTime"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-input>
        </t-form-item>
        <!-- <t-form-item
          label="门店图片"
          name="storeImages"
        > -->
        <!-- action="/test/user/common/upload" -->
        <!-- 
          <t-upload
            ref="uploadRef"
            v-model="file"
            theme="image"
            tips="单张图片文件上传"
            accept="image/*"
            :auto-upload="false"
            :upload-all-files-in-one-request="false"
            :locale="{
              triggerUploadText: {
                image: '请选择图片',
              },
            }"
            @fail="handleFail"
          >
          </t-upload>
          <t-button
            variant="base"
            theme="default"
            size="small"
            style="height: 22px"
            @click="uploadFiles"
          >
            点击上传
          </t-button> -->
        <!-- <t-upload
            ref="uploadRef"
            v-model="file"
            :request-method="requestMethod"
            placeholder="自定义上传方法需要返回成功或失败信息"
            :on-fail="handleFail"
          ></t-upload>
        </t-form-item> -->
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
          ></t-textarea>
        </t-form-item>
        <t-form-item
          label="门店公告"
          name="announcement"
        >
          <t-textarea
            v-model="formData.announcement"
            placeholder="请输入内容"
            @enter="onEnter"
          ></t-textarea> </t-form-item></t-form
    ></t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page2, update2 } from '@/api/user/mendianguanlijiekou';
// import { upload } from '@/api/user/wenjianshangchuanjiekou';

const props = defineProps({ editId: String }); // 为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit']);

const visible = ref(false); // 是否显示
const loading = ref(false);
const FORM_RULES = { name: [{ required: true, message: '姓名必填' }] };
const file = ref([]);
const uploadRef = ref();

// 在此定义表单数据
const formData = reactive({
  id: null,
  storeId: '9376',
  storeName: '',
  address: '',
  venueIntroduction: '',
  openingTime: '',
  closingTime: '',
  storeImages: '',
  serviceHotline: '',
  advanceDays: '',
  leadTime: null,
  announcement: '',
  scheduledNotice: '',
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
    const res = await page2({ entity: { id: props.editId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records
    // for (const key in formData) {
    //   if (Object.prototype.hasOwnProperty.call(formData, key)) {
    //     formData[key] = data[formData[key]];
    //   }
    // }
    // 以下操作用于更新数据
    formData.id = data.id;
    formData.storeName = data.storeName;
    formData.address = data.address;
    formData.venueIntroduction = data.venueIntroduction;
    formData.openingTime = data.openingTime;
    formData.closingTime = data.closingTime;
    formData.storeImages = data.storeImages;
    formData.serviceHotline = data.serviceHotline;
    formData.announcement = data.announcement;

    formData.advanceDays = data.advanceDays;
    formData.leadTime = data.leadTime;
    formData.scheduledNotice = data.scheduledNotice;
  } catch (error) {
    console.log(error);
  }
};
// 确定编辑
const edit = async () => {
  try {
    const res = await update2(formData);
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
// const uploadFiles = async () => {
//   try {
//     const res = upload(uploadRef.value);
//     console.log(res);
//   } catch (error) {
//     MessagePlugin.error(`文件 ${file.value} 上传失败`);
//   }
// };

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
    tempSrc.value = base64String; // 暂存src，用于储存原始图片
    // console.log(base64String);
    const storeImages = { images: [base64String] };
    const toJsonString = JSON.stringify({ storeImages });
    const formattedJsonString = `"storeImages": ${JSON.stringify(toJsonString)}`;
    formData.storeImages = formattedJsonString;
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
