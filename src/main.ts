/* eslint-disable simple-import-sort/imports */
import TDesign from 'tdesign-vue-next';
import { createApp } from 'vue';
import ElementPlus from 'element-plus';

import App from './App.vue';
import router from './router';
import { store } from './store';
import { registerGlobalComponents } from './components';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';
import 'element-plus/dist/index.css';

const app = createApp(App);

app.use(ElementPlus);
app.use(TDesign);
app.use(store);
app.use(router);

// 注册自定义全局组件
registerGlobalComponents(app);

// 确保在store和router初始化之后再导入权限守卫
import './permission';

app.mount('#app');
