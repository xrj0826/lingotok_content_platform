import { defineStore } from 'pinia';
import { MessagePlugin } from 'tdesign-vue-next';

// import { getUserInfo } from '@/api/user/guanliyuan';
import router from '@/router';
import { usePermissionStore } from '@/store';
import type { UserInfo } from '@/types/interface';

// import { login } from '../../api/user/guanliyuan';
import md5 from '../../utils/md5';
import { getUserInfo, login } from '@/api/user/passport';
import { onMounted } from 'vue';
import { useRouter } from "vue-router";
const router1 = useRouter();
const InitUserInfo: UserInfo = {
  name: '', // 用户名，用于展示在页面右上角头像处
  roles: [], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
};

export const useUserStore = defineStore('user', {
  state: () => ({
    // token: localStorage.getItem('accessToken'), // 默认token不走权限?
    token: localStorage.getItem('accessToken'),
    userInfo: { ...InitUserInfo },
    password: '',
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    async login(userInfo: Record<string, unknown>) {
      const data = {
        username: userInfo.account as string,
        // password: md5.md5(userInfo.password),
        password: userInfo.password, // 改为固定密码
        // uuid: '',
      };

      const res = await login(data);
      console.log(data);
      localStorage.setItem('accessToken', res.result.accessToken);
      localStorage.setItem('tabsvalue', '1');
      localStorage.setItem('bereviewedtabsvalue', '1');
      useUserStore().token = res.result.accessToken;
      // router.push('/userSetting')
      if (res.code === 200) {
        //  MessagePlugin.success('登录成功')
      } else {
        MessagePlugin.error('登录失败');
      }
    },
    async getUserInfo() {
      await getUserInfo().then((res) => {
        localStorage.setItem('userInfo', JSON.stringify(res.result));
        localStorage.setItem('userId', res.result.roleIds);
      }).catch((res) => {
        router1.push({ path: "/login" });
        console.log('请重新登录')

      });
    },
    async logout() {
      this.token = '';
      this.userInfo = { ...InitUserInfo };
    },
  },
  persist: {
    afterRestore: () => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes(['all']);
    },
    key: 'user',
    paths: ['token'],
  },
});
