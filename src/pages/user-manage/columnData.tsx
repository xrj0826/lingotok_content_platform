import { compileStyle } from '@vue/compiler-sfc';
import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon } from 'tdesign-icons-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

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
  { colKey: 'userName', title: '用户名' },
  {
    colKey: 'userInfo',
    title: '用户详细信息',
  },
  {
    colKey: 'userStatus',
    title: '用户会员状态',
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
          {' '}
          <t-link
            theme="primary"
            onClick={handlerClick}
          >
            详情
          </t-link>
          <t-link
            theme="danger"
            onClick={handlerDelete}
          >
            删除
          </t-link>
        </t-space>
      );
    },
  },
];
const handlerClick = () => {
  alert('事件触发了');
};
const handlerDelete = () => {
  alert('你确定要删除该用户吗?删除后数据将无法恢复。');
};
