<!-- 订单管理 -->
<template>
  <div>
    <t-card>
      <t-space>
        <t-button theme="primary">
          <template #icon><add-icon /></template>
          新建公告
        </t-button>
      </t-space>
      <t-space direction="vertical">
        <t-table
          :row-key="index"
          :data="data"
          :columns="columns"
          :stripe="false"
          table-layout="fixed"
          :bordered="true"
          size="large"
          :pagination="pagination"
          cell-empty-content="-"
          resizable
          @row-click="handleRowClick"
        >
        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<script setup lang="tsx">
// eslint-disable-next-line vue/no-export-in-script-setup
import { onMounted, reactive, ref } from 'vue';

import { page2 } from '@/api/user/mendianguanlijiekou';

import { columns } from './newFile';
// const { data, total} = useSomeFeature();
const data = ref([]);
const index = ref();
// const pagination = reactive({
//   current: 1,
//   pageSize: 10,
//   total: 10,
//   showJumper: true,
//   onChange: (pageInfo: { current: number; pageSize: number }) => {
//     pagination.current = pageInfo.current;
//     pagination.pageSize = pageInfo.pageSize;
//     queryData({
//       // 分页改变时更新数据
//       pageNumber: pagination.current,
//       pageSize: pagination.pageSize,
//     });
//     console.log('pagination.onChange', pageInfo);
//   },
// });
// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
});

const handleRowClick = (e) => {
  console.log(e);
};
const handlerDelete = (e) => {
  console.log(e);
};
// 发送编辑行后执行回调
const editFinish = (newData) => {
  alert('编辑完成');
  alert(newData);
};
const queryData = async (paginatio8nInfo?, searchVo?, entityInfo?) => {
  try {
    console.log('请求', entityInfo, paginationInfo);

    const res = await page2({ entity: null, searchVo, page: paginatio8nInfo }); // 在此发送请求
    console.log('数据已送达', res);
    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
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
