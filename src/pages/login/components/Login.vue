<template>
  <t-form
    ref="form"
    :class="['item-container', `login-${type}`]"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <template v-if="type == 'password'">
      <t-form-item name="account">
        <t-input
          v-model="formData.account"
          size="large"
          placeholder="请输入账号:"
        >
          <template #prefix-icon>
            <t-icon name="user" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item name="password">
        <t-input
          v-model="formData.password"
          size="large"
          :on-focus="giveCookies"
          :type="showPsw ? 'text' : 'password'"
          clearable
          placeholder="请输入登录密码:"
        >
          <template #prefix-icon>
            <t-icon name="lock-on" />
          </template>
          <template #suffix-icon>
            <t-icon
              :name="showPsw ? 'browse' : 'browse-off'"
              @click="showPsw = !showPsw"
            />
          </template>
        </t-input>
      </t-form-item>

      <div class="check-container remember-pwd">
        <t-checkbox v-model="userWantsToSavePassword">记住密码</t-checkbox>
      </div>
    </template>

    <t-form-item
      v-if="type !== 'qrcode'"
      class="btn-container"
    >
      <t-button
        block
        size="large"
        type="submit"
      >
        登录
      </t-button>
    </t-form-item>

    <div class="switch-container">
      <span
        v-if="type !== 'password'"
        class="tip"
        @click="switchType('password')"
        >使用账号密码登录</span
      >
    </div>
  </t-form>
</template>

<script setup lang="ts">
// import { LoginIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import VueCookies from 'vue-cookies';
import { useRoute, useRouter } from 'vue-router';

// import { useCounter } from '@/hooks';
import { useUserStore } from '@/store';
// import EditPassword from './EditPassword.vue';

const userStore = useUserStore();
const userWantsToSavePassword = ref(false); // @ts-ignore
const savedPassword = VueCookies.get('password'); // @ts-ignore
const savedAccount = VueCookies.get('account');

const INITIAL_DATA = {
  phone: '',
  account: '',
  password: '',
  verifyCode: '',
  checked: false,
};

const FORM_RULES: Record<string, FormRule[]> = {
  phone: [{ required: true, message: '手机号必填', type: 'error' }],
  account: [{ required: true, message: '账号必填', type: 'error' }],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  verifyCode: [{ required: true, message: '验证码必填', type: 'error' }],
};

const type = ref('password');

const form = ref<FormInstanceFunctions>();
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);

// const [countDown, handleCounter] = useCounter();
const giveCookies = () => {
  // 获取保存的密码Cookie
  console.log('是否勾选', userWantsToSavePassword.value, savedPassword);

  // 将密码填充到输入框中
  if (savedPassword && formData.value.account === savedAccount) {
    formData.value.password = savedPassword;
  }
};

const switchType = (val: string) => {
  type.value = val;
};

const router = useRouter();
const route = useRoute();

const onSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    try {
      await userStore.login(formData.value);
      // 勾选则缓存cookies
      if (userWantsToSavePassword.value === true) {
        // @ts-ignore
        VueCookies.set('password', formData.value.password, { expires: '7d' }); // 设置密码Cookie，有效期7天
        // @ts-ignore
        VueCookies.set('account', formData.value.account, { expires: '7d' }); // 设置密码Cookie，有效期7天
        console.log('检查是否记住了密码', formData.value.password);
      }
      MessagePlugin.success('登陆成功');
      const redirect = route.query.redirect as string;
      const redirectUrl = redirect ? decodeURIComponent(redirect) : '/dashboard';
      router.push(redirectUrl);
    } catch (e) {
      console.log(e);
      MessagePlugin.error(e.message);
    }
  }
};
// // 发送编辑行后执行回调
// const editFinish = async (newPassword) => {
//   console.log('edit传回', newPassword);
//   INITIAL_DATA.password = newPassword;
// };
</script>

<style lang="less" scoped>
@import url('../index.less');
</style>
