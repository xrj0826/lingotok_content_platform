import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/customerService',
    name: 'customerService',
    component: Layout,
    redirect: '/customerService/CommentManage',
    meta: { title: '客服中心', icon: shallowRef(DashboardIcon) },
    children: [
      {
        path: 'customerManage',
        name: 'CustomerManage',
        component: () => import('@/pages/customer-service/index.vue'),
        meta: { title: '客服管理' },
      },
    ],
  },
];
