import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete1 } from '@/api/user/changdeguanli';
import { useRenewDataStore } from '@/store/renewData';

import Detail from './components/Detail.vue';
import Edit from './components/Edit.vue';

export const columns: PrimaryTableCol[] = [
  { colKey: 'createBy', title: '创建者' },
  { colKey: 'createTime', title: '创建时间', sorter: true },
  { colKey: 'updateBy', title: '修改时间', sorter: true },
  { colKey: 'noticeTime', title: '通知日期', sorter: true },
  { colKey: 'noticePerson', title: '通知人' },

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
  { colKey: 'noticeState', title: '通知状态' },

  {
    colKey: 'operation',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-link
            theme="danger"
            onClick={() => handleDelete(row.id)}
          >
            删除
          </t-link>
          <Edit
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
        </t-space>
      );
    },
  },
];

const store = useRenewDataStore();

const handleDelete = async (id) => {
  console.log('删除的id', id);
  const res = await delete1(id);
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
