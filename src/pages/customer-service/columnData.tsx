import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon } from 'tdesign-icons-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import Drawer from '../customer-service/component/Drawer.vue';

const statusNameListMap = {
  0: {
    label: '非会员',
    theme: 'warning',
  },
  1: {
    label: '游客',
    theme: 'danger',
  },
  2: {
    label: '会员',
    theme: 'success',
  },
};

const statusDefaultListMap = {
  0: {
    label: '正常',
    theme: 'success',
    icon: <CheckCircleFilledIcon />,
  },
  1: {
    label: '封禁',
    theme: 'danger',
    icon: <CloseCircleFilledIcon />,
  },
  2: {
    label: 'null',
    theme: 'warning',
    icon: <ErrorCircleFilledIcon />,
  },
};

export const columns: PrimaryTableCol[] = [
  { colKey: 'userName', title: '客服名' },
  {
    colKey: 'id',
    title: 'id',
  },
  {
    colKey: 'phone',
    title: '电话号码',
  },
  {
    colKey: 'userStatus',
    title: '客服状态',
    cell: (h, { row }) => {
      return (
        <t-tag
          shape="round"
          theme={statusNameListMap[row.status].theme}
          variant="dark"
        >
          {statusNameListMap[row.status].label}
        </t-tag>
      );
    },
  },
  {
    colKey: 'userDefalut',
    title: '封禁状态',
    ellipsis: true,
    cell: (h, { row }) => {
      return (
        <t-tag
          shape="round"
          theme={statusDefaultListMap[row.status].theme}
          variant="light-outline"
        >
          {statusDefaultListMap[row.status].icon}
          {statusDefaultListMap[row.status].label}
        </t-tag>
      );
    },
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
