<!-- 场地管理 -->
<template>
  <div>
    <t-card>
      <t-space style="margin: 0 20px 20px 0">
        <add @add="AddFinsh"></add>
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDelete"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
      </t-space>
      <!-- <t-select-input
        placeholder="请输入任意关键词"
        allow-input
        clearable
        style="width: 300px"
        @input-change="onInputChange"
      >
        <template #suffixIcon><search-icon /></template>
      </t-select-input> -->

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
        @filter-change="onFilterChange"
        @change="onChange"
      >
        <!-- select-on-row-click -->

        <!-- 自定义表头，title值为插槽名称  -->
        <template #title-slot-name>
          <div style="display: flex; justify-content: center"><UserCircleIcon style="margin-right: 8px" />申请人</div>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'ChangDiManage',
};
</script>
<script setup lang="tsx">
// import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { deleteUsingDELETE, page } from '@/api/user/changdeguanli';
import { useRenewDataStore } from '@/store/renewData';

import { columns } from './columnData';
import Add from './components/Add.vue';

const querySave = reactive({
  sort: '',
  venueType: '',
  order: null,
});
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
    const res = await page({ entity: entityInfo, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
const selectedRowKeys = ref([]);

// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
  console.log(value, params);
};

const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await deleteUsingDELETE({ ids });
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
const handleRowClick = (e) => {
  console.log(e);
};
// 过滤等发生变化时会出发 change 事件
const onFilterChange = (filterValue, context) => {
  querySave.venueType = filterValue.venueType;
  queryData(
    {
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    },
    // @ts-ignore
    querySave,
  );
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info.sorter, context.trigger);
  if (context.trigger === 'sorter') {
    if (info.sorter === undefined) {
      querySave.sort = '';
      querySave.order = null;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
    } else {
      querySave.sort = info.sorter.sortBy;
      querySave.order = info.sorter.descending;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      });
    }
  }
};
// const onInputChange = (keyword) => {
//   console.log('搜索', keyword);
//   queryData(
//     {
//       pageNumber: pagination.current,
//       pageSize: pagination.pageSize,
//     },
//     {
//       selecte: {
//         additionalProp1: { keyword },
//       },
//     },
//   );
// };

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    queryData(
      {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      },
      null, // @ts-ignore
      querySave,
    ); // 分页数据改变时调用请求函数
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

<style lang="less" scoped>
:deep([class*='t-table-expandable-icon-cell']) .t-icon {
  background-color: transparent;
}
</style>
