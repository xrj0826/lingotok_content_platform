import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { reactive, ref } from 'vue';

import { delete1 } from '@/api/user/changdeguanli';
import { useRenewDataStore } from '@/store/renewData';

import Dialog from './components/Dialog.vue';

export const columns: PrimaryTableCol[] = [
  { colKey: 'createBy', title: '创建者' },
  { colKey: 'createTime', title: '创建时间' },
  { colKey: 'updateBy', title: '修改时间' },
  { colKey: 'noticeTime', title: '通知日期' },
  { colKey: 'noticePerson', title: '通知人' },

  {
    colKey: 'detail',
    title: '公告详情',
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
          <Dialog
            onEdit={editFinish}
            editId={row.id}
          ></Dialog>
        </t-space>
      );
    },
  },
];

const store = useRenewDataStore();
const visibleNormalDrag = ref(false);
const noticeContent = ref('');

const detail = reactive({
  noticeTitle: '',
  noticeContent: '',
});

const handleDelete = async (id) => {
  console.log('删除的id', id);
  const res = await delete1(id);
  console.log('删除后', res);

  store.renewData({ pageNmber: 1, pagaSize: 10 });
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: 1, pagaSize: 10 }); // 使用pinia里面的分页请求
};
