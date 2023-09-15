<template>
  <div>
    <t-row align="center">
      <t-avatar :image="avatarUrl" size="40px"></t-avatar>
      <t-space direction="vertical" size="0px" style="margin-left: 10px">
        <div class="name">{{ name }}</div>
        <div class="userId">昵称：{{ description }}</div>
      </t-space>
    </t-row>
  </div>
</template>
<script lang="tsx">
export default {
  name: 'UserMini',
};
</script>
<script setup lang="tsx">
defineProps<{
  name: string;
  description: string;
  avatarUrl: string;
}>();
</script>

<style lang="less" scoped>
.name {
  color: rgb(20, 21, 34);
  font-weight: 600;
  font-size: 16px;
  font-family: Poppins;
}

.userId {
  color: rgb(14, 15, 29);
  font-weight: 400;
  font-size: 12px;
  font-family: Poppins;
}
</style>
