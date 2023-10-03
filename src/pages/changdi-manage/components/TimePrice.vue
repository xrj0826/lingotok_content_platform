<template>
  <div>
    <t-space>
      <t-link
        theme="primary"
        @click="handleAdd"
        >区间价格</t-link
      >
    </t-space>
    <t-dialog
      v-model:visible="visible"
      attach="body"
      width="900px"
      header="修改区间价格"
      body="订单保存中，请稍后"
      :confirm-btn="null"
      :on-confirm="close"
      :on-close="null"
    >
      <t-space style="margin-bottom: 20px">
        <addTimePrice @add="AddFinsh"></addTimePrice>
        <t-button
          theme="danger"
          @click="handleMoreDelete"
        >
          批量删除
        </t-button>
      </t-space>
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
        <!-- 自定义表头，title值为插槽名称  -->
        <template #title-slot-name>
          <div style="display: flex; justify-content: center"><UserCircleIcon style="margin-right: 8px" />申请人</div>
        </template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script lang="tsx" setup>
import dayjs from 'dayjs';
import { DatePicker, Input, MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { onMounted, reactive, ref } from 'vue';

import { delete7, page3, update3 } from '@/api/user/houtaizhidingteshujiagejiekou';
import { useRenewDataStore } from '@/store/renewData';

import addTimePrice from './addTimePrice.vue';

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
  // store.renewData = queryData; // 挂载时，将请求函数给pinia
  // store.pagination.current = pagination.current; // 分页数据也一起给
  // store.pagination.pageSize = pagination.pageSize;
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
    colKey: 'orderst',
    title: '订单开始时间',
    edit: {
      component: DatePicker,
      // props, 透传全部属性到 DatePicker 组件
      props: { enableTimePicker: true, clearable: true, allowInput: true },
      // 除了点击非自身元素退出编辑态之外，还有哪些事件退出编辑态
      abortEditOnEvent: ['onChange'],
      onEdited: (context) => {
        data.value.splice(context.rowIndex, 1, context.newRowData);
        console.log('Edit Date:', context);
        const params = {
          orderst: context.newRowData.orderst,
          id: context.newRowData.orderst.id,
        };

        update3(params);
        MessagePlugin.success('编辑成功');
      },
      // 校验规则，此处同 Form 表单
      rules: () => [
        {
          validator: (val) => dayjs(val).isAfter(dayjs()),
          message: '只能选择今天以后日期',
        },
      ],
    },
  },

  {
    colKey: 'ordered',
    title: '订单结束时间',
    edit: {
      component: DatePicker,
      // props, 透传全部属性到 DatePicker 组件
      props: { enableTimePicker: true, clearable: true, allowInput: true },
      // 除了点击非自身元素退出编辑态之外，还有哪些事件退出编辑态
      abortEditOnEvent: ['onChange'],
      onEdited: (context) => {
        data.value.splice(context.rowIndex, 1, context.newRowData);
        console.log('Edit Date:', context);
        const params = {
          orderst: context.newRowData.orderst,
          id: context.newRowData.orderst.id,
        };

        update3(params);
        MessagePlugin.success('编辑成功');
      },
      // 校验规则，此处同 Form 表单
      rules: () => [
        {
          validator: (val) => dayjs(val).isAfter(dayjs()),
          message: '只能选择今天以后日期',
        },
      ],
    },
  },
  {
    colKey: 'specialValue',
    title: '该时间段价格',
    // 编辑状态相关配置，全部集中在 edit
    edit: {
      // 1. 支持任意组件。需保证组件包含 `value` 和 `onChange` 两个属性，且 onChange 的第一个参数值为 new value。
      // 2. 如果希望支持校验，组件还需包含 `status` 和 `tips` 属性。具体 API 含义参考 Input 组件
      component: Input,
      // props, 透传全部属性到 Input 组件。可以是一个函数，不同行有不同的 props 属性 时，使用 Function）
      props: {
        clearable: true,
        autofocus: true,
      },
      // 触发校验的时机（when to validate)
      validateTrigger: 'change',
      // 透传给 component: Input 的事件（也可以在 edit.props 中添加）
      on: (editContext) => ({
        onBlur: () => {
          console.log('失去焦点', editContext);
          const params = {
            specialValue: editContext.editedRow.specialValue,
            orderst: editContext.editedRow.orderst,
            ordered: editContext.editedRow.ordered,
            id: editContext.editedRow.id,
          };

          update3(params);
        },
        onEnter: (ctx) => {
          ctx?.e?.preventDefault();
          const params = {
            specialValue: editContext.editedRow.specialValue,
            orderst: editContext.editedRow.orderst,
            ordered: editContext.editedRow.ordered,
            id: editContext.editedRow.id,
          };

          update3(params);
        },
      }),
      // 除了点击非自身元素退出编辑态之外，还有哪些事件退出编辑态
      abortEditOnEvent: ['onEnter'],
      // 编辑完成，退出编辑态后触发
      onEdited: (context) => {
        console.log(context);
        data.value.splice(context.rowIndex, 1, context.newRowData);
        console.log('Edit firstName:', context);
        MessagePlugin.success('编辑成功');
      },
      // 校验规则，此处同 Form 表单。https://tdesign.tencent.com/vue-next/components/form
      rules: [{ required: true, message: '不能为空' }],
      // 默认是否为编辑状态
      defaultEditable: true,
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
    const res = await page3({ entity: { venueId: props.editId }, searchVo, page: paginationInfo }); // 在此发送请求
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
      const res = await delete7({ ids });
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
