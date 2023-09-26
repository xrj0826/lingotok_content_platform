import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/coupons-manage',
    name: 'coupons-manage',
    component: Layout,
    redirect: '/coupons-manage/coupons-manage',
    meta: { title: '优惠卷管理', icon: shallowRef(DashboardIcon) },
    children: [
      {
        path: 'coupons-manage',
        name: 'CouponsManage',
        component: () => import('@/pages/coupons-manage/index.vue'),
        meta: { title: '优惠卷管理', hidden: true },
      },
    ],
  },
];
