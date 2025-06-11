import { VideoIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/user-videos/list',
    name: 'userVideos',
    component: Layout,
    meta: {
      title: '用户视频',
      icon: shallowRef(VideoIcon),
      orderNo: 3,
      hidden: localStorage.getItem('username') !== 'admin'  // 根据用户权限判断是否显示
    },
    children: [
      {
        path: '',
        component: () => import('@/pages/user-videos/index.vue'),
      },
    ],
  },
]; 