import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/table',
    name: 'table',
    component: Layout,
    redirect: '/table/template',
    meta: { title: '表格', icon: shallowRef(DashboardIcon) },

    children: [
      {
        path: 'template',
        name: 'TableTemplate',
        component: () => import('@/pages/table/index.vue'),
        meta: { title: '表格示例' },
      },
    ],
  },
];
