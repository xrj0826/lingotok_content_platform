<!-- 用户管理 -->
<template>
  <div>
    <t-card>
      <t-space direction="vertical">
        <t-table row-key="id" :data="data" :columns="columns" :stripe="true" table-layout="fixed" :bordered="true"
          size="medium" :pagination="pagination" cell-empty-content="-" resizable @row-click="handleRowClick">
        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'UserManage',
};
</script>
<script setup lang="tsx">
import { SizeEnum } from 'tdesign-vue-next';
import { Ref, ref } from 'vue';
import { columns } from './columnData'

import { useSomeFeature } from './constants';

const { data, total } = useSomeFeature();

interface A {
  name?: string;
}
const B: A = {};
const ary: A[] = [{ name: '123' }, {}];
console.log(ary);
console.log(B);

const handleRowClick = (e) => {
  console.log(e);
  // console.log(data);

};



const pagination = {
  defaultCurrent: 1,
  defaultPageSize: 5,
  total,
};
</script>

<style lang="less" scoped></style>
