<!-- 视频列表 -->
<template>
  <div>
    <t-loading :loading="detailLoading" fullscreen overlay />
    <t-card class="row-container" :bordered="false">
      <t-space direction="vertical" style="width: 100%">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <t-button theme="primary" @click="showUploadDialog">添加视频</t-button>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">视频ID</div>
            <t-input v-model="searchVideoId" placeholder="搜索视频ID（可选）" style="width: 240px" clearable />
          </div>

          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">Asset ID</div>
            <t-input v-model="searchAssetId" placeholder="搜索Asset ID（可选）" style="width: 240px" clearable />
          </div>

          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">合集名称</div>
            <t-select v-model="searchSeriesName" placeholder="选择合集名称（可选）" style="width: 240px"
              :options="seriesNameOptions" clearable filterable />
          </div>

          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">合集Level</div>
            <t-radio-group v-model="searchLevel" variant="default-filled">
              <t-radio-button value="">全部</t-radio-button>
              <t-radio-button value="easy">Easy</t-radio-button>
              <t-radio-button value="medium">Medium</t-radio-button>
              <t-radio-button value="hard">Hard</t-radio-button>
            </t-radio-group>
          </div>

          <div style="display: flex; align-items: center; flex-wrap: wrap;">
            <div style="margin-right: 10px;">合集Interest</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              <t-tag v-for="interest in selectedInterests" :key="interest" theme="primary" closable
                @close="removeInterest(interest)">
                {{ interest }}
              </t-tag>
              <t-select v-model="currentInterest" placeholder="选择Interest（可选）" style="width: 240px"
                :options="availableInterestOptions" @change="addInterest" />
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-left: auto;">
            <t-button theme="default" @click="handleReset">重置</t-button>
            <t-button theme="primary" @click="handleSearch">搜索</t-button>
          </div>
        </div>

        <t-table row-key="video_id" :data="videoList" :columns="columns" :bordered="true" size="small"
          :loading="loading" :hover="true" :pagination="pagination" @page-change="onPageChange">
          <template #video_status="{ row }">
            <div style="display: flex; align-items: center;">
              <t-popconfirm :content="`确认${row.video_status === 'online' ? '下架' : '上架'}该视频吗？`"
                @confirm="() => handleTableStatusChange(!(row.video_status === 'online'), row)">
                <t-switch :loading="row._statusLoading" :model-value="row.video_status === 'online'"
                  @change="() => { }">
                  <template #label="{ value }">{{ value ? '已上架' : '已下架' }}</template>
                </t-switch>
              </t-popconfirm>
            </div>
          </template>
        </t-table>
      </t-space>
    </t-card>

    <!-- 视频详情弹窗 -->
    <t-dialog v-model:visible="showDetailDialog" header="视频详情" :footer="false" width="1200px"
      :close-on-overlay-click="true">
      <template v-if="currentVideo">
        <div class="video-detail">
          <!-- 左侧视频预览和字幕编辑区域 -->
          <div class="video-preview-section">
            <div class="video-player-box">
              <div v-if="currentVideo.video?.video_trans_code_play_url || currentVideo.video?.video_play_url"
                class="video-container">
                <video ref="videoPlayer" class="video-player"
                  :src="currentVideo.video?.video_trans_code_play_url || currentVideo.video?.video_play_url"
                  :poster="currentVideo.video?.video_cover_url" controls preload="metadata">
                  您的浏览器不支持 HTML5 视频播放
                </video>
              </div>
              <div v-else-if="currentVideo.video?.video_cover_url" class="video-cover">
                <img :src="currentVideo.video.video_cover_url" alt="视频封面" />
                <div class="no-video-tip">暂无可播放视频</div>
              </div>
              <div v-else class="video-placeholder">
                暂无封面和视频
              </div>
            </div>

            <!-- 字幕按钮和编辑区域 -->
            <div class="subtitle-section">
              <div class="subtitle-buttons">
                <t-button v-for="subtitle in currentVideo.video?.subtitle_list" :key="subtitle.language"
                  variant="outline" :theme="currentSubtitle?.language === subtitle.language ? 'primary' : 'default'"
                  @click="handleSubtitleSelect(subtitle)">
                  {{ getSubtitleLanguageName(subtitle.language) }}
                </t-button>
                <t-button v-if="hasDraftButton" variant="outline" :theme="isDraftMode ? 'primary' : 'default'"
                  @click="handleDraftSubtitleSelect">
                  中文草稿字幕
                </t-button>
              </div>

              <!-- 字幕编辑区域 -->
              <div v-if="currentSubtitle || isDraftMode" class="subtitle-editor">
                <div class="subtitle-header">
                  <span>{{ isDraftMode ? '中文草稿字幕' : getSubtitleLanguageName(currentSubtitle.language) }}内容</span>
                  <div class="subtitle-actions">
                    <t-button v-if="isDraftMode" theme="primary" size="small" @click="handleSaveSubtitle"
                      :loading="uploading">
                      保存
                    </t-button>
                  </div>
                </div>
                <t-loading :loading="subtitleLoading">
                  <t-textarea v-model="subtitleContent"
                    :placeholder="`请输入${isDraftMode ? '中文草稿字幕' : getSubtitleLanguageName(currentSubtitle.language)}内容`"
                    :autosize="{ minRows: 10, maxRows: 20 }"
                    :readonly="currentSubtitle?.language !== 'zh' && !isDraftMode" />
                </t-loading>

              </div>
              <div v-else class="subtitle-placeholder">
                请选择要编辑的字幕
              </div>
            </div>
          </div>

          <!-- 右侧信息区域 -->
          <div class="video-info-section">
            <div class="info-group">
              <div class="detail-item">
                <span class="label">Video ID:</span>
                <span class="value">{{ currentVideo.video?.video_id || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">名称:</span>
                <div class="value">
                  <t-input v-model="editingTitle" placeholder="请输入视频名称" style="width: 300px" />
                </div>
              </div>
              <div class="detail-item">
                <span class="label">定制化标签:</span>
                <div class="value">
                  <t-input v-model="editingCustomize" placeholder="请输入定制化标签" style="width: 300px" />
                </div>
              </div>
              <div class="detail-item">
                <span class="label">Asset ID:</span>
                <span class="value">{{ currentVideo.video?.asset_id || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">视频时长:</span>
                <span class="value">{{ formatDuration(currentVideo.video?.duration) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">上架状态:</span>
                <div class="value">
                  <t-radio-group v-model="editingStatus">
                    <t-radio-button value="online">上架</t-radio-button>
                    <t-radio-button value="offline">下架</t-radio-button>
                  </t-radio-group>
                </div>
              </div>
              <div class="detail-item">
                <span class="label">视频备注:</span>
                <div class="value">
                  <t-textarea v-model="editingComment" placeholder="请输入视频备注" :maxlength="500"
                    :autosize="{ minRows: 3, maxRows: 5 }" />
                </div>
              </div>
              <div class="detail-item" style="justify-content: flex-end;">
                <t-button theme="primary" size="small" @click="handleUpdateVideoInfo" :loading="updating">
                  保存修改
                </t-button>
              </div>
            </div>

            <!-- <div class="info-group">
              <div class="detail-item">
                <span class="label">作者名称:</span>
                <span class="value">{{ currentVideo.video?.author_name || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">作者头像:</span>
                <div class="value">
                  <img v-if="currentVideo.video?.author_avatar_url" :src="currentVideo.video.author_avatar_url"
                    alt="作者头像" class="author-avatar" />
                  <span v-else>-</span>
                </div>
              </div>
            </div> -->

            <div class="info-group">
              <div class="detail-item">
                <span class="label">视频观看数:</span>
                <span class="value">{{ currentVideo.video?.watch_cnt || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">视频完播数:</span>
                <span class="value">{{ currentVideo.video?.watch_complete_cnt || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">视频点赞数:</span>
                <span class="value">{{ currentVideo.video?.like_cnt || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">视频收藏数:</span>
                <span class="value">{{ currentVideo.video?.favorite_cnt || 0 }}</span>
              </div>
            </div>

            <div class="info-group">
              <div class="detail-item">
                <span class="label">合集ID:</span>
                <span class="value">{{ currentVideo.video?.series?.id || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">合集名称:</span>
                <div class="value">
                  <t-select v-model="editingSeriesName" placeholder="选择合集名称" style="width: 300px"
                    :options="seriesNameOptions" clearable filterable />
                </div>
              </div>
              <div class="detail-item">
                <span class="label">合集Level:</span>
                <span class="value">{{ currentVideo.video?.series?.level === '<UNSET>' ? '未配置' :
                  (currentVideo.video?.series?.level || '-') }}</span>
              </div>
              <div class="detail-item">
                <span class="label">合集Interest:</span>
                <span class="value">{{ currentVideo.video?.series?.interest_list?.join(', ') || '-' }}</span>
              </div>


              <div class="detail-item" style="justify-content: flex-end;">
                <t-button theme="primary" size="small" @click="handleUpdateVideoInfo" :loading="updating">
                  保存修改
                </t-button>
              </div>



            </div>
            <div class="info-group">
              <div v-if="isDraftMode">
                <div class="info-item">
                  <span class="info-label">修改人：</span>
                  <span class="info-value">{{ currentVideo.video?.draft_subtitle_user || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">修改时间：</span>
                  <span class="info-value">{{ formatDate(currentVideo.video?.draft_subtitle_time) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">行数：</span>
                  <span class="info-value">{{ subtitleRows }}</span>
                </div>
              </div>
            </div>

            <!-- <div v-if="currentVideo.video?.quiz_list?.length" class="info-group">
              <div class="detail-item">
                <span class="label">测验数量:</span>
                <span class="value">{{ currentVideo.video.quiz_list.length }}</span>
              </div>
            </div> -->
          </div>
        </div>
      </template>
    </t-dialog>

    <!-- 上传视频弹窗 -->
    <t-dialog v-model:visible="uploadDialogVisible" header="上传视频" :confirm-btn="{ content: '确认上传', loading: uploading }"
      :cancel-btn="{ content: '取消' }" @confirm="handleUploadConfirm" @close="closeUploadDialog" width="1000px">
      <t-form ref="uploadFormRef" :data="uploadForm" :rules="ruleValidate">
        <t-form-item label="选择合集" name="series_name">
          <t-select v-model="uploadForm.series_name" placeholder="请选择合集" :options="seriesNameOptions" />
        </t-form-item>
        <t-form-item label="上传视频">
          <huawei-o-b-s-upload ref="obsUploadRef" accept="video/*" :max-size="1024 * 1024 * 1024" :multiple="true"
            :max-files="10" folder="videos" @success="handleUploadSuccess" @error="handleUploadFail">
            <t-button theme="primary">
              <upload-icon />选择视频
            </t-button>
            <template #tip>
              <p class="tip">支持视频格式：MP4、AVI等，单个文件不超过1GB</p>
            </template>
          </huawei-o-b-s-upload>
        </t-form-item>
      </t-form>

      <!-- 已上传视频列表 -->
      <div style="margin-top: 16px;">
        <div class="section-title">已上传视频列表</div>
        <t-table :data="uploadedVideoList" :columns="uploadedVideoColumns" :bordered="true" size="small"
          style="margin-top: 8px;">
          <template #url-cell="{ row }">
            <t-link v-if="row.url" :href="row.url" target="_blank" theme="primary" hover="underline">
              {{ row.url }}
            </t-link>
            <span v-else>-</span>
          </template>
          <template #operation-cell="{ row }">
            <t-button theme="danger" variant="text" @click="handleRemoveVideo(row)">
              删除
            </t-button>
          </template>
        </t-table>
      </div>
    </t-dialog>

    <!-- 确认上传弹窗 -->
    <t-dialog v-model:visible="confirmUploadVisible" header="确认上传" :confirm-btn="{ content: '确认', loading: uploading }"
      :cancel-btn="{ content: '取消' }" @confirm="handleFinalUpload" @close="confirmUploadVisible = false">
      <p>确认将以下视频上传到合集"{{ uploadForm.series_name }}"？</p>
      <t-table :data="uploadedVideoList" :columns="uploadedVideoColumns" size="small" :bordered="true">
        <template #url-cell="{ row }">
          <t-link v-if="row.url" :href="row.url" target="_blank" theme="primary" hover="underline">
            {{ row.url }}
          </t-link>
          <span v-else>-</span>
        </template>
        <template #operation-cell="{ row }">
          <t-button theme="danger" variant="text" @click="handleRemoveVideo(row)">
            删除
          </t-button>
        </template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script setup lang="tsx">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import HuaweiOBSUpload from '@/components/HuaweiOBSUpload/index.vue';
import ObsClient from 'esdk-obs-browserjs';
import type { UploadFile, RequestMethodResponse, SwitchValue } from 'tdesign-vue-next';
import { useRenewDataStore } from '@/store/renewData';
import { UploadIcon } from 'tdesign-icons-vue-next';

// 基础数据
const route = useRoute();
const videoList = ref([]);
const loading = ref(false);
const detailLoading = ref(false);
const searchVideoId = ref('');
const searchAssetId = ref('');
const searchSeriesName = ref('');
const searchLevel = ref('');
const selectedInterests = ref([]);
const currentInterest = ref('');
const showDetailDialog = ref(false);
const currentVideo = ref(null);

// 合集名称列表
const seriesNameList = ref([]);
const seriesNameOptions = computed(() => {
  return seriesNameList.value.map(name => ({
    label: name,
    value: name
  }));
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  pageSizeOptions: [10, 20, 50]
});

// 表格列配置
const columns = [
  {
    colKey: 'video_id',
    title: '视频ID',
    width: 230,
    ellipsis: true,
    cell: (h, { row }) => (
      <t-link theme="primary" hover="underline" onClick={() => showVideoDetail(row)}>
        {row.video_id}
      </t-link>
    )
  },
  {
    colKey: 'title',
    title: '视频名称',
    width: 300,
    ellipsis: true
  },
  {
    colKey: 'asset_id',
    title: 'AssetID',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'series.name',
    title: '合集名称',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'series_level',
    title: '合集Level',
    width: 120,
    cell: ({ row }) => {
      const level = row?.series?.level;
      if (!level || level === '<UNSET>') return <t-tag theme="default">未设置</t-tag>;

      const themeMap = {
        easy: 'success',
        medium: 'warning',
        hard: 'danger'
      };

      return <t-tag theme={themeMap[level.toLowerCase()] || 'default'}>{level}</t-tag>;
    }
  },
  {
    colKey: 'series_interest',
    title: '合集Interest列表',
    width: 200,
    cell: ({ row }) => {
      const interests = row?.series?.interest_list;
      if (!interests || !Array.isArray(interests) || interests.length === 0) return '-';
      return interests.join('; ');
    }
  },
  {
    colKey: 'video_status',
    title: '上架状态',
    width: 120
  }
];

// Interest选项
const interestOptions = [
  // 'food_drink', 'beauty_style', 'music', 'fitness_health', 'vlogs', 'comedy',
  // 'sports', 'entertainment_culture', 'science_education', 'family',
  // 'motivation_advice', 'dance', 'travel', 'gaming', 'pets', 'automotive_vehicle',
  // 'diy', 'art', 'anime_comics', 'life_hacks', 'outdoors', 'oddly_satisfy'
];

// 计算可选的Interest选项（排除已选择的）
const availableInterestOptions = computed(() => {
  return interestOptions
    .filter(interest => !selectedInterests.value.includes(interest))
    .map(interest => ({ label: interest, value: interest }));
});

// 添加Interest
const addInterest = (value) => {
  if (value && !selectedInterests.value.includes(value)) {
    selectedInterests.value.push(value);
    currentInterest.value = ''; // 清空选择框
    onSearch();
  }
};

// 移除Interest
const removeInterest = (interest) => {
  selectedInterests.value = selectedInterests.value.filter(item => item !== interest);
  onSearch();
};

// 生成签名
function generateSignature(timestamp: string): string {
  const apiName = 'search_video';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 生成视频详情接口签名
function generateVideoDetailSignature(timestamp: string): string {
  const apiName = 'get_video';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 生成更新视频接口签名
function generateUpdateVideoSignature(timestamp: string): string {
  const apiName = 'update_video_info';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 生成更新字幕接口签名
function generateUploadSubtitleSignature(timestamp: string): string {
  const apiName = 'upload_video_draft_subtitle';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 生成获取合集名称接口签名
function generateSeriesNameSignature(timestamp: string): string {
  const apiName = 'get_all_series_name';
  const signStr = `${apiName}${timestamp}lingotok`;
  return CryptoJS.SHA256(signStr).toString();
}

// 获取请求头
function getRequestHeaders(apiName: string = 'search_video'): { Timestamp: string; Signature: string } {
  const timestamp = Date.now().toString();
  let signature = '';

  // 根据不同的API生成对应的签名
  switch (apiName) {
    case 'get_video':
      signature = generateVideoDetailSignature(timestamp);
      break;
    case 'update_video_info':
      signature = generateUpdateVideoSignature(timestamp);
      break;
    case 'upload_video_draft_subtitle':
      signature = generateUploadSubtitleSignature(timestamp);
      break;
    case 'upload_video':
      signature = CryptoJS.SHA256(`upload_video${timestamp}lingotok`).toString();
      break;
    default:
      signature = generateSignature(timestamp);
  }

  return {
    Timestamp: timestamp,
    Signature: signature
  };
}

// 获取视频列表
async function fetchVideoList() {
  loading.value = true;
  try {
    const headers = getRequestHeaders();
    const offset = (pagination.current - 1) * pagination.pageSize;
    const postData = {
      offset,
      limit: pagination.pageSize,
      ...(searchVideoId.value && { video_id: searchVideoId.value }),
      ...(searchAssetId.value && { asset_id: searchAssetId.value }),
      ...(searchSeriesName.value && { series_name: searchSeriesName.value }),
      ...(searchLevel.value && { series_level: searchLevel.value }),
      ...(selectedInterests.value.length > 0 && { series_interest_list: selectedInterests.value })
    };

    const res = await axios.post('https://api.lingotok.ai/api/v1/video/search_video', postData, {
      headers
    });

    if (res.data?.code === 200 && Array.isArray(res.data.data.video_list)) {
      const videos = res.data.data.video_list.map(video => ({
        ...video,
        _statusLoading: false
      }));
      videoList.value = videos;
      pagination.total = res.data.data.total || 0;
    } else {
      videoList.value = [];
      pagination.total = 0;
      MessagePlugin.error('获取数据失败');
    }
  } catch (error) {
    console.error('获取视频列表失败:', error);
    videoList.value = [];
    pagination.total = 0;
    MessagePlugin.error('获取数据失败');
  } finally {
    loading.value = false;
  }
}

// 处理表格中的状态变更
const handleTableStatusChange = async (value: SwitchValue, row) => {
  if (!row?.video_id) {
    MessagePlugin.warning('视频ID不存在');
    return;
  }

  try {
    row._statusLoading = true;
    const videoId = row.video_id;
    const username = localStorage.getItem('username') || 'unknown';

    // 准备更新参数
    const updateParams = {
      video_id: videoId,
      username: username,
      title: row.title,
      status: value ? 'online' : 'offline',
      customize: row.customize || ''
    };

    // 调用更新接口
    const headers = getRequestHeaders('update_video_info');
    const response = await axios.post(
      'https://api.lingotok.ai/api/v1/video/update_video_info',
      updateParams,
      { headers }
    );

    if (response.data?.code === 200) {
      MessagePlugin.success('更新成功');
      // 更新本地数据
      row.video_status = value ? 'online' : 'offline';
      // 刷新列表
      fetchVideoList();
    } else {
      throw new Error(response.data?.message || '更新失败');
    }
  } catch (error) {
    console.error('更新视频信息失败:', error);
    MessagePlugin.error('更新失败：' + (error instanceof Error ? error.message : '未知错误'));
    // 恢复原状态
    await fetchVideoList();
  } finally {
    row._statusLoading = false;
  }
};

// 分页变化
const onPageChange = (pageInfo) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchVideoList();
};

// 搜索处理
const onSearch = () => {
  pagination.current = 1;
  fetchVideoList();
};

// 显示视频详情
const showVideoDetail = async (row) => {
  try {
    detailLoading.value = true;
    const headers = getRequestHeaders('get_video');
    const res = await axios.post('https://api.lingotok.ai/api/v1/video/get_video',
      { video_id: row.video_id },
      { headers }
    );

    if (res.data?.code === 200) {
      currentVideo.value = res.data.data;
      showDetailDialog.value = true;
      // 初始化编辑状态
      editingStatus.value = row.video_status || 'offline';
      editingComment.value = row.comment || '';
    } else {
      MessagePlugin.error('获取视频详情失败');
    }
  } catch (error) {
    console.error('获取视频详情失败:', error);
    MessagePlugin.error('获取视频详情失败');
  } finally {
    detailLoading.value = false;
  }
};

// 格式化时长
const formatDuration = (duration) => {
  if (!duration) return '-';
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  return `${remainingMinutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 获取字幕语言名称
const getSubtitleLanguageName = (language: string) => {
  const languageMap = {
    'zh': '中文字幕',
    'en': '英文字幕',
    'ar': '阿拉伯语字幕',
    'pinyin': '拼音字幕'
  };
  return languageMap[language] || language;
};

// 字幕相关状态
const currentSubtitle = ref(null);
const subtitleContent = ref('');
const subtitleLoading = ref(false);
const uploading = ref(false);
const isDraftMode = ref(false);
const subtitleRows = ref(0);

// 计算字幕行数
const countSubtitleRows = (content: string) => {
  if (!content) return 0;
  // 按换行符分割并过滤空行
  return content.split('\n').filter(line => line.trim()).length;
};

// 选择字幕
const handleSubtitleSelect = async (subtitle) => {
  try {
    isDraftMode.value = false;
    currentSubtitle.value = subtitle;
    subtitleLoading.value = true;

    // 获取字幕内容
    const response = await axios.get(subtitle.subtitle_play_url);
    subtitleContent.value = response.data;
    subtitleRows.value = countSubtitleRows(response.data);
  } catch (error) {
    console.error('获取字幕内容失败:', error);
    MessagePlugin.error('获取字幕内容失败');
    subtitleContent.value = '';
    subtitleRows.value = 0;
  } finally {
    subtitleLoading.value = false;
  }
};

// 处理草稿字幕选择
const handleDraftSubtitleSelect = async () => {
  try {
    isDraftMode.value = true;
    currentSubtitle.value = null;
    subtitleLoading.value = true;

    // 如果有草稿字幕URL，则获取草稿字幕内容
    if (currentVideo.value?.video?.draft_subtitle_url) {
      const response = await axios.get(currentVideo.value.video.draft_subtitle_url);
      subtitleContent.value = response.data;
    } else {
      // 如果没有草稿字幕，则使用中文字幕内容
      const zhSubtitle = currentVideo.value?.video?.subtitle_list?.find(s => s.language === 'zh');
      if (zhSubtitle) {
        const response = await axios.get(zhSubtitle.subtitle_play_url);
        subtitleContent.value = response.data;
      } else {
        subtitleContent.value = '';
      }
    }

    // 计算行数
    subtitleRows.value = countSubtitleRows(subtitleContent.value);
  } catch (error) {
    console.error('获取草稿字幕内容失败:', error);
    MessagePlugin.error('获取草稿字幕内容失败');
    subtitleContent.value = '';
    subtitleRows.value = 0;
  } finally {
    subtitleLoading.value = false;
  }
};

// 保存字幕
const handleSaveSubtitle = async () => {
  if (!currentVideo.value?.video?.video_id) {
    MessagePlugin.warning('视频ID不存在');
    return;
  }

  try {
    uploading.value = true;
    console.log('开始保存字幕...');

    // 创建字幕文件的 Blob 对象
    const srtBlob = new Blob([subtitleContent.value], { type: 'text/plain' });
    const timestamp = Date.now();
    const username = localStorage.getItem('username') || 'unknown';
    const videoId = currentVideo.value?.video?.video_id;
    const fileName = `draft_subtitle_${videoId}_${username}_${timestamp}.srt`;
    const file = new File([srtBlob], fileName, { type: 'text/plain' });

    console.log('准备上传文件:', fileName);

    // 创建 ObsClient 实例
    const obsClient = new ObsClient({
      access_key_id: 'UI29JOFHTKQRBVVQ06TT',
      secret_access_key: 'vaMNt6dy5cJvXDlkzoWVNx3M8O0H5aIkneZSMZom',
      server: 'https://obs.me-east-1.myhuaweicloud.com',
      timeout: 60,
    });

    // 上传文件到华为云 OBS
    const obsFileName = `draft_subtitle/${fileName}`;
    console.log('开始上传到 OBS:', obsFileName);

    const result = await obsClient.putObject({
      Bucket: 'lingotok',
      Key: obsFileName,
      SourceFile: file,
    });

    console.log('OBS 上传结果:', result);

    if (result.CommonMsg.Status === 200) {
      const fileUrl = `https://lingotok.obs.me-east-1.myhuaweicloud.com/${obsFileName}`;
      console.log('文件上传成功，URL:', fileUrl);

      // 计算字幕行数
      const rows = countSubtitleRows(subtitleContent.value);

      // 准备更新字幕信息的参数
      const updateParams = {
        video_id: videoId,
        username: username,
        draft_subtitle_url: fileUrl,
        draft_subtitle_rows: rows
      };

      console.log('准备更新字幕信息:', updateParams);

      // 调用更新接口
      const headers = getRequestHeaders('upload_video_draft_subtitle');
      console.log('请求头:', headers);

      const response = await axios.post(
        'https://api.lingotok.ai/api/v1/video/upload_video_draft_subtitle',
        updateParams,
        { headers }
      );

      console.log('更新字幕信息响应:', response.data);

      if (response.data?.code === 200) {
        MessagePlugin.success('字幕保存成功');
        // 更新当前字幕的URL和行数
        currentVideo.value.video.draft_subtitle_url = fileUrl;
        currentVideo.value.video.draft_subtitle_rows = rows;
        currentVideo.value.video.draft_subtitle_user = username;
        currentVideo.value.video.draft_subtitle_time = Math.floor(Date.now() / 1000);
        subtitleRows.value = rows;
      } else {
        throw new Error(response.data?.message || '更新失败');
      }
    } else {
      throw new Error('文件上传失败');
    }
  } catch (error) {
    console.error('保存字幕失败:', error);
    MessagePlugin.error('保存字幕失败：' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    uploading.value = false;
  }
};

// 视频播放器引用
const videoPlayer = ref(null);

// 在弹窗关闭时暂停视频播放
watch(showDetailDialog, (newVal) => {
  if (!newVal && videoPlayer.value) {
    videoPlayer.value.pause();
  }
});

// 在弹窗关闭时清空字幕状态
watch(showDetailDialog, (newVal) => {
  if (!newVal) {
    if (videoPlayer.value) {
      videoPlayer.value.pause();
    }
    currentSubtitle.value = null;
    subtitleContent.value = '';
    isDraftMode.value = false;
    subtitleRows.value = 0;
  }
});

// 监听路由参数变化并执行搜索
onMounted(() => {
  // 获取合集名称列表
  fetchSeriesName();

  // 从store中获取搜索参数
  const store = useRenewDataStore();
  if (store.searchParams?.seriesName) {
    searchSeriesName.value = store.searchParams.seriesName;
    onSearch();
    // 清除store中的搜索参数,避免影响下次进入
    store.setSearchParams({ seriesName: '' });
  } else {
    // 只有在没有合集名称参数时才执行初始化加载
    fetchVideoList();
  }
});

// 定义视频状态类型
type VideoStatus = 'online' | 'offline';

// 视频编辑状态
const editingTitle = ref<string>('');
const editingStatus = ref<VideoStatus>('offline');
const updating = ref<boolean>(false);
const editingCustomize = ref<string>('');
const editingSeriesName = ref<string>('');
const editingComment = ref('');

// 监听当前视频变化，初始化编辑值
watch(() => currentVideo.value, (newVideo) => {
  if (newVideo?.video) {
    editingTitle.value = newVideo.video.title || '';
    editingStatus.value = (newVideo.video.video_status as VideoStatus) || 'offline';
    editingCustomize.value = newVideo.video.customize || '';
    editingSeriesName.value = newVideo.video.series?.name || '';
    editingComment.value = newVideo.video.comment || '';  // 初始化视频备注
  }
}, { immediate: true });

// 更新视频信息
const handleUpdateVideoInfo = async () => {
  if (!currentVideo.value?.video?.video_id) {
    MessagePlugin.warning('视频ID不存在');
    return;
  }

  try {
    updating.value = true;
    const videoId = currentVideo.value.video.video_id;
    const username = localStorage.getItem('username') || 'unknown';

    // 准备更新参数
    const updateParams = {
      video_id: videoId,
      username: username,
      title: editingTitle.value,
      status: editingStatus.value,
      customize: editingCustomize.value,
      series_name: editingSeriesName.value,
      comment: editingComment.value
    };

    console.log('准备更新视频信息:', updateParams);

    // 调用更新接口
    const headers = getRequestHeaders('update_video_info');
    const response = await axios.post(
      'https://api.lingotok.ai/api/v1/video/update_video_info',
      updateParams,
      { headers }
    );

    console.log('更新视频信息响应:', response.data);

    if (response.data?.code === 200) {
      MessagePlugin.success('更新成功');
      // 更新本地数据
      currentVideo.value.video.title = editingTitle.value;
      currentVideo.value.video.video_status = editingStatus.value;
      currentVideo.value.video.customize = editingCustomize.value;
      if (currentVideo.value.video.series) {
        currentVideo.value.video.series.name = editingSeriesName.value;
      } else {
        currentVideo.value.video.series = { name: editingSeriesName.value };
      }
      currentVideo.value.video.comment = editingComment.value;
      // 刷新列表
      fetchVideoList();
    } else {
      throw new Error(response.data?.message || '更新失败');
    }
  } catch (error) {
    console.error('更新视频信息失败:', error);
    MessagePlugin.error('更新失败：' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    updating.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  onSearch();
};

// 重置处理
const handleReset = () => {
  searchVideoId.value = '';
  searchAssetId.value = '';
  searchSeriesName.value = '';
  searchLevel.value = '';
  selectedInterests.value = [];
  currentInterest.value = '';
  onSearch();
};

// 获取合集名称列表
async function fetchSeriesName() {
  try {
    const timestamp = Date.now().toString();
    const signature = generateSeriesNameSignature(timestamp);
    const headers = {
      Timestamp: timestamp,
      Signature: signature
    };

    const res = await axios.post('https://api.lingotok.ai/api/v1/video/get_all_series_name', {}, {
      headers
    });

    if (res.data?.code === 200 && Array.isArray(res.data.data.series_name_list)) {
      seriesNameList.value = res.data.data.series_name_list;
    } else {
      seriesNameList.value = [];
    }
  } catch (error) {
    console.error('获取系列名称失败:', error);
    seriesNameList.value = [];
  }
}

// 处理合集名称变化
const onSeriesNameChange = () => {
  onSearch();
};

// 添加中文草稿字幕按钮
const hasDraftButton = ref(false);

watch(() => currentVideo.value, (newVideo) => {
  if (newVideo?.video) {
    // 检查是否有中文字幕
    const hasZhSubtitle = newVideo.video.subtitle_list?.some(s => s.language === 'zh');
    // 只有在有中文字幕的情况下才显示草稿按钮
    hasDraftButton.value = hasZhSubtitle;
  } else {
    hasDraftButton.value = false;
  }
}, { immediate: true });

// 上传相关
const uploadDialogVisible = ref(false);
const uploadForm = reactive({
  series_name: '',
});
const uploadFormRef = ref(null);
const obsUploadRef = ref(null);
const uploadedVideoList = ref<any[]>([]);
const confirmUploadVisible = ref(false);

// 上传规则
const ruleValidate = {
  series_name: [
    {
      required: true,
      message: '请输入系列名称',
      type: 'error' as const
    }
  ]
};

// 已上传视频列表列配置
const uploadedVideoColumns = [
  {
    colKey: 'name',
    title: '视频名称',
    width: 250,
    ellipsis: true
  },
  {
    colKey: 'url',
    title: '视频地址',
    width: 450,
    ellipsis: true,
    cell: 'url-cell'
  },
  {
    colKey: 'uploadTime',
    title: '上传时间',
    width: 180
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 80,
    cell: 'operation-cell'
  }
];

// 显示上传对话框
const showUploadDialog = () => {
  uploadDialogVisible.value = true;
  uploadForm.series_name = '';
  uploadedVideoList.value = [];
};

// 关闭上传对话框
const closeUploadDialog = () => {
  uploadDialogVisible.value = false;
  uploadForm.series_name = '';
  uploadedVideoList.value = [];
};

// 处理上传成功
const handleUploadSuccess = (file: any, response: any) => {
  console.log('上传成功回调:', file, response);

  // 获取视频URL
  let videoUrl = '';
  if (Array.isArray(response) && response[0]?.url) {
    videoUrl = response[0].url;
  } else if (Array.isArray(file.response) && file.response[0]?.url) {
    videoUrl = file.response[0].url;
  } else if (typeof response === 'string') {
    videoUrl = response;
  }

  console.log('提取的视频URL:', videoUrl);

  if (!videoUrl) {
    console.error('无法获取视频URL:', file, response);
    MessagePlugin.warning('无法获取视频URL，请检查上传是否成功');
    return;
  }

  // 将新上传的视频添加到列表中
  const newVideo = {
    name: file.name || '未命名',
    url: videoUrl,
    uploadTime: new Date().toLocaleString()
  };
  console.log('新视频对象:', newVideo);

  // 确保 uploadedVideoList 是响应式数组
  if (!uploadedVideoList.value) {
    uploadedVideoList.value = [];
  }

  // 使用数组方法触发响应式更新
  uploadedVideoList.value = [...uploadedVideoList.value, newVideo];
  console.log('更新后的上传列表:', uploadedVideoList.value);
};

// 处理删除视频
const handleRemoveVideo = (video: any) => {
  if (!video || !uploadedVideoList.value) return;

  const index = uploadedVideoList.value.findIndex(v => v.name === video.name && v.url === video.url);
  if (index > -1) {
    // 从上传列表中移除
    uploadedVideoList.value.splice(index, 1);

    // 同步更新上传组件的文件列表
    if (obsUploadRef.value) {
      obsUploadRef.value.removeFile(video.name);
    }
  }
};

// 处理上传失败
const handleUploadFail = (options: any) => {
  console.error('文件上传失败:', options);
  MessagePlugin.error(`文件上传失败：${options.response?.error || options.error || '未知错误'}`);
};

// 处理最终上传确认
const handleUploadConfirm = async () => {
  const valid = await uploadFormRef.value?.validate();
  if (!valid) return;

  if (!uploadedVideoList.value || uploadedVideoList.value.length === 0) {
    MessagePlugin.warning('请先上传视频文件');
    return;
  }

  // 显示确认对话框
  confirmUploadVisible.value = true;
};

// 处理最终提交
const handleFinalUpload = async () => {
  if (!uploadForm.series_name || uploadedVideoList.value.length === 0) {
    MessagePlugin.warning('请选择合集并上传视频');
    return;
  }

  try {
    uploading.value = true;
    const username = localStorage.getItem('username') || 'unknown';

    // 生成时间戳和签名
    const timestamp = Date.now().toString();
    const signature = CryptoJS.SHA256(`upload_video${timestamp}lingotok`).toString();
    const headers = {
      Timestamp: timestamp,
      Signature: signature
    };

    // 准备上传参数，只包含未删除的视频
    const uploadParams = {
      series_name: uploadForm.series_name,
      upload_video_map: uploadedVideoList.value.reduce((acc, video) => {
        // 只添加未被删除的视频
        if (video && video.url) {
          acc[video.name] = video.url;
        }
        return acc;
      }, {})
    };

    console.log('提交的参数:', uploadParams);
    console.log('请求头:', headers);

    // 调用上传接口
    const response = await axios.post(
      'https://api.lingotok.ai/api/v1/video/upload_video',
      uploadParams,
      { headers }
    );

    if (response.data?.code === 200) {
      MessagePlugin.success('上传成功');
      closeUploadDialog();
      confirmUploadVisible.value = false;
      fetchVideoList();
    } else {
      throw new Error(response.data?.message || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    MessagePlugin.error('上传失败：' + (error.message || '未知错误'));
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.video-title {
  color: #0052d9;
  cursor: pointer;
}

.video-title:hover {
  text-decoration: underline;
}

.video-detail {
  display: flex;
  gap: 24px;
  padding: 20px;
}

.video-preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 600px;
}

.video-player-box {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-cover {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .no-video-tip {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
  }
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}

.subtitle-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.subtitle-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.subtitle-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subtitle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-weight: 500;
    color: #333;
  }
}

.subtitle-actions {
  display: flex;
  gap: 8px;
}

.subtitle-placeholder {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.video-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.detail-item .label {
  width: 120px;
  color: #666;
  font-weight: 500;
}

.detail-item .value {
  flex: 1;
  color: #333;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.subtitle-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #333;
}

.tip {
  color: var(--td-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}

.section-title {
  font-size: 14px;
  color: var(--td-text-color-primary);
  font-weight: 500;
  margin-bottom: 8px;
}
</style>