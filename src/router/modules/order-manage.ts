import { OrderDescendingIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/video/videoManage',
    name: 'video',
    component: Layout,
    meta: {
      title: '视频管理',
      icon: shallowRef(OrderDescendingIcon),
      orderNo: 2,
    },
    children: [
      {
        path: '',
        component: () => import('@/pages/order-manage/index.vue'),
      }
    ]
  },
];
