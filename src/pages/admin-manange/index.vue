<!-- 客服管理 -->
<template>
  <div>
    <t-card>
      <t-space style="margin: 0 20px 20px 0">
        <add @add="AddFinsh"></add>

        <t-button
          theme="danger"
          @click="handleMoreDelete"
        >
          批量删除
        </t-button>
        <t-select-input
          placeholder="请输入任意关键词"
          allow-input
          clearable
          style="width: 300px"
          @input-change="onInputChange"
        >
          <template #suffixIcon><search-icon /></template>
        </t-select-input>
      </t-space>
      <t-table
        :row-key="index"
        :data="data"
        :columns="columns"
        table-layout="fixed"
        :bordered="true"
        size="small"
        :pagination="pagination"
        cell-empty-content="-"
        resizable
        :loading="isLoading"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeys"
        @row-click="handleRowClick"
        @select-change="onSelectChange"
        @change="onChange"
      >
        <!-- 自定义表头，title值为插槽名称  -->
        <template #title-slot-name>
          <div style="display: flex; justify-content: center"><UserCircleIcon style="margin-right: 8px" />申请人</div>
        </template>
      </t-table></t-card
    >
  </div>
</template>

<script lang="tsx">
export default {
  name: 'AdminManager',
};
</script>
<script setup lang="tsx">
import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { delAllByIds, page7 } from '@/api/user/guanliyuan';
import { useRenewDataStore } from '@/store/renewData';

import { columns } from './columnData';
import Add from './components/Add.vue';

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

const index = ref();
const data = ref([]);
const isLoading = ref(false);
const store = useRenewDataStore();

// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page7({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
const selectedRowKeys = ref([]);

const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delAllByIds({ ids });
      console.log('批量删除后', res);
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
      MessagePlugin.success('删除成功');
    }
  } catch (error) {
    console.log(error);
  }
};
// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
  console.log(value, params);
};

const handleRowClick = (e) => {
  console.log(e);
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info, context);
};
// 搜索框
const onInputChange = (keyword) => {
  console.log(keyword);
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

const AddFinsh = (newData) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
};
</script>

<style lang="less" scoped></style>
