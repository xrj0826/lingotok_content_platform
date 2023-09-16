import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon } from 'tdesign-icons-vue-next';

const statusNameListMap = {
  0: {
    label: '审批通过', theme: 'success', icon: <CheckCircleFilledIcon /> },
  1: {
      label: '审批失败', theme: 'danger', icon: <CloseCircleFilledIcon /> },
  2: {
        label: '审批过期', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
};

const statusDefaultListMap = {
  0: {
    label: '正常', theme: 'success', icon: <CheckCircleFilledIcon /> },
  1: {
      label: '封禁', theme: 'danger', icon: <CloseCircleFilledIcon /> },
  2: {
    label: 'null', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
};

export const columns: PrimaryTableCol[] = [
        { colKey: 'userName', title: '用户名' },
        {
          colKey: 'userInfo',
          title: '用户详细信息',
        },
        {
          colKey: 'userStatus', title: '用户会员状态', cell: (h, { row }) => {
            return (
              <t-tag shape = "round" theme = { statusNameListMap[row.status].theme } variant = "light-outline" >
                { statusNameListMap[row.status].icon }
            { statusNameListMap[row.status].label }
            </t-tag>
      );
    },
  },
        { colKey: 'userDefalut', title: '封禁状态', ellipsis: true,  cell: (h, { row }) => {
                    return (
                      <t-tag shape = "round" theme = { statusDefaultListMap[row.status].theme } variant = "light-outline" >
                        { statusDefaultListMap[row.status].icon }
                    { statusDefaultListMap[row.status].label }
                    </t-tag>
              );
            }, },
        { colKey: 'operation', title: '操作', cell: (h, { row }) => {
                    return (
                     <t-space> <t-link theme="primary" onClick={ handlerClick }>详情</t-link>
                      <t-link theme="danger">删除</t-link></t-space>
              );
            } },
        
];
const handlerClick = () => {
   alert('事件触发了')
}