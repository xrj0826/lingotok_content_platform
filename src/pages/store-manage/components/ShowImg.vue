<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handleAdd"
        >查看</t-link
      >
    </t-space>
    <t-dialog
      v-model:visible="visible"
      width="900px"
      header="修改区间价格"
      body="订单保存中，请稍后"
      :confirm-btn="null"
      :on-confirm="close"
      :on-close="null"
    >
      <addTimePrice
        style="margin: 0 900px 20px 0"
        @add="AddFinsh"
      ></addTimePrice>
      <t-button
        theme="danger"
        @click="handleMoreDelete"
      >
        批量删除
      </t-button>
      <t-table
        :row-key="index"
        :data="data"
        :columns="columns"
        table-layout="fixed"
        :bordered="true"
        size="large"
        :pagination="pagination"
        cell-empty-content="-"
        resizable
        :loading="isLoading"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeys"
        select-on-row-click
        @row-click="handleRowClick"
        @select-change="onSelectChange"
        @change="onChange"
      >
      </t-table>
    </t-dialog>
  </div>
</template>

<script lang="tsx" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { onMounted, reactive, ref } from 'vue';

import { page6 } from '@/api/user/mendiantupianjiekou';
import { useRenewDataStore } from '@/store/renewData';

const props = defineProps({ editId: Number }); // 为什么这里类型只能用大写，不然会警告?

// const emit = defineEmits(['add']);
const index = ref();
const data = ref([]);
const isLoading = ref(false);
// const loading = ref(false);
const visible = ref(false);
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
// const store = useRenewDataStore();
// 在此定义表单数据
// const submitData = reactive({
//   // id: null,
//   venueId: null,
//   orderst: '',
//   ordered: '',
//   specialValue: null,
// });
const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },

  {
    colKey: 'storeImage',
    title: '门店轮播图片',
    width: '80px',
    cell: (h, { row }) => {
      return (
        <t-image
          src={`https://139.9.38.185:666/${row.storeImage}`}
          style={"width: '80px', height: '80px' "}
        />
      );
    },
  },
  // {
  //   colKey: 'venueId',
  //   title: '场地id',
  // },
];

const close = () => {
  console.error('突然的关闭');
  visible.value = false;
};

// 外部的添加按钮
const handleAdd = () => {
  visible.value = true;
  store.storeId = props.editId; // 当点击添加区间价格时，发送从表格传过来的row.id，存储到pinia给价格区间表格
};

// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page6({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
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

// const handleMoreDelete = async () => {
//   try {
//     const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
//     if (ids === '') {
//       MessagePlugin.error('未勾选删除项');
//     } else {
//       const res = await delete7({ ids });
//       console.log('批量删除后', res);
//       queryData({
//         pageNumber: pagination.current,
//         pageSize: pagination.pageSize,
//       });
//       MessagePlugin.success('删除成功');
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const handleRowClick = (e) => {
  console.log(e.target.row);
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
const AddFinsh = (newData) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
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
</script>
