// import { MessagePlugin } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import {} from 'vue';

import { delete19 } from '@/api/user/guanliyuan';
import { useRenewDataStore } from '@/store/renewData';

// import Edit from './components/Edit.vue';

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
    colKey: 'username',
    title: '管理员用户名',
  },
  // { colKey: 'nickName', title: '昵称' },

  { colKey: 'mobile', title: '管理员手机号' },
  {
    colKey: 'operation',
    fixed: 'right',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              handleDelete(row.id);
            }}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          {/* <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit> */}
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

    const res = await delete19({ ids: id });
    console.log('删除后', res);
    MessagePlugin.success('删除成功');

    store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
// const editFinish = async (newData) => {
//   console.log('edit传回', newData);
//   store.renewData({ pageNmber: 1, pagaSize: 10 }); // 使用pinia里面的分页请求
// };
