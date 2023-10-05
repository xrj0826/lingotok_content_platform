import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete18 } from '@/api/user/chuzhikaguanli';
import { useRenewDataStore } from '@/store/renewData';

import Edit from './components/Edit.vue';

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
    fixed: 'left',
  },
  // {
  //   colKey: 'id',
  //   title: 'id',
  // },

  // { colKey: 'userId', title: '用户id' },

  { colKey: 'cardName', title: '卡名称' },
  {
    colKey: 'cardType',
    title: '卡类型（储值卡、月卡、次卡）',
    width: '240px',

    cell: (h, { row }) => {
      let cellValue;

      // 使用 switch 语句检查 row 的值
      switch (row.cardType) {
        case 'STORED_VALUE':
          cellValue = <span>储值卡</span>;
          break;
        case 'MONTHLY':
          cellValue = <span>月卡</span>;
          break;
        case 'TICKET':
          cellValue = <span>次卡</span>;
          break;
        default:
          cellValue = <span>null</span>;
          break;
      }

      return cellValue;
    },
    filter: {
      // 过滤行中的列标题别名
      // label: '申请状态 A',
      type: 'single',
      list: [
        { label: '储值卡', value: 'STORED_VALUE' },
        { label: '月卡', value: 'MONTHLY' },
        { label: '次卡', value: 'TICKET' },
      ],
      resetValue: '',
      // props: {
      //   placeholder: '输入关键词过滤',
      //   onChange: onOrderStateChange,
      // },
      // 是否显示重置取消按钮，一般情况不需要显示
      showConfirmAndReset: true,
    },
  },
  // {
  //   colKey: 'currentBalance',
  //   title: '当前余额',
  //   sorter: true,
  // },
  // {
  //   colKey: 'bonusAmount',
  //   title: '赠送金额',
  // },

  { colKey: 'faceValue', title: '面值', sorter: true },

  {
    colKey: 'discountValue',
    title: '折扣值/折',
  },
  { colKey: 'days', title: '有效期', sorter: true },

  // { colKey: 'startDate', title: '生效日期', sorter: true },
  // { colKey: 'endDate', title: '结束日期', sorter: true },
  {
    colKey: 'storeId',
    title: '门店',
  },
  // { colKey: 'createBy', title: '创建者' },
  // { colKey: 'createTime', title: '创建时间', sorter: true },
  // { colKey: 'updateBy', title: '修改者' },
  // { colKey: 'updateTime', title: '修改时间', sorter: true },
  {
    colKey: 'operation',
    title: '操作',
    fixed: 'right',

    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => handleDelete(row.id)}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
        </t-space>
      );
    },
  },
];
// 循环为列属性配置居中属性
for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}
const store = useRenewDataStore();
const handleDelete = async (id) => {
  try {
    console.log('删除的id', id);
    // 参数要求是个对象
    const params = {
      id,
    };
    const res = await delete18(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');

    store.renewData(
      {
        pageNmber: store.pagination.current,
        pagaSize: store.pagination.pageSize,
        sort: 'createTime',
        order: 'asc',
      },
      null,
      store.querySave,
    );
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData(
    {
      pageNmber: store.pagination.current,
      pagaSize: store.pagination.pageSize,
      sort: 'createTime',
      order: 'asc',
    },
    null,
    store.querySave,
  );
};
