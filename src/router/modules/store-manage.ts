import { BacktopRectangleIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/store-manage',
    name: 'store-manage',
    component: Layout,
    redirect: '/store-manage/store-manage',
    meta: { title: '门店管理', icon: shallowRef(BacktopRectangleIcon) },
    children: [
      {
        path: 'store-manage',
        name: 'StoreManage',
        component: () => import('@/pages/store-manage/index.vue'),
        meta: { title: '用户管理', hidden: true },
      },
    ],
  },
];
