import { UsergroupIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/admin',
    name: 'admin',
    component: Layout,
    redirect: '/admin/admin-manange',
    meta: {
      title: '管理员管理',
      icon: shallowRef(UsergroupIcon),
    },
    children: [
      {
        path: 'admin-manange',
        name: 'AdminManage',
        component: () => import('@/pages/admin-manange/index.vue'),
        meta: { title: '管理员管理', hidden: true },
      },
    ],
  },
];
