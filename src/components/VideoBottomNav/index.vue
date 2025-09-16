<template>
  <div class="video-bottom-nav">
    <div class="nav-container">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item"
        :class="{ active: isActive(item.path) }">
        <t-icon :name="item.icon" />
        <span>{{ item.name }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

interface Props {
  items?: NavItem[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [
    { name: '视频库', path: '/video-library/list', icon: 'video' },
    { name: '合集管理', path: '/series/seriesManage', icon: 'folder' },
    { name: '创建视频', path: '/video-generation/create', icon: 'add-circle' },
    { name: '我的', path: '/user/profile', icon: 'user' }
  ]
});

const route = useRoute();
const navItems = ref(props.items);

// 判断当前路由是否激活
const isActive = (path: string): boolean => {
  return route.path.startsWith(path);
};

</script>

<style scoped>
.video-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 999;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #3b82f6;
}

.nav-item.active {
  color: #3b82f6;
  font-weight: 500;
}

.nav-item .t-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 12px;
}
</style>
