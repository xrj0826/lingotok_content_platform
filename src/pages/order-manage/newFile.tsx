import { log } from 'console';
import { get } from 'lodash';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { ref } from 'vue';

import { get2 } from '@/api/user/mendianguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import Edit from './components/Edit.vue';

export const columns: PrimaryTableCol[] = [
  // {
  //   colKey: 'row-select',
  //   type: 'multiple',
  // fixed: 'left',
  //   width: 50,
  // },

  {
    colKey: 'operation',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <Edit // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
        </t-space>
      );
    },
  },
  {
    colKey: 'deleteFlag',
    title: '删除标志',
    cell: (h, { row }) => {
      return <b>{row.deleteFlag === true ? '已删除' : '正常'}</b>;
    },
    // eslint-disable-next-line consistent-return
    attrs: ({ row }) => {
      if (row.deleteFlag === false) {
        return {
          style: {
            color: 'rgb(117, 211, 175)',
          },
        };
      }
      if (row.deleteFlag === true) {
        return {
          style: {
            color: 'rgb(249, 62, 62)',
          },
        };
      }
    },
  },
  {
    colKey: 'orderState',
    title: '订单状态',
    cell: (h, { row }) => {
      return <b>{row.deleteFlag === true ? '待使用' : '使用中'}</b>;
    },
    // eslint-disable-next-line consistent-return
    attrs: ({ row }) => {
      if (row.deleteFlag === false) {
        return {
          style: {
            color: 'rgb(117, 211, 175)',
          },
        };
      }
      if (row.deleteFlag === true) {
        return {
          style: {
            color: 'rgb(249, 62, 62)',
          },
        };
      }
    },
  },
  { colKey: 'orderState', title: '订单状态', width: '200px' },
  { colKey: 'orderPrice', title: '订单价格' },
  { colKey: 'orderType', title: '订单类型（枚举' },
  { colKey: 'paymentMethods', title: '支付方式' },
  { colKey: 'share', title: '分享次数' },
  {
    colKey: 'venueId',
    title: '场地id',
    render(h, { row }) {
      // 调用 fetchStoreName 方法获取 storeName
      const storeNamePromise = getStoreName(row.venueId);
      // 使用 storeNamePromise 来渲染单元格
      return (
        <b>
          {h('span', {}, [
            storeNamePromise.then((storeName) => {
              return storeName;
            }),
          ])}
        </b>
      );
    },
  },
  { colKey: 'phoneNumber', title: '手机号码', width: '200px' },
  { colKey: 'orderDate', title: '预约日期', width: '200px' },
  { colKey: 'orderSt', title: '预约开始时间', width: '200px' },
  { colKey: 'orderEd', title: '预约结束时间', width: '200px' },
  { colKey: 'startTime', title: '用户进场时间', width: '200px' },
  { colKey: 'endTime', title: '用户离开时间', width: '200px' },
  { colKey: 'qrCode', title: '二维码' },
  // { colKey: 'createBy', title: '创建者' },
  // { colKey: 'createTime', title: '创建时间', width: '200px' },
  // { colKey: 'updateBy', title: '修改者', width: '200px' },
  // { colKey: 'updateTime', title: '修改时间', width: '200px' },
  // { colKey: 'userId', title: '门店id', width: '200px' },
];
async function getStoreName(storeId) {
  const res = await get2(storeId);
  return res.result.storeName;
}
for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}
const store = useRenewDataStore();

// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize }); // 使用pinia里面的分页请求
};
