<!-- eslint-disable -->
<template>
  <div class="oss-upload">
    <el-upload
      ref="upload"
      action=""
      :show-file-list="false"
      :multiple="!single"
      :on-change="handleChange"
      :before-upload="handleBeforeUpload"
      :auto-upload="false"
      :limit="single ? 1 : 100"
      :on-exceed="handleExceed"
    >
      <t-button theme="primary">大文件上传</t-button>
      <div style="font-size: 10px; margin-bottom: 15px; margin-left: 10px" v-if="fileList.length">
        已上传：{{ fileList.length - unList.length }}
      </div>
    </el-upload>
    <el-dialog
      v-model="dialogVisible"
      width="850px"
      destroy-on-close
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <div slot="title" class="head-title">
        <span>大文件上传</span>
        <span class="num">
          {{ fileList.length - unList.length }}/{{ fileList.length }}
        </span>
      </div>
      <div class="dialog-head">
        <div class="head-btn">
          <t-button
            size="small"
            theme="primary"
            :disabled="uploadDisabled"
            @click="submitForm"
          >
            开始上传
          </t-button>
          <t-button
            class="item-btn"
            size="small"
            :disabled="resumeDisabled"
            @click="resumeUpload"
          >
            继续
          </t-button>
          <t-button
            class="item-btn"
            size="small"
            theme="warning"
            :disabled="pauseDisabled"
            @click="stopUpload"
          >
            暂停
          </t-button>
        </div>
      </div>
      <div class="file-list">
        <div class="file-item" v-for="(item, index) in fileList" :key="index">
          <!-- <svg class="icon-file" aria-hidden="true">
            <use :xlink:href="`#icon-${fileTypeIcon(item)}`"></use>
          </svg> -->
          <div class="file-name">
            <div class="name">
              <span class="file-name-item">
                {{ index + 1 }}.{{ item.name }}
              </span>
              <span class="speed" v-if="item.isLoading && !item.isPlay">
                准备就绪
              </span>
              <span class="speed" v-if="item.isPlay && item.percentage !== 100">
                {{ item.speed }}/s
              </span>
              <span v-if="item.percentage === 100" class="success">完成</span>
              <!-- <div class="total" v-if="item.tempCheckpoint">
                {{ filterSize(item.partSize) }}/{{ filterSize(item.size) }}
              </div> -->
              <div class="total">
                {{ filterSize(item.size) }}
              </div>
            </div>
            <span class="name error" v-if="item.errMsg">{{ item.errMsg }}</span>
            <el-progress
              :percentage="item.percentage"
              v-if="item.percentage < 100 && !item.errMsg"
            ></el-progress>
            <template v-else>
              <el-progress
                :percentage="item.percentage"
                :status="item.errMsg ? 'exception' : 'success'"
              ></el-progress>
            </template>
          </div>
          <div class="tool">
            <span
              v-if="
                !item.percentage || (0 < item.percentage && item.percentage < 100 && !item.isPlay)

              "
              class="icon delete"
              @click="handleDeleteChangeFile(index)"
            >
              <CloseCircleIcon />
            </span>
            <span
              v-else
              class="icon delete"
              @click="handleDeleteChangeFile(index)"
            >
              <DeleteIcon />
            </span>
            <span
              v-if="item.percentage && Number(item.percentage) !== 100"
              class="icon"
              :class="item.isPlay ? 'delete' : 'success'"
              @click="handleStopChangeFile(index, item)"
            >
              <PauseCircleFilledIcon  v-if="item.isPlay" />
              <CaretRightSmallIcon v-else />
            </span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'UploadPan',
};
</script>
<script setup lang="tsx">
import OSS from 'ali-oss';
import { CaretRightSmallIcon, CloseCircleIcon, DeleteIcon, PauseCircleFilledIcon } from 'tdesign-icons-vue-next';
import { ElMessageBox } from 'element-plus';
import { MessagePlugin } from 'tdesign-vue-next';
import { getCurrentInstance, onMounted, ref, watch } from 'vue';

import { filterSize } from "@/utils/utils.ts";

import { bucket, region } from '@/constants';

const props = defineProps<{
  value: {
    type: Array<object>;
    default: [];
  };
  dir: {
    type: string;
    default: '';
  };
  accept: {
    type: string;
    default: '';
  };
  single: {
    type: boolean;
    default: false;
  };
}>();

