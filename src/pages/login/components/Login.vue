<template>
  <t-form ref="form" class="item-container" :data="formData" :rules="FORM_RULES" label-width="0" @submit="onSubmit">
    <t-form-item name="account">
      <t-input v-model="formData.account" size="large" placeholder="请输入账号:">
        <template #prefix-icon> <t-icon name="user" /> </template>
      </t-input>
    </t-form-item>

    <t-form-item name="password">
      <t-input v-model="formData.password" size="large" :type="showPsw ? 'text' : 'password'" clearable
        placeholder="请输入登录密码:">
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>

        <template #suffix-icon>
          <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
        </template>
      </t-input>
    </t-form-item>

    <div class="check-container remember-pwd">
      <t-checkbox v-model="userWantsToSavePassword">记住密码</t-checkbox>
    </div>

    <t-form-item class="btn-container">
      <t-button block size="large" type="submit">
        登录
      </t-button>
    </t-form-item>
  </t-form>
</template>

<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const INITIAL_DATA = {
  account: '',
  password: '',
};

const FORM_RULES: Record<string, FormRule[]> = {
  account: [{ required: true, message: '账号必填', type: 'error' }],
  password: [{ required: true, message: '密码必填', type: 'error' }],
};

const form = ref<FormInstanceFunctions>();
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);
const userWantsToSavePassword = ref(false);

// Cookie 操作函数
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// 在组件挂载时检查是否有保存的账号密码
onMounted(() => {
  const savedAccount = getCookie('account');
  const savedPassword = getCookie('password');

  if (savedAccount && savedPassword) {
    formData.value.account = savedAccount;
    formData.value.password = savedPassword;
    userWantsToSavePassword.value = true;
  }
});

const router = useRouter();

const onSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    try {
      // 简单的账号密码验证
      if (formData.value.account !== '' && formData.value.password === 'yepzan') {
        // 存储登录状态
        localStorage.setItem('username', formData.value.account);
        localStorage.setItem('accessToken', 'dummy-token');

        // 如果选择了记住密码，保存账号密码
        if (userWantsToSavePassword.value) {
          setCookie('account', formData.value.account, 7);
          setCookie('password', formData.value.password, 7);
        } else {
          // 如果没有选择记住密码，清除保存的账号密码
          removeCookie('account');
          removeCookie('password');
        }

        MessagePlugin.success('登录成功');

        // 使用 window.location 进行页面跳转
        window.location.href = '/series/seriesManage';
      } else {
        MessagePlugin.error('密码错误');
      }
    } catch (e) {
      console.error('登录过程出错:', e);
      MessagePlugin.error('登录失败，请重试');
    }
  }
};
</script>

<style lang="less" scoped>
@import url('../index.less');
</style>
