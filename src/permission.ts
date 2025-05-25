import 'nprogress/nprogress.css'; // progress bar style
import NProgress from 'nprogress'; // progress bar
import { MessagePlugin } from 'tdesign-vue-next';

import router from '@/router';
import { getAllSeriesName } from '@/api/video';

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  // 当进入 /admin/base 页面时调用接口
  if (to.path === '/admin/base') {
    try {
      const result = await getAllSeriesName();
      console.log('获取系列名称成功:', result);
      // 这里你可以将结果存储到 store 中或进行其他处理
    } catch (error) {
      MessagePlugin.error('获取系列名称失败');
      console.error('获取系列名称失败:', error);
    }
  }

  next();
});

router.afterEach(() => {
  NProgress.done();
});
