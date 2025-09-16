import { UserIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      title: '登录页',
      icon: shallowRef(UserIcon),
      hidden: true
    },
  },
]; 