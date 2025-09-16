<template>
  <t-drawer v-model:visible="showSettingPanel" size="408px" :footer="false" header="页面配置" :close-btn="true"
    class="setting-drawer-container" @close-btn-click="handleCloseDrawer">
    <div class="setting-container">
      <t-form ref="form" :data="formData" label-align="left">
        <div class="setting-group-title">主题模式</div>
        <t-radio-group v-model="formData.mode">
          <div v-for="(item, index) in MODE_OPTIONS" :key="index" class="setting-layout-drawer">
            <div>
              <t-radio-button :key="index" :value="item.type">
                <component :is="getModeIcon(item.type)" />
              </t-radio-button>
              <p :style="{ textAlign: 'center', marginTop: '8px' }">{{ item.text }}</p>
            </div>
          </div>
        </t-radio-group>
        <div class="setting-group-title">主题色</div>
        <t-radio-group v-model="formData.brandTheme">
          <div v-for="(item, index) in DEFAULT_COLOR_OPTIONS" :key="index" class="setting-layout-drawer">
            <t-radio-button :key="index" :value="item" class="setting-layout-color-group">
              <color-container :value="item" />
            </t-radio-button>
          </div>
          <div class="setting-layout-drawer">
            <t-popup destroy-on-close expand-animation placement="bottom-right" trigger="click"
              :visible="isColoPickerDisplay" :overlay-style="{ padding: 0 }" @visible-change="onPopupVisibleChange">
              <template #content>
                <t-color-picker-panel :on-change="changeColor" :color-modes="['monochrome']" format="HEX"
                  :swatch-colors="[]" />
              </template>
              <t-radio-button :value="dynamicColor" class="setting-layout-color-group dynamic-color-btn">
                <color-container :value="dynamicColor" />
              </t-radio-button>
            </t-popup>
          </div>
        </t-radio-group>

        <div class="setting-group-title">导航布局</div>
        <t-radio-group v-model="formData.layout">
          <div v-for="(item, index) in LAYOUT_OPTION" :key="index" class="setting-layout-drawer">
            <t-radio-button :key="index" :value="item">
              <span class="layout-text">{{ item === 'side' ? '侧边布局' : item === 'top' ? '顶部布局' : '混合布局' }}</span>
            </t-radio-button>
          </div>
        </t-radio-group>

        <t-form-item v-show="formData.layout === 'mix'" label="分割菜单（混合模式下有效）" name="splitMenu">
          <t-switch v-model="formData.splitMenu" />
        </t-form-item>

        <t-form-item v-show="formData.layout === 'mix'" label="固定 Sidebar" name="isSidebarFixed">
          <t-switch v-model="formData.isSidebarFixed" />
        </t-form-item>

        <div class="setting-group-title">元素开关</div>
        <!-- <t-form-item v-show="formData.layout === 'side'" label="显示 Header" name="showHeader">
          <t-switch v-model="formData.showHeader" />
        </t-form-item> -->
        <t-form-item label="显示 Breadcrumbs" name="showBreadcrumb">
          <t-switch v-model="formData.showBreadcrumb" />
        </t-form-item>
        <t-form-item label="显示 Footer" name="showFooter">
          <t-switch v-model="formData.showFooter" />
        </t-form-item>
        <t-form-item label="使用 多标签Tab页" name="isUseTabsRouter">
          <t-switch v-model="formData.isUseTabsRouter"></t-switch>
        </t-form-item>
      </t-form>
      <div class="setting-info">
        <p>请复制后手动修改配置文件: /src/config/style.ts</p>
        <t-button theme="primary" variant="text" @click="handleCopy"> 复制配置项 </t-button>
      </div>
    </div>
  </t-drawer>
</template>
<script setup lang="ts">
import type { PopupVisibleChangeContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watchEffect } from 'vue';
import useClipboard from 'vue-clipboard3';

// 导入SVG图标组件
import SettingAutoIcon from '../assets/assets-setting-auto.svg';
import SettingDarkIcon from '../assets/assets-setting-dark.svg';
import SettingLightIcon from '../assets/assets-setting-light.svg';
import ColorContainer from '@/components/color/index.vue';
import Thumbnail from '@/components/thumbnail/index.vue';
import { DEFAULT_COLOR_OPTIONS } from '@/config/color';
import STYLE_CONFIG from '@/config/style';
import { useSettingStore } from '@/store';

const settingStore = useSettingStore();

const LAYOUT_OPTION = ['side', 'top', 'mix'];

const MODE_OPTIONS = [
  { type: 'light', text: '明亮' },
  { type: 'dark', text: '暗黑' },
  { type: 'auto', text: '跟随系统' },
];

const { toClipboard } = useClipboard();

