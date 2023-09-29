<!-- eslint-disable prettier/prettier -->
<!-- 订单管理 -->
<template>
  <div>
    <t-space>
      <add @add="AddFinsh"></add>
      <t-button
        theme="danger"
        @click="handleMoreDelete"
      >
        批量删除
      </t-button>
    </t-space>
    <t-space>
    <t-checkbox style="margin-left: 100px;;">未选中项</t-checkbox>
    <t-checkbox>未选悬停项</t-checkbox>
    <t-checkbox :default-checked="true"> 选中项 </t-checkbox>
    <t-checkbox disabled> 未选禁用项 </t-checkbox>
    <t-checkbox disabled :default-checked="true"> 选中禁用项 </t-checkbox>
  </t-space>
      <t-space>
        </t-space>
      <t-space direction="vertical">
        <t-card> <t-button theme="primary">
          <template #icon><add-icon /></template>
          订单导出
        </t-button>
        <t-select-input
        placeholder="请输入任意关键词"
        allow-input
        clearable
        style="width: 500px ;margin-left:100px;"  @input-change="onInputChange"
>
        <template #suffixIcon><search-icon /></template>
      </t-select-input></t-card>
        <t-table
          :row-key="index"
          :data="data"
          :columns="columns"
          table-layout="fixed"
          :bordered="true"
          size="large"
          :pagination="pagination"
          cell-empty-content="-"
          :selected-row-keys="selectedRowKeys"

          onmouseover="showTooltip(this);"
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          width: 1200px;
          "
          @select-change="onSelectChange">


        </t-table>
      </t-space>

    </div>
</template>

<script lang="tsx">
export default {
  name: 'OrderManage',
};
</script>
<script setup lang="tsx">
import { onMounted, reactive, ref } from 'vue';

import { delete9, page4 } from '@/api/user/dingdanguanlijiekou';

import { columns } from './newFile';

const index = ref();
const data = ref([]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectedRowKeys = ref([]);

const AddFinsh = (newData: any) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
};
const onInputChange = (keyword: any) => {
  console.log(keyword);
};

// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
  console.log(value, params);
};
const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    const res = await delete9({ ids });
    console.log('批量删除后', res);
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    });
  } catch (error) {
    console.log(error);
  }
};
// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo: { current: number; pageSize: number }) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    queryData({
      // 分页改变时更新数据
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    });
    console.log('pagination.onChange', pageInfo);
  },
});
const queryData = async (
  paginationInfo?: { pageNumber: number; pageSize: number },
  searchVo?: undefined,
  entityInfo?: undefined,
) => {
  try {
    console.log('请求', entityInfo, paginationInfo);

    const res = await page4({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);
    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
};
</script>

<style lang="less" scoped></style>
