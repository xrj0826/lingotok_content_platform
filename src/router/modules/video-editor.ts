import { shallowRef } from 'vue';
import Layout from '@/layouts/index.vue';
import { EditIcon } from 'tdesign-icons-vue-next';

export default [
  {
    path: '/video-editor',
    name: 'videoEditor',
    component: Layout,
    redirect: '/video-editor/index',
    meta: {
      title: '视频编辑',
      icon: shallowRef(EditIcon),
      orderNo: 3,
      hidden: true
    },
    children: [
      {
        path: 'index',
        name: 'videoEditorIndex',
        component: () => import('@/pages/video-editor/index.vue'),
        meta: {
          title: '视频编辑工具',
        },
      },
      {
        path: 'test',
        name: 'videoEditorTest',
        component: () => import('@/pages/video-editor/test-ffmpeg.vue'),
        meta: {
          title: 'FFmpeg测试',
          hidden: true, // 隐藏在导航中
        },
      },
      {
        path: 'validation',
        name: 'ffmpegValidation',
        component: () => import('@/pages/video-editor/ffmpeg-validation.vue'),
        meta: {
          title: 'FFmpeg文件验证',
          hidden: true, // 隐藏在导航中
        },
      },
    ],
  },
];
