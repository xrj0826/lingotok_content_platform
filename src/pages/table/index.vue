<template>
  <div>
    <t-space direction="vertical">
      <!-- 按钮操作区域 -->
      <t-radio-group v-model="size" variant="default-filled">
        <t-radio-button value="small">小尺寸</t-radio-button>
        <t-radio-button value="medium">中尺寸</t-radio-button>
        <t-radio-button value="large">大尺寸</t-radio-button>
      </t-radio-group>

      <t-space>
        <t-checkbox v-model="stripe"> 显示斑马纹 </t-checkbox>
        <t-checkbox v-model="bordered"> 显示表格边框 </t-checkbox>
        <t-checkbox v-model="hover"> 显示悬浮效果 </t-checkbox>
        <t-checkbox v-model="tableLayout"> 宽度自适应 </t-checkbox>
        <t-checkbox v-model="showHeader"> 显示表头 </t-checkbox>
      </t-space>

      <!-- 当数据为空需要占位时，会显示 cellEmptyContent -->
      <t-table
        row-key="index"
        :data="data"
        :columns="columns"
        :stripe="stripe"
        :bordered="bordered"
        :hover="hover"
        :table-layout="tableLayout ? 'auto' : 'fixed'"
        :size="size"
        :pagination="pagination"
        :show-header="showHeader"
        cell-empty-content="-"
        resizable
        @row-click="handleRowClick"
      >
      </t-table>
    </t-space>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'TableTemplate',
};
</script>
<script setup lang="tsx">
import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon } from 'tdesign-icons-vue-next';
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

const stripe = ref(true);
const bordered = ref(true);
const hover = ref(false);
const tableLayout = ref(false);
const size: Ref<SizeEnum> = ref('medium');
const showHeader = ref(true);

const columns: PrimaryTableCol[] = [
  { colKey: 'applicant', title: '申请人' },
  {
    colKey: 'status',
    title: '申请状态',
    cell: (h, { row }) => {
      return (
        <t-tag shape="round" theme={statusNameListMap[row.status].theme} variant="light-outline">
          {statusNameListMap[row.status].icon}
          {statusNameListMap[row.status].label}
        </t-tag>
      );
    },
  },
  { colKey: 'channel', title: '签署方式' },
  { colKey: 'detail.email', title: '邮箱地址', ellipsis: true, cell: undefined },
  { colKey: 'createTime', title: '申请时间' },
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
