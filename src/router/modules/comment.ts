import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/comment',
    name: 'comment',
    component: Layout,
    redirect: '/comment/Comment-manage',
    meta: { title: '评论管理', icon: shallowRef(DashboardIcon) },
    children: [
      {
        path: 'comment-manage',
        name: 'CommentManage',
        component: () => import('@/pages/comment/index.vue'),
        meta: { title: '评论管理', hidden: true },
      },
    ],
  },
];
