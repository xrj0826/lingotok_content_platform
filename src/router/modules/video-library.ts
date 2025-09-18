import { shallowRef } from 'vue';
import Layout from '@/layouts/index.vue';
import { PlayCircleIcon } from 'tdesign-icons-vue-next';

export default [
  {
    path: '/video-library',
    name: 'videoLibrary',
    component: Layout,
    redirect: '/video-library/list',
    meta: {
      title: '视频库',
      icon: shallowRef(PlayCircleIcon),
      orderNo: 4,
      hidden: false
    },
    children: [
      {
        path: 'list',
        name: 'videoLibraryList',
        component: () => import('@/pages/video-library/index.vue'),
        meta: {
          title: '视频列表',
        },
      },
    ],
  },
];