const emit = defineEmits(['get-unlist', 'on-close', 'on-delete', 'on-update', 'input']);
const fileList = ref([]);
const audioInfo = ref({});
const file = ref(null);
const tempCheckpoint = ref(null);
const uploadId = ref('');
const uploadStatus = ref(null);
const showAudio = ref(false);
const percentage = ref(0);
const uploadName = ref('');
const client = ref(null);
const year = ref(new Date().getFullYear());
const uploadDisabled = ref(true);
const resumeDisabled = ref(true);
const pauseDisabled = ref(true);
const dialogVisible = ref(false);
const isDoing = ref(false);
const unList = ref([]);
const fileMap = ref({});
const map_max_key = ref(0);
const partSize = ref(1024 * 1024);
const parallel = ref(4);
const checkpoints = ref({});
const credentials = ref(null);
// const AccessKeyId = process.env.VITE_ACCESS_KEY_ID
// const AccessKeySecret = process.env.VITE_ACCESS_KEY_SECRET
const stsToken = import.meta.env.VITE_STS_TOKEN;
// 要扮演的RAM角色ARN
const RoleArn = import.meta.env.VITE_ROLE_ARN;
// 角色会话名称
const RoleSessionName = import.meta.env.VITE_ROLE_SESSION_NAME;
// 临时访问凭证
const SecurityToken = ref(
  'CAIS/QF1q6Ft5B2yfSjIr5b3LemBur5n1pWYYBDHtFdkdMkalZHTsjz2IHhMeHhhB+sZt/g2mWBQ7fYalrJaT55UWErjVvBM6Zda9yysZYfbstCy94YDjJD96bJx5aKijqHoeOzcYI73WJXEMiLp9EJaxb/9ak/RPTiMOoGIjphKd8keWhLCAxNNGNZRIHkJyqZYTwyzU8ygKRn3mGHdIVN1sw5n8wNF5L+439eX52i17jS46JdM+9qgeMX/N5AzYMggDYjr5oEsKPqdihw3wgNR6aJ7gJZD/Tr6pdyHCzFTmU7ea7aFo4M0c1YlP/VqQ/UU9OKXjuFjqih/O21tK7AnGoABSgaFXJ0cHXcySvGIREF/FOdgos805j+jgt6H4ttZxes6FMOl5XwM/0sVCtK35e/IXxY7riFQ00TATvLMadAVKaUGHHyP8dj23Yzy5CxJSyGa5s5XLafzGqJuiatKBVZoePyOSIZfc8S5McM3mHu/BW/nAOshRQzM8368qegVJwkgAA==',
);
const AccessKeyId = ref('STS.NUBfS5WaFaWsb6vPW1xF6zTxP');
const AccessKeySecret = ref('Gx4NJJvPPvaah15NHiwgWAQMk3dP5re3z4X9Gv8K7zBN');
onMounted(() => {
  window.addEventListener('online', resumeUpload);
});

// watch(dialogVisible, (val) => {
//   if (!val) {
//     fileList.value = [];
//   }
// });
const getStsToken = () => {
  // JavaScript
  // const now = new Date().getTime();
  // if (localStorage.getItem('session_start') && now - localStorage.getItem('session_start') > 60000) {
  //   // session expired, regenerate a new one
  //   localStorage.removeItem('session_start');
  //   localStorage.setItem('session_start', now);
  //   STSToken().then((res) => {
  //     const { credentials } = res.data.result.body;
  //     SecurityToken.value = credentials.securityToken;
  //     AccessKeySecret.value = credentials.accessKeySecret;
  //     AccessKeyId.value = credentials.accessKeyId;
  //   });
  // } else {
  //   // set session start time
  //   localStorage.setItem('session_start', now);
  // }
};
watch(
  fileList,
  (val) => {
    console.log('watch', val);
    if (val.length) {
      dialogVisible.value = true;
      // getStsToken();
      const list = [];
      unList.value = [];
      val.forEach((item) => {
        if (item.raw.name.indexOf('.') === -1) item.errMsg = '不支持此格式上传';
        if (item.percentage === 100) list.push(item);
        else unList.value.push(item);
      });
      if (list.length === val.length) {
        pauseDisabled.value = true;
        isDoing.value = true;
      } else {
        isDoing.value = false;
      }
    }
  },
  { deep: true },
);

const handleExceed = () => {
  if (props.single) {
    MessagePlugin.error('当前上传只能上传单个文件');
  } else {
    MessagePlugin.error('上传文件数量不能超过100个，请重新选择！');
  }
};

const handleDeleteChangeFile = (index) => {
  fileList.value.splice(index, 1);
  if (!fileList.value.length) dialogVisible.value = false;
};

