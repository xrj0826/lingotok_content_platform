<template>
  <div class="video-audio-panel">
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
          <t-form :data="audioOptions" label-width="80px">
            <t-form-item label="输出格式" name="outputFormat">
              <t-select v-model="audioOptions.outputFormat" style="width: 100%">
                <t-option value="mp3" label="MP3" />
                <t-option value="wav" label="WAV" />
                <t-option value="aac" label="AAC" />
                <t-option value="ogg" label="OGG" />
              </t-select>
            </t-form-item>
            <t-form-item label="音频质量" name="audioQuality">
              <t-select v-model="audioOptions.audioQuality" style="width: 100%">
                <t-option value="128k" label="128k" />
                <t-option value="192k" label="192k" />
                <t-option value="256k" label="256k" />
                <t-option value="320k" label="320k" />
              </t-select>
            </t-form-item>
            <t-form-item label="采样率" name="sampleRate">
              <t-select v-model="audioOptions.sampleRate" style="width: 100%">
                <t-option :value="44100" label="44.1 kHz" />
                <t-option :value="48000" label="48 kHz" />
                <t-option :value="96000" label="96 kHz" />
              </t-select>
            </t-form-item>
            <t-form-item label="声道" name="channels">
              <t-select v-model="audioOptions.channels" style="width: 100%">
                <t-option :value="1" label="单声道" />
                <t-option :value="2" label="立体声" />
              </t-select>
            </t-form-item>
            <t-form-item label="开始时间" name="startTime">
              <t-input-number
                v-model="audioOptions.startTime"
                :min="0"
                :step="0.1"
                placeholder="秒"
                style="width: 100%"
              />
            </t-form-item>
            <t-form-item label="结束时间" name="endTime">
              <t-input-number
                v-model="audioOptions.endTime"
                :min="audioOptions.startTime"
                :step="0.1"
                placeholder="秒"
                style="width: 100%"
              />
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
              {{ processing ? '提取中...' : '提取音频' }}
            </t-button>
          </div>
        </t-card>
      </t-col>

      <t-col :span="18">
        <t-card title="视频预览" :bordered="false">
          <div v-if="selectedFile" class="video-section">
            <h4>原视频</h4>
            <video
              ref="originalVideoRef"
              :src="originalVideoUrl"
              controls
              class="video-player"
              @loadedmetadata="handleVideoLoaded"
            />
            <div v-if="videoDuration > 0" class="video-info">
              <span>总时长: {{ formatTime(videoDuration) }}</span>
              <span v-if="audioOptions.startTime !== undefined && audioOptions.endTime !== undefined">
                提取片段: {{ formatTime(audioOptions.startTime) }} - {{ formatTime(audioOptions.endTime) }}
              </span>
            </div>
          </div>

          <div v-if="resultAudioUrl" class="audio-section">
            <h4>提取的音频</h4>
            <audio :src="resultAudioUrl" controls class="audio-player" />
            <div class="result-actions">
              <t-button @click="downloadResult">
                <template #icon>
                  <download-icon />
                </template>
                下载音频
              </t-button>
              <t-button variant="outline" @click="clearResult">清除结果</t-button>
            </div>
          </div>

          <div v-if="!selectedFile" class="empty-state">
            <sound-icon class="empty-icon" />
            <p>请选择视频文件开始提取音频</p>
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { SoundIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import { extractAudioFromVideo, createPlayableVideoUrl, revokeVideoUrl } from '@/utils/videoProcessor';

const fileList = ref([]);
const selectedFile = ref<File | null>(null);
const originalVideoUrl = ref('');
const resultAudioUrl = ref('');
const processing = ref(false);
const videoDuration = ref(0);
const originalVideoRef = ref<HTMLVideoElement>();

const audioOptions = reactive({
  outputFormat: 'mp3' as 'mp3' | 'wav' | 'aac' | 'ogg',
  audioQuality: '128k',
  sampleRate: 44100,
  channels: 2,
  startTime: undefined as number | undefined,
  endTime: undefined as number | undefined
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

const handleVideoLoaded = () => {
  if (originalVideoRef.value) {
    videoDuration.value = originalVideoRef.value.duration;
    // 设置默认的结束时间为视频总时长
    if (audioOptions.endTime === undefined) {
      audioOptions.endTime = videoDuration.value;
    }
  }
};

// 监听开始时间变化
watch(() => audioOptions.startTime, (newVal) => {
  if (newVal !== undefined && audioOptions.endTime !== undefined && newVal >= audioOptions.endTime) {
    audioOptions.endTime = Math.min(newVal + 1, videoDuration.value);
  }
});

const handleExtract = async () => {
  if (!selectedFile.value) return;

  try {
    processing.value = true;
    
    const options = {
      outputFormat: audioOptions.outputFormat,
      audioQuality: audioOptions.audioQuality,
      sampleRate: audioOptions.sampleRate,
      channels: audioOptions.channels,
      startTime: audioOptions.startTime,
      endTime: audioOptions.endTime
    };

    const result = await extractAudioFromVideo(selectedFile.value, options);

    if (resultAudioUrl.value) {
      revokeVideoUrl(resultAudioUrl.value);
    }

    resultAudioUrl.value = result;
    MessagePlugin.success('音频提取完成！');
  } catch (error) {
    console.error('音频提取失败:', error);
    MessagePlugin.error(`提取失败: ${error}`);
  } finally {
    processing.value = false;
  }
};

const downloadResult = () => {
  if (resultAudioUrl.value) {
    const link = document.createElement('a');
    link.href = resultAudioUrl.value;
    link.download = `extracted_audio_${Date.now()}.${audioOptions.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const clearResult = () => {
  if (resultAudioUrl.value) {
    revokeVideoUrl(resultAudioUrl.value);
    resultAudioUrl.value = '';
  }
};

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style lang="less" scoped>
.video-audio-panel {
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

    .video-info {
      margin-top: 12px;
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #666;
    }
  }

  .audio-section {
    h4 {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .audio-player {
      width: 100%;
      max-width: 600px;
      margin-bottom: 12px;
    }

    .result-actions {
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






























































































