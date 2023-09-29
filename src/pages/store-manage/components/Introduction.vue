<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handlerEdit"
        >查看详情</t-link
      >
    </t-space>
    <t-dialog
      v-model:visible="visible"
      header="场馆介绍"
      :confirm-btn="{
        content: '确认',
        theme: 'primary',
      }"
      :on-confirm="close"
      :on-close="close"
    >
      <t-card
        :bordered="false"
        :style="{ width: '400px' }"
      >
        {{ props.data }}
      </t-card>
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({ data: String }); // 为什么这里类型只能用大写，不然会警告?

const visible = ref(false); // 是否显示

const close = () => {
  console.error('===close');
  visible.value = false;
};

// 外部的编辑按钮
const handlerEdit = async () => {
  try {
    visible.value = true;

    // 以下操作用于更新数据
  } catch (error) {
    console.log(error);
  }
};
</script>
