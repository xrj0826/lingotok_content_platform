import { BooksIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/series/seriesManage',
    name: 'series',
    component: Layout,
    meta: {
      title: '视频合集管理',
      icon: shallowRef(BooksIcon),
      orderNo: 1,
    },
    children: [
      {
        path: '',
        component: () => import('@/pages/admin-manange/index.vue'),
      }
    ]
  },
]; 