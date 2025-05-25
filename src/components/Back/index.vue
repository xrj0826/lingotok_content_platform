<template>
  <el-button @click="goBack"
    style="border-radius: 50%; height: 50px; width: 50px; position: absolute; left: 30px; top: 100px;  background: linear-gradient(270deg, #a65ef7 10.748%, #4c53ff 86.826%); ">
    <el-icon :size="30" color="#ffffff">
      <Back />
    </el-icon>
  </el-button>
</template>

<script lang="ts" setup>
import router from "../../router";

const goBack = () => {
  router.back()
}

</script>

<style lang="less" scoped></style>
