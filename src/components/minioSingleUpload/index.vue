<template>
  <div class="container">
    <div style="display: flex">
      <el-upload
        ref="upload"
        class="upload-demo"
        :on-remove="handleRemove"
        :on-change="handleFileChange"
        :file-list="uploadFileList"
        :show-file-list="false"
        :auto-upload="false"
      >
        <t-button
          slot="trigger"
          type="primary"
          plain
          >选择文件</t-button
        >
      </el-upload>
      <t-button
        style="margin-left: 10px"
        type="success"
        @click="handleUpload"
        >上传</t-button
      >
      <t-button
        type="danger"
        @click="clearFileHandler"
        >清空</t-button
      >
    </div>
    <!-- 文件列表 -->
    <div class="file-list-wrapper">
      <el-collapse>
        <el-collapse-item
          v-for="(item, index) in uploadFileList"
          :key="index"
        >
          <template #title>
            <div class="upload-file-item">
              <div
                style="display: flex"
                class="file-info-item file-name"
              >
                文件名：
                <div
                  style="width: 150px; word-break: break-word; line-height: 20px; display: flex; align-items: center"
                >
                  {{ item.name }}
                </div>
              </div>
              <div class="file-info-item file-size">文件大小：{{ transformByte(item.size) }}</div>
              <div class="file-info-item file-progress">
                <span class="file-progress-label">文件进度：</span>
                <el-progress
                  :percentage="item.uploadProgress"
                  class="file-progress-value"
                />
              </div>
              <div class="file-info-item file-size">
                <span>状态：</span>
                <el-tag
                  v-if="item.status === '等待上传'"
                  size="medium"
                  type="info"
                  >等待上传</el-tag
                >
                <el-tag
                  v-else-if="item.status === '校验MD5'"
                  size="medium"
                  type="warning"
                  >校验MD5</el-tag
                >
                <el-tag
                  v-else-if="item.status === '正在上传'"
                  size="medium"
                  >正在上传</el-tag
                >
                <el-tag
                  v-else-if="item.status === '上传成功'"
                  size="medium"
                  type="success"
                  >上传完成</el-tag
                >
                <el-tag
                  v-else
                  size="medium"
                  type="danger"
                  >上传错误</el-tag
                >
              </div>
            </div>
          </template>
          <div class="file-chunk-list-wrapper">
            <!-- 分片列表 -->
            <el-table
              :data="item.chunkList"
              max-height="400"
              style="width: 100%"
            >
              <el-table-column
                prop="chunkNumber"
                label="分片序号"
                width="180"
              >
              </el-table-column>
              <el-table-column
                prop="progress"
                label="上传进度"
              >
                <template #default="{ row }">
                  <el-progress
                    v-if="!row.status || row.progressStatus === 'normal'"
                    :percentage="row.progress"
                  />
                  <el-progress
                    v-else
                    :percentage="row.progress"
                    :status="row.progressStatus"
                    :text-inside="true"
                    :stroke-width="16"
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="status"
                label="状态"
                width="180"
              >
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import SparkMD5 from 'spark-md5';

import { completeMultipartUpload1, createMultipartUpload } from '@/api/user/file';
import { completeMultipartUpload } from '@/api/user/webApi';

