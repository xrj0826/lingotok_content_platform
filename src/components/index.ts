/**
 * 全局组件注册
 */
import { App } from 'vue';
import YepzanVideoThumbnail from './YepzanVideoThumbnail.vue';
import SafeMediaDisplay from './SafeMediaDisplay.vue';

const components = [
  YepzanVideoThumbnail,
  SafeMediaDisplay
];

export function registerGlobalComponents(app: App): void {
  components.forEach((component) => {
    app.component(component.name || component.__name, component);
  });
}

// 导出所有组件
export {
  YepzanVideoThumbnail,
  SafeMediaDisplay
};

