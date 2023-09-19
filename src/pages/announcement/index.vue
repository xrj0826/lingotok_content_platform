<!-- 订单管理 -->
<template>
  <div>
    <t-card>
      <t-space>
        <t-button theme="primary">
          <template #icon><add-icon /></template>
          新建公告
        </t-button></t-space>
      <t-space direction="vertical">
        <t-table row-key="index" :data="data" :columns="columns" :stripe="false" table-layout="fixed" :bordered="true"
          size="large" :pagination="pagination" cell-empty-content="-" resizable @row-click="handleRowClick">
        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'Announcement',
};
</script>
<script setup lang="tsx">
import { AddIcon } from 'tdesign-icons-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { Ref, ref } from 'vue';

import { useSomeFeature } from './constants';
import Dialog from "./components/Dialog.vue";

const { data, total } = useSomeFeature();


const columns: PrimaryTableCol[] = [
  { colKey: 'announcementId', title: '公告编号' },
  {
    colKey: 'img',
    title: '配图',
  },
  {
    colKey: 'detail', title: '公告内容', cell: (h, { row }) => {
      return (
        <t-link theme="primary">详情</t-link>
      );
    },
  },
  { colKey: 'isTop', title: '是否置顶', ellipsis: true, cell: undefined },
  {
    colKey: 'operation', title: '操作', cell: (h, { row }) => {
      return (
        <t-space>
          <t-link theme="danger" onClick={handlerDelete}>删除</t-link>
          <Dialog edit={editRow} editId={row.id}></Dialog>
        </t-space>
      );
    },
  },
];

const pagination = {
  defaultCurrent: 1,
  defaultPageSize: 5,
  total,
};
const handleRowClick = (e) => {
  console.log(e);
};
const handlerDelete = (e) => {
  console.log(e);
};
//发送编辑行后执行回调
const editRow = (newData) => {
  alert("编辑完成")
  // alert(newData)
}
</script>

<style lang="less" scoped></style>
