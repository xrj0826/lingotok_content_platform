<!-- 客服管理 -->
<template>
  <div>

    <t-dialog v-model:visible="visibleUploadExercise" header="上传练习" width="1000px" :footer="false"
      @close="closeExerciseUpload()">
      <div style="padding-left: 50px">
        <div style="display: flex">
          <div>练习名称：</div>
          <div style="width: 100px; margin-left: 20px">
            <t-input v-model="exerciseTitle" />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>练习难度：</div>
          <div style="margin-left: 20px">
            <t-radio-group variant="primary-filled" :default-value="defaultValue" @change="radioChange">
              <t-radio-button value="EASY">easy</t-radio-button>
              <t-radio-button value="MIDDLE">middle</t-radio-button>
              <t-radio-button value="HARD">hard</t-radio-button>
            </t-radio-group>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 20px; margin: 20px">
        <!-- <div style="display: flex; width: 500px">
          <div style="width: 130px">原文文档</div>
          <t-upload v-model="fileList.contentFileName" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="1" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'contentFileName')"
            @remove="(e) => removeFile('contentFileName')"></t-upload>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">翻译文档</div>
          <t-upload v-model="fileList.translationFileName" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="1" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'translationFileName')"
            @remove="(e) => removeFile('translationFileName')"></t-upload>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">音频文件</div>
          <t-upload v-model="fileList.audioFileName" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="1" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'audioFileName')" @remove="(e) => removeFile('audioFileName')"></t-upload>
        </div> -->
        <!-- <div style="display: flex; width: 500px">
          <div style="width: 130px">视频字幕文件</div>
          <t-upload v-model="fileList.videoSubtitleFileName" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="1" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'videoSubtitleFileName')"
            @remove="(e) => removeFile('videoSubtitleFileName')"></t-upload>
        </div> -->
        <!--        <minio-upload
          v-model:fileName="fileForm.contentFileName"
          :single="true"
          title="原文文档"
        />
        <minio-upload
          v-model:fileName="fileForm.translationFileName"
          :single="true"
          title="原文翻译文档"
        />
        <minio-upload
          v-model:fileName="fileForm.audioFileName"
          :single="true"
          title="音频文件"
        />-->
        <!-- <div style="display: flex; gap: 20px">
          <div>视频文件</div>
        <input style="margin-left: 53px;"
            id="file-selector" type="file" multiple="multiple" class="inputFile" @change="filechange" /><img
            style="width: 18px;height: 18px;position: absolute;margin-top: 8px;margin-left: 140px;"
            src="../../assets/shangchuan.png">
        </div> -->

        <!-- 文件上传 -->
        <div style="display: flex">
          <div style="width: 130px">合集封面</div>
          <div style="width: 500px; margin-left: 20px">
            <HuaweiOBSUpload accept="image/jpeg,image/png" buttonText="上传封面" tips="建议尺寸：800x600，支持jpg、png格式"
              folder="series_cover" @success="handleCoverUploadSuccess" @error="handleCoverUploadError" />
          </div>
        </div>

        <!-- 已上传文件列表 -->
        <!-- <div v-if="successList.length"> -->
        <!-- <pre> -->
        <!-- 已上传： -->
        <!-- {{ successList }} -->
        <!-- </pre> -->
        <!-- </div> -->

        <!-- <div v-for="(item, i) in files" :key="i">
          <minio-upload :exerciseId="0" :isUpload="false" :cos="cos" :file1="item" mode="word" />
        </div> -->
        <!--        <minio-upload
          v-model:fileName="fileForm.videoSubtitleFileName"
          :single="true"
          title="视频字幕文件"
        />-->
      </div>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button size="large" @click="exerciseUpload()">确认上传</t-button>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visivleModifyExercise" header="修改练习" width="1000px" :footer="false"
      @opened="setProgress()" @close="closeExerciseModify()">
      <div style="padding-left: 50px">
        <div style="display: flex">
          <div>练习名称：</div>
          <div style="width: 400px; margin-left: 20px">
            <t-input v-model="modifyEx.title" />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>练习难度：</div>
          <div style="margin-left: 20px; display: flex">
            <div :class="modifyEx.difficultyLevel == 'EASY' ? 'choose' : 'unchoose'" @click="levelChange('EASY')">
              easy
            </div>
            <div :class="modifyEx.difficultyLevel == 'MIDDLE' ? 'choose' : 'unchoose'" style="margin-left: 10px"
              @click="levelChange('MIDDLE')">
              middle
            </div>
            <div :class="modifyEx.difficultyLevel == 'HARD' ? 'choose' : 'unchoose'" style="margin-left: 10px"
              @click="levelChange('HARD')">
              hard
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px; margin: 20px">
          上传完文件请先点击确认修改保存文件
          <div style="display: flex">
            <div style="width: 130px">原文文档</div>
            <div v-if="modifyEx.contentFileName" style="width: 200px; margin-right: 20px">
              当前文件：
              {{ modifyEx.contentFileName }}
            </div>
            <t-upload v-model="fileList.contentFileName" action="/manager/manager/upload/file" theme="file"
              :headers="{ accessToken: accessToken }" :max="1" @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="(e) => fileUpload(e, 'contentFileName')"
              @remove="(e) => removeFile('contentFileName')"></t-upload>
          </div>
          <div style="display: flex">
            <div style="width: 130px">翻译文档</div>
            <div v-if="modifyEx.translationFileName" style="width: 200px; margin-right: 20px">
              当前文件：
              {{ modifyEx.translationFileName }}
            </div>
            <t-upload v-model="fileList.translationFileName" action="/manager/manager/upload/file" theme="file"
              :headers="{ accessToken: accessToken }" :max="1" @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="(e) => fileUpload(e, 'translationFileName')"
              @remove="(e) => removeFile('translationFileName')"></t-upload>
          </div>
          <div style="display: flex">
            <div style="width: 130px">音频文件</div>
            <div v-if="modifyEx.audioFileName" style="width: 200px; margin-right: 20px">
              当前文件：
              {{ modifyEx.audioFileName }}
            </div>
            <t-upload v-model="fileList.audioFileName" action="/manager/manager/upload/file" theme="file"
              :headers="{ accessToken: accessToken }" :max="1" @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="(e) => fileUpload(e, 'audioFileName')" @remove="(e) => removeFile('audioFileName')"></t-upload>
          </div>
          <div style="display: flex; gap: 20px">
            <div>视频文件</div>
            <input style="margin-left: 53px;" id="file-selector" type="file" :multiple="true" class="inputFile"
              @change="filechange" />
            <img style="width: 18px;height: 18px;position: absolute;margin-top: 8px;margin-left: 140px;"
              src="../../assets/shangchuan.png">
          </div>

          <div v-for="(item, i) in files" :key="i">
            <minio-upload :exerciseId="rowExercise.id" :isUpload="false" :cos="cos" :file1="item" mode="word" />
          </div>
        </div>
      </div>
      <div v-if="progressVisible && progressVal">
        {{ progressVal === 100 ? '视频分段完成' : '视频文件分段中' }}
        <t-progress theme="plump" :color="{ from: '#0052D9', to: '#00A870' }" :percentage="progressVal"
          :status="'active'" />
      </div>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button size="large" @click="cutContentFun()">文档分段</t-button>
        <t-button size="large" @click="cutAudioFun()">音频分段</t-button>
        <t-popconfirm :on-confirm="cutVideoFun">
          <template #content>
            请先选择视频字幕类型
            <t-card>
              <t-radio-group v-model="type">
                <t-radio-button :value="1">类型1：Dialogue +时间戳</t-radio-button>
                <t-radio-button :value="2">类型2：单独时间戳</t-radio-button>
              </t-radio-group>
            </t-card>
          </template>
          <t-button size="large">视频分段</t-button>
        </t-popconfirm>

        <t-button size="large" @click="exerciseUploadModify()">确认修改</t-button>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visibleUploadSen" header="上传句子" width="1000px" :footer="false" @close="closeSenUpload()">
      <div style="padding: 20px">
        <div style="display: flex">
          <div>句子内容</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea v-model="senUploadCon" placeholder="请输入句子内容" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>

        <div style="margin-top: 20px; display: flex">
          <div>句子翻译</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea v-model="senUploadTran" placeholder="请输入句子翻译" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="senUpload()">确认上传</t-button>
        </div>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visibleModifySen" header="修改句子" width="1000px" :footer="false" @close="closeSenModify()">
      <div style="display: flex; flex-direction: column; padding: 20px; gap: 30px">
        <div style="display: flex">
          <div>句子内容</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea v-model="rowModifySen.content" placeholder="请输入句子内容" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>
        <div style="display: flex">
          <div>句子翻译</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea v-model="rowModifySen.translation" placeholder="请输入句子翻译" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">音频文件</div>
          <t-upload v-model="sentenceFiles.voiceUrl" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="1" @success="(e) => sentenceFileUpload(e, 'voiceUrl')"
            @remove="(e) => sentenceRemoveFile('voiceUrl')"></t-upload>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">视频文件</div>
          <t-upload v-model="sentenceFiles.videoUrl" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="1" @success="(e) => sentenceFileUpload(e, 'videoUrl')"
            @remove="(e) => sentenceRemoveFile('videoUrl')"></t-upload>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="senModify()">确认修改</t-button>
        </div>
      </div>
    </t-dialog>

    <t-loading :loading="loading" text="加载中..." fullscreen />

    <!-- 系列合集表格 -->
    <t-card class="row-container" :bordered="false">
      <t-space direction="vertical" style="width: 100%">
        <div style="display: flex;">
          <div style="margin-right: 10px;margin-top: 5px;">合集名称</div>
          <t-input v-model="search" placeholder="搜索合集名称（可选）" style="width: 240px" @enter="onSearch" clearable />
        </div>

        <t-table row-key="id" :data="seriesNameList" :columns="seriesNameColumns" :bordered="true" size="small"
          :loading="isLoading" :hover="true" :pagination="pagination" @page-change="onPageChange">
        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'AdminManager',
};
</script>
<script setup lang="tsx">
import { ChevronDownIcon, BrowseIcon, UploadIcon } from 'tdesign-icons-vue-next';
import { number } from 'echarts';
import { MessagePlugin, SuccessContext, UploadFailContext, UploadFile } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Tag as TTag, ImageViewer as TImageViewer } from 'tdesign-vue-next';
import { useRouter } from 'vue-router';

