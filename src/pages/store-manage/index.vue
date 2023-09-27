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
          row-key="index"
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

  <script
    setup
    lang="jsx"
  >
    import { ref, computed } from 'vue';
    import { ErrorCircleFilledIcon, CheckCircleFilledIcon, CloseCircleFilledIcon } from 'tdesign-icons-vue-next';

    const data = [];
    const statusNameListMap = {
      0: { label: '审批通过', theme: 'success', icon: <CheckCircleFilledIcon /> },
      1: { label: '审批失败', theme: 'danger', icon: <CloseCircleFilledIcon /> },
      2: { label: '审批过期', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
    };
    for (let i = 0; i < 5; i++) {
      data.push({
        index: i + 1,
        applicant: ['贾明', '张三', '王芳'][i % 3],
        status: i % 3,
        channel: ['电子签署', '纸质签署', '纸质签署'][i % 3],
        detail: {
          email: ['w.cezkdudy@lhll.au', 'r.nmgw@peurezgn.sl', 'p.cumx@rampblpa.ru'][i % 3],
        },
        matters: ['宣传物料制作费用', 'algolia 服务报销', '相关周边制作费', '激励奖品快递费'][i % 4],
        time: [2, 3, 1, 4][i % 4],
        createTime: ['2022-01-01', '2022-02-01', '2022-03-01', '2022-04-01', '2022-05-01'][i % 4],
      });
    }

    const leftFixedColumn = ref(2);
    const rightFixedColumn = ref(1);
    const tableLayout = ref('fixed');
    const emptyData = ref(false);

    const columns = computed(() => {
      return [
        { colKey: 'applicant', title: '申请人', width: 100, fixed: 'left' },
        {
          colKey: 'status',
          title: '审批状态',
          width: 150,
          fixed: leftFixedColumn.value >= 2 ? 'left' : undefined,
          cell: (h, { rowIndex }) => {
            const status = rowIndex % 3;
            return (
              <t-tag
                shape="round"
                theme={statusNameListMap[status].theme}
                variant="light-outline"
              >
                {statusNameListMap[status].icon}
                {statusNameListMap[status].label}
              </t-tag>
            );
          },
        },
        { colKey: 'detail.email', title: '邮箱地址', width: 180 },
        { colKey: 'matters', title: '申请事项', width: 200 },
        {
          colKey: 'createTime',
          title: '申请日期',
          width: 120,
          fixed: rightFixedColumn.value >= 2 ? 'right' : undefined,
        },
        { colKey: 'operation', title: '操作', width: 100, fixed: 'right' },
      ];
    });
    const rightFixedColumn = new Column();
    const tableRef = ref(null);
    // eslint-disable-next-line
    const scrollToCreateTime = () => {
      // 横向滚动到指定列
      tableRef.value.scrollColumnIntoView('matters');
    };
  </script>
  <style
    lang="less"
    scoped
  >
    .tdesign-demo-block-column {
      width: 100%;
    }
  </style>
</template>

<script lang="tsx">
export default {
  name: 'StoreManage',
};
</script>
<script setup lang="tsx">
import { dataTool } from 'echarts';
import { AddIcon } from 'tdesign-icons-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { onMounted, reactive, ref } from 'vue';

import { page1 } from '@/api/user/mendianguanlijiekou';

import Dialog from './components/Dialog.vue';
import { useSomeFeature } from './constants';

// const { data, total } = useSomeFeature();
const data = ref([]);
const total = ref();
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
  alert('编辑完成');
  alert(newData);
};
const queryData = async (paginatio8nInfo?, searchVo?, entityInfo?) => {
  try {
    console.log('请求', entityInfo, paginationInfo);

    const res = await page1({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
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

<style lang="less" scoped></style>
