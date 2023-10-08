import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete1 } from '@/api/user/changdeguanli';
import { useRenewDataStore } from '@/store/renewData';

import BuyIns from './components/BuyIns.vue';
import Edit from './components/Edit.vue';
import TimePrice from './components/TimePrice.vue';

const store = useRenewDataStore();

export const columns: PrimaryTableCol[] = [
  // {
  //   colKey: 'row-select',
  //   type: 'multiple',
  //   width: 40,
  // },
  {
    colKey: 'id',
    title: 'id',
    width: '120px',
  },
  {
    colKey: 'venueName',
    title: '场地名称',
    width: '100px',
  },
  {
    colKey: 'venueType',
    title: '场地类型',
    width: '100px', // 单选过滤配置
    filter: {
      // 过滤行中的列标题别名
      // label: '申请状态 A',
      type: 'single',
      list: [
        { label: '篮球场', value: '0' },
        { label: '羽毛球场', value: '1' },
        { label: '乒乓球场', value: '2' },
      ],
      resetValue: '',
      // props: {
      //   placeholder: '输入关键词过滤',
      //   onChange: onOrderStateChange,
      // },
      // 是否显示重置取消按钮，一般情况不需要显示
      showConfirmAndReset: true,
    },
    cell: (h, { row }) => {
      let cellValue;

      // 使用 switch 语句检查 row 的值
      switch (row.venueType) {
        case '0':
          cellValue = <b style={{ color: 'rgb(117, 211, 175)' }}>篮球场</b>;
          break;
        case '1':
          cellValue = <b style={{ color: 'rgb(165, 105, 91)' }}>羽毛球场</b>;
          break;
        case '2':
          cellValue = <b style={{ color: 'rgb(185, 155, 10)' }}>乒乓球场</b>;
          break;
        default:
          cellValue = <b>未设置</b>;
          break;
      }

      return cellValue;
    },
  },
  // {
  //   colKey: 'createBy',
  //   title: '创建者',
  // },
  // { colKey: 'createTime', title: '创建时间', sorter: true },
  // { colKey: 'updateBy', title: '修改者' },
  // { colKey: 'updateTime', title: '修改时间', sorter: true },
  // { colKey: 'storeId', title: '门店id' },
  { colKey: 'amAllPrice', title: '9:30-11:30与16:00-18:00全场价格', sorter: true },
  { colKey: 'pmAllPrice', title: '18:00-22:00全场价格', sorter: true },
  { colKey: 'leadTime', title: '场地起订时间/分', sorter: true },

  // { colKey: 'amHalfPrice', title: '9:30-11:30与16:00-18:00篮球场半场价格', sorter: true },
  // { colKey: 'pmHalfPrice', title: '18:00-22:00篮球场半场价格', sorter: true },
  // { colKey: 'price', title: '普通场价格', sorter: true },
  // {
  //   colKey: 'relevancyId',
  //   title: '篮球半场关联篮球全场id',
  // },
  {
    colKey: 'specialValue',
    title: '区间价格',
    width: '90px',
    cell: (h, { row }) => {
      return (
        <t-space>
          <TimePrice // @ts-ignore
            onAdd={editFinish}
            editId={row.id}
          ></TimePrice>
        </t-space>
      );
    },
  },
  {
    colKey: 'purchaseInstructions',
    title: '购买须知',
    width: '90px',

    cell: (h, { row }) => {
      return (
        <t-space>
          <BuyIns
            // onAdd={editFinish}
            data={row.purchaseInstructions}
          ></BuyIns>
        </t-space>
      );
    },
  },
  {
    colKey: 'operation',
    title: '操作',
    width: '100px',
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
          <Edit // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
        </t-space>
      );
    },
  },
];
for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}

const handleDelete = async (id) => {
  try {
    console.log('删除的id', id);
    // 参数要求是个对象
    const params = {
      id,
    };
    //
    const res = await delete1(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');
    await store.renewData(
      { pageNumber: store.pagination.current, pageSize: store.pagination.pageSize, sort: 'createTime', order: 'asc' },
      null,
      store.querySave,
    );
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
const editFinish = (newData) => {
  console.log('edit传回', newData);
  console.log('store分页数据', store.pagination.current, store.pagination.pageSize);

  store.renewData(
    { pageNumber: store.pagination.current, pageSize: store.pagination.pageSize, sort: 'createTime', order: 'asc' },
    null,
    store.querySave,
  ); // 使用pinia里面的分页请求
};
