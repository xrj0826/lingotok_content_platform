<template>
  <div class="container">
    <div>

      <!-- 文件上传 -->
      <!-- <input id="file-selector" type="file" @change="fileChange" /> -->

      <!-- 已上传文件列表 -->
      <div>

        <t-table row-key="index" :data="data" :columns="columns" :showHeader="false">
          <template #size>
            <div>{{ formatSize(data[0].size) }}</div>
          </template>
          <template #progress>
            <div class="progress" v-if="progressInfo.status">
              <div class="progress-info">
                {{ progressInfo.name }}
                <el-progress :percentage="progressInfo.percent" />
                <el-button @click="toggleUpload" size="small">
                  {{ progressInfo.status === 'pause' ? '继续上传' : '暂停' }}
                </el-button>
              </div>
              <div v-html="progressInfo.text" class="progress-text"></div>
            </div>
            <div v-else>
              <t-tag theme="success">上传完成</t-tag>
            </div>
          </template>
        </t-table>

      </div>

      <!-- 上传进度信息 -->

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, watch, reactive } from 'vue';
import { cosUploadUtils } from './cosUploadUtils';
import { size } from 'lodash';
import { upload1 } from '@/api/user/webApi';
// import upload1 from 'src/api/user/webApi.ts'
const data = ref([{
  filename: "", size: "", progress: "", contentType: ""
}])

const cos = ref(null); // 腾讯云 cos 操作实例
const Bucket = "english-1325232490"; // 存储桶名称，由bucketname-appid 组成，appid必须填入，可以在COS控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
const Region = "ap-shanghai"; // 存储桶Region可以在COS控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/
const successList = ref([]);
const progressInfo = ref({
  percent: 0, // 进度百分比
  text: "", // 进度信息文本
  name: "", // 正在上传中的文件名称
  taskId: "", // 上传任务 id，用于暂停/继续
  status: "", // 上传状态，用于暂停、继续按钮显示
  size: "",
});
const props = defineProps({
  file1: Object,
  cos: Object
});

const columns = ref([
  { colKey: 'filename', title: '文件名', width: '100' },
  { colKey: 'size', title: '文件大小', width: '100' },
  // { colkey: 'contentType', title: '文件类型', width: '100' },
  { colKey: 'progress', title: '上传过程', width: '200' },
])

// 开始或暂停 cos 下载任务
const toggleUpload = () => {
  const { status, taskId } = progressInfo.value;
  if (status === "uploading") {
    // 暂停
    cos.value.pauseTask(taskId);
    progressInfo.value.status = "pause";
  } else if (status === "pause") {
    // 继续
    cos.value.restartTask(taskId);
    progressInfo.value.status = "uploading";
  }
};

// 文件改变事件
const fileChange = (file) => {
  if (!file) return;
  // 上传文件
  cos.value.uploadFile(
    {
      Bucket: Bucket,
      Region: Region,
      Key: file.name,
      Body: file,
      SliceSize: 1024 * 1024, // 大于1mb才进行分块上传
      onTaskReady: (tid) => {
        progressInfo.value.taskId = tid;
        Object.assign(progressInfo.value, {
          taskId: tid,
          status: "uploading",
        });
      },
      onProgress: (progressData) => {
        console.log("上传中", JSON.stringify(progressData));
        const text = cosUploadUtils.getProgressText(progressData);
        Object.assign(progressInfo.value, {
          percent: Math.floor(progressData.percent * 100),
          text,
          name: file.name,
        });
      },
    },
    (err, data1) => {
      console.log('1000', err, data1); //
      if (!err) {
        const { Location } = data1;
        successList.value.push({
          name: "https://encdn.ydwl.tech/" + progressInfo.value.name,
          url: Location,
        });
        const params = {
          filename: data.value[0].filename,
          contentType: data.value[0].contentType
        }
        upload1(params).then(() => {

        })
        // 初始化进度信息
        Object.assign(progressInfo.value, {
          percent: 0,
          text: "",
          name: "",
          taskId: "",
          status: "",
          url: "",
        });
      }
    }
  );
};

// 监听 file1 的变化
watch(() => props.file1, (newVal) => {
  console.log('new', newVal)
  // progressInfo.value.size = newVal.size
  data.value[0].filename = newVal.name
  data.value[0].size = newVal.size
  data.value[0].contentType = newVal.type
  console.log('data', data.value)
  cos.value = props.cos
  fileChange(newVal)
}, { deep: true, immediate: true });

onBeforeUnmount(() => {
  // 取消上传
  const { taskId } = progressInfo.value;
  cos.value.cancelTask(taskId);
});

const unitSize = 1024;

function transformByte(size) {
  if (!size) {
    return '0B';
  }
  if (size < unitSize) {
    return `${size} B`;
  }
  if (size < unitSize ** 2) {
    return `${(size / unitSize).toFixed(2)} K`;
  }
  if (size < unitSize ** 3) {
    return `${(size / unitSize ** 2).toFixed(2)} MB`;
  }
  if (size < unitSize ** 4) {
    return `${(size / unitSize ** 3).toFixed(2)} GB`;
  }
  return `${(size / unitSize ** 4).toFixed(2)} TB`;
}

const formatSize = ref(transformByte);
</script>

<style>
.container {
  width: 1000px;
  margin: 0 auto;
}

.file-list-wrapper {
  margin-top: 20px;
}

h2 {
  text-align: center;
}

.file-info-item {
  margin: 0 20px;
}

.upload-file-item {
  display: flex;
}

.file-progress {
  display: flex;
  align-items: center;
}

.file-progress-value {
  width: 250px;
}

.uploader-example {
  width: 880px;
  padding: 15px;
  margin: 40px auto 0;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.uploader-example .uploader-btn {
  margin-right: 4px;
}

.uploader-example .uploader-list {
  max-height: 440px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}

.progress {
  max-width: 680px;
  padding: 15px;
  margin: 16px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.progress-info {
  margin: 10px 0;
}

.progress-text span {
  font-weight: bold;
}
</style>
