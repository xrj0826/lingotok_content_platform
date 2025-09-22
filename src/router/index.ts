import uniq from 'lodash/uniq';
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import notice from './modules/notice';

const env = import.meta.env.MODE || 'development';

// 导入homepage相关固定路由
const homepageModules = import.meta.glob('./modules/**/homepage.ts', { eager: true });

// 导入modules非homepage相关固定路由
const fixedModules = import.meta.glob('./modules/**/!(homepage).ts', { eager: true });

// 其他固定路由
const defaultRouterList: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/series/seriesManage',
    meta: {
      hidden: true, // 隐藏在导航菜单中
    },
  },
  // 移除通配符路由，改为在路由错误处理中统一处理未匹配路径
];

// 存放固定路由
export const homepageRouterList: Array<RouteRecordRaw> = mapModuleRouterList(homepageModules);
export const fixedRouterList: Array<RouteRecordRaw> = mapModuleRouterList(fixedModules);

export const allRoutes = [...fixedRouterList, ...homepageRouterList, ...defaultRouterList];
console.log('allRoutes', allRoutes)

// 固定路由模块转换为路由
export function mapModuleRouterList(modules: Record<string, unknown>): Array<RouteRecordRaw> {
  const routerList: Array<RouteRecordRaw> = [];
  Object.keys(modules).forEach((key) => {
    // @ts-ignore
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

export const getRoutesExpanded = () => {
  const expandedRoutes: Array<string> = [];

  fixedRouterList.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child: RouteRecordRaw) => {
          expandedRoutes.push(item.path);
          expandedRoutes.push(`${item.path}/${child.path}`);
        });
    }
  });
  return uniq(expandedRoutes);
};

// 获取当前激活的路由路径
export const getActive = (maxLevel = 3): string => {
  const route = router.currentRoute.value;
  if (!route.path) {
    return '';
  }
  return route.path;  // 直接返回完整路径
};

const router = createRouter({
  // 修改为hash模式，解决路由404问题
  history: createWebHashHistory(env === 'site' ? '/starter/vue-next/' : import.meta.env.VITE_BASE_URL),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

// 路由错误处理，防止直接访问路由时出现404
router.onError((error) => {
  console.error('路由错误:', error);
  // 如果是找不到组件，重定向到视频库页面
  if (error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Failed to resolve module') ||
    error.message.includes('Unexpected token')) {
    router.push('/video-library/list');
  }
});

// 全局导航守卫，处理未匹配的路径
router.beforeEach((to, from, next) => {
  // 检查路由是否存在
  const matchedRoutes = router.getRoutes().filter(route => 
    route.path === to.path || 
    (route.path.includes(':') && to.matched.length > 0)
  );
  
  if (matchedRoutes.length === 0) {
    console.warn('路由未找到，重定向到视频库页面:', to.path);
    next('/video-library/list');
  } else {
    next();
  }
});

export default router;
