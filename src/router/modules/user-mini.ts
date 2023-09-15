import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/user-mini',
    name: 'user-mini',
    component: Layout,
    redirect: '/user-mini/template',
    meta: { title: '用户管理页', icon: shallowRef(DashboardIcon) },
    children: [
      {
        path: 'manage',
        name: 'UserMini',
        component: () => import('@/pages/user-mini/index.vue'),
        meta: { title: '用户管理' },
      },
    ],
  },
];
