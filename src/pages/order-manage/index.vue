<!-- 订单管理 -->
<template>
  <div>
    <t-card>
      <t-space>
        <t-button theme="primary">
          <template #icon><add-icon /></template>
          订单导出
        </t-button></t-space>
      <t-space direction="vertical">
        <t-table row-key="index" :data="data" :columns="columns" table-layout="fixed" :bordered="true" size="large"
          :pagination="pagination" cell-empty-content="-" resizable @row-click="handleRowClick">
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
import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon, AddIcon } from 'tdesign-icons-vue-next';
import { SizeEnum } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { Ref, ref } from 'vue';

import { useSomeFeature } from './constants';

const { data, total } = useSomeFeature();

const statusNameListMap = {
  0: { label: '审批通过', theme: 'success', icon: <CheckCircleFilledIcon /> },
  1: { label: '审批失败', theme: 'danger', icon: <CloseCircleFilledIcon /> },
  2: { label: '审批过期', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
};


const columns: PrimaryTableCol[] = [
  { colKey: 'userName', title: '用户名' },
  {
    colKey: 'userInfo',
    title: '用户详细信息',
  },
  {
    colKey: 'userStatus', title: '用户会员状态', cell: (h, { row }) => {
      return (
        <t-tag shape="round" theme={statusNameListMap[row.status].theme} variant="light-outline">
          {statusNameListMap[row.status].icon}
          {statusNameListMap[row.status].label}
        </t-tag>
      );
    },
  },
  { colKey: 'userDefalut', title: '用户禁用', ellipsis: true, cell: undefined },
  { colKey: 'operation', title: '操作' },
];
interface A {
  name?: string;
}
const B: A = {};
const ary: A[] = [{ name: '123' }, {}];
console.log(ary);
console.log(B);

const handleRowClick = (e) => {
  console.log(e);
};

const pagination = {
  defaultCurrent: 1,
  defaultPageSize: 5,
  total,
};
</script>

<style lang="less" scoped></style>
