import { CalendarIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/creditcard-manage',
    name: 'creditcard-manage',
    component: Layout,
    redirect: '/creditcard-manage/creditcard-manage',
    meta: { title: '储值卡管理', icon: shallowRef(CalendarIcon), orderNo: 5 },

    children: [
      {
        path: 'creditcard-manage',
        name: 'CreditCardManage',
        component: () => import('@/pages/creditcard-manage/index.vue'),
        meta: { title: '管理员储值卡管理' },
      },
      {
        path: 'userCard-manage',
        name: 'UserCardManage',
        component: () => import('@/pages/user-card-manage/index.vue'),
        meta: { title: '用户卡管理' },
      },
    ],
  },
];
