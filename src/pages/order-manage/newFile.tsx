import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  { colKey: 'createBy', title: '创建者' },
  { colKey: 'createTime', title: '创建时间', width: '200px' },
  { colKey: 'updateBy', title: '修改者', width: '200px' },
  { colKey: 'updateTime', title: '修改时间', width: '200px' },
  { colKey: 'userId', title: '门店id', width: '200px' },
  { colKey: 'orderDate', title: '预约日期', width: '200px' },
  { colKey: 'orderSt', title: '预约开始时间', width: '200px'},
  { colKey: 'orderEd', title: '预约结束时间', width: '200px' },
  { colKey: 'orderState', title: '订单状态', width: '200px' },
  { colKey: 'orderPrice', title: '订单价格' },
  { colKey: 'orderType', title: '订单类型（枚举）' },
  { colKey: 'paymentMethods', title: '支付方式' },
  { colKey: 'share', title: '分享次数' },
  { colKey: 'venueId', title: '场地id' },
  { colKey: 'phoneNumber', title: '手机号码' },
  { colKey: 'qrCode', title: '二维码' },
  { colKey: 'startTime', title: '用户进场时间' },
  { colKey: 'endTime', title: '用户离开时间' },
];
