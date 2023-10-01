<!-- 客服管理 -->
<template>
  <div>
    <!-- <Drawer></Drawer> -->
    <t-card>
      <t-space direction="vertical">
        <t-table
          :row-key="rowKey"
          :data="data"
          :columns="columns"
          :stripe="true"
          table-layout="fixed"
          :bordered="true"
          size="medium"
          :pagination="pagination"
          cell-empty-content="-"
          resizable
          @row-click="handleRowClick"
        >
          <template #op="">
            <t-space>
              <t-link
                theme="danger"
                @click="handlerDelete"
                >删除</t-link
              >
              <!-- <Drawer :edit="editRow" :editId="index"></Drawer> -->
            </t-space>
          </template>
        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'CustomerManage',
};
</script>
<script setup lang="tsx">
import { columns } from './columnData';
import { useSomeFeature } from './constants';
// import Drawer from '../customer-service/component/Drawer.vue'

const { data, total } = useSomeFeature();

const rowKey = 'index';

const handleRowClick = (e) => {
  console.log(e);
  console.log(data);

  // console.log(data);
};

const handlerDelete = (e) => {
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