import { delete8, save9, update8 } from '@/api/user/articles';
import {
  autoSplitContent,
  cutAudio,
  cutVideo,
  delete6,
  deleteSentenceResource,
  getProgress,
  mergeAudio,
  mergeSentence,
  mergeVideo,
  save8,
  update7,
  videoResourceHandler,
  voiceASR,
} from '@/api/user/exercises';
import { delete4, page, update6 } from '@/api/user/readingMaterials';
import { delete2, save3, update1 } from '@/api/user/sentence';
import minioUpload from '@/components/minioUpload/index.vue';
// import { delete21, page10 } from '@/api/user/guanliyuan';
import { useRenewDataStore } from '@/store/renewData';

import {
  articleId,
  articlesContent,
  columns,
  columnsContent,
  columnsEssay,
  columnsExercise,
  columnsReading,
  columnsVideo,
  essayDetail,
  exerciseModifyLevel,
  exerciseModifyName,
  exercises,
  exercisesDetail,
  id,
  loading,
  modifyEx,
  name,
  readingDetail,
  readingDetailContent,
  readingId,
  rowArticle,
  rowEssay,
  rowExercise,
  rowModifyArticle,
  rowModifySen,
  rowReading,
  visible,
  visibleDetail,
  visibleEassy,
  visibleExercise,
  visibleModifyArticle,
  visibleModifySen,
  visivleModifyExercise,
} from './columnData';
import Add from './components/Add.vue';
import COS from 'cos-js-sdk-v5';
import { getAllSeriesName } from '@/api/video';
import HuaweiOBSUpload from '@/components/HuaweiOBSUpload/index.vue';
import { usePermissionStore } from '@/store';

