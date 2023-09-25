<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="look"
        >查看详情</t-link
      ></t-space
    >

    <t-dialog
      v-model:visible="visible"
      header="公告详情"
      draggable
      :on-confirm="() => (visible = false)"
    >
      <t-card
        :title="'标题: ' + detail.noticeTitle"
        :bordered="false"
        :style="{ width: '400px' }"
      >
        {{ '内容:  ' + detail.noticeContent }}
      </t-card>
    </t-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { page4 } from '@/api/user/xiaochengxugonggao';

const props = defineProps({ detailId: String || Number }); // 为什么这里类型只能用大写，不然会警告?
const visible = ref(false);

const detail = reactive({
  noticeTitle: '',
  noticeContent: '',
  noticePerson: '',
});
// 外部的编辑按钮
const look = async () => {
  try {
    visible.value = true;
    console.log(props.detailId);
    const res = await page4({ entity: { id: props.detailId }, searchVo: null, page: null }); // 使用分页查询用于获得当前的数据
    const [data] = res.result.records; // 解构赋值records

    // 以下操作用于更新数据
    detail.noticeTitle = data.noticeTitle;
    detail.noticeContent = data.noticeContent;
    detail.noticePerson = data.noticePerson;
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="less" scoped></style>
