<!-- 视频详情组件 -->
<template>
  <div class="video-detail-container">
    <!-- 视频播放区域 -->
    <div class="video-section">
      <div class="video-player-wrapper">
        <div v-if="video.videoUrl && video.status === 'completed'" class="video-container">
          <video ref="videoPlayer" :src="video.videoUrl" controls preload="metadata" class="video-player"
            @loadedmetadata="handleVideoLoaded">
            您的浏览器不支持视频播放
          </video>
        </div>

        <div v-else-if="video.status === 'processing'" class="video-placeholder processing">
          <div class="placeholder-content">
            <t-icon name="loading" class="loading-icon" />
            <div class="placeholder-title">视频生成中</div>
            <div class="placeholder-description">请稍候，视频正在生成中...</div>
            <t-progress :percentage="75" size="small" />
          </div>
        </div>

        <div v-else-if="video.status === 'failed'" class="video-placeholder failed">
          <div class="placeholder-content">
            <t-icon name="error-circle" class="error-icon" />
            <div class="placeholder-title">生成失败</div>
            <div class="placeholder-description">视频生成过程中出现错误</div>
            <t-button theme="primary" size="small" @click="retryGeneration">
              重新生成
            </t-button>
          </div>
        </div>

        <div v-else class="video-placeholder">
          <div class="placeholder-content">
            <t-icon name="video" class="video-icon" />
            <div class="placeholder-title">暂无视频</div>
            <div class="placeholder-description">视频尚未生成</div>
          </div>
        </div>
      </div>

      <!-- 视频操作按钮 -->
      <div v-if="video.status === 'completed' && video.videoUrl" class="video-actions">
        <t-button theme="primary" @click="downloadVideo">
          <template #icon>
            <t-icon name="download" />
          </template>
          下载视频
        </t-button>

        <t-button theme="default" @click="shareVideo">
          <template #icon>
            <t-icon name="share" />
          </template>
          分享视频
        </t-button>

        <t-button theme="default" @click="copyVideoUrl">
          <template #icon>
            <t-icon name="link" />
          </template>
          复制链接
        </t-button>
      </div>
    </div>

    <!-- 视频信息区域 -->
    <div class="info-section">
      <!-- 基本信息 -->
      <div class="info-card">
        <h4 class="card-title">基本信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">标题：</span>
            <span class="info-value">{{ video.title || '无标题' }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">类型：</span>
            <span class="info-value">
              <t-tag size="small" theme="light">
                {{ video.type === 'dialogue' ? '对话视频' : '文章视频' }}
              </t-tag>
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">状态：</span>
            <span class="info-value">
              <t-tag size="small" :theme="getStatusTheme(video.status)">
                {{ getStatusText(video.status) }}
              </t-tag>
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatDate(video.createTime) }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">更新时间：</span>
            <span class="info-value">{{ formatDate(video.updateTime) }}</span>
          </div>

          <div v-if="video.duration" class="info-item">
            <span class="info-label">视频时长：</span>
            <span class="info-value">{{ formatDuration(video.duration) }}</span>
          </div>
        </div>
      </div>

      <!-- 生成参数 -->
      <div class="info-card">
        <h4 class="card-title">生成参数</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">选择音色：</span>
            <span class="info-value">{{ getVoiceName(video.voice) }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">播放倍速：</span>
            <span class="info-value">{{ video.speed }}x</span>
          </div>

          <div class="info-item">
            <span class="info-label">内容长度：</span>
            <span class="info-value">{{ video.content.length }} 字符</span>
          </div>
        </div>
      </div>

      <!-- 内容预览 -->
      <div class="info-card">
        <h4 class="card-title">内容预览</h4>
        <div class="content-preview">
          <div v-if="video.type === 'dialogue'" class="dialogue-content">
            <div v-for="(line, index) in parseDialogue(video.content)" :key="index" class="dialogue-line"
              :class="{ 'speaker-a': line.speaker === 'A', 'speaker-b': line.speaker === 'B' }">
              <span class="speaker">{{ line.speaker }}:</span>
              <span class="content">{{ line.content }}</span>
            </div>
          </div>

          <div v-else class="article-content">
            <p v-for="(paragraph, index) in video.content.split('\n').filter(p => p.trim())" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>

      <!-- 操作区域 -->
      <div class="action-section">
        <t-button theme="danger" variant="outline" @click="deleteVideo">
          <template #icon>
            <t-icon name="delete" />
          </template>
          删除视频
        </t-button>

        <t-button v-if="video.status === 'failed'" theme="primary" @click="retryGeneration">
          <template #icon>
            <t-icon name="refresh" />
          </template>
          重新生成
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义视频接口
interface Video {
  id: string;
  title: string;
  content: string;
  type: 'dialogue' | 'article';
  voice: string;
  speed: number;
  status: 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  createTime: number;
  updateTime: number;
}

// 定义 props 和 emits
interface Props {
  video: Video;
}

interface Emits {
  (e: 'close'): void;
  (e: 'delete', video: Video): void;
  (e: 'download', video: Video): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const videoPlayer = ref<HTMLVideoElement>();

// 获取状态主题
const getStatusTheme = (status: string) => {
  switch (status) {
    case 'processing': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'danger';
    default: return 'default';
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'processing': return '生成中';
    case 'completed': return '已完成';
    case 'failed': return '生成失败';
    default: return '未知';
  }
};

// 获取音色名称
const getVoiceName = (voice: string) => {
  const voiceMap: Record<string, string> = {
    'xiaoxiao': '晓晓',
    'yunyang': '云扬',
    'xiaoyi': '小艺',
    'yunhao': '云皓',
    'xiaoran': '小然',
    'yunfeng': '云峰'
  };
  return voiceMap[voice] || voice;
};

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
};

// 格式化时长
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 解析对话内容
const parseDialogue = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const match = line.match(/^([AB]):\s*(.+)$/);
    if (match) {
      return {
        speaker: match[1],
        content: match[2]
      };
    }
    return {
      speaker: '?',
      content: line
    };
  });
};

