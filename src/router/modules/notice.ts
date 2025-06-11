import { RouteRecordRaw } from 'vue-router';
import { NotificationIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/notice/send',
    name: 'notice',
    component: Layout,
    meta: {
      title: '站内信',
      icon: shallowRef(NotificationIcon),
      orderNo: 100,
      hidden: localStorage.getItem('username') !== 'admin'  // 根据用户权限判断是否显示
    },
    children: [
      {
        path: '',
        component: () => import('@/pages/notice/send.vue'),
      },
    ],
  },
]; 