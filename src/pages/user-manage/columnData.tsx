import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete3 } from '@/api/user/yonghuguanlixiangguanjiekou';
import { useRenewDataStore } from '@/store/renewData';

import Dialog from './components/Dialog.vue';

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
    colKey: 'name',
    title: '姓名',
  },
  { colKey: 'nickName', title: '昵称' },
  {
    colKey: 'credit',
    title: '积分',
  },

  { colKey: 'phoneNumber', title: '手机号' },
  { colKey: 'email', title: '邮件' },
  { colKey: 'birthday', title: '生日' },
  { colKey: 'avatar', title: '头像' },
  { colKey: 'sex', title: '性别' },

  {
    colKey: 'operation',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onClick={() => handleDelete(row.id)}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          <Dialog
            onEdit={editFinish}
            editId={row.id}
          ></Dialog>
        </t-space>
      );
    },
  },
  { colKey: 'createBy', title: '创建者' },
  { colKey: 'createTime', title: '创建时间', sorter: true },
  { colKey: 'updateBy', title: '修改者' },
  { colKey: 'updateTime', title: '修改时间', sorter: true },
];
const store = useRenewDataStore();
const handleDelete = async (id) => {
  console.log('删除的id', id);
  const res = await delete3(id);
  console.log('删除后', res);

  store.renewData({ pageNmber: 1, pagaSize: 10 });
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: 1, pagaSize: 10 }); // 使用pinia里面的分页请求
};