const fileTypeIcon = (item) => {
  const { type } = item.raw;
  const isVideo = type.indexOf('video') !== -1;
  const isImage = type.indexOf('image') !== -1;
  const isAudio = type.indexOf('audio') !== -1;
  const isZip = type.indexOf('zip') !== -1;
  const isDocument = type.indexOf('wordprocessingml') !== -1;
  const isPDF = type.indexOf('pdf') !== -1;
  const isTxt = type.indexOf('text') !== -1;
  const isSheet = type.indexOf('sheet') !== -1;
  if (isVideo) return 'MP4';
  if (isImage) return 'JPG1';
  if (isAudio) return 'mp3-1';
  if (isZip) return 'yasuo';
  if (isDocument) return 'DOCX';
  if (isPDF) return 'wenjianleixing-biaozhuntu-PDFwendang';
  if (isTxt) return 'div-1';
  if (isSheet) return 'excel1';
  return 'weizhiwenjian';
};
const handleClose = () => {
  emit('on-close');
  if (isDoing.value) dialogVisible.value = false;
  else {
    ElMessageBox.confirm('正在上传文件，关闭后上传文件会丢失！是否继续？', '操作提示', {
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning',
    })
      .then(() => {
        emit('get-unlist');
        fileList.value.forEach((item) => {
          if (item.client && item.percentage < 100) item.client.cancel();
        });
        dialogVisible.value = false;
      })
      .catch((e) => {
        console.log(e);
      });
  }
};

const getOss = async () => {
  const isPass = {
    pass: true,
  };
  // credentials.value = {
  //   AccessKeyId: AccessKeyId.value,
  //   AccessKeySecret: AccessKeySecret.value,
  //   SecurityToken: SecurityToken.value,
  // };
  return isPass;
};

const handleBeforeUpload = async () => {
  console.log('handleBeforeUpload');
};

const handleStopChangeFile = (index, item) => {
  item.isPlay = !item.isPlay;
  fileList.value.splice(index, 1, item);
  if (!item.isPlay) item.client.cancel();
  else resumeMultipartUpload(item);
};
// 点击开始
const submitForm = async () => {
  uploadDisabled.value = true;
  pauseDisabled.value = false;
  multipartUpload();
};

const stopUpload = () => {
  resumeDisabled.value = false;
  pauseDisabled.value = true;
  fileList.value.forEach((item) => {
    item.client.cancel();
    item.isPlay = false;
  });
};

const change = (i, value) => {
  fileMap.value[i] = value;
  map_max_key.value = i;
};

const handle_network_speed_change = async (start_time, end_time, network_speed) => {
  if (start_time - map_max_key.value >= 10000) {
    fileMap.value = {};
  }
  for (let i = start_time; i <= end_time; i++) {
    const value = fileMap.value[i];
    if (value) {
      change(i, value + network_speed);
    } else {
      change(i, network_speed);
    }
  }
};

const handle_network_speed = (res, partSize, p) => {
  const spend_time = res.rt / 1000;
  const end_time = new Date(res.headers.date).getTime();
  const start_time = end_time - spend_time;
  // @ts-ignore
  let network_speed = parseInt(partSize / spend_time, 10);
  if (p === 0) network_speed = 0;
  if (network_speed === 0) {
    // nothing to do
  } else {
    handle_network_speed_change(start_time, end_time, network_speed);
  }
  return network_speed ? filterSize(network_speed) : 0;
};
const filePath = ref('');
const resumeUploadFile = async (item, checkpoint) => {
  const { uploadId, file, name } = checkpoint;
  try {
    const { raw, percentage } = item;
    item.partSize = 0;

    if (percentage < 100 && raw.name.indexOf('.') !== -1) {
      const file = raw;
      const path = `${props.dir ? props.dir : ''}${file.name}`;
      item.path = path;
      item.client
        .multipartUpload(uploadId, file, {
          parallel: parallel.value,
          partSize: partSize.value,
          progress: async (p, checkpoint, res) => {
            await onUploadProgress(item, p, checkpoint, res, name);
          },
          checkpoint,
        })
        .then(() => {
          delete checkpoints.value[checkpoint.uploadId];
          emit('input', fileList.value);
          resumeDisabled.value = true;
          if (unList.value.length && uploadDisabled.value) resumeDisabled.value = false;
          onCreatePanFile(item);
        })
        .catch(async (err) => {
          await resetUpload(err, item);
        });
    }
  } catch {
    console.log('---err---');
  }
};