const querySave = reactive({
  sort: '',
  order: null,
});
const index = ref();
const data = ref([]);
const isLoading = ref(false);
const store = useRenewDataStore();
const selectedRowKeysReading = ref([]);
const selectedRowKeysEassy = ref([]);
const selectedRowKeysExercise = ref([]);
const selectedRowKeysSen = ref([]);
const selectedRowKeysContent = ref([]);
const selectedRowKeysTrans = ref([]);
const selectedRowKeysAudio = ref([]);
const selectedRowKeysVideo = ref([]);
const articleCount = ref('0');
const articleIntroduction = ref('');
const picture = ref([]);
const articlePicture = ref('');
const articleTitle = ref('');
const readingMaterialId = ref('');
const visibleUploadArticle = ref(false);
const accessToken = ref<string | null>();
const articleCountModify = ref('0');
const articleIntroductionModify = ref('');
const pictureModify = ref([]);
const articlePictureModify = ref('');
const articleTitleModify = ref('');
const visibleUploadExercise = ref(false);
const exerciseTitle = ref('');
const defaultValue = ref('EASY');
const exerciseLevel = ref('EASY');
const visibleUploadSen = ref(false);
const visibleMerge = ref(false);
const senUploadCon = ref('');
const senUploadTran = ref('');

const current = ref(1);
const pageSize = ref(20);
const currentData = ref([]);

const onPageSizeChange = (size) => {
  pageSize.value = size;
};

const onCurrentChange = (index) => {
  current.value = index;
};

const onPageChange = (pageInfo: { current: number; pageSize: number }) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchSeriesData();
};

const filechange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    files.value.push(...Array.from(target.files));
  }
};

const cos = ref(null); // 腾讯云 cos 操作实例

const files = ref<File[]>([]);

const getCosInstance = () => {
  console.log('1112454', COS);
  cos.value = new COS({
    getAuthorization: (options, callback) => {
      const url = 'http://111.229.66.85:8866/manager/web/sts'; // 这里替换成您的服务接口地址
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.setRequestHeader('accessToken', localStorage.getItem('accessToken'));
      xhr.onload = (e) => {
        try {
          const data = JSON.parse(e.target.responseText);
          console.log('data', data);
          const credentials = data.result;
          if (!data || !credentials) return console.error('credentials invalid');
          callback({
            TmpSecretId: credentials.tmpSecretId,
            TmpSecretKey: credentials.tmpSecretKey,
            XCosSecurityToken: credentials.sessionToken,
            StartTime: Math.floor(Date.now() / 1000), // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            ExpiredTime: Math.floor(Date.now() / 1000) + 1800, // 时间戳，单位秒，如：1580000900
          });
        } catch (e) {
          console.error(e);
        }
      };
      xhr.send();
    },
  });
};



// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result; // 获得表格数据
    pagination.total = res.result.length; // 数据加载完成，设置数据总条数
    store.renewData = queryData;
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
const selectedRowKeys = ref([]);

