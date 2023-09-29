<!-- 订单管理 -->
<template>
  <div>
    <t-card>
      <t-space>
        <t-button theme="primary">
          <template #icon><add-icon /></template>
          新建公告
        </t-button></t-space
      >
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
import { AddIcon } from 'tdesign-icons-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { onMounted, reactive, ref } from 'vue';

import { page2 } from '@/api/user/mendianguanlijiekou';

import Dialog from './components/Dialog.vue';

const data = ref([]);
const index = ref();
// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
});
const columns: PrimaryTableCol[] = [
  { colKey: 'createTime', title: '创建时间' },
  {
    colKey: 'updateBy',
    title: '修改者',
  },
  {
    colKey: 'updateTime',
    title: '修改时间',
  },
  {
    colKey: 'venueIntroduction ',
    title: '场馆介绍',
  },
  {
    colKey: 'closingTime ',
    title: '关店时间',
  },
  {
    colKey: 'openingTime ',
    title: '开店时间',
  },
  { colKey: 'deleteFlag', title: ' 删除标志', ellipsis: true, cell: undefined },

  {
    colKey: 'storeImages',
    title: '门店图片',
  },
  {
    colKey: ' serviceHotline ',
    title: '服务热线',
  },
  {
    colKey: 'realTime ',
    title: '实时人数',
  },
  {
    colKey: 'advanceDays  ',
    title: '提前预订天数',
  },
  {
    colKey: 'leadTime  ',
    title: '起订时间',
  },

  {
    colKey: 'announcement  ',
    title: '公告',
  },
  {
    colKey: 'address  ',
    title: '门店地址 ',
  },
  {
    colKey: 'operation',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-link
            theme="danger"
            onConfirm={handlerDelete}
          >
            删除
          </t-link>
          <Dialog
            onEdit={editFinish}
            editId={row.id}
          ></Dialog>
        </t-space>
      );
    },
  },
];

const handleRowClick = (e) => {
  console.log(e);
};
const handlerDelete = (e) => {
  console.log(e);
};
// 发送编辑行后执行回调
const editFinish = (newData) => {
  // eslint-disable-next-line no-alert
  alert('编辑完成');
  // eslint-disable-next-line no-alert
  alert(newData);
};
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    console.log('请求', entityInfo, paginationInfo);

    const res = await page2({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
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

<style lang="less" scoped>
.tdesign-demo-block-column {
  width: 100%;
}
</style>
