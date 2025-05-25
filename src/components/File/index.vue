
<template>
  <div class="questionAnnex">
    <div class="each">
      <img v-if="suffix === 'jpg' || suffix === 'png' || type === 'image/jpeg' || type === 'image/png'" class="image"
        src="/src/assets/file/JPG.svg">
      <img v-else-if="suffix === 'doc' || suffix === 'docx' || type === 'application/msword'" class="image"
        src="/src/assets/file/DOC.svg">
      <img
        v-else-if="suffix === 'xls' || suffix === 'xlsx' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || type === 'application/vnd.ms-excel'"
        class="image" src="/src/assets/file/XLS.svg">
      <img v-else-if="suffix === 'pdf' || type === 'application/pdf'" class="image" src="/src/assets/file/PDF.svg">
      <img v-else-if="suffix === 'txt' || suffix === 'md' || type === 'text/plain'" class="image"
        src="/src/assets/file/TXT.svg">
      <img
        v-else-if="suffix === 'ppt' || suffix === 'pptx' || type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'"
        class="image" src="/src/assets/file/PPT.svg">
      <img
        v-else-if="suffix === 'zip' || suffix === 'rar' || type === 'application/zip' || type === 'application/x-zip-compressed'"
        class="image" src="/src/assets/file/ZIP.svg">
      <img v-else class="image" src="/src/assets/file/link.svg">
      <div class="content">
        <div class="name">{{ name || '文件' }}</div>
        <a :href="url" target="_blank" class="preview">点击下载或预览</a>
      </div>
    </div>
  </div>
</template>
<script lang="tsx">
export default {
  name: 'File',
};
</script>
<script lang="tsx" setup>
import router from '@/router';
const props = defineProps({
  url: String,
  type: String,
  name: String
});

const suffix = props.name.substring(props.name.lastIndexOf('.') + 1);

const goBack = () => {
  router.back()
}

</script>

<style lang="less" scoped>
.questionAnnex {
  margin-top: 10px;
  margin-left: 44.5px;
  flex-wrap: wrap;
  display: flex;

  .each {
    padding: 10px;
    border-radius: 5px;
    margin-right: 10px;
    margin-bottom: 10px;
    background-color: #edf2ff;
    display: flex;

    .image {
      margin-left: 5px;
      width: 30px;
      height: 30px;
    }

    .content {
      margin-left: 10px;

      .name {
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 157px;
      }

      .preview {
        // margin-top: 5px;
        font-size: 10px;

        color: #167b6f;
      }
    }
  }
}</style>
