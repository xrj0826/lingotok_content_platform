import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { deleteUsingDELETE, update } from '@/api/user/changdeguanli';

import Dialog from './components/Dialog.vue';

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    checkProps: ({ rowIndex }) => ({ disabled: rowIndex % 2 !== 0 }),
    width: 50,
  },
  {
    colKey: 'id',
    title: 'id',
  },
  {
    colKey: 'venueName',
    title: '场地名称',
  },

  {
    colKey: 'venueName',
    title: '场地名称',
  },
  {
    colKey: 'createBy',
    title: '创建者',
  },
  { colKey: 'createTime', title: '创建时间' },
  { colKey: 'updateBy', title: '修改者' },
  { colKey: 'updateTime', title: '修改时间' },
  { colKey: 'venueName', title: '门店id' },
  { colKey: 'price', title: '价格' },
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
          <Dialog
            onEdit={editFinish}
            editId={row.id}
          ></Dialog>
        </t-space>
      );
    },
  },
];
const handlerDelete = (e) => {
  console.log(e);
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log(newData);
};
