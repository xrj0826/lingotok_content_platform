import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete11 } from '@/api/user/youhuiquanguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import Edit from './components/Edit.vue';

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
    fixed: 'left',
  },
  // {
  //   colKey: 'id',
  //   title: 'id',
  // },
  { colKey: 'usageLimit', title: '优惠卷次数限制', width: '140px' },
  { colKey: 'usageCount', title: '优惠卷使用次数', width: '140px' },

  {
    colKey: 'discountValue',
    title: '折扣值(元)',
  },
  {
    colKey: 'discountType',
    title: '折扣类型',
    cell: (h, { row }) => {
      return (
        <t-tag
          shape="round"
          variant="light-outline"
        >
          {row.discountType}
        </t-tag>
      );
    },
  },
  { colKey: 'days', title: '优惠天数', sorter: true },
  { colKey: 'cardName', title: '卡名称' },
  {
    colKey: 'isActive',
    title: '是否有效',
    cell: (h, { row }) => {
      return (
        <t-tag
          shape="round"
          theme={row.isActive === 0 ? 'danger' : 'success'}
          variant="light-outline"
        >
          {row.isActive === 0 ? '失效' : '有效'}
        </t-tag>
      );
    }, // 单选过滤配置
    filter: {
      // 过滤行中的列标题别名
      // label: '申请状态 A',
      type: 'single',
      list: [
        { label: '失败', value: 0 },
        { label: '有效', value: 1 },
      ],
      popupProps: {
        attach: () => document.body,
      },
    },
  },
  {
    colKey: 'numberInvitees',
    title: '邀请人数',
  },
  {
    colKey: 'overlay',
    title: '是否可叠加',
    cell: (h, { row }) => {
      return <b>{row.overlay === 1 ? '是' : '否'}</b>;
    },
    // eslint-disable-next-line consistent-return
    attrs: ({ row }) => {
      if (row.overlay === 1) {
        return {
          style: {
            color: 'rgb(117, 211, 175)',
          },
        };
      }
      if (row.overlay === 0) {
        return {
          style: {
            color: 'rgb(249, 62, 62)',
          },
        };
      }
    },
  },
  {
    colKey: 'code',
    title: '兑换码',
  },

  { colKey: 'startDate', title: '生效日期', sorter: true },
  { colKey: 'endDate', title: '结束日期', sorter: true },
  { colKey: 'createBy', title: '创建者' },
  { colKey: 'createTime', title: '创建时间', sorter: true },
  { colKey: 'updateBy', title: '修改者' },
  { colKey: 'updateTime', title: '修改时间', sorter: true },
  {
    colKey: 'operation',
    title: '操作',
    width: '150px',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => handleDelete(row.id)}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          <Edit // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
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