const FILE_UPLOAD_ID_KEY = 'file_upload_id';
const accessToken = localStorage.getItem('accessToken');
const chunkSize = 10 * 1024 * 1024;
const FileStatus = {
  wait: '等待上传',
  getMd5: '校验MD5',
  uploading: '正在上传',
  success: '上传成功',
  error: '上传错误',
};
export default {
  props: {
    mode: {
      default: 'default',
      type: String,
    },
  },
  data() {
    return {
      changeDisabled: false,
      uploadDisabled: false,
      // 上传并发数
      simultaneousUploads: 3,
      uploadIdInfo: null,
      retryList: [],
      uploadFileList: [],
    };
  },
  computed: {
    transformByte() {
      return function (size) {
        if (!size) {
          return '0B';
        }
        const unitSize = 1024;
        if (size < unitSize) {
          return `${size} B`;
        }
        // KB
        if (size < unitSize ** 2) {
          return `${(size / unitSize).toFixed(2)} K`;
        }
        // MB
        if (size < unitSize ** 3) {
          return `${(size / unitSize ** 2).toFixed(2)} MB`;
        }
        // GB
        if (size < unitSize ** 4) {
          return `${(size / unitSize ** 3).toFixed(2)} GB`;
        }
        // TB
        return `${(size / unitSize ** 4).toFixed(2)} TB`;
      };
    },
  },
  methods: {
    async handleUpload() {
      const self = this;
      if (this.uploadFileList.length === 0) {
        this.$message.error('请先选择文件');
        return;
      }
      this.uploadFileList.map((currentFile, index) => {
        if (!(currentFile.status === '等待上传')) return;
        // 当前操作文件
        currentFile.status = FileStatus.getMd5;
        // const url = await minioClient.presignedPutObject(bucketName, filename);
        // 1. 计算MD5
        this.getFileMd5(currentFile.raw, async (md5) => {
          // 2. 检查是否已上传
          // const checkResult = await self.checkFileUploadedByMd5(md5);
          // // 已上传
          // if (checkResult.data.status === 1) {
          //   self.$message.success(`上传成功，文件地址：${checkResult.data.url}`);
          //   console.log(`文件访问地址：${checkResult.data.url}`);
          //   currentFile.status = FileStatus.success;
          //   currentFile.uploadProgress = 100;
          //   return;
          // }
          // if (checkResult.data.status === 2) {
          // "上传中" 状态
          // 获取已上传分片列表
          // const { chunkUploadedList } = checkResult.data;
          // currentFile.chunkUploadedList = chunkUploadedList;
          // } else {
          //   // 未上传
          //   console.log('未上传');
          // }
          console.log(`文件MD5：${md5}`);
          // 3. 正在创建分片
          const fileChunks = self.createFileChunk(currentFile.raw, chunkSize);
          const param = {
            fileName: currentFile.name,
            chunkSize: fileChunks.length,
          };
          // 4. 获取上传url
          const uploadIdInfoResult = await createMultipartUpload(param);
          console.log('uploadIdInfoResult', uploadIdInfoResult);
          // const uploadIdInfoResult = await self.getFileUploadUrls(param);
          self.uploadIdInfo = uploadIdInfoResult;
          self.saveFileUploadId(uploadIdInfoResult.result.uploadId);
          const uploadChunks = uploadIdInfoResult.result.chunks;
          if (fileChunks.length + 1 !== uploadChunks.length) {
            self.$message.error('文件分片上传地址获取错误');
            return;
          }
          console.log('fileChunks', fileChunks);
          currentFile.chunkList = [];
          /*        for (let i = 0; i < fileChunks.length + 1; i++) {
            currentFile.chunkList.push({
              chunkNumber: i + 1,
              chunk: fileChunks[i],
              uploadUrl: uploadChunks[i].uploadUrl,
              progress: 0,
              status: '—',
            });
          } */
          fileChunks.map((chunkItem, index) => {
            currentFile.chunkList.push({
              chunkNumber: index + 1,
              chunk: chunkItem,
              uploadUrl: uploadChunks[index + 1].uploadUrl,
              progress: 0,
              status: '—',
            });
          });
          let tempFileChunks = [];
          currentFile.chunkList.forEach((item) => {
            tempFileChunks.push(item);
          });
          currentFile.status = FileStatus.uploading;
          // 处理分片列表，删除已上传的分片
          tempFileChunks = self.processUploadChunkList(tempFileChunks, index);
          // 5. 上传
          await self.uploadChunkBase(tempFileChunks, index);
          console.log('上传完成');
          // 6. 合并文件
          const params = {
            fileName: currentFile.name,
            /** 上传编号 */
            uploadId: uploadIdInfoResult.result.uploadId,
            /** 分片数量 */
            chunkSize: fileChunks.length,
            /** 文件大小 */
            fileSize: currentFile.size,
            /** 文件类型 */
            contentType: currentFile.raw.type,
            /** 密码 */
            pass: '',
            /** 超时时间 */
            expire: 100000,
            /** 最大下载数 */
            maxGetCount: 100,
          };
          let mergeResult = {};
          if (this.mode === 'word') {
            // 单词上传
            mergeResult = await completeMultipartUpload(params);
          } else {
            // 默认上传
            mergeResult = await completeMultipartUpload1(params);
          }
          console.log(mergeResult);
          if (!mergeResult) {
            currentFile.status = FileStatus.error;
            self.$message.error(mergeResult.message);
          } else {
            currentFile.status = FileStatus.success;
            console.log(`文件访问地址：${mergeResult.result.url}`);
            self.$message.success(`上传成功，文件地址：${mergeResult.result.url}`);
          }
        });
      });
    },
    clearFileHandler() {
      this.uploadFileList = [];
      this.uploadIdInfo = null;
    },
    handleFileChange(file, fileList) {
      this.uploadFileList = fileList;
      console.log('fileList', fileList);
      this.uploadFileList.forEach((item) => {
        if (item.status !== 'ready') return;
        // 初始化自定义属性
        this.initFileProperties(item);
      });
    },
    initFileProperties(file) {
      file.chunkList = [];
      file.status = FileStatus.wait;
      file.progressStatus = 'warning';
      file.uploadProgress = 0;
    },
    handleRemove(file, fileList) {
      this.uploadFileList = fileList;
    },
    /**
     * 分片读取文件 MD5
     */
    getFileMd5(file, callback) {
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      const fileReader = new FileReader();
      // 计算分片数
      const totalChunks = Math.ceil(file.size / chunkSize);
      console.log(`总分片数：${totalChunks}`);
      let currentChunk = 0;
      const spark = new SparkMD5.ArrayBuffer();
      loadNext();
      fileReader.onload = function (e) {
        try {
          spark.append(e.target.result);
        } catch (error) {
          console.log(`获取Md5错误：${currentChunk}`);
        }
        if (currentChunk < totalChunks) {
          currentChunk++;
          loadNext();
        } else {
          callback(spark.end());
        }
      };
      fileReader.onerror = function () {
        console.warn('读取Md5失败，文件读取错误');
      };
      function loadNext() {
        const start = currentChunk * chunkSize;
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        // 注意这里的 fileRaw
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      }
    },
    /**
     * 文件分片
     */
    createFileChunk(file, size = chunkSize) {
      const fileChunkList = [];
      let count = 0;
      while (count < file.size) {
        fileChunkList.push({
          file: file.slice(count, count + size),
        });
        count += size;
      }
      return fileChunkList;
    },
    /**
     * 处理即将上传的分片列表，判断是否有已上传的分片，有则从列表中删除
     */
    processUploadChunkList(chunkList, index) {
      const currentFile = this.uploadFileList[index];
      const { chunkUploadedList } = currentFile;
      if (chunkUploadedList === undefined || chunkUploadedList === null || chunkUploadedList.length === 0) {
        return chunkList;
      }
      //
      for (let i = chunkList.length - 1; i >= 0; i--) {
        const chunkItem = chunkList[i];
        for (let j = 0; j < chunkUploadedList.length; j++) {
          if (chunkItem.chunkNumber === chunkUploadedList[j]) {
            chunkList.splice(i, 1);
            break;
          }
        }
      }
      return chunkList;
    },
    uploadChunkBase(chunkList, index) {
      const self = this;
      let successCount = 0;
      const totalChunks = chunkList.length;
      return new Promise((resolve, reject) => {
        const handler = () => {
          if (chunkList.length) {
            const chunkItem = chunkList.shift();
            // 直接上传二进制，不需要构造 FormData，否则上传后文件损坏
            axios
              .put(chunkItem.uploadUrl, chunkItem.chunk.file, {
                // 上传进度处理
                onUploadProgress: self.checkChunkUploadProgress(chunkItem, index),
                headers: {
                  'Content-Type': 'application/octet-stream',
                },
              })
              .then((response) => {
                if (response.status === 200) {
                  console.log(`分片：${chunkItem.chunkNumber} 上传成功`);
                  successCount++;
                  // 继续上传下一个分片
                  handler();
                } else {
                  console.log(`上传失败：${response.status}，${response.statusText}`);
                }
              })
              .catch((error) => {
                // 更新状态
                console.log(`分片：${chunkItem.chunkNumber} 上传失败，${error}`);
                // 重新添加到队列中
                chunkList.push(chunkItem);
                handler();
              });
          }
          if (successCount >= totalChunks) {
            resolve();
          }
        };
        // 并发
        for (let i = 0; i < this.simultaneousUploads; i++) {
          handler();
        }
      });
    },
    saveFileUploadId(data) {
      localStorage.setItem(FILE_UPLOAD_ID_KEY, data);
    },
    checkFileUploadedByMd5(md5) {
      const url = `/manager/manager/web/file`;
      const config = {
        headers: {
          accessToken,
        },
      };
      return new Promise((resolve, reject) => {
        axios
          .post(
            url,
            {},
            {
              headers: { accessToken },
            },
          )
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    /**
     * 合并文件
     */
    mergeFile(file) {
      const self = this;
      const url = `http://127.0.0.1:8027/upload/merge?uploadId=${file.uploadId}&fileName=${file.fileName}&md5=${file.md5}`;
      return new Promise((resolve, reject) => {
        axios
          .post(url)
          .then((response) => {
            const { data } = response;
            if (!data.success) {
              file.status = FileStatus.error;
              resolve(data);
            } else {
              file.status = FileStatus.success;
              resolve(data);
            }
          })
          .catch((error) => {
            self.$message.error(`合并文件失败：${error}`);
            file.status = FileStatus.error;
            reject();
          });
      });
    },
    /**
     * 检查分片上传进度
     */
    checkChunkUploadProgress(item, index) {
      return (p) => {
        item.progress = parseInt(String((p.loaded / p.total) * 100));
        this.updateChunkUploadStatus(item, index);
      };
    },
    updateChunkUploadStatus(item, index) {
      let status = FileStatus.uploading;
      let progressStatus = 'normal';
      if (item.progress >= 100) {
        status = FileStatus.success;
        progressStatus = 'success';
      }
      const chunkIndex = item.chunkNumber - 1;
      const currentChunk = this.uploadFileList[index].chunkList[chunkIndex];
      // 修改状态
      currentChunk.status = status;
      currentChunk.progressStatus = progressStatus;
      // 更新状态
      this.uploadFileList[index].chunkList[chunkIndex] = currentChunk;
      // 获取文件上传进度
      this.getCurrentFileProgress(index);
    },
    getCurrentFileProgress(index) {
      const currentFile = this.uploadFileList[index];
      if (!currentFile || !currentFile.chunkList) {
        return;
      }
      const { chunkList } = currentFile;
      const uploadedSize = chunkList
        .map((item) => item.chunk.file.size * item.progress)
        .reduce((acc, cur) => acc + cur);
      // 计算方式：已上传大小 / 文件总大小
      const progress = parseInt((uploadedSize / currentFile.size).toFixed(2));
      currentFile.uploadProgress = progress;
      this.uploadFileList[index] = currentFile;
    },
  },
};
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
</style>
