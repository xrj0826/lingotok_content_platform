<template>
  <div class="login-wrapper">
    <login-header />

    <div class="login-container">
      <div class="title-container">
        <h1 class="title margin-no">登录到</h1>
        <h1 class="title">内容管理平台</h1>
      </div>

      <login />
      <tdesign-setting />
    </div>

    <footer class="copyright">Copyright @ 2021-2022 Tencent. All Rights Reserved</footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoginIndex',
});
</script>

<script setup lang="ts">
import TdesignSetting from '@/layouts/setting.vue';
import LoginHeader from './components/Header.vue';
import Login from './components/Login.vue';
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
