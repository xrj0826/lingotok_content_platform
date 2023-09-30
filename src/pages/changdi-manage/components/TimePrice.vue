<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handleAdd"
        >修改区间价格</t-link
      >
    </t-space>
    <t-dialog
      v-model:visible="visible"
      header="添加场地"
      body="订单保存中，请稍后"
      :confirm-btn="{
        content: '提交',
        theme: 'primary',
        loading,
      }"
      :on-confirm="add"
      :on-close="close"
    >
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
        select-on-row-click
        @row-click="handleRowClick"
        @select-change="onSelectChange"
        @change="onChange"
      >
        <!-- 自定义表头，title值为插槽名称  -->
        <template #title-slot-name>
          <div style="display: flex; justify-content: center"><UserCircleIcon style="margin-right: 8px" />申请人</div>
        </template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script lang="tsx" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { reactive, ref } from 'vue';

import { save } from '@/api/user/changdeguanli';

const emit = defineEmits(['add']);
const index = ref();
const data = ref([]);
const isLoading = ref(false);
const loading = ref(false);
const visible = ref(false);
const store = useRenewDataStore();
// 在此定义表单数据
const formData = reactive({
  // id: null,
  orderSt: '',
  orderEd: '',
  customRateValue: '',
});
const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
];
const setOrderSt = ref([]);
const setOrderEd = ref([]);

const close = () => {
  console.error('突然的关闭');
  visible.value = false;
};

// 外部的添加按钮
const handleAdd = () => {
  visible.value = true;
};

// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page8({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
const selectedRowKeys = ref([]);

// const handleMoreDelete = async () => {
//   try {
//     const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
//     if (ids === '') {
//       MessagePlugin.error('未勾选删除项');
//     } else {
//       const res = await delete17({ ids });
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
  console.log('change', info.sorter, context);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    sort: info.sorter.sortBy,
    order: info.sorter.descending === false ? 'asc' : 'desc',
  });
};
// 确定添加
const add = async () => {
  try {
    // 记录添加值
    setOrderSt.value.push(formData.orderSt);
    setOrderEd.value.push(formData.orderEd);
    console.log('开始时间数组', setOrderSt.value);
    console.log('结束时间数组', setOrderEd.value);

    // 一系列的转化
    const specialValue = {
      customRateTable: [
        { orderSt: formData.orderSt, orderEd: formData.orderEd, customRateValue: formData.customRateValue },
      ],
    };
    const jsonString = JSON.stringify({ specialValue });
    const formattedJsonString = `"specialValue": ${JSON.stringify(jsonString)}`;
    const newFormData = reactive({ specialValue: formattedJsonString });
    console.log('看看你得', newFormData);

    const res = await save(newFormData);
    console.log('編輯返回', res);
    emit('add', 'emit传来喜报:组件通信成功', res);

    loading.value = true;
    // 加载一下
    const timer = setTimeout(() => {
      loading.value = false;
      visible.value = false;
      clearTimeout(timer);
    }, 200);
    MessagePlugin.success('添加成功');
  } catch (error) {
    console.log(error);
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
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    }); // 分页数据改变时调用请求函数
    console.log('pagination.onChange', pageInfo);
  },
});
</script>
