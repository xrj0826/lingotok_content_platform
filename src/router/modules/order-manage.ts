import { OrderDescendingIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/video',
    name: 'video',
    component: Layout,
    redirect: '/video/videoManage',
    meta: {
      title: '视频管理',
      icon: shallowRef(OrderDescendingIcon),
      orderNo: 2,
    },
    children: [
      {
        path: 'videoManage',
        name: 'VideoManage',
        component: () => import('@/pages/order-manage/index.vue'),
        meta: { title: '视频管理', hidden: true },
      },
    ],
  },
];
