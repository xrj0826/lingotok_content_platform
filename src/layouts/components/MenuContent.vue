<template>
  <div>
    <template v-for="item in list" :key="item.path">
      <template v-if="!item.children || !item.children.length || item.meta?.single">
        <t-menu-item v-if="getHref(item)" :name="item.path" :value="getPath(item)" @click="openHref(getHref(item)[0])">
          <template #icon>
            <component :is="menuIcon(item)" class="t-icon"></component>
          </template>
          {{ item.title }}
        </t-menu-item>
        <t-menu-item style="overflow:visible;" width="200px" v-else :name="item.path" :value="getPath(item)" :to="item.path">
          <template #icon>
            <component :is="menuIcon(item)" class="t-icon"></component>
          </template>
          <div style=" padding: 2px 0; padding-right: 20px;">
            <t-badge v-if="item.title === '在线接入'" :count="unreadCount">
              <div>
                {{ item.title }}
              </div>
            </t-badge>
            <div v-else>
              {{ item.title }}
            </div>
          </div>
        </t-menu-item>
      </template>
      <t-submenu v-else :name="item.path" :value="item.path" :title="item.title">
        <template #icon>
          <component :is="menuIcon(item)" class="t-icon"></component>
        </template>
        <menu-content v-if="item.children" :nav-data="item.children" />
      </t-submenu>
    </template>
  </div>
</template>
<script setup lang="tsx">
import type { PropType } from 'vue';
import {computed, onMounted, ref} from 'vue';

import { getActive } from '@/router';
import type { MenuRoute } from '@/types/interface';
import {SDK_APPID} from "@/constants";
import TIM from "tim-js-sdk";
import {getUserSignature} from "@/api/common/imUser";

type ListItemType = MenuRoute & { icon?: string };

const props = defineProps({
  navData: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
});
const active = computed(() => getActive());

const list = computed(() => {
  const { navData } = props;
  return getMenuList(navData);
});

const menuIcon = (item: ListItemType) => {
  if (typeof item.icon === 'string') return <t-icon name={item.icon} />;
  const RenderIcon = item.icon;
  return RenderIcon;
};

const getMenuList = (list: MenuRoute[], basePath?: string): ListItemType[] => {
  if (!list || list.length === 0) {
    return [];
  }
  // 如果meta中有orderNo则按照从小到大排序
  list.sort((a, b) => {
    return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
  });
  return list
    .map((item) => {
      const path = basePath && !item.path.includes(basePath) ? `${basePath}/${item.path}` : item.path;

      return {
        path,
        title: item.meta?.title,
        icon: item.meta?.icon,
        children: getMenuList(item.children, path),
        meta: item.meta,
        redirect: item.redirect,
      };
    })
    .filter((item) => item.meta && item.meta.hidden !== true);
};

const getHref = (item: MenuRoute) => {
  const { frameSrc, frameBlank } = item.meta;
  if (frameSrc && frameBlank) {
    return frameSrc.match(/(http|https):\/\/([\w.]+\/?)\S*/);
  }
  return null;
};

const getPath = (item: ListItemType) => {
  const activeLevel = active.value.split('/').length;
  const pathLevel = item.path.split('/').length;
  if (activeLevel > pathLevel && active.value.startsWith(item.path)) {
    return active.value;
  }

  if (active.value === item.path) {
    return active.value;
  }

  return item.meta?.single ? item.redirect : item.path;
};

const openHref = (url: string) => {
  window.open(url);
};
const chatId = ref("SERVICES" + localStorage.getItem('userId'))
const options = {
  SDKAppID: Number(SDK_APPID), // 接入时需要将0替换为您的云通信应用的 SDKAppID，类型为 Number
};
const chat = TIM.create(options);
const usersig = ref('')

const getUserSig = async () => {
  const data = {
    userId: chatId.value,
  };
  await getUserSignature(data).then(async (res) => {
    usersig.value = res.result;
    await chatLogin();
  });
};
const chatLogin = async () => {
  chat
    .login({ userID: chatId.value, userSig: usersig.value })
    .then(function (imResponse) {
      console.log('登录成功', imResponse.data); // 登录成功
      chat.on(TIM.EVENT.SDK_READY, getMark);
      if (imResponse.data.repeatLogin === true) {
        getMark();
        // 标识账号已登录，本次登录操作为重复登录。
        console.log(imResponse.data.errorInfo);
      }
    })
    .catch(function (imError) {
      console.warn('login error:', imError); // 登录失败的相关信息
    });
};
const unreadCount = ref('0')
const getMark = (()=>{
  let totalUnreadCount = chat.getTotalUnreadMessageCount();
  let onTotalUnreadMessageCountUpdated = function(event) {
    unreadCount.value = event.data
    console.log('未读变化',event.data); // 当前单聊和群聊会话的未读总数
  };
  chat.on(TIM.EVENT.TOTAL_UNREAD_MESSAGE_COUNT_UPDATED, onTotalUnreadMessageCountUpdated);
  unreadCount.value = String(totalUnreadCount)
  console.log('未读总数', totalUnreadCount)
})
onMounted(()=>{
  window.reLogin = () => {
    getUserSig()
  };
  getUserSig()
})
</script>
