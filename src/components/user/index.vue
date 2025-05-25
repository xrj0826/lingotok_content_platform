<template>
  <div>
    <t-row justify="center">
      <t-avatar shape="round" size="90px" :image="avatarUrl"></t-avatar>
    </t-row>
    <t-row style="margin-top: 16px" align="center" justify="center">
      <div class="name" style="margin-right: 8px">{{ name }}</div>
      <t-space v-if="status === 0" align="center" size="2px">
        <t-icon name="error-circle"></t-icon>
        <div>未认证</div>
      </t-space>
      <t-space v-if="status === 1" align="center" size="2px">
        <t-icon name="check-circle" style="color: green"></t-icon>
        <div>认证</div>
      </t-space>
    </t-row>
    <t-row justify="center" class="id"> 用户ID:{{ id }} </t-row>
    <t-row justify="center" align="center">
      <t-icon name="star-filled" style="color: rgb(255, 176, 84)" size="large"></t-icon>
      <div class="access">{{ score }}</div>
      <div class="access">({{ scoreNumber }}人 评价)</div>
    </t-row>
    <t-row align="center" justify="center" style="margin-top: 15px">
      <t-space size="1px" direction="vertical" align="center">
        <div class="count">{{ service }}</div>
        <div class="detail">服务中</div>
      </t-space>
      <t-space size="1px" style="margin: 0 20px" direction="vertical" align="center">
        <div class="count">{{ compare }}</div>
        <div class="detail">竞标中</div>
      </t-space>
      <t-space size="1px" direction="vertical" align="center">
        <div class="count">{{ done }}</div>
        <div class="detail">已完成</div>
      </t-space>
    </t-row>
  </div>
</template>
<script lang="tsx">
export default {
  name: 'UserCard',
};
</script>
<script setup lang="tsx">
defineProps<{
  avatarUrl: string;
  name: string;
  id: string;
  score: number;
  scoreNumber: number;
  service: string;
  compare: string;
  done: string;
  status: 0 | 1;
}>();
</script>

<style lang="less" scoped>
.name {
  color: rgb(17, 36, 61);
  font-weight: 700;
  font-size: 18px;
  font-family: Open Sans;
}
.id {
  color: rgb(112, 122, 137);
  font-weight: 300;
  font-size: 12px;
  font-family: Open Sans;
}
.access {
  color: rgb(20, 21, 34);
  font-weight: 600;
  font-size: 14px;
  font-family: Poppins;
}
.count {
  color: rgb(17, 36, 61);
  font-weight: 700;
  font-size: 16px;
  font-family: Open Sans;
}
.detail {
  color: rgb(112, 122, 137);
  font-weight: 300;
  font-size: 12px;
  font-family: Open Sans;
}
</style>
