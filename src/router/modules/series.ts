import { BooksIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/series',
    name: 'series',
    component: Layout,
    redirect: '/series/seriesManage',
    meta: {
      title: '视频合集管理',
      icon: shallowRef(BooksIcon),
      orderNo: 1,
    },
    children: [
      {
        path: 'seriesManage',
        name: 'SeriesManage',
        component: () => import('@/pages/admin-manange/index.vue'),
        meta: { title: '视频合集列表', hidden: true },
      },
    ],
  },
]; 