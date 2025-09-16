<template>
  <div class="file-card">
    <img src="./images/Document_doc_Light.png" alt="" />
    <div class="detail">
      <div class="name">{{ fileName }}</div>
      <div class="operation">点击预览详情</div>
    </div>
  </div>
</template>
<script lang="tsx">
export default {
  name: 'FileCard',
};
</script>
<script setup lang="tsx">
defineProps<{
  fileName: string;
}>();
</script>

<style lang="less" scoped>
.file-card {
  display: flex;
  align-items: center;
  width: 250px;
  height: 50px;
  background-color: #edf2ff;
  border-radius: 5px;
  img {
    width: 45px;
    height: 45px;
  }
  .detail {
    display: flex;
    flex-direction: column;
    margin-left: 20px;
    .name {
    }
    .operation {
      color: #077467;
    }
  }
}
</style>