const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete4({ ids });
      console.log('批量删除后', res);
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
      MessagePlugin.success('删除成功');
      selectedRowKeys.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoreDeleteReading = async () => {
  try {
    const ids = selectedRowKeysReading.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete8({ ids });
      console.log('批量删除后', res);
      readingDetail(rowReading.value);
      // console.log('rowEaasy', );
      MessagePlugin.success('删除成功');
      selectedRowKeysReading.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoreDeleteEassy = async () => {
  try {
    const ids = selectedRowKeysExercise.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete6({ ids });
      console.log('批量删除后', res);
      // essayDetail(rowArticle.value)

      // console.log('rowEaasy', );
      MessagePlugin.success('删除成功');
      selectedRowKeysExercise.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};
const handleMoreDeleteExercise = async () => {
  try {
    const ids = selectedRowKeysEassy.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete6({ ids });
      essayDetail(rowArticle.value);
      MessagePlugin.success('删除成功');
      selectedRowKeysEassy.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoreDeleteSen = async () => {
  try {
    const ids = selectedRowKeysSen.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete2({ ids });
      // console.log('批量删除后', res);
      // console.log('rowEaasy', );
      // exercisesDetail(rowExercise.value)
      exercisesDetail(rowExercise.value);
      MessagePlugin.success('删除成功');
      selectedRowKeysSen.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};
const handleMoreDeleteContent = async () => {
  try {
    const ids = [
      ...selectedRowKeysContent.value,
      ...selectedRowKeysTrans.value,
      ...selectedRowKeysAudio.value,
      ...selectedRowKeysVideo.value,
    ].join();
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await deleteSentenceResource({ ids });
      // console.log('批量删除后', res);
      // console.log('rowEaasy', );
      // exercisesDetail(rowExercise.value)
      exercisesDetail(rowExercise.value);
      MessagePlugin.success('删除成功');
      selectedRowKeysSen.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};
const mergeInSentence = async () => {
  try {
    const ids = [
      ...selectedRowKeysContent.value,
      ...selectedRowKeysTrans.value,
      ...selectedRowKeysAudio.value,
      ...selectedRowKeysVideo.value,
    ].join();
    if (ids === '') {
      MessagePlugin.error('未勾选组合项');
    } else {
      /*      Math.min(
        selectedRowKeysContent.value.length,
        selectedRowKeysTrans.value,
        selectedRowKeysAudio.value,
        selectedRowKeysVideo.value,
      ); */
      console.log(exercises.value);
      const content = exercises.value.conetentList?.find((item) => selectedRowKeysContent.value[0] === item.id) || '';
      const translation =
        exercises.value.translationList?.find((item) => selectedRowKeysTrans.value[0] === item.id) || '';
      const audio = exercises.value.audioList?.find((item) => selectedRowKeysAudio.value[0] === item.id) || '';
      const video = exercises.value.videoList?.find((item) => selectedRowKeysVideo.value[0] === item.id) || '';
      const params = {
        exercisesId: rowExercise.value.id,
        content: content.content,
        translation: translation.content,
        voiceUrl: audio.url,
        videoUrl: video.url,
      };
      loading.value = true;
      save3(params).then(() => {
        MessagePlugin.success('句子组合成功');
        selectedRowKeysContent.value = [];
        selectedRowKeysTrans.value = [];
        selectedRowKeysAudio.value = [];
        selectedRowKeysVideo.value = [];
        exercisesDetail(rowExercise.value);
        loading.value = false;
        deleteSentenceResource({ ids });
      });
    }
  } catch (error) {
    console.log(error);
  }
};
// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
};

const onSelectChangeReading = (value, params) => {
  selectedRowKeysReading.value = value;
};

const onSelectChangeEassy = (value, params) => {
  selectedRowKeysEassy.value = value;
};

const onSelectChangeExercise = (value, params) => {
  selectedRowKeysExercise.value = value;
};

const onSelectChangeSen = (value, params) => {
  selectedRowKeysSen.value = value;
};
const onSelectChangeContent = (value, params) => {
  selectedRowKeysContent.value = value;
};
const onSelectChangeTrans = (value, params) => {
  selectedRowKeysTrans.value = value;
};
const onSelectChangeAudio = (value, params) => {
  selectedRowKeysAudio.value = value;
};
const onSelectChangeVideo = (value, params) => {
  selectedRowKeysVideo.value = value;
};
const onSortChange = (e, flag) => {
  if (flag === 'content') {
    exercises.value.conetentList = e.currentData;
  } else if (flag === 'trans') {
    exercises.value.translationList = e.currentData;
  } else if (flag === 'audio') {
    exercises.value.audioList = e.currentData;
  } else if (flag === 'video') {
    exercises.value.videoList = e.currentData;
  }
};
const handleMerge = async (flag) => {
  loading.value = true;
  if (flag === 'content') {
    const res = await mergeSentence({ ids: selectedRowKeysContent.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysContent.value = [];
    }
  } else if (flag === 'trans') {
    const res = await mergeSentence({ ids: selectedRowKeysTrans.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysTrans.value = [];
    }
  } else if (flag === 'audio') {
    const res = await mergeAudio({ ids: selectedRowKeysAudio.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysAudio.value = [];
    }
  } else if (flag === 'video') {
    const res = await mergeVideo({ ids: selectedRowKeysVideo.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysVideo.value = [];
    }
  }
  loading.value = false;
};

const handleRowClick = (e) => {
  console.log(e);
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info.sorter, context.trigger);

  if (context.trigger === 'sorter') {
    if (info.sorter === undefined) {
      querySave.sort = '';
      querySave.order = null;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
    } else {
      querySave.sort = info.sorter.sortBy;
      querySave.order = info.sorter.descending;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      });
    }
  }
};

const edit = async () => {
  // if (data.value.length === 1) {
  //   MessagePlugin.error('至少保留一位管理员');
  // } else {
  try {
    if (name.value == '') {
      MessagePlugin.error('读物名称不能为空');
    } else {
      const params = {
        id: id.value,
        name: name.value,
      };
      const res = await update6(params);
      console.log('批量删除后', res);
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
      MessagePlugin.success('更改成功');
      visible.value = false;
    }
  } catch (error) {
    console.log(error);
  }
  // }
};
// 搜索框
// const onInputChange = (keyword) => {
//   console.log(keyword);
// };

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  pageSizeOptions: [10, 20, 50]
});
const sentenceFiles = ref({ voiceUrl: [], videoUrl: [] });

const sentenceFileUpload = (value, name) => {
  rowModifySen.value[name] = value.response.result.url;
};
const sentenceRemoveFile = (name) => {
  sentenceFiles.value[name] = [];
};
const AddFinsh = (newData) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
};
const fileUpload = (value, name) => {
  fileForm.value[name] = value.response.result.name;
};
const removeFile = (name) => {
  fileList.value[name] = [];
};
const pictureUpload = (value) => {
  articlePicture.value = value.response.result.url;
  console.log('articlePicture', articlePicture.value);
};

const pictureModifyUpload = (value) => {
  rowModifyArticle.value.picture = value.response.result.url;
  console.log('articlePicture', articlePicture.value);
};

const removePicture = () => {
  picture.value = [];
};

const articleUpload = () => {
  loading.value = true;
  const params = {
    articleCount: Number(articleCount.value),
    introduction: articleIntroduction.value,
    picture: articlePicture.value,
    title: articleTitle.value,
    readingMaterialId: rowReading.value.id,
  };
  save9(params).then((res) => {
    loading.value = false;
    readingDetail(rowReading.value);
    closeArticle();
  });
};

const closeArticle = () => {
  visibleUploadArticle.value = false;
  articleCount.value = '';
  articleIntroduction.value = '';
  articlePicture.value = '';
  picture.value = [];
  articleTitle.value = '';
};

const closeArticleModify = () => {
  visibleModifyArticle.value = false;
  pictureModify.value = [];
};

const articleUploadModify = () => {
  loading.value = true;
  const params = {
    articleCount: Number(rowModifyArticle.value.articleCount),
    introduction: rowModifyArticle.value.introduction,
    picture: rowModifyArticle.value.picture,
    title: rowModifyArticle.value.title,
    readingMaterialId: rowModifyArticle.value.readingMaterialId,
    id: rowModifyArticle.value.id,
  };
  update8(params).then((res) => {
    loading.value = false;
    closeArticleModify();
    readingDetail(rowReading.value);
  });
};
const fileForm = ref({
  audioFileName: '',
  videoFileName: '',
  videoSubtitleFileName: '',
  contentFileName: '',
  translationFileName: '',
});
const fileList = ref({
  audioFileName: [],
  videoFileName: [],
  videoSubtitleFileName: [],
  contentFileName: [],
  translationFileName: [],
});
const exerciseUploadModify = () => {
  loading.value = true;
  const omitNull = (obj) => {
    Object.keys(obj)
      .filter((k) => obj[k] === '')
      .forEach((k) => delete obj[k]);
    return obj;
  };
  modifyEx.value = { ...omitNull(modifyEx.value), ...omitNull(fileForm.value) };
  update7(modifyEx.value).then((res) => {
    loading.value = false;
    essayDetail(rowArticle.value);
    // closeExerxciseUpload()
    // closeExerciseModify();
    MessagePlugin.success('练习修改成功');
    files.value = []
  });
};


const exerciseUpload = () => {
  // loading.value = true;
  // console.log('files', files)
  const params = {
    articleId: articleId.value,
    title: exerciseTitle.value,
    difficultyLevel: exerciseLevel.value,
    ...fileForm.value,
    /** 语音识别id */
    taskId: '',
  };
  save8(params).then((res) => {
    if (res.success) {
      loading.value = false;
      essayDetail(rowArticle.value);
      MessagePlugin.success('练习上传成功');
      if (fileForm.value.audioFileName) {
        voiceASR({ exerciseId: modifyEx.value.id });
      }
      closeExerciseUpload();
      files.value = []
    }
  });
};
const cutContentFun = () => {
  autoSplitContent({ exerciseId: modifyEx.value.id }).then((res) => {
    if (res.success) {
      MessagePlugin.success('文档分段成功');
    }
  });
};
const cutAudioFun = () => {
  cutAudio({ exerciseId: modifyEx.value.id }).then((res) => {
    if (res.success) {
      MessagePlugin.success('音频分段成功');
    }
  });
};
const type = ref(1);
const cutVideoFun = () => {
  cutVideo({ exerciseId: modifyEx.value.id, filepath: modifyEx.value.videoFileName, type: type.value });
  clearInterval(progressInterval.value);
  progressInterval.value = null;
  getProgressMethods(modifyEx.value.id);
  progressInterval.value = setInterval(() => {
    getProgressMethods(modifyEx.value.id);
  }, 10000);
};
const progressInterval = ref(null);
const progressVisible = ref(false);
const progressVal = ref<number>(0);
const setProgress = () => {
  getProgressMethods(modifyEx.value.id);
  progressInterval.value = setInterval(() => {
    getProgressMethods(modifyEx.value.id);
  }, 10000);
};
const getProgressMethods = (exerciseId) => {
  progressVisible.value = true;
  getProgress({ exerciseId }).then((res) => {
    if (res.result && res.success) {
      const nums = res.result.split('/');
      progressVal.value = Number(Number((Number(nums[0]) / Number(nums[1])) * 100).toFixed(2));
      if (progressVal.value === 100) {
        clearInterval(progressInterval.value);
        progressInterval.value = null;
        MessagePlugin.success('视频分段完成');
      }
    } else {
      progressVisible.value = false;
      clearInterval(progressInterval.value);
      progressInterval.value = null;
    }
  });
};
const closeExerciseUpload = () => {
  visibleUploadExercise.value = false;
  exerciseTitle.value = '';
  defaultValue.value = 'EASY';
  exerciseLevel.value = 'EASY';
};

const radioChange = (value) => {
  exerciseLevel.value = value;
};

const closeExerciseModify = () => {
  visivleModifyExercise.value = false;
  clearInterval(progressInterval.value);
  progressInterval.value = null;
};

const closeSenUpload = () => {
  visibleUploadSen.value = false;
  senUploadCon.value = '';
  senUploadTran.value = '';
};

const closeSenModify = () => {
  visibleModifySen.value = false;
};

const levelChange = (level: 'EASY' | 'MIDDLE' | 'HARD') => {
  modifyEx.value.difficultyLevel = level;
};

const senUpload = () => {
  loading.value = true;
  const params = {
    exercisesId: rowExercise.value.id,
    content: senUploadCon.value,
    translation: senUploadTran.value,
  };
  save3(params).then(() => {
    MessagePlugin.success('句子上传成功');
    loading.value = false;
    exercisesDetail(rowExercise.value);
    closeSenUpload();
  });
};

const senModify = () => {
  loading.value = true;
  update1(rowModifySen.value).then(() => {
    MessagePlugin.success('句子修改成功');
    loading.value = false;
    exercisesDetail(rowExercise.value);
    closeSenModify();
  });
};

const seriesNameList = ref([]);
const levelOptions = [
  { content: 'easy', value: 'easy' },
  { content: 'medium', value: 'medium' },
  { content: 'hard', value: 'hard' },
];

const handleLevelClick = (data: { value: string }, row: any) => {
  row.level = data.value;
  MessagePlugin.success(`已切换为【${data.value}】`);
};

// 行级Popconfirm显示状态和待更新level
const popconfirmVisibleMap = reactive({}); // { [id]: boolean }
const pendingLevelMap = reactive({}); // { [id]: string }

// 过滤掉所有以 _ 开头的字段
function filterInternalProps(obj) {
  const result = {};
  for (const key in obj) {
    if (!key.startsWith('_')) {
      result[key] = obj[key];
    }
  }
  return result;
}

async function updateSeriesLevel(row, newLevel) {
  // 生成header
  function generateSignature(timestamp) {
    const apiName = 'update_series';
    const signStr = `${apiName}${timestamp}lingotok`;
    return CryptoJS.SHA256(signStr).toString();
  }
  function getRequestHeaders() {
    const timestamp = Date.now().toString();
    return {
      Timestamp: timestamp,
      Signature: generateSignature(timestamp)
    };
  }
  const headers = getRequestHeaders();
  // 构造请求体，过滤掉内部状态属性
  const username = localStorage.getItem('username') || '';
  const filteredRow = filterInternalProps(row);
  const payload = { ...filteredRow, level: newLevel, username };

  try {
    const res = await axios.post('https://testapi.lingotok.ai/api/v1/video/update_series', payload, { headers });
    if (res.data && res.data.code === 200) {
      row.level = newLevel;
      MessagePlugin.success('修改成功');
    } else {
      MessagePlugin.error(res.data?.message || '修改失败');
    }
  } catch (e) {
    MessagePlugin.error('网络错误，修改失败');
  }
}

// 新增：删除标签后自动请求接口更新
async function updateSeriesInterest(row, newInterestList) {
  function generateSignature(timestamp) {
    const apiName = 'update_series';
    const signStr = `${apiName}${timestamp}lingotok`;
    return CryptoJS.SHA256(signStr).toString();
  }
  function getRequestHeaders() {
    const timestamp = Date.now().toString();
    return {
      Timestamp: timestamp,
      Signature: generateSignature(timestamp)
    };
  }
  const headers = getRequestHeaders();
  const username = localStorage.getItem('username') || '';
  const filteredRow = filterInternalProps(row);
  const payload = { ...filteredRow, interest_list: newInterestList, username };

  try {
    const res = await axios.post('https://testapi.lingotok.ai/api/v1/video/update_series', payload, { headers });
    if (res.data && res.data.code === 200) {
      row.interest_list = newInterestList;
      MessagePlugin.success('兴趣标签已更新');
    } else {
      MessagePlugin.error(res.data?.message || '兴趣标签更新失败');
    }
  } catch (e) {
    MessagePlugin.error('网络错误，兴趣标签更新失败');
  }
}

const coverPreviewVisibleMap = reactive<Record<string | number, boolean>>({});
const coverEditDialogMap = reactive<Record<string | number, boolean>>({});
const coverUploadFileMap = reactive<Record<string | number, any[]>>({});
const coverUploadUrlMap = reactive<Record<string | number, string>>({});
const obsKeyMap = reactive<Record<string | number, string>>({});

// 初始化文件列表的方法
const initializeFileList = (id: string | number) => {
  if (!coverPreviewVisibleMap[id]) coverPreviewVisibleMap[id] = false;
  if (!coverEditDialogMap[id]) coverEditDialogMap[id] = false;
  if (!coverUploadFileMap[id]) coverUploadFileMap[id] = [];
  if (!coverUploadUrlMap[id]) coverUploadUrlMap[id] = '';
  if (!obsKeyMap[id]) obsKeyMap[id] = '';
};

const seriesNameColumns = [
  {
    colKey: 'id',
    title: '合集ID',
    align: 'center',
    width: 250,
    cell: (h, { row }) => (
      <t-link theme="primary" hover="underline" onClick={() => handleSeriesClick(row)}>
        {row.id}
      </t-link>
    )
  },
  {
    colKey: 'name',
    title: '合集名称',
    align: 'center',
    cell: (val, context) => {
      const row = context?.row || context?.data || val?.row || val;
      const id = row?.id;
      // 本地编辑状态
      if (!row) return '-';
      // 本地输入框内容
      if (!row._editName) row._editName = row.name;
      // 控制Popconfirm显隐
      if (typeof row._editPopVisible === 'undefined') row._editPopVisible = false;
      // 修改名称方法
      const handleUpdateName = async () => {
        if (!row._editName || row._editName === row.name) {
          row._editPopVisible = false;
          return;
        }
        // 调用接口
        try {
          // 生成header
          function generateSignature(timestamp) {
            const apiName = 'update_series';
            const signStr = `${apiName}${timestamp}lingotok`;
            return CryptoJS.SHA256(signStr).toString();
          }
          function getRequestHeaders() {
            const timestamp = Date.now().toString();
            return {
              Timestamp: timestamp,
              Signature: generateSignature(timestamp)
            };
          }
          const headers = getRequestHeaders();
          const username = localStorage.getItem('username') || '';
          const payload = { ...filterInternalProps(row), name: row._editName, username };
          const res = await axios.post('https://testapi.lingotok.ai/api/v1/video/update_series', payload, { headers });
          if (res.data && res.data.code === 200) {
            row.name = row._editName;
            MessagePlugin.success('名称修改成功');
          } else {
            MessagePlugin.error(res.data?.message || '名称修改失败');
          }
        } catch (e) {
          MessagePlugin.error('网络错误，名称修改失败');
        }
        row._editPopVisible = false;
      };
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <t-input
            v-model={row._editName}
            size="small"
            style={{
              width: `${Math.max(120, Math.min((row._editName?.length || 4) * 16 + 32, 400))}px`,
              minWidth: '120px',
              maxWidth: '400px'
            }}
          />
          <t-popconfirm
            visible={row._editPopVisible}
            content="确认修改吗"
            onConfirm={handleUpdateName}
            onCancel={() => { row._editPopVisible = false; }}
          >
            <t-button size="small" onClick={() => { row._editPopVisible = true; }}>修改</t-button>
          </t-popconfirm>
        </div>
      );
    }
  },
  {
    colKey: 'cover',
    title: '合集封面',
    align: 'center',
    cell: (h: any, { row }: { row: any }) => {
      if (!row?.id) return '-';

      const handleUploadSuccess = async ({ url }) => {
        try {
          const username = localStorage.getItem('username') || '';
          const payload = {
            ...filterInternalProps(row),
            cover: url,
            username
          };
          const timestamp = Date.now().toString();
          const headers = {
            Timestamp: timestamp,
            Signature: CryptoJS.SHA256(`update_series${timestamp}lingotok`).toString()
          };
          const res = await axios.post('https://testapi.lingotok.ai/api/v1/video/update_series', payload, { headers });
          if (res.data?.code === 200) {
            row.cover = url;
            MessagePlugin.success('封面修改成功');
            coverEditDialogMap[row.id] = false;
          } else {
            MessagePlugin.error(res.data?.message || '修改失败');
          }
        } catch (e) {
          MessagePlugin.error('网络错误，修改失败');
        }
      };

      const handleUploadError = (error) => {
        MessagePlugin.error('上传失败：' + error.message);
      };

      return (
        <div class="cover-column-container">
          {row.cover && row.cover.trim() ? (
            <div>
              <div class="image-preview" onClick={() => coverPreviewVisibleMap[row.id] = true}>
                <img src={row.cover} alt="cover" style="width: 80px; height: 80px; object-fit: cover;" />
              </div>
              <t-image-viewer
                visible={coverPreviewVisibleMap[row.id]}
                images={[row.cover]}
                onClose={() => coverPreviewVisibleMap[row.id] = false}
              />
            </div>
          ) : (
            <div class="image-preview empty-preview" style="cursor: default;">
              <div style="text-align: center; color: #999;">
                <div style="margin-top: 4px; font-size: 12px;">暂无封面</div>
              </div>
            </div>
          )}

          <t-button theme="primary" size="small" onClick={() => coverEditDialogMap[row.id] = true}>
            {row.cover && row.cover.trim() ? '修改封面' : '上传封面'}
          </t-button>

          <t-dialog
            visible={coverEditDialogMap[row.id]}
            header="修改合集封面"
            onClose={() => coverEditDialogMap[row.id] = false}
          >
            <div style="padding: 20px">
              <HuaweiOBSUpload
                accept="image/jpeg,image/png"
                buttonText="上传封面"
                tips="建议尺寸：800x600，支持jpg、png格式"
                folder="series_cover"
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              />
            </div>
          </t-dialog>
        </div>
      );
    }
  },
  {
    colKey: 'level',
    title: '合集Level',
    align: 'center',
    cell: (val, context) => {
      const row = context?.row || context?.data || val?.row || val;
      const id = row?.id;
      // level颜色映射
      const levelColorMap = {
        easy: 'success',
        medium: 'warning',
        hard: 'danger',
      };
      return (
        <div class="tdesign-demo-dropdown" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
          <TTag theme={levelColorMap[row.level] || 'default'}>{row && typeof row.level !== 'undefined' ? row.level : '-'}</TTag>
          <t-dropdown
            options={levelOptions}
            onClick={data => {
              if (row && id) {
                pendingLevelMap[id] = data.value;
                popconfirmVisibleMap[id] = true;
              }
            }}
          >
            <t-button variant="text" size="small">
              <span class="tdesign-demo-dropdown__text">
                <ChevronDownIcon size="16" />
              </span>
            </t-button>
          </t-dropdown>
          <t-popconfirm
            visible={!!popconfirmVisibleMap[id]}
            content="确认修改吗"
            onConfirm={async () => {
              await updateSeriesLevel(row, pendingLevelMap[id]);
              popconfirmVisibleMap[id] = false;
              pendingLevelMap[id] = undefined;
            }}
            onCancel={() => {
              popconfirmVisibleMap[id] = false;
              pendingLevelMap[id] = undefined;
            }}
          >
            {/* 这里不渲染按钮，仅用于气泡确认 */}
            <span></span>
          </t-popconfirm>
        </div>
      );
    }
  },
  {
    colKey: 'interest_list',
    title: '合集Interest列表',
    align: 'center',
    cell: (val, context) => {
      const row = context?.row || context?.data || val?.row || val;
      let interests = row?.interest_list;
      if (typeof interests === 'string') {
        try { interests = JSON.parse(interests); } catch { }
      }
      if (!Array.isArray(interests)) interests = [];
      const id = row?.id;
      // 删除标签弹窗
      const handleDeleteTag = (idx) => {
        interestDeletePopMap[id] = idx;
      };
      const confirmDeleteTag = async () => {
        const idx = interestDeletePopMap[id];
        const newList = interests.slice();
        newList.splice(idx, 1);
        await updateSeriesInterest(row, newList);
        interestDeletePopMap[id] = undefined;
      };
      // 添加标签弹窗
      const handleAddTag = (tag) => {
        interestAddPopMap[id] = tag;
      };
      const confirmAddTag = async () => {
        const tag = interestAddPopMap[id];
        let interestsArr = row?.interest_list;
        if (typeof interestsArr === 'string') {
          try { interestsArr = JSON.parse(interestsArr); } catch { interestsArr = []; }
        }
        if (!Array.isArray(interestsArr)) interestsArr = [];
        if (interestsArr.includes(tag)) {
          interestAddPopMap[id] = undefined;
          return;
        }
        const newList = [...interestsArr, tag];
        await updateSeriesInterest(row, newList);
        interestAddPopMap[id] = undefined;
      };
      // 固定兴趣标签英文名
      const INTEREST_OPTIONS = [
        'food_drink', 'beauty_style', 'music', 'fitness_health', 'vlogs', 'comedy', 'sports', 'entertainment_culture', 'science_education', 'family', 'motivation_advice', 'dance', 'travel', 'gaming', 'pets', 'automotive_vehicle', 'diy', 'art', 'anime_comics', 'life_hacks', 'outdoors', 'oddly_satisfy'
      ];
      const availableOptions = INTEREST_OPTIONS.filter(
        (item) => !interests.includes(item)
      ).map(item => ({ content: item, value: item }));
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
          {interests.length === 0 ? '-' : interests.map((item, idx) => (
            <t-popconfirm
              key={idx}
              visible={interestDeletePopMap[id] === idx}
              content="确认修改吗"
              onConfirm={confirmDeleteTag}
              onCancel={() => { interestDeletePopMap[id] = undefined; }}
            >
              <TTag theme="primary" closable onClose={() => handleDeleteTag(idx)}>{item}</TTag>
            </t-popconfirm>
          ))}
          <t-popconfirm
            visible={!!interestAddPopMap[id]}
            content="确认修改吗"
            onConfirm={confirmAddTag}
            onCancel={() => { interestAddPopMap[id] = undefined; }}
          >
            <t-dropdown
              options={availableOptions}
              trigger="click"
              popupProps={{
                visible: !!addTagDropdownVisibleMap[id],
                onVisibleChange: (v) => { addTagDropdownVisibleMap[id] = v }
              }}
              onClick={data => handleAddTag(data.value)}
              disabled={availableOptions.length === 0}
            >
              <t-button variant="text" size="small" style="padding:0 4px; margin-left:4px; color:#0052d9; border:1px dashed #0052d9; min-width:32px; height:24px; line-height:22px;">+添加</t-button>
            </t-dropdown>
          </t-popconfirm>
        </div>
      );
    }
  }
];

const search = ref('');

// 生成签名
function generateSignature(timestamp: string): string {
  const apiName = 'search_series';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 获取请求头参数
function getRequestHeaders(): { Timestamp: string; Signature: string } {
  const timestamp = Date.now().toString();
  return {
    Timestamp: timestamp,
    Signature: generateSignature(timestamp)
  };
}

async function fetchSeriesData() {
  isLoading.value = true;
  try {
    const headers = getRequestHeaders();
    const offset = (pagination.current - 1) * pagination.pageSize;
    const postData: { offset: number; limit: number; series_name?: string } = {
      offset,
      limit: pagination.pageSize
    };
    if (search.value && search.value.trim() !== '') {
      postData.series_name = search.value;
    }
    const res = await axios.post('https://testapi.lingotok.ai/api/v1/video/search_series', postData, {
      headers
    });
    if (res.data?.code === 200) {
      seriesNameList.value = Array.isArray(res.data.data.series_list) ? res.data.data.series_list : [];
      pagination.total = res.data.data.total || 0;
    } else {
      seriesNameList.value = [];
      pagination.total = 0;
      MessagePlugin.error('获取数据失败');
    }
  } catch (error) {
    console.error('获取系列名称失败:', error);
    seriesNameList.value = [];
    pagination.total = 0;
    MessagePlugin.error('获取数据失败');
  } finally {
    isLoading.value = false;
  }
}

const onSearch = () => {
  pagination.current = 1;
  fetchSeriesData();
};

const allInterestOptions = ref([]);
const addTagDropdownVisibleMap = reactive({}); // { [id]: boolean }
const interestDeletePopMap = reactive({}); // { [rowId]: index }
const interestAddPopMap = reactive({});    // { [rowId]: tag }

onMounted(async () => {
  fetchSeriesData();
  // 获取所有可选标签
  try {
    if (res && res.code === 200 && Array.isArray(res.data.series_name_list)) {
      allInterestOptions.value = res.data.series_name_list;
    } else {
      allInterestOptions.value = [];
    }
  } catch (e) {
    allInterestOptions.value = [];
  }
});

// 过滤掉所有以 _ 开头的字段
function filterRowForApi(row) {
  const result = {};
  for (const key in row) {
    if (!key.startsWith('_')) {
      result[key] = row[key];
    }
  }
  return result;
}

// 添加 OBS 配置
const OBS_CONFIG = {
  AK: 'UI29JOFHTKQRBVVQ06TT',
  SK: 'vaMNt6dy5cJvXDlkzoWVNx3M8O0H5aIkneZSMZom',
  SERVER: 'https://obs.me-east-1.myhuaweicloud.com',
  BUCKET: 'lingotok',
  FOLDER: 'series_cover'
};

// 生成 OBS 上传策略和签名
const getObsPolicy = (filename: string) => {
  const key = `${OBS_CONFIG.FOLDER}/${Date.now()}_${filename}`;
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);

  const policyObj = {
    expiration: expiration.toISOString(),
    conditions: [
      { bucket: OBS_CONFIG.BUCKET },
      ['eq', '$key', key],
      { 'x-obs-acl': 'public-read' },
      ['content-length-range', 0, 5 * 1024 * 1024]
    ]
  };

  const policy = btoa(JSON.stringify(policyObj));
  const signature = CryptoJS.HmacSHA1(policy, OBS_CONFIG.SK).toString(CryptoJS.enc.Base64);

  return {
    key,
    policy,
    signature,
    accessKey: OBS_CONFIG.AK
  };
};

// 上传配置
const uploadConfig = reactive({
  action: OBS_CONFIG.SERVER,
  headers: { 'x-obs-acl': 'public-read' },
  name: 'file',
  key: '',
  accept: 'image/*',
  format: ['jpg', 'jpeg', 'png', 'gif'],
  sizeLimit: 2 * 1024 * 1024,
  data: (file: File) => {
    if (!file) return {};
    const { key, policy, signature, accessKey } = getObsPolicy(file.name);
    uploadConfig.key = key;
    return {
      key,
      'x-obs-acl': 'public-read',
      policy,
      AccessKeyId: accessKey,
      signature
    };
  },
  formatResponse: (res: any, context: { file: UploadFile }) => {
    if (typeof res === 'string') {
      try {
        res = JSON.parse(res);
      } catch (e) {
        if (res === '') {
          return {
            error: null,
            url: `https://${OBS_CONFIG.BUCKET}.${OBS_CONFIG.SERVER.split('//')[1]}/${uploadConfig.key}`
          };
        }
        return { error: '响应格式错误' };
      }
    }
    return res;
  }
} as any); // 使用 as any 临时解决类型问题

// 文件校验函数
const validateUploadFile = async (file: File): Promise<boolean> => {
  if (!file) return false;

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    MessagePlugin.error('只能上传图片文件');
    return false;
  }

  // 检查文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    MessagePlugin.error('图片大小不能超过 2MB');
    return false;
  }

  return true;
};

