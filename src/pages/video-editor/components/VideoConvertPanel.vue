<template>
  <div class="video-convert-panel">
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

        <t-card title="转换设置" :bordered="false" class="settings-card">
          <t-form :data="convertOptions" label-width="80px">
            <t-form-item label="输出格式" name="outputFormat">
              <t-select v-model="convertOptions.outputFormat" style="width: 100%">
                <t-option value="mp4" label="MP4" />
                <t-option value="webm" label="WebM" />
                <t-option value="avi" label="AVI" />
                <t-option value="mov" label="MOV" />
              </t-select>
            </t-form-item>
            <t-form-item label="分辨率" name="resolution">
              <t-select v-model="convertOptions.resolution" style="width: 100%" allow-input>
                <t-option value="" label="保持原始" />
                <t-option value="1920x1080" label="1080p" />
                <t-option value="1280x720" label="720p" />
                <t-option value="854x480" label="480p" />
              </t-select>
            </t-form-item>
            <t-form-item label="帧率" name="frameRate">
              <t-select v-model="convertOptions.frameRate" style="width: 100%">
                <t-option :value="0" label="保持原始" />
                <t-option :value="24" label="24 fps" />
                <t-option :value="30" label="30 fps" />
                <t-option :value="60" label="60 fps" />
              </t-select>
            </t-form-item>
            <t-form-item label="视频质量" name="quality">
              <t-slider
                v-model="convertOptions.quality"
                :min="0"
                :max="51"
                :step="1"
                :marks="{ 0: '最高', 23: '默认', 51: '最低' }"
                style="width: 100%"
              />
            </t-form-item>
          </t-form>

          <div class="action-buttons">
            <t-button
              theme="primary"
              :disabled="!selectedFile || processing"
              :loading="processing"
              @click="handleConvert"
              block
            >
              {{ processing ? '转换中...' : '开始转换' }}
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

          <div v-if="resultVideoUrl" class="video-section">
            <h4>转换结果</h4>
            <video :src="resultVideoUrl" controls class="video-player" />
            <div class="result-actions">
              <t-button @click="downloadResult">
                <template #icon>
                  <download-icon />
                </template>
                下载视频
              </t-button>
              <t-button variant="outline" @click="clearResult">清除结果</t-button>
            </div>
          </div>

          <div v-if="!selectedFile" class="empty-state">
            <video-icon class="empty-icon" />
            <p>请选择视频文件开始转换</p>
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { VideoIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import { convertVideo, createPlayableVideoUrl, revokeVideoUrl } from '@/utils/videoProcessor';

const fileList = ref([]);
const selectedFile = ref<File | null>(null);
const originalVideoUrl = ref('');
const resultVideoUrl = ref('');
const processing = ref(false);

const convertOptions = reactive({
  outputFormat: 'mp4',
  resolution: '',
  frameRate: 0,
  quality: 23
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

const handleConvert = async () => {
  if (!selectedFile.value) return;

  try {
    processing.value = true;
    
    const options = {
      outputFormat: convertOptions.outputFormat,
      resolution: convertOptions.resolution || undefined,
      frameRate: convertOptions.frameRate || undefined,
      quality: convertOptions.quality
    };

    const result = await convertVideo(selectedFile.value, options);

    if (resultVideoUrl.value) {
      revokeVideoUrl(resultVideoUrl.value);
    }

    resultVideoUrl.value = result;
    MessagePlugin.success('视频转换完成！');
  } catch (error) {
    console.error('视频转换失败:', error);
    MessagePlugin.error(`转换失败: ${error}`);
  } finally {
    processing.value = false;
  }
};

const downloadResult = () => {
  if (resultVideoUrl.value) {
    const link = document.createElement('a');
    link.href = resultVideoUrl.value;
    link.download = `converted_video_${Date.now()}.${convertOptions.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const clearResult = () => {
  if (resultVideoUrl.value) {
    revokeVideoUrl(resultVideoUrl.value);
    resultVideoUrl.value = '';
  }
};
</script>

<style lang="less" scoped>
.video-convert-panel {
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

    .result-actions {
      margin-top: 12px;
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
}
</style>











































