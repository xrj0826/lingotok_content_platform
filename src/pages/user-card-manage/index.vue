<!-- eslint-disable no-await-in-loop -->
<!-- 储值卡管理 -->
<template>
  <div>
    <t-card>
      <t-space style="margin: 0 20px 20px 0">
        <!-- <add @add="AddFinsh"></add> -->
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDelete"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
        <!-- <t-select-input
          placeholder="请输入任意关键词"
          allow-input
          clearable
          style="width: 300px"
          @input-change="onInputChange"
        >
          <template #suffixIcon><search-icon /></template>
        </t-select-input> -->
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
        :loading-props="{ delay: 0, size: 'small' }"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeys"
        @row-click="handleRowClick"
        @select-change="onSelectChange"
        @filter-change="onFilterChange"
        @change="onChange"
      >
      </t-table
    ></t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'CreditCardManage',
};
</script>
<script setup lang="tsx">
// import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { delete17, page9 } from '@/api/user/chuzhikaguanli';
import { get1 } from '@/api/user/yonghuguanlixiangguanjiekou';
// import { get2 } from '@/api/user/mendianguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import { columns } from './columnData';
// import Add from './components/Add.vue';

// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    sort: 'createTime',
    order: 'asc',
  });
  store.renewData = queryData; // 挂载时，将请求函数给pinia
  store.pagination.current = pagination.current; // 分页数据也一起给
  store.pagination.pageSize = pagination.pageSize;
  store.querySave = querySave;
});

const index = ref();
const data = ref([]);
const isLoading = ref(false);
const store = useRenewDataStore();
const querySave = reactive({
  sort: 'createTime',
  order: false,
  cardType: '',
  userId: '',
  nickName: '',
});
// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page9({ entity: entityInfo, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);
    // 缓存表格数据，以便数据同时更新
    const cache = ref([]);
    cache.value = res.result.records;
    // 使用Promise.all()来并行发送所有的请求
    const promises = cache.value.map((item) => {
      // 只处理有userId属性的数据
      if (Object.prototype.hasOwnProperty.call(item, 'userId')) {
        // 返回一个Promise对象
        return get1({ id: item.userId });
      }
      // 没有userId属性的数据返回null
      return null;
    });
    // 等待所有的请求都完成
    await Promise.all(promises)
      .then((results) => {
        // 遍历结果数组
        results.forEach((res, i) => {
          // 如果结果不为空
          if (res && res !== undefined) {
            // 更新对应的数据
            cache.value[i].phoneNumber = res.result.phoneNumber || '';
            cache.value[i].user = res.result.nickName || '';
          }
        });
      })
      .catch((error) => {
        // 处理错误情况
        console.log(error);
      });
    data.value = cache.value; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
    store.renewData = queryData;
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
  isLoading.value = false;
};

// 多选删除
const selectedRowKeys = ref([]);
const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete17({ ids });
      console.log('批量删除后', res);
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      });
      MessagePlugin.success('删除成功');
    }
  } catch (error) {
    console.log(error);
    MessagePlugin.error('出错了，请刷新');
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
// 过滤等发生变化时会出发 change 事件
const filterItem = ref([]);
// const filterItem2 = ref([]);

const onFilterChange = (filterValue, context) => {
  try {
    if (filterValue.cardType) {
      console.log('filterValue', filterValue.cardType.toString());
      querySave.cardType = filterValue.cardType.toString();
    }

    // filterItem.value = data.value.filter((item) => item.phoneNumber === filterValue.phoneNumber);

    if (filterValue.user || filterValue.phoneNumber) {
      if (filterValue.user) {
        filterItem.value = [];
        filterItem.value = data.value.filter((item) => item.user === filterValue.user);
      } else if (filterValue.phoneNumber) {
        filterItem.value = [];
        filterItem.value = data.value.filter((item) => item.phoneNumber === filterValue.phoneNumber);
      }
      // 通过手机号获取userId,再存储到请求参数中
      const { userId } = JSON.parse(JSON.stringify(filterItem.value[0]));
      querySave.userId = userId;
      console.log('filterValueuser', filterValue.user, filterValue.phoneNumber);
    } else {
      querySave.userId = null;
    }
    // if (filterValue.phoneNumber) {
    //   if (filterItem.value) {
    //     filterItem.value = data.value.filter((item) => item.phoneNumber === filterValue.phoneNumber);
    //   } else filterItem.value.push(data.value.filter((item) => item.phoneNumber === filterValue.phoneNumber));
    // }

    // filterItem.value = Array.from(new Set(filterItem.value));

    // filterItem2.value = data.value.filter(
    //   (item) => item.user === filterValue.user && item.phoneNumber === filterValue.phoneNumber,
    // );
    // const { userId2 } = JSON.parse(JSON.stringify(filterItem2.value[0]));
    // querySave.userId = userId2;

    // console.log(
    //   'filterItem0000000000000000000000000000000000000000',
    //   JSON.parse(JSON.stringify(filterItem.value[0])).userId,
    //   querySave.userId,
    // );
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
  } catch (error) {
    console.log(error);
    // filterItem为undefined的情况
    querySave.userId = null;
    console.log(querySave.userId);
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
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info.sorter, context.trigger);

  if (context.trigger === 'sorter') {
    if (info.sorter === undefined) {
      querySave.sort = 'createTime';
      querySave.order = false;
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
        null, // @ts-ignore
        querySave,
      );
    }
  }
};
// 搜索框
// const searchValue = ref();
// const onInputChange = (keyword) => {
//   searchValue.value = keyword;
//   querySave.phoneNumber = keyword;
//   queryData(
//     {
//       pageNumber: pagination.current,
//       pageSize: pagination.pageSize,
//       sort: querySave.sort,
//       order: querySave.order === false ? 'asc' : 'desc',
//     },
//     null, // @ts-ignore
//     querySave,
//   );
// };

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo) => {
    console.log('当前分页数据', pageInfo);
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    store.pagination.current = pagination.current; // 分页数据也一起给
    store.pagination.pageSize = pagination.pageSize;
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

// const AddFinsh = (newData) => {
//   console.log(newData);
//   queryData(
//     {
//       pageNumber: pagination.current,
//       pageSize: pagination.pageSize,
//       sort: querySave.sort,
//       order: querySave.order === false ? 'asc' : 'desc',
//     },
//     null, // @ts-ignore
//     querySave,
//   );
// };
</script>

<style lang="less" scoped></style>
