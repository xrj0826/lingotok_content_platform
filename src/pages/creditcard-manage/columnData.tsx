import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete13 } from '@/api/user/chuzhikaguanli';
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

  { colKey: 'userId', title: '用户id' },
  {
    colKey: 'storeId',
    title: '门店id',
  },
  { colKey: 'cardName', title: '卡名称' },
  {
    colKey: 'cardType',
    title: '卡类型（储值卡、月卡、次卡）',
    width: '220px',
  },
  {
    colKey: 'currentBalance',
    title: '当前余额',
    sorter: true,
  },
  {
    colKey: 'bonusAmount',
    title: '赠送金额',
  },

  { colKey: 'faceValue', title: '面值', sorter: true },

  {
    colKey: 'discountValue',
    title: '折扣值',
  },
  { colKey: 'days', title: '有效期', sorter: true },
  { colKey: 'startDate', title: '生效日期' },
  { colKey: 'endDate', title: '结束日期' },

  { colKey: 'createBy', title: '创建者' },
  { colKey: 'createTime', title: '创建时间', sorter: true },
  { colKey: 'updateBy', title: '修改者' },
  { colKey: 'updateTime', title: '修改时间', sorter: true },
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
    const res = await delete13(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');

    store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: 1, pagaSize: 10 }); // 使用pinia里面的分页请求
};