// 上传成功处理函数
const handleUploadSuccess = (context: SuccessContext) => {
  const res = context.response;
  if (res.error) {
    MessagePlugin.error(res.error);
    return;
  }

  if (res.url) {
    MessagePlugin.success('上传成功');
  } else {
    console.error('Invalid upload response:', res);
    MessagePlugin.error('上传响应格式不正确');
  }
};

// 上传失败处理函数
const handleUploadError = (context: UploadFailContext) => {
  console.error('Upload error:', context);
  MessagePlugin.error('上传失败');
};

// 处理封面上传成功
const handleCoverUploadSuccess = ({ url, file }) => {
  picture.value = url;
  MessagePlugin.success('封面上传成功');
};

// 处理封面上传失败
const handleCoverUploadError = (error) => {
  MessagePlugin.error('封面上传失败：' + error.message);
};

// 处理合集点击
const router = useRouter();
const handleSeriesClick = (row) => {
  // 将搜索参数存储到store中
  store.setSearchParams({
    seriesName: row.name
  });

  // 使用完整的路由路径进行跳转
  router.push({
    path: '/video/videoManage',
    query: {
      seriesName: row.name
    }
  }).catch(err => {
    console.error('路由跳转失败:', err);
    // 如果路由跳转失败,尝试刷新页面
    window.location.href = '/video/videoManage?seriesName=' + encodeURIComponent(row.name);
  });
};
</script>
<style lang="less" scoped>
.choose {
  width: 68px;
  height: 28px;
  line-height: 26px;
  background-color: #0052d9;
  display: flex;
  justify-content: center;
  color: #ffffff;
  border-radius: 12px;
  cursor: pointer;
}

