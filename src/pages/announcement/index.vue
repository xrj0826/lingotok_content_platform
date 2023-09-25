<!-- 订单管理 -->
<template>
  <div>
    <t-card>
      <t-space> <add @add="AddFinsh"></add> </t-space>

      <t-space direction="vertical">
        <t-table
          row-key="index"
          :data="data"
          :columns="columns"
          :stripe="false"
          table-layout="fixed"
          :loading="isLoading"
          :hover="true"
          :bordered="true"
          size="large"
          :pagination="pagination"
          cell-empty-content="-"
          resizable
          @row-click="handleRowClick"
          @change="onChange"
        >
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
import { onMounted, reactive, ref } from 'vue';

import { page4 } from '@/api/user/xiaochengxugonggao';
import { useRenewDataStore } from '@/store/renewData';

import { columns } from './columnData';
import Add from './components/Add.vue';

const data = ref([]);
const isLoading = ref(false);
const store = useRenewDataStore();

// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
  store.renewData = queryData; // 挂载时，将请求函数给pinia
  store.pagination.current = pagination.current; // 分页数据也一起给
  store.pagination.pageSize = pagination.pageSize;
});
// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page4({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info.sorter, context);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    sort: info.sorter.sortBy,
    order: info.sorter.descending === false ? 'asc' : 'desc',
  });
};
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    }); // 分页数据改变时调用请求函数
    console.log('pagination.onChange', pageInfo);
  },
});

const handleRowClick = (e) => {
  console.log(e);
};
const AddFinsh = (newData) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
};
</script>

<style lang="less" scoped></style>
./columnData
