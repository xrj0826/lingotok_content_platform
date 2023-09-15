<template>
  <div style="color: #aaa" :class="prefix + '-footer'">Copyright @2022-2023 越海客号® 自由职业者与雇主交流交易平台
    <a  href="https://beian.miit.gov.cn/#/Integrated/index"  target="_blank" style="margin-left: 4px;cursor: pointer;color: #aaa" class="copyright">| 蒙ICP备2023001000号 </a>
    <a href="https://www.beian.gov.cn/portal/registerSystemInfo" class="copyright" style="margin-left: 4px;cursor: pointer;color: #aaa" target="_blank">| 蒙公安网备15080202000195号 </a>
  </div>
</template>

<script setup lang="ts">
import { prefix } from '@/config/global';
</script>

<style lang="less" scoped>
.@{starter-prefix}-footer {
  color: var(--td-text-color-placeholder);
  line-height: 20px;
  text-align: center;
}
</style>
