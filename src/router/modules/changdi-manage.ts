import { BacktopRectangleIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/changdi-manage',
    name: 'changdi-manage',
    component: Layout,
    redirect: '/changdi-manage/changdi-manage',
    meta: { title: '开屏图片管理', icon: shallowRef(BacktopRectangleIcon), orderNo: 3 },

    children: [
      {
        path: 'changdi-manage',
        name: 'ChangDiManage',
        component: () => import('@/pages/changdi-manage/index.vue'),
        meta: { title: '开屏图片管理', hidden: true },
      },
    ],
  },
];
