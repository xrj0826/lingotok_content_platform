import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete11 } from '@/api/user/youhuiquanguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import Edit from './components/Edit.vue';

const statusNameListMap = {
  0: { label: '审批通过', theme: 'success', icon: <CheckCircleFilledIcon /> },
  1: { label: '审批失败', theme: 'danger', icon: <CloseCircleFilledIcon /> },
  2: { label: '审批过期', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
};
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

  { colKey: 'userId', title: '用户id' },
  {
    colKey: 'storeId',
    title: '门店id',
  },
  { colKey: 'cardName', title: '卡名称' },
  {
    colKey: 'cardType',
    title: '卡类型（储值卡、月卡、次卡）',
    cell: (h, { row }) => {
      return (
        <t-tag
          shape="round"
          theme={statusNameListMap[row.status].theme}
          variant="light-outline"
        >
          {statusNameListMap[row.status].icon}
          {statusNameListMap[row.status].label}
        </t-tag>
      );
    },
  },
  {
    colKey: 'currentBalance',
    title: '当前余额',
    sorter: true,
  },
  {
    colKey: 'bonusAmount',
    title: '赠送金额',
  },

  { colKey: 'faceValue', title: '面值', sorter: true },

  {
    colKey: 'discountValue',
    title: '折扣值',
  },
  { colKey: 'days', title: '有效期', sorter: true },
  { colKey: 'startDate', title: '生效日期' },
  { colKey: 'endDate', title: '结束日期' },

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
          <Edit
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
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
  try {
    console.log('删除的id', id);
    // 参数要求是个对象
    const params = {
      id,
    };
    const res = await delete11(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');

    store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: 1, pagaSize: 10 }); // 使用pinia里面的分页请求
};