const resetUpload = async (err, item) => {
  const msg = JSON.stringify(err);
  if (msg.indexOf('Error') !== -1) {
    if (item.client) {
      item.client.cancel();
    }
    await getOss();
    item.client = new OSS({
      accessKeyId: AccessKeyId.value,
      accessKeySecret: AccessKeySecret.value,
      stsToken: SecurityToken.value,
      bucket,
      region,
    });
    await resumeMultipartUpload(item);
  }
};

const resumeUpload = async () => {
  pauseDisabled.value = false;
  // eslint-disable-next-line no-multi-assign
  uploadDisabled.value = resumeDisabled.value = true;
  await resumeMultipartUpload('');
};
interface Checkpoint {
  uploadId: string;
}

const resumeMultipartUpload = async (item) => {
  if (item) {
    const { tempCheckpoint } = item;
    resumeUploadFile(item, tempCheckpoint);
  } else {
    Object.values(checkpoints.value).forEach((checkpoint: Object) => {
      const { uploadId } = checkpoint as Checkpoint;
      const index = fileList.value.findIndex((option) => option.upload === uploadId);
      const item = fileList.value[index];
      resumeUploadFile(item, checkpoint);
    });
  }
};

const onUploadProgress = async (item, p, checkpoint, res, path) => {
  if (checkpoint) {
    checkpoints.value[checkpoint.uploadId] = checkpoint;
    item.speed = handle_network_speed(res, partSize.value, p);
    item.tempCheckpoint = checkpoint;
    item.abortCheckpoint = checkpoint;
    item.upload = checkpoint.uploadId;
  }
  item.isPlay = true;
  if (item.isPlay) item.isLoading = false;
  item.uploadName = path;
  item.percentage = Number((p * 100).toFixed(2));
};

const ossUpload = async (item, files) => {
  let isPass = {
    pass: true,
    filePath: '',
  };
  try {
    const { raw, percentage } = item;
    item.partSize = 0;
    // 核心代码
    if (percentage < 100 && raw.name.indexOf('.') !== -1) {
      const file = raw;
      const path = `${props.dir ? `${props.dir}/` : ''}${file.name}`;
      item.path = path;
      await item.client
        .multipartUpload(path, file, {
          parallel: parallel.value,
          partSize: partSize.value,
          progress: async (p, checkpoint, res) => {
            await onUploadProgress(item, p, checkpoint, res, path);
          },
        })
        .then(() => {
          resumeDisabled.value = true;
          onCreatePanFile(item);
          if (unList.value.length && uploadDisabled.value) resumeDisabled.value = false;
        })
        .catch(async (err) => {
          console.log('err--', err);
          //   await resetUpload(err, item)
        });
    }
  } catch (e) {
    isPass = {
      ...e,
      pass: false,
      filePath: '',
    };
  }
  return isPass;
};
// 开始上传
const multipartUpload = () => {
  if (!file.value) {
    MessagePlugin.error('请选择文件');
    return;
  }

  fileList.value.forEach(async (item) => {
    item.isLoading = true;
    const getOssRes = getOss();

    item.client = new OSS({
      accessKeyId: AccessKeyId.value,
      accessKeySecret: AccessKeySecret.value,
      stsToken: SecurityToken.value,
      bucket,
      region,
    });

    try {
      console.log('client', item.client);
      // 配置Bucket加密方式。
      const result = await item.client.putBucketEncryption(bucket, {
        SSEAlgorithm: 'AES256', // 此处以设置AES256加密为例。若使用KMS加密，需添加KMSMasterKeyID属性。
        // KMSMasterKeyID：“yourKMSMasterKeyId”,设置KMS密钥ID，加密方式为KMS可设置此项。当SSEAlgorithm值为KMS，且使用指定的密钥加密时，需输入密钥ID。其他情况下，必须为空。
      });
      console.log('putBucketEncryption', result);
    } catch (e) {
      console.log('putBucketEncryption--err', e);
    }
    /*    if (!getOssRes.pass) {
      MessagePlugin.error('获取oss上传凭证异常');
    } */
    ossUpload(item, fileList.value);
  });
};
/* async function putBucketEncryption(client) {} */

const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}${
    date.getMonth() + 1
  }${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
};

const handleChange = (fil, files) => {
  console.log('handleChange');
  console.log(fil, files);

  files.forEach((item) => {
    item.client = null;
    item.isPlay = false;
    item.isLoading = false;
    item.abortCheckpoint = false;
  });
  fileList.value = files;
  file.value = fil.raw;
  uploadDisabled.value = false;
  // eslint-disable-next-line no-multi-assign
  pauseDisabled.value = resumeDisabled.value = true;
};