// 处理视频加载完成
const handleVideoLoaded = () => {
  // 可以在这里处理视频加载完成的逻辑
};

// 下载视频
const downloadVideo = () => {
  emit('download', props.video);
};

// 分享视频
const shareVideo = () => {
  if (navigator.share && props.video.videoUrl) {
    navigator.share({
      title: props.video.title || '我的视频',
      text: '看看我生成的视频！',
      url: props.video.videoUrl
    });
  } else {
    copyVideoUrl();
  }
};

// 复制视频链接
const copyVideoUrl = () => {
  if (props.video.videoUrl) {
    navigator.clipboard.writeText(props.video.videoUrl);
    MessagePlugin.success('视频链接已复制到剪贴板');
  }
};

// 重新生成
const retryGeneration = () => {
  MessagePlugin.info('重新生成功能开发中');
};

// 删除视频
const deleteVideo = () => {
  emit('delete', props.video);
};
</script>

<style scoped>
.video-detail-container {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.video-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-player-wrapper {
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.video-container {
  width: 100%;
  height: 100%;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.video-placeholder.processing {
  background: #eff6ff;
}

.video-placeholder.failed {
  background: #fef2f2;
}

.placeholder-content {
  text-align: center;
  padding: 40px 20px;
}

.loading-icon {
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.video-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.placeholder-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.placeholder-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.video-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.info-section {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.card-title {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
  white-space: nowrap;
}

.info-value {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
  text-align: right;
  word-break: break-all;
}

.content-preview {
  max-height: 300px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}

.dialogue-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialogue-line {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  border-radius: 6px;
}

.dialogue-line.speaker-a {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.dialogue-line.speaker-b {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
}

.speaker {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 20px;
}

.content {
  flex: 1;
  color: #4b5563;
  line-height: 1.5;
}

.article-content p {
  margin: 8px 0;
  color: #4b5563;
  line-height: 1.6;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-detail-container {
    flex-direction: column;
  }

  .info-section {
    width: 100%;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }

  .video-actions {
    justify-content: center;
  }

  .action-section {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .video-actions {
    flex-direction: column;
  }

  .action-section {
    flex-direction: column;
  }
}
</style>














































































