<template>
  <div class="video-editor-container">
    <t-card :bordered="false">
      <template #header>
        <div class="header-wrapper">
          <h3>视频编辑工具</h3>
          <div class="header-actions">
            <t-button variant="text" @click="showDiagnostic">
              <template #icon>
                <info-circle-icon />
              </template>
              环境诊断
            </t-button>
            <t-button variant="text" @click="showTestPage">
              <template #icon>
                <tools-icon />
              </template>
              详细测试
            </t-button>
            <t-button variant="text" @click="showValidationPage">
              <template #icon>
                <info-circle-icon />
              </template>
              文件验证
            </t-button>
          </div>
        </div>
      </template>

      <t-tabs v-model="activeTab" placement="top">
        <!-- 快速测试 -->
        <t-tab-panel value="test" label="🔧 FFmpeg测试">
          <enhanced-quick-test-panel />
        </t-tab-panel>

        <!-- 视频剪切 -->
        <t-tab-panel value="cut" label="视频剪切">
          <video-cut-panel />
        </t-tab-panel>

        <!-- 视频合并 -->
        <t-tab-panel value="merge" label="视频合并">
          <video-merge-panel />
        </t-tab-panel>

        <!-- 视频转换 -->
        <t-tab-panel value="convert" label="视频转换">
          <video-convert-panel />
        </t-tab-panel>

        <!-- 帧提取 -->
        <t-tab-panel value="frames" label="帧提取">
          <video-frames-panel />
        </t-tab-panel>

        <!-- 音频提取 -->
        <t-tab-panel value="audio" label="音频提取">
          <video-audio-panel />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { InfoCircleIcon, ToolsIcon } from 'tdesign-icons-vue-next';
import { showDiagnosticModal } from '@/utils/ffmpegDiagnostic';
import EnhancedQuickTestPanel from './components/EnhancedQuickTestPanel.vue';
import VideoCutPanel from './components/VideoCutPanel.vue';
import VideoMergePanel from './components/VideoMergePanel.vue';
import VideoConvertPanel from './components/VideoConvertPanel.vue';
import VideoFramesPanel from './components/VideoFramesPanel.vue';
import VideoAudioPanel from './components/VideoAudioPanel.vue';

const activeTab = ref('test');

const showDiagnostic = () => {
  showDiagnosticModal();
};

const showTestPage = () => {
  // 在新标签页中打开测试页面
  const testUrl = `${location.origin}${location.pathname}#/video-editor/test`;
  window.open(testUrl, '_blank');
};

const showValidationPage = () => {
  // 在新标签页中打开文件验证页面
  const validationUrl = `${location.origin}${location.pathname}#/video-editor/validation`;
  window.open(validationUrl, '_blank');
};
</script>

<style lang="less" scoped>
.video-editor-container {
  padding: 24px;

  .header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #1f2937;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
