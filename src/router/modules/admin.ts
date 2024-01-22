import { BooksIcon, UsergroupIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/admin',
    name: 'admin',
    component: Layout,
    redirect: '/admin/base',
    meta: {
      title: '读物管理',
      icon: shallowRef(BooksIcon),
      orderNo: 1,
    },
    children: [
      {
        path: 'base',
        name: 'AdminManage',
        component: () => import('@/pages/admin-manange/index.vue'),
        meta: { title: '读物管理', hidden: true },
      },
    ],
  },
];