const showSettingPanel = computed({
  get() {
    return settingStore.showSettingPanel;
  },
  set(value: boolean) {
    settingStore.updateConfig({
      showSettingPanel: value,
    });
  },
});

const formData = computed(() => {
  return settingStore.$state;
});

const isColoPickerDisplay = ref(false);
const dynamicColor = ref('');

const onPopupVisibleChange = (visible: boolean, context: PopupVisibleChangeContext) => {
  if (!visible && context.trigger === 'trigger-element-click') {
    isColoPickerDisplay.value = false;
  }
};

const changeColor = (hex: string) => {
  dynamicColor.value = hex;
  settingStore.updateConfig({
    brandTheme: hex,
  });
};

const handleCloseDrawer = () => {
  showSettingPanel.value = false;
};

const handleCopy = async () => {
  const text = JSON.stringify(formData.value, null, 2);
  try {
    await toClipboard(text);
    MessagePlugin.success('复制成功');
  } catch (e) {
    MessagePlugin.error('复制失败');
  }
};

const getModeIcon = (mode: string) => {
  if (mode === 'dark') {
    return SettingDarkIcon;
  }
  if (mode === 'auto') {
    return SettingAutoIcon;
  }
  return SettingLightIcon;
};

// 监听主题切换
watchEffect(() => {
  const { mode } = formData.value;
  const isDarkMode = mode === 'dark';

  if (mode === 'auto') {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    if (media.matches) {
      document.documentElement.setAttribute('theme-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('theme-mode');
    }
    return;
  }

  if (isDarkMode) {
    document.documentElement.setAttribute('theme-mode', 'dark');
  } else {
    document.documentElement.removeAttribute('theme-mode');
  }
});

// 监听主题色变化
watchEffect(() => {
  const { brandTheme } = formData.value;
  if (brandTheme) {
    document.documentElement.style.setProperty('--td-brand-color', brandTheme);
    document.documentElement.style.setProperty('--td-brand-color-hover', brandTheme);
    document.documentElement.style.setProperty('--td-brand-color-focus', brandTheme);
    document.documentElement.style.setProperty('--td-brand-color-active', brandTheme);
    document.documentElement.style.setProperty('--td-brand-color-disabled', brandTheme);
    document.documentElement.style.setProperty('--td-brand-color-light', `${brandTheme}20`);
    document.documentElement.style.setProperty('--td-brand-color-light-hover', `${brandTheme}40`);
  }
});

// 监听布局变化
watchEffect(() => {
  const { layout } = formData.value;
  const isSimpleLayout = layout === 'top';
  if (isSimpleLayout) {
    document.documentElement.setAttribute('layout', 'top');
  } else {
    document.documentElement.removeAttribute('layout');
  }
});

onMounted(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  if (formData.value.mode === 'auto') {
    if (media.matches) {
      document.documentElement.setAttribute('theme-mode', 'dark');
    }
  }
});
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.setting-drawer-container {
  :deep(.t-drawer__body) {
    padding: 0;
  }
}

.setting-container {
  height: 100%;
  padding: 0 var(--td-comp-paddingLR-xl);
  overflow-y: scroll;
}

.setting-group-title {
  font-size: var(--td-font-size-body-medium);
  color: var(--td-text-color-primary);
  padding: var(--td-comp-paddingTB-xl) 0 var(--td-comp-paddingTB-s);
  line-height: 22px;
  font-weight: 700;
}

.setting-layout-drawer {
  display: inline-flex;
  margin-right: var(--td-comp-margin-xxl);
  margin-bottom: var(--td-comp-margin-s);

  :deep(.t-radio-button) {
    width: 80px;
    height: 68px;
    padding: 0;
    border-radius: var(--td-radius-medium);
    overflow: hidden;
    border: 2px solid var(--td-component-stroke);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: none;

    &::before {
      display: none;
    }

    &.t-is-checked {
      border-color: var(--td-brand-color);
      color: var(--td-brand-color);
    }

    &:hover {
      border-color: var(--td-brand-color-light);
      color: var(--td-brand-color-light);
    }
  }

  .layout-text {
    font-size: var(--td-font-size-body-small);
    line-height: 22px;
  }

  .t-radio-button__label {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.setting-layout-color-group {
  width: 80px;
  height: 40px;
  padding: 0;
  font-size: 0;
  border-radius: var(--td-radius-medium);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &.t-is-checked {
    border: 1px solid var(--td-brand-color);
  }
}

.dynamic-color-btn {
  border: 1px solid var(--td-component-stroke);
}

.setting-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--td-comp-margin-xxl) 0;
  padding: 0 var(--td-comp-paddingLR-xl);
  color: var(--td-text-color-secondary);
  background-color: var(--td-bg-color-component);
  height: var(--td-comp-size-xxxl);
  border-radius: var(--td-radius-medium);
}
</style>