<!-- 订单管理 -->
<template>


  <div>
    <t-card>
      <t-space>
        <t-button theme="primary">
          <template #icon><add-icon /></template>
          订单导出
        </t-button></t-space
      >
      <t-space direction="vertical">
        <t-checkbox v-model="horizontalScrollAffixedBottom" style="margin-left: 32px">滚动条吸底</t-checkbox>
        <t-table row-key="index" :data="data" :columns="columns" table-layout="fixed" :bordered="true" size="large"
          :pagination="pagination" cell-empty-content="-" resizable @row-click="handleRowClick">

        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'OrderManage',
};
</script>
<script setup lang="tsx">
import { PrimaryTableCol, SizeEnum } from 'tdesign-vue-next';
import { Ref, reactive, ref,onMounted } from 'vue';
import {page3} from '@/api/user/dingdanguanlijiekou'
import { columns } from "./newFile";
const data = ref([]);
const total = ref();

// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
});



const horizontalScrollAffixedBottom = ref(false);
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
    queryData({ // 分页改变时更新数据
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
    console.log('pagination.onChange', pageInfo);
  },
});
const editFinish = (newData) => {
  alert('编辑完成');
  alert(newData);
};
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    console.log('请求', entityInfo, paginationInfo);

    const res = await page3({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);
    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
};
</script>

<style lang="less" scoped></style>