.unchoose {
  width: 68px;
  height: 28px;
  line-height: 26px;
  background-color: #e8e8e8;
  display: flex;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
}

.inputFile {
  /* 隐藏按钮后的文字 */
  font-size: 0;
}

/* 修改按钮后的文字颜色 */
.inputFile[type='file'] {
  color: gray;
}

.icon {
  display: inline-block;
  height: 16px;
  width: 16px;
  background-image: url(../../assets/shangchuan.png);
  /*这里放置图标的绝对路径*/
  background-repeat: no-repeat;
  position: absolute;
  top: 0%;
  left: 0px;
  z-index: 2;
}

.inputFile::file-selector-button {
  width: 116px;
  height: 2rem;
  font-size: 16px;
  color: #000;
  border-radius: 0.25rem;
  border: 1px solid #dddddd;
  padding: 6px 30px;
  background-color: #fff;
  box-sizing: border-box;
  font-family: inherit;
  cursor: pointer;
}

.tdesign-demo-dropdown {
  &__text {
    display: inline-flex;
    align-items: center;

    .t-icon {
      margin-left: 8px;
    }
  }
}

.tdesign-demo-image-viewer__ui-image {
  width: 160px;
  height: 160px;
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  border-radius: var(--td-radius-small);
  overflow: hidden;
}

.tdesign-demo-image-viewer__ui-image--hover {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: var(--td-text-color-anti);
  line-height: 22px;
  transition: 0.2s;
}

.tdesign-demo-image-viewer__ui-image:hover .tdesign-demo-image-viewer__ui-image--hover {
  opacity: 1;
  cursor: pointer;
}

.tdesign-demo-image-viewer__ui-image--img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
  position: absolute;
}

.tdesign-demo-image-viewer__base {
  width: 160px;
  height: 160px;
  margin: 10px;
  border: 4px solid var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-medium);
}

.cover-column-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.image-preview {
  width: 80px;
  height: 80px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #E7E7E7;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-preview {
  background-color: #f5f5f5;
  color: #999;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
