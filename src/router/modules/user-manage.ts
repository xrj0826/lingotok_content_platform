import { UserIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/user-manage',
    name: 'user-manage',
    component: Layout,
    redirect: '/user-manage/u-manage',
    meta: {
      title: '管理员设置',
      icon: shallowRef(UserIcon),
      orderNo: 4,
    },
    children: [
      {
        path: 'u-manage',
        name: 'UserManage',
        component: () => import('@/pages/user-manage/index.vue'),
        meta: { title: '管理员设置', hidden: true },
      },
    ],
  },
];
