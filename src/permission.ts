import 'nprogress/nprogress.css'; // progress bar style
import NProgress from 'nprogress'; // progress bar
import { MessagePlugin } from 'tdesign-vue-next';
import { getAllSeriesName } from '@/api/video';
import router from '@/router';

NProgress.configure({ showSpinner: false });

const whiteList = ['/login']; // 白名单列表

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  // 如果是访问登录页，直接放行
  if (to.path === '/login') {
    next();
    NProgress.done();
    return;
  }

  // 检查是否有token
  const hasToken = localStorage.getItem('accessToken');

  if (hasToken) {
    // 当进入 /admin/base 页面时调用接口
    if (to.path === '/admin/base') {
      try {
        const result = await getAllSeriesName();
        console.log('获取系列名称成功:', result);
      } catch (error) {
        MessagePlugin.error('获取系列名称失败');
        console.error('获取系列名称失败:', error);
      }
    }
    next();
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单中，直接进入
      next();
    } else {
      // 其他没有访问权限的页面将重定向到登录页面
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
