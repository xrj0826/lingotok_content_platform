<template>
  <div :class="sideNavCls">
    <t-menu :class="menuCls" :theme="theme" :value="currentPath" :collapsed="collapsed" :default-value="currentPath">
      <!--      <template #logo>-->
      <!--        <span v-if="showLogo" :class="`${prefix}-side-nav-logo-wrapper`" @click="goHome">-->
      <!--          <component :is="getLogo()"  :class="`${prefix}-side-nav-logo-${collapsed ? 't' : 'tdesign'}-logo`" />-->
      <!--          <div style="font-size: 22px; font-weight: 700;  line-height: 50px; margin-left: 10px ">智能球馆</div>-->
      <!--        </span>-->
      <!--      </template>-->
      <span :class="`${prefix}-side-nav-logo-wrapper`" @click="goHome">
        <!-- <component
          :is="getLogo()"
          style="transform: translateX(-30px)"
          :class="`${prefix}-side-nav-logo-${collapsed ? 't' : 'tdesign'}-logo`"
        /> -->
        <div v-if="!collapsed"
          style="font-size: 24px; font-weight: 700; line-height: 50px; margin-left: -20px; margin-right: 16px">
          <!-- 高校体育管理系统 -->
          内容管理系统
        </div>
      </span>
      <!--      <div style="display: flex; ">-->
      <!--        <img style="height: 50px; " src="/src/assets/assets-logo-full.svg">-->
      <!--      </div>-->
      <menu-content :nav-data="menu" />
      <template #operations>
        <span class="version-container"> {{ !collapsed ? '内容管理平台' : '' }} </span>
      </template>
    </t-menu>
    <div :class="`${prefix}-side-nav-placeholder${collapsed ? '-hidden' : ''}`"></div>
  </div>
</template>

<script setup lang="ts">
import union from 'lodash/union';
import type { PropType } from 'vue';
import { computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import AssetLogoFull from '@/assets/assets-logo-full.svg?component';
import AssetLogo from '@/assets/assets-t-logo.svg?component';
import { prefix } from '@/config/global';
import { getActive, getRoutesExpanded } from '@/router';
import { useSettingStore } from '@/store';
import type { MenuRoute } from '@/types/interface';

import MenuContent from './MenuContent.vue';

const MIN_POINT = 992 - 1;

const props = defineProps({
  menu: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
  showLogo: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  isFixed: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  layout: {
    type: String as PropType<string>,
    default: '',
  },
  headerHeight: {
    type: String as PropType<string>,
    default: '64px',
  },
  theme: {
    type: String as PropType<'light' | 'dark'>,
    default: 'light',
  },
  isCompact: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
});

const router = useRouter();
const route = useRoute();
const settingStore = useSettingStore();

const collapsed = computed(() => useSettingStore().isSidebarCompact);

const currentPath = computed(() => route.path);

const defaultExpanded = computed(() => {
  const path = currentPath.value;
  const parentPath = path.substring(0, path.lastIndexOf('/'));
  const expanded = getRoutesExpanded();
  return union(expanded, parentPath === '' ? [] : [parentPath]);
});

// 监听路由变化，确保菜单选中状态更新
watch(
  () => route.path,
  () => {
    // 强制更新active值
    currentPath.value;
  }
);

const sideNavCls = computed(() => {
  const { isCompact } = props;
  return [
    `${prefix}-sidebar-layout`,
    {
      [`${prefix}-sidebar-compact`]: isCompact,
    },
  ];
});

const menuCls = computed(() => {
  const { showLogo, isFixed, layout } = props;
  return [
    `${prefix}-side-nav`,
    {
      [`${prefix}-side-nav-no-logo`]: !showLogo,
      [`${prefix}-side-nav-no-fixed`]: !isFixed,
      [`${prefix}-side-nav-mix-fixed`]: layout === 'mix' && isFixed,
    },
  ];
});

const autoCollapsed = () => {
  const isCompact = window.innerWidth <= MIN_POINT;
  settingStore.updateConfig({
    isSidebarCompact: isCompact,
  });
};

onMounted(() => {
  autoCollapsed();
  window.onresize = () => {
    autoCollapsed();
  };
});

const goHome = () => {
  router.push('/');
};

const getLogo = () => {
  if (collapsed.value) return AssetLogo;
  return AssetLogoFull;
};
</script>

<style lang="less" scoped></style>
