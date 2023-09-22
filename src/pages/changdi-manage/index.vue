<!-- 客服管理 -->
<template>
  <div>
    <!-- <Drawer></Drawer> -->
    <t-card>
      <t-space direction="vertical">
        <t-table
          :row-key="index"
          :data="data"
          :columns="columns"
          table-layout="fixed"
          :bordered="true"
          size="medium"
          :pagination="pagination"
          cell-empty-content="-"
          resizable
          :selected-row-keys="selectedRowKeys"
          select-on-row-click
          @row-click="handleRowClick"
          @select-change="rehandleSelectChange"
        >
        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'ChangDiManage',
};
</script>
<script setup lang="tsx">
import { onMounted, reactive, ref } from 'vue';

import { page } from '@/api/user/changdeguanli';

import { columns } from './columnData';

// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
});

const index = ref();
const data = ref([]);
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    console.log('请求', entityInfo, paginationInfo);

    const res = await page({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);
    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
};
const selectedRowKeys = ref([]);

const rehandleSelectChange = (value, ctx) => {
  selectedRowKeys.value = value;
  console.log(value, ctx);
};
const handleRowClick = (e) => {
  console.log(e);
};
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    queryData(pageInfo);
    console.log('pagination.onChange', pageInfo);
  },
});
</script>

<style lang="less" scoped></style>
