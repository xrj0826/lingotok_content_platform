import { RootListIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/announcement',
    name: 'announcement',
    component: Layout,
    redirect: '/announcement/announcement-change',
    meta: {
      title: '公告管理',
      icon: shallowRef(RootListIcon),
    },
    orderNo: 10,
    children: [
      {
        path: 'announcement-change',
        name: 'Announcement',
        component: () => import('@/pages/announcement/index.vue'),
        meta: { title: '公告更改', hidden: true },
      },
    ],
  },
];
