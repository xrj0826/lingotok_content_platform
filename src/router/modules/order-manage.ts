import { OrderDescendingIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/order',
    name: 'order',
    component: Layout,
    redirect: '/order/orderManage',
    meta: {
      title: '词汇书管理页',
      icon: shallowRef(OrderDescendingIcon),
      orderNo: 2,
    },
    children: [
      {
        path: 'orderManage',
        name: 'OrderManage',
        component: () => import('@/pages/order-manage/index.vue'),
        meta: { title: '词汇书管理', hidden: true },
      },
    ],
  },
];
