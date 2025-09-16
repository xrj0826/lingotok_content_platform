import { shallowRef } from 'vue';
import Layout from '@/layouts/index.vue';
import { VideoIcon, EditIcon } from 'tdesign-icons-vue-next';

export default [
  {
    path: '/video-generation',
    name: 'videoGeneration',
    component: Layout,
    redirect: '/video-generation/create',
    meta: {
      title: '视频生成',
      icon: shallowRef(VideoIcon),
      orderNo: 2,
      hidden: false
    },
    children: [
      {
        path: 'create',
        name: 'videoGenerationCreate',
        component: () => import('@/pages/video-generation/index.vue'),
        meta: {
          title: '创建视频',
        },
      },
      {
        path: 'dialogue',
        name: 'dialogueVideoGeneration',
        component: () => import('@/pages/video-generation/dialogue-video.vue'),
        meta: {
          title: '对话视频',
        },
      },
      /* 暂时注释掉缺失的组件
      {
        path: 'enhanced-dialogue',
        name: 'enhancedDialogueVideoGeneration',
        component: () => import('@/pages/video-generation/enhanced-dialogue-video.vue'),
        meta: {
          title: '增强对话视频',
        },
      },
      */
      {
        path: 'word',
        name: 'wordVideoGeneration',
        component: () => import('@/pages/video-generation/word-video.vue'),
        meta: {
          title: '单词视频',
          hiddenBreadcrumb: true,
        },
      },
      {
        path: 'list',
        name: 'videoGenerationList',
        component: () => import('@/pages/video-generation/list.vue'),
        meta: {
          title: '视频列表',
        },
      },
      {
        path: 'storage',
        name: 'videoStorage',
        component: () => import('@/pages/video-generation/video-storage.vue'),
        meta: {
          title: '视频存储库',
        },
      },
      {
        path: 'simple',
        name: 'simpleVideoGeneration',
        component: () => import('@/pages/video-generation/index-simple.vue'),
        meta: {
          title: '简单生成',
        },
      },
    ],
  },
];