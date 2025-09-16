<template>
  <div class="video-editing-notice">
    <div class="notice-header">
      <t-icon name="video" size="24px" />
      <h4>视频编辑功能</h4>
    </div>

    <div class="notice-content">
      <div v-if="selectedVideoForEdit" class="selected-video-info">
        <p><strong>已选择视频:</strong> {{ selectedVideoForEdit.title }}</p>
        <p><strong>角色:</strong> {{ selectedVideoForEdit.role === 'A' ? '角色A' : '角色B' }}</p>
      </div>

      <div v-if="selectedVideosForMerge.length > 1" class="selected-videos-info">
        <p><strong>已选择拼接视频:</strong> {{ selectedVideosForMerge.length }} 个</p>
        <div class="video-list">
          <div v-for="video in selectedVideosForMerge" :key="video.id" class="video-item">
            {{ video.title }} ({{ video.role === 'A' ? '角色A' : '角色B' }})
          </div>
        </div>
      </div>

      <div class="notice-message">
        <t-alert theme="info" :close="false">
          <template #icon>
            <t-icon name="info-circle" />
          </template>
          为了获得最佳的视频编辑体验，请前往左侧栏的"视频编辑"页面进行视频剪切和拼接操作。
        </t-alert>
      </div>
    </div>

    <div class="notice-actions">
      <t-button theme="primary" @click="downloadSelectedVideos">
        <template #icon>
          <t-icon name="download" />
        </template>
        下载选中视频
      </t-button>
      <t-button variant="outline" @click="clearSelection">
        清空选择
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';

interface VideoItem {
  id: string;
  url: string;
  title: string;
  role: 'A' | 'B';
  file?: File;
  blob?: Blob;
}

interface SelectedVideo {
  id: string;
  role: 'A' | 'B';
  video: VideoItem;
  index: number;
  title: string;
}

const props = defineProps<{
  selectedVideoForEdit?: VideoItem;
  selectedVideosForMerge: SelectedVideo[];
}>();

const emit = defineEmits<{
  clearSelection: [];
}>();

// 下载选中的视频
const downloadSelectedVideos = async () => {
  if (props.selectedVideoForEdit) {
    downloadVideo(props.selectedVideoForEdit);
  }

  if (props.selectedVideosForMerge.length > 0) {
    for (const selectedVideo of props.selectedVideosForMerge) {
      downloadVideo(selectedVideo.video);
      await new Promise(resolve => setTimeout(resolve, 500)); // 避免同时下载太多
    }
  }

  MessagePlugin.success('已开始下载选中的视频');
};

// 下载单个视频
const downloadVideo = (video: VideoItem) => {
  const link = document.createElement('a');
  link.href = video.url;
  link.download = `${video.title || 'video'}.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 清空选择
const clearSelection = () => {
  emit('clearSelection');
};
</script>

<style lang="less" scoped>
.video-editing-notice {
  margin: 24px 0;
  padding: 20px;
  background: #f8faff;
  border: 1px solid #d1e7ff;
  border-radius: 12px;

  .notice-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }
  }

  .notice-content {
    margin-bottom: 16px;

    .selected-video-info,
    .selected-videos-info {
      margin-bottom: 12px;
      padding: 12px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e5e7eb;

      p {
        margin: 4px 0;
        font-size: 14px;
        color: #374151;
      }

      .video-list {
        margin-top: 8px;

        .video-item {
          padding: 4px 8px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }
      }
    }

    .notice-message {
      margin-top: 16px;
    }
  }

  .notice-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
