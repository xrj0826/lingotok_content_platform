<!-- 订单管理 -->
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

      <t-space direction="vertical">
        <t-table
          :row-key="index"
          :data="data"
          :columns="columns"
          :stripe="false"
          table-layout="fixed"
          :loading="isLoading"
          :hover="true"
          :bordered="false"
          size="large"
          :pagination="pagination"
          cell-empty-content="-"
          resizable
          :selected-row-keys="selectedRowKeys"
          @row-click="handleRowClick"
          @select-change="onSelectChange"
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
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { get2 } from '@/api/user/mendianguanlijiekou';
import { delete11, page5 } from '@/api/user/xiaochengxugonggao';
import { useRenewDataStore } from '@/store/renewData';

import { columns } from './columnData';
import Add from './components/Add.vue';

const index = ref();
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
    const res = await page5({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求

    console.log('数据已送达', res);

    data.value = res.result.records; // 获得表格数据
    console.log('data.value', data.value);
    // 这段代码会安全地检查data.value数组中的每个对象是否具有storeId属性，如果存在，则替换为storeName。
    // for (let i = 0; i < data.value.length; i++) {
    //   if (Object.prototype.hasOwnProperty.call(data.value[i], 'storeId')) {
    //     data.value[i].storeId = (await get2({ id: data.value[i].storeId })).result.storeName;
    //     // console.log(data.value[i].storeId);
    //   }
    // }
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
      const res = await delete11({ ids });
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
