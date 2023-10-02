<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handlerEdit"
        >查看</t-link
      >
    </t-space>
    <t-dialog
      v-model:visible="visible"
      attach="body"
      header="查看图片信息"
      body="保存中，请稍后"
      :confirm-btn="{
        content: '修改',
        theme: 'primary',
        loading,
      }"
      :on-confirm="editImg"
      :on-close="close"
    >
      <t-space
        :key="loadingCount"
        direction="vertical"
      >
        <!-- <t-space
          :break-line="true"
          :style="{ height: '240px', 'overflow-y': 'scroll' }"
        >
          <t-image
            v-for="item in list2"
            :key="item"
            :src="`list[${item}].img`"
            :style="{ width: '230px', height: '120px' }"
            :lazy="true"
          />
        </t-space> -->
        <t-image
          :src="list[0].img"
          :style="{ width: '120px', height: '120px' }"
        /><t-image
          :src="list[1].img"
          :style="{ width: '120px', height: '120px' }"
        /><t-image
          :src="list[2].img"
          :style="{ width: '120px', height: '120px' }"
        /><t-image
          :src="list[3].img"
          :style="{ width: '120px', height: '120px' }"
        />
      </t-space>
      <t-form
        :ref="form"
        :data="formData"
        :colon="true"
        @submit="editImg"
      >
        <t-form-item> <div style="height: 20px"></div></t-form-item>

        <t-form-item
          label="要替换的图片"
          name="formData.id"
        >
          <t-radio-group v-model="formData.id">
            <t-radio :value="0">第一张</t-radio>
            <t-radio :value="1">第二张</t-radio>
            <t-radio :value="2">第三张</t-radio>
            <t-radio :value="3">第四张</t-radio>
          </t-radio-group></t-form-item
        >

        <t-form-item
          label="门店图片"
          name="storeImages"
        >
          <!-- action="http://139.9.38.185:8887/v3/api-docs/user/common/upload" -->
          <t-upload
            ref="uploadRef"
            v-model="file"
            :request-method="requestMethod"
            placeholder="选择要替换的图片"
            :on-fail="handleFail"
          ></t-upload>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script lang="tsx" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { page6, update6 } from '@/api/user/mendiantupianjiekou';
import { useRenewDataStore } from '@/store/renewData';

const emit = defineEmits(['show']);
const store = useRenewDataStore();

const file = ref([]);

const form = ref(null);
const visible = ref(false); // 是否显示
const loading = ref(false); // 加载
const loadingCount = ref(0);
const list = reactive([{ img: '' }, { img: '' }, { img: '' }, { img: '' }]);
// 在此定义表单数据
const formData = reactive({
  id: null,
});
const ImageParams = reactive({ id: null, storeImage: '' });

const close = () => {
  console.error('===close');
  visible.value = false;
};

// 外部的编辑按钮
const handlerEdit = async () => {
  try {
    visible.value = true;
    // console.log('list.value', list.value);

    const res = await page6({ entity: null, searchVo: null, page: { pageNumber: 1, pageSize: 10 } }); // 使用分页查询用于获得当前的数据
    const data = res.result.records;
    store.imgNum = data.length; // 校正
    for (let index = 0; index < 4; index++) {
      list[index].img = data[index].storeImage;
    }

    // 以下操作用于更新数据
  } catch (error) {
    console.log(error);
  }
};
// // 确定编辑
const editImg = async () => {
  try {
    const res = await update6(ImageParams);
    console.log('編輯返回', res);
    emit('show', 'emit传来喜报:组件通信成功', res);
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
    ImageParams.id = formData.id;
    // ImageParams.imageId = nanoid();
    // console.log(ImageParams.storeImage);
    // update6(ImageParams);

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
</script>