const handleDeleteFile = (url) => {
  const startIndex = url.indexOf(props.dir);
  const key = url.substring(startIndex, url.length);
  console.log(key, '根据key删除文件');
  emit('on-delete');
  fileList.value = [];
  MessagePlugin.success('删除成功');
};

const onCreatePanFile = async (file) => {
  const params = await getParams(file);
  console.log('--提交数据--', params);
  const newFileList = fileList.value.map((item, index) => {
    return {
      url: `https://${bucket}.${region}.aliyuncs.com/${item.path}`,
      fileKey: item.upload,
      fileSize: item.raw.size,
      name: item.uploadName,
    };
  });
  console.log('newFileList', newFileList);
  emit('input', newFileList);
  // emit('on-update', fileUrl);
};

const handleMediaRes = (type) => {
  return {
    async image(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = e.target.result as string;
          const image = new Image();
          image.onload = function () {
            resolve({
              Width: image.width,
              Height: image.height,
            });
          };
          image.src = data;
        };
        reader.readAsDataURL(file);
      });
    },
    async audio(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = e.target.result as string;
          const audio = new Audio();
          audio.onloadeddata = function () {
            const { duration } = audio;
            resolve({
              Duration: duration * 1000,
            });
          };
          audio.src = data;
        };
        reader.readAsDataURL(file);
      });
    },
    async video(file) {
      return new Promise((resolve) => {
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = videoUrl;
        video.onloadeddata = function () {
          resolve({
            CoverImg: '',
            Duration: video.duration * 1000,
            Width: video.videoWidth,
            Height: video.videoHeight,
          });
        };
      });
    },
  }[type];
};
const captureImage = (url, t) => {
  t = t || '3000 ';
  const posterUrl = `${url}?x-oss-process=video/snapshot,t_${t},f_jpg`;
  return posterUrl;
};

const getParams = async (file) => {
  const { type } = file.raw;
  const isVideo = type.indexOf('video') !== -1;
  const isImage = type.indexOf('image') !== -1;
  const isAudio = type.indexOf('audio') !== -1;
  let fileType = '';
  if (isVideo) fileType = 'video';
  else if (isImage) {
    if (type.indexOf('adobe') === -1) fileType = 'image';
  } else if (isAudio) fileType = 'audio';
  let option;
  if (isVideo || isImage || isAudio) {
    if (fileType) option = await handleMediaRes(fileType)(file.raw);
  }
  return {
    ResTitle: file.name,
    ResDescribe: '',
    OssKey: file.uploadName,
    ContentType: type || 'application/octet-stream',
    ContentLength: file.size,
    ...option,
  };
};
</script>

<style lang="less" scoped>
.file-list {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}
.icon-file {
  width: 2.5em;
  height: 2.5em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
::v-deep {
  .el-progress-circle {
    width: 40px !important;
    height: 40px !important;
  }
}
.file-item {
  display: flex;
  align-content: center;
  .file-name {
    flex: 1;
    .name {
      width: 100%;
      display: flex;
      .total {
        margin-left: 20px;
      }
      // justify-content: space-between;
      .file-name-item {
        font-weight: 500;
        width: 290px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
      }
      .speed {
        width: 120px;
        text-align: center;
        font-size: 13px;
        color: #b3d4fc;
      }
      .success {
        text-align: center;
        width: 120px;
        color: #0052d9;
      }
      &.error {
        color: #f45;
        font-size: 12px;
      }
    }
  }
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
  &:last-child {
    border-bottom: 0;
  }
  .tool {
    margin-left: 15px;
    .icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 30px;
      background-color: #eee;
      border-radius: 5px;
      margin: 0px 4px;
      cursor: pointer;
      font-size: 15px;
      color: rgb(255, 68, 85);
      font-weight: 600;
      &.success {
        color: #91cc75;
        background-color: #eee;
      }
    }
  }
}
.head-title {
  margin-bottom: 20px;
  text-align: left;
}
.dialog-head {
  display: flex;
  justify-content: space-between;
}
::v-deep {
  .el-progress-bar {
    width: 320px !important;
  }
  .el-progress {
    text-align: left;
  }
}
.num {
  background: #515256a8;
  padding: 2px 10px;
  border-radius: 4px;
  margin-left: 15px;
  color: #fff;
}
:deep .el-progress.is-success .el-progress-bar__inner {
  background: #0052d9 !important;
}
</style>
