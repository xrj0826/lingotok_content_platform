<template>
  <div>
    <template v-for="item in visibleMenuItems" :key="item.path">
      <t-menu-item style="overflow: visible" width="200px" :name="item.path" :value="item.path" :to="item.path">
        <template #icon>
          <component :is="menuIcon(item)" class="t-icon"></component>
        </template>
        <div style="padding: 2px 0; padding-right: 20px">
          {{ item.meta?.title }}
        </div>
      </t-menu-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { PropType } from 'vue';
import type { MenuRoute } from '@/types/interface';

// 扩展 MenuRoute 类型
interface ListItemType extends MenuRoute {
  icon?: string | { render: () => void };
}

const props = defineProps({
  navData: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
});

const route = useRoute();

// 监听用户名变化
const username = ref(localStorage.getItem('username'));
watch(() => localStorage.getItem('username'), (newUsername) => {
  username.value = newUsername;
});

// 过滤掉需要隐藏的菜单项
const visibleMenuItems = computed(() => {
  return props.navData.filter(item => !item.meta?.hidden);
});

const menuIcon = (item: ListItemType) => {
  if (!item.icon) {
    return '';
  }
  if (typeof item.icon === 'string') {
    return item.icon.includes('/') ? 'icon-logo' : `icon-${item.icon}`;
  }
  return item.icon.render();
};
</script>
