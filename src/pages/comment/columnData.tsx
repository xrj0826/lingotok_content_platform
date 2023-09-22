import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

export const columns: PrimaryTableCol[] = [
  { colKey: 'user', title: '' },
  {
    colKey: 'content',
    title: '',
  },

  {
    colKey: 'operation',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-link
            theme="danger"
            onClick={handlerDelete}
          >
            删除
          </t-link>
          <Drawer
            onEdit={editRow}
            editId={row.id}
          ></Drawer>
        </t-space>
      );
    },
  },
];

const handlerDelete = () => {
  alert('你确定要删除该用户吗?删除后数据将无法恢复。');
};

// 发送编辑行后执行回调
const editRow = (newData) => {
  alert('编辑完成');
  alert(newData);
};
