import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete1 } from '@/api/user/changdeguanli';
import { useRenewDataStore } from '@/store/renewData';

import BuyIns from './components/BuyIns.vue';
import Edit from './components/Edit.vue';
import TimePrice from './components/TimePrice.vue';

const store = useRenewDataStore();

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  // {
  //   colKey: 'id',
  //   title: 'id',
  // },
  {
    colKey: 'venueName',
    title: '场地名称',
  },
  // {
  //   colKey: 'createBy',
  //   title: '创建者',
  // },
  // { colKey: 'createTime', title: '创建时间', sorter: true },
  // { colKey: 'updateBy', title: '修改者' },
  // { colKey: 'updateTime', title: '修改时间', sorter: true },
  // { colKey: 'storeId', title: '门店id' },
  { colKey: 'halfPrice', title: '半场价格' },
  { colKey: 'allPrice', title: '全场价格' },
  { colKey: 'price', title: '普通场价格', sorter: true },
  {
    colKey: 'specialValue',
    title: '设置时间区间价格',
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
    title: '场地购买须知',
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
    await store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize }); // 使用pinia里面的分页请求
};
