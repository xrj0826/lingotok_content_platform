/**
 * 全局组件注册
 */
import { App } from 'vue';
import YepzanVideoThumbnail from './YepzanVideoThumbnail.vue';
import SafeMediaDisplay from './SafeMediaDisplay.vue';
import FFmpegPreloader from './FFmpegPreloader.vue';
import FFmpegProgressOverlay from './FFmpegProgressOverlay.vue';
import AspectRatioImage from './AspectRatioImage.vue';
import DialogCharacterImage from './DialogCharacterImage.vue';
import DialogImagesEnhanced from './DialogImagesEnhanced.vue';
import ImagePreviewDialog from './ImagePreviewDialog.vue';

const components = [
  YepzanVideoThumbnail,
  SafeMediaDisplay,
  FFmpegPreloader,
  FFmpegProgressOverlay,
  AspectRatioImage,
  DialogCharacterImage,
  DialogImagesEnhanced,
  ImagePreviewDialog
];

export function registerGlobalComponents(app: App): void {
  components.forEach((component) => {
    app.component(component.name || component.__name, component);
  });
}

// 导出所有组件
export {
  YepzanVideoThumbnail,
  SafeMediaDisplay,
  FFmpegPreloader,
  FFmpegProgressOverlay,
  AspectRatioImage,
  DialogCharacterImage,
  DialogImagesEnhanced,
  ImagePreviewDialog
};









