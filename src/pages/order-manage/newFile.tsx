import dayjs from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

// import { ref } from 'vue';
import { delete10 } from '@/api/user/dingdanguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import Edit from './components/Edit.vue';

// const onOrderStateChange = async (val, ctx) => {
//   console.log('订单状态过滤', val, ctx);
//   const res = await store.renewData(
//     { pageNumber: store.pagination.current, pageSize: store.pagination.pageSize },
//     null,
//     { orderState: val },
//   );
//   console.log(res);
// };
// const onOrderTypeChange = async (val, ctx) => {
//   console.log('订单状态过滤', val, ctx);
//   const res = await store.renewData(
//     { pageNumber: store.pagination.current, pageSize: store.pagination.pageSize },
//     null,
//     { orderType: val },
//   );
//   console.log(res);
// };
export const columns: PrimaryTableCol[] = [
  // {
  //   colKey: 'row-select',
  //   type: 'multiple',
  // fixed: 'left',
  //   width: 50,
  // },

  // {
  //   colKey: 'deleteFlag',
  //   title: '删除标志', // 单选过滤配置
  //   filter: {
  //     // 过滤行中的列标题别名
  //     // label: '申请状态 A',
  //     type: 'single',
  //     list: [
  //       { label: '正常', value: 0 },
  //       { label: '已删除', value: 1 },
  //     ],
  //     resetValue: '',
  //     // props: {
  //     //   placeholder: '输入关键词过滤',
  //     //   onChange: onOrderStateChange,
  //     // },
  //     // 是否显示重置取消按钮，一般情况不需要显示
  //     showConfirmAndReset: true,
  //   },
  //   cell: (h, { row }) => {
  //     let cellValue;

  //     // 使用 switch 语句检查 row 的值
  //     switch (row.deleteFlag) {
  //       case false:
  //         cellValue = <span>正常</span>;
  //         break;
  //       case true:
  //         cellValue = <span>已删除</span>;
  //         break;
  //       default:
  //         cellValue = <span>正常</span>;
  //         break;
  //     }

  //     return cellValue;
  //   },
  // eslint-disable-next-line consistent-return
  // attrs: ({ row }) => {
  //   if (row.deleteFlag === false) {
  //     return {
  //       style: {
  //         color: 'rgb(117, 211, 175)',
  //       },
  //     };
  //   }
  //   if (row.deleteFlag === true) {
  //     return {
  //       style: {
  //         color: 'rgb(249, 62, 62)',
  //       },
  //     };
  //   }
  // },
  // },
  // {
  //   colKey: 'orderState',
  //   title: '订单状态',
  //   cell: (h, { row }) => {
  //     return <b>{row.deleteFlag === true ? '待使用' : '使用中'}</b>;
  //   },
  //   // eslint-disable-next-line consistent-return
  //   attrs: ({ row }) => {
  //     if (row.deleteFlag === false) {
  //       return {
  //         style: {
  //           color: 'rgb(117, 211, 175)',
  //         },
  //       };
  //     }
  //     if (row.deleteFlag === true) {
  //       return {
  //         style: {
  //           color: 'rgb(249, 62, 62)',
  //         },
  //       };
  //     }
  //   },
  // },
  {
    colKey: 'orderState',
    title: '订单状态',
    width: '200px', // 输入框过滤配置
    cell: (h, { row }) => {
      let cellValue;

      // 使用 switch 语句检查 row 的值
      switch (row.orderState) {
        case 'IN_USE':
          cellValue = <span>使用中</span>;
          break;
        case 'WAITING_TO_USE':
          cellValue = <span>待使用</span>;
          break;
        case 'USED':
          cellValue = <span>已使用</span>;
          break;
        case 'EXPIRED':
          cellValue = <span style={{ color: 'rgb(900, 1, 10)' }}>已失效</span>;
          break;
        case 'PAYMENT_SUCCESSFUL':
          cellValue = <span style={{ color: 'rgb(1, 179, 1)' }}>支付成功</span>;
          break;
        case 'REFUNDED':
          cellValue = <span>退款</span>;
          break;
        default:
          cellValue = <span>null</span>;
          break;
      }

      return cellValue;
    },
    // 单选过滤配置
    filter: {
      // 过滤行中的列标题别名
      // label: '申请状态 A',
      type: 'single',
      list: [
        { label: '使用中', value: 'IN_USE' },
        { label: '待使用', value: 'WAITING_TO_USE' },
        { label: '已使用', value: 'USED' },
        { label: '已失效', value: 'EXPIRED' },
        { label: '退款', value: 'REFUNDED' },
        { label: '支付成功', value: 'PAYMENT_SUCCESSFUL' },
      ],
      resetValue: '',
      // props: {
      //   placeholder: '输入关键词过滤',
      //   onChange: onOrderStateChange,
      // },
      // 是否显示重置取消按钮，一般情况不需要显示
      showConfirmAndReset: true,
    },
  },
  { colKey: 'orderPrice', title: '订单价格', sorter: true },
  {
    colKey: 'orderType',
    title: '订单类型', // 单选过滤配置
    cell: (h, { row }) => {
      let cellValue;

      // 使用 switch 语句检查 row 的值
      switch (row.orderType) {
        case 'RENTAL':
          cellValue = <span>租场</span>;
          break;
        case 'TICKET':
          cellValue = <span>门票</span>;
          break;
        case 'TIMER':
          cellValue = <span>赛事</span>;
          break;
        case 'EVENT':
          cellValue = <span>已失效</span>;
          break;
        default:
          cellValue = <span>null</span>;
          break;
      }

      return cellValue;
    },
    filter: {
      // 过滤行中的列标题别名
      // label: '申请状态 A',
      type: 'single',
      list: [
        { label: '租场', value: 'RENTAL' },
        { label: '门票', value: 'TICKET' },
        { label: '赛事', value: 'TIMER' },
        { label: '已失效', value: 'EVENT' },
      ],
      resetValue: '',
      // props: {
      //   placeholder: '输入关键词过滤',
      //   onChange: onOrderTypeChange,
      // },
      // 是否显示重置取消按钮，一般情况不需要显示
      showConfirmAndReset: true,
    },
  },
  {
    colKey: 'paymentMethods',
    title: '支付方式',
    filter: {
      // 过滤行中的列标题别名
      // label: '申请状态 A',
      type: 'single',
      list: [
        { label: '微信支付', value: 'WECHAT' },
        { label: '储值卡支付', value: 'CARD' },
      ],
      resetValue: '',
      // props: {
      //   placeholder: '输入关键词过滤',
      //   onChange: onOrderTypeChange,
      // },
      // 是否显示重置取消按钮，一般情况不需要显示
      showConfirmAndReset: true,
    },
    cell: (h, { row }) => {
      let cellValue;

      // 使用 switch 语句检查 row 的值
      switch (row.paymentMethods) {
        case 'WECHAT':
          cellValue = <span>微信支付</span>;
          break;
        case 'CARD':
          cellValue = <span>储值卡支付</span>;
          break;
        default:
          cellValue = <span>null</span>;
          break;
      }

      return cellValue;
    },
  },
  { colKey: 'share', title: '分享次数' },
  {
    colKey: 'venueId',
    title: '场地id',
    // render(h, { row }) {
    //   // 调用 fetchStoreName 方法获取 storeName
    //   const storeNamePromise = getStoreName(row.venueId);
    //   // 使用 storeNamePromise 来渲染单元格
    //   return (
    //     <b>
    //       {h('span', {}, [
    //         storeNamePromise.then((storeName) => {
    //           return storeName;
    //         }),
    //       ])}
    //     </b>
    //   );
    // },
  },
  {
    colKey: 'phoneNumber',
    title: '手机号码',
    width: '200px', // 输入框过滤配置
    filter: {
      type: 'input',

      // 文本域搜索
      // component: Textarea,

      resetValue: '',
      // 按下 Enter 键时也触发确认搜索
      confirmEvents: ['onEnter'],
      props: {
        placeholder: '请精确输入手机号',
      },
      // 是否显示重置取消按钮，一般情况不需要显示
      showConfirmAndReset: true,
    },
  },
  {
    colKey: 'orderDate',
    title: '预约日期',
    width: '150px',
    cell: (h, { row }) => {
      let cellValue;
      const dateObj = dayjs(row.orderDate);
      const timeString = dateObj.format('YYYY-MM-DD');
      if (timeString === 'Invalid Date') {
        cellValue = <span></span>;
      } else cellValue = <span>{timeString}</span>;
      return cellValue;
    },
  },
  {
    colKey: 'orderSt',
    title: '预约开始时间',
    width: '200px',
    cell: (h, { row }) => {
      let cellValue;
      const dateObj = dayjs(row.orderSt);
      const timeString = dateObj.format('HH:mm:ss');
      if (timeString === 'Invalid Date') {
        cellValue = <span></span>;
      } else cellValue = <span>{timeString}</span>;
      return cellValue;
    },
  },
  {
    colKey: 'orderEd',
    title: '预约结束时间',
    width: '200px',
    cell: (h, { row }) => {
      let cellValue;
      const dateObj = dayjs(row.orderEd);
      const timeString = dateObj.format('HH:mm:ss');
      if (timeString === 'Invalid Date') {
        cellValue = <span></span>;
      } else cellValue = <span>{timeString}</span>;
      return cellValue;
    },
  },
  { colKey: 'startTime', title: '用户进场时间', width: '200px' },
  { colKey: 'endTime', title: '用户离开时间', width: '200px' },
  { colKey: 'createTime', title: '创建时间', width: '200px' },
  {
    colKey: 'operation',
    title: '操作',
    fixed: 'right',
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
  // { colKey: 'qrCode', title: '二维码' },
  // { colKey: 'createBy', title: '创建者' },
  // { colKey: 'updateBy', title: '修改者', width: '200px' },
  // { colKey: 'updateTime', title: '修改时间', width: '200px' },
  // { colKey: 'userId', title: '门店id', width: '200px' },
];
// async function getStoreName(storeId) {
//   const res = await get2(storeId);
//   return res.result.storeName;
// }

const handleDelete = async (id) => {
  try {
    console.log('删除的id', id);
    // 参数要求是个对象
    const params = {
      id,
    };
    //
    const res = await delete10(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');
    store.renewData(
      { pageNumber: store.pagination.current, pageSize: store.pagination.pageSize },
      null,
      store.querySave,
    ); // 使用pinia里面的分页请求
  } catch (error) {
    console.log(error);
  }
};
for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}
const store = useRenewDataStore();

// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize }, null, store.querySave); // 使用pinia里面的分页请求
};
