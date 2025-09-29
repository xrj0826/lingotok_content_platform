<template>
  <div class="video-frames-panel">
    <t-row :gutter="24">
      <t-col :span="6">
        <t-card title="文件选择" :bordered="false" class="settings-card">
          <t-upload
            v-model="fileList"
            :max="1"
            accept="video/*"
            :auto-upload="false"
            :show-upload-progress="false"
            @change="handleFileChange"
          />
        </t-card>

        <t-card title="提取设置" :bordered="false" class="settings-card">
          <t-form :data="frameOptions" label-width="80px">
            <t-form-item label="帧数" name="frameCount">
              <t-input-number
                v-model="frameOptions.frameCount"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </t-form-item>
            <t-form-item label="尺寸" name="size">
              <t-select v-model="frameOptions.size" style="width: 100%" allow-input>
                <t-option value="320x240" label="320x240" />
                <t-option value="640x480" label="640x480" />
                <t-option value="1280x720" label="1280x720" />
              </t-select>
            </t-form-item>
            <t-form-item label="格式" name="format">
              <t-select v-model="frameOptions.format" style="width: 100%">
                <t-option value="png" label="PNG" />
                <t-option value="jpg" label="JPG" />
                <t-option value="webp" label="WebP" />
              </t-select>
            </t-form-item>
            <t-form-item label="提取模式" name="extractMode">
              <t-select v-model="frameOptions.extractMode" style="width: 100%">
                <t-option value="uniform" label="均匀分布" />
                <t-option value="keyframe" label="关键帧" />
                <t-option value="scene" label="场景变化" />
              </t-select>
            </t-form-item>
          </t-form>

          <div class="action-buttons">
            <t-button
              theme="primary"
              :disabled="!selectedFile || processing"
              :loading="processing"
              @click="handleExtract"
              block
            >
              {{ processing ? '提取中...' : '提取帧' }}
            </t-button>
          </div>
        </t-card>
      </t-col>

      <t-col :span="18">
        <t-card title="视频预览" :bordered="false">
          <div v-if="selectedFile" class="video-section">
            <h4>原视频</h4>
            <video :src="originalVideoUrl" controls class="video-player" />
          </div>

          <div v-if="extractedFrames.length > 0" class="frames-section">
            <h4>提取的帧 ({{ extractedFrames.length }}张)</h4>
            <div class="frames-grid">
              <div
                v-for="(frame, index) in extractedFrames"
                :key="index"
                class="frame-item"
                @click="previewFrame(frame)"
              >
                <img :src="frame" :alt="`Frame ${index + 1}`" />
                <div class="frame-index">{{ index + 1 }}</div>
              </div>
            </div>
            <div class="frames-actions">
              <t-button @click="downloadAllFrames">
                <template #icon>
                  <download-icon />
                </template>
                下载所有帧
              </t-button>
              <t-button variant="outline" @click="clearFrames">清除结果</t-button>
            </div>
          </div>

          <div v-if="!selectedFile" class="empty-state">
            <video-icon class="empty-icon" />
            <p>请选择视频文件开始提取帧</p>
          </div>
        </t-card>
      </t-col>
    </t-row>

    <!-- 帧预览模态框 -->
    <t-dialog
      v-model:visible="previewVisible"
      header="帧预览"
      :footer="false"
      width="80%"
    >
      <div class="frame-preview">
        <img :src="previewFrameUrl" alt="Frame Preview" />
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { VideoIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import { extractVideoFrames, createPlayableVideoUrl, revokeVideoUrl } from '@/utils/videoProcessor';

const fileList = ref([]);
const selectedFile = ref<File | null>(null);
const originalVideoUrl = ref('');
const extractedFrames = ref<string[]>([]);
const processing = ref(false);
const previewVisible = ref(false);
const previewFrameUrl = ref('');

const frameOptions = reactive({
  frameCount: 10,
  size: '320x240',
  format: 'png' as 'png' | 'jpg' | 'webp',
  extractMode: 'uniform' as 'uniform' | 'keyframe' | 'scene'
});

const handleFileChange = (files: any[]) => {
  if (files.length > 0) {
    selectedFile.value = files[0].raw;
    originalVideoUrl.value = createPlayableVideoUrl(files[0].raw);
  } else {
    selectedFile.value = null;
    if (originalVideoUrl.value) {
      revokeVideoUrl(originalVideoUrl.value);
      originalVideoUrl.value = '';
    }
  }
};

const handleExtract = async () => {
  if (!selectedFile.value) return;

  try {
    processing.value = true;
    
    const options = {
      frameCount: frameOptions.frameCount,
      size: frameOptions.size,
      format: frameOptions.format,
      extractMode: frameOptions.extractMode
    };

    const frames = await extractVideoFrames(selectedFile.value, options);
    extractedFrames.value = frames;
    MessagePlugin.success(`成功提取${frames.length}帧！`);
  } catch (error) {
    console.error('帧提取失败:', error);
    MessagePlugin.error(`提取失败: ${error}`);
  } finally {
    processing.value = false;
  }
};

const previewFrame = (frameUrl: string) => {
  previewFrameUrl.value = frameUrl;
  previewVisible.value = true;
};

const downloadAllFrames = () => {
  extractedFrames.value.forEach((frame, index) => {
    const link = document.createElement('a');
    link.href = frame;
    link.download = `frame_${(index + 1).toString().padStart(3, '0')}.${frameOptions.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  MessagePlugin.success('开始下载所有帧');
};

const clearFrames = () => {
  extractedFrames.value = [];
};
</script>

<style lang="less" scoped>
.video-frames-panel {
  .settings-card {
    margin-bottom: 16px;
  }

  .action-buttons {
    margin-top: 24px;
  }

  .video-section {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .video-player {
      width: 100%;
      max-width: 800px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .frames-section {
    h4 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .frames-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .frame-item {
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }

      img {
        width: 100%;
        height: auto;
        display: block;
      }

      .frame-index {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 2px;
        font-size: 12px;
      }
    }

    .frames-actions {
      display: flex;
      gap: 12px;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #999;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  }

  .frame-preview {
    text-align: center;

    img {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 4px;
    }
  }
}
</style>

































































































