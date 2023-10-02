import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete12 } from '@/api/user/xiaochengxugonggao';
import { useRenewDataStore } from '@/store/renewData';

import Detail from './components/Detail.vue';
import Edit from './components/Edit.vue';

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  // { colKey: 'createBy', title: '创建者' },
  // { colKey: 'createTime', title: '创建时间', sorter: true },
  // { colKey: 'updateBy', title: '修改人' },
  // { colKey: 'updateTime', title: '修改时间', sorter: true },

  { colKey: 'noticeTime', title: '通知时间', sorter: true },
  // { colKey: 'noticePerson', title: '通知人' },

  {
    colKey: 'detail',
    title: '公告详情',
    cell: (h, { row }) => {
      return (
        <t-space>
          <Detail detailId={row.id}></Detail>
        </t-space>
      );
    },
  },
  {
    colKey: 'storeId',
    title: '门店',
    cell: () => {
      return <span>恒跃体育广钢公园体育中心</span>; // 写死门店，一分钱一分货
    },
  },
  {
    colKey: 'operation',
    title: '操作',
    fixed: 'right',

    cell: (h, { row }) => {
      return (
        <t-space>
          <t-link
            theme="danger"
            onConfirm={() => handleDelete(row.id)}
          >
            删除
          </t-link>
          <Edit // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
        </t-space>
      );
    },
  },
];
// for (let i = 0; i < columns.length; i++) {
//   columns[i].align = 'center';
// }

const store = useRenewDataStore();

const handleDelete = async (id) => {
  console.log('删除的id', id);
  const params = {
    id,
  };
  const res = await delete12(params);
  console.log('删除后', res);
  MessagePlugin.success('删除成功');

  store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
  // 使用pinia里面的分页请求
};
