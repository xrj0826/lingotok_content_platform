<!-- 订单管理 -->
<template>
  <div>
    <t-space style="margin: 0 20px 20px 0">
      <!-- <add @add="AddFinsh"></add> -->
      <!-- <t-button theme="primary">
          <template #icon><add-icon /></template>
          订单导出
        </t-button> -->
      <t-popconfirm
        content="确认删除吗"
        :on-confirm="handleMoreDelete"
      >
        <t-button theme="danger"> 批量删除 </t-button>
      </t-popconfirm>
    </t-space>
    <t-card>
      <t-table
        :row-key="index"
        :data="data"
        :columns="columns"
        resizable
        table-layout="fixed"
        :bordered="true"
        size="small"
        :pagination="pagination"
        :filter-row="null"
        cell-empty-content="-"
        :selected-row-keys="selectedRowKeys"
        @row-click="handleRowClick"
        @select-change="onSelectChange"
        @filter-change="onFilterChange"
        @change="onChange"
      >
      </t-table>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'OrderManage',
};
</script>
<script setup lang="tsx">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

// import { get, page } from '@/api/user/changdeguanli';
import { delete9, page4 } from '@/api/user/dingdanguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import { columns } from './newFile';

const store = useRenewDataStore();
const index = ref();
const data = ref([]);
const selectedRowKeys = ref([]);

// enum paymentMethod {
//   'WECHAT',
//   'CARD',
// }
// 暂存查询条件
const querySave = reactive({
  orderType: '',
  orderState: '',
  paymentMethods: '',
  sort: 'createTime',
  order: true,
  phoneNumber: '',
});
// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    sort: 'createTime',
    order: 'desc',
  });
  store.renewData = queryData; // 挂载时，将请求函数给pinia
  store.pagination.current = pagination.current; // 分页数据也一起给
  store.pagination.pageSize = pagination.pageSize;
  store.querySave = querySave;
});
// const AddFinsh = (newData: any) => {
//   console.log(newData);
//   queryData({
//     pageNumber: pagination.current,
//     pageSize: pagination.pageSize,
//   });
// };

// 过滤等发生变化时会出发 change 事件
const onFilterChange = (filterValue, context) => {
  // console.log('onchange', filterValue, context);
  // if ('orderType' in filterValue) {
  //   querySave.orderType = filterValue.orderType;
  // }
  // if ('orderType' in filterValue) {
  //   querySave.orderState = filterValue.orderState;
  // }
  querySave.orderType = filterValue.orderType;
  querySave.orderState = filterValue.orderState;
  querySave.paymentMethods = filterValue.paymentMethods;
  querySave.phoneNumber = filterValue.phoneNumber;

  console.log(' pagination.current', pagination.current, 'total', pagination.total, 'size', pagination.pageSize);

  queryData(
    {
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: querySave.sort,
      order: querySave.order === false ? 'asc' : 'desc',
    },
    null, // @ts-ignore
    querySave,
  );
};
// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
  console.log(value, params);
};
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
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null,
        // @ts-ignore
        querySave,
      );
    }
  }
};
const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete9({ ids });
      console.log('批量删除后', res);
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null,
        // @ts-ignore
        querySave,
      );

      MessagePlugin.success('删除成功');
    }
  } catch (error) {
    console.log(error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo: { current: number; pageSize: number }) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    store.pagination.current = pagination.current; // 分页数据也一起给
    store.pagination.pageSize = pagination.pageSize;
    queryData(
      {
        // 分页改变时更新数据
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      },
      null, // @ts-ignore
      querySave,
    );
    console.log('pagination.onChange', pageInfo);
  },
});
const queryData = async (paginationInfo?, searchVo?: undefined, entityInfo?: undefined) => {
  try {
    console.log('请求', entityInfo, paginationInfo);
    const res = await page4({ entity: entityInfo, searchVo, page: paginationInfo }); // 在此发送请求

    console.log('数据已送达', res);
    data.value = res.result.records; // 获得表格数据

    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
    store.renewData = queryData;
    store.querySave = querySave;
    const deleteArr: string[] = [];
    // 这段代码会安全地检查data.value数组中的每个对象是否具有paymentMethods属性，然后删除支付类型为null的数据
    for (let i = 0; i < data.value.length; i++) {
      if (Object.prototype.hasOwnProperty.call(data.value[i], 'paymentMethods')) {
        if (data.value[i].paymentMethods === null) {
          deleteArr.push(data.value[i].id);
        }
      }
    }
    const ids = deleteArr.join(); // 提取数组里面的字符串
    delete9({ ids });
    // 如果总页数小于当前页数
    if (res.result.pages < res.result.current) {
      pagination.current = res.result.pages;
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null, // @ts-ignore
        querySave,
      );
    }
  } catch (err) {
    console.log(err);
  }
};
const handleRowClick = (e) => {
  console.log(e);
};
</script>

<style lang="less" scoped></style>
