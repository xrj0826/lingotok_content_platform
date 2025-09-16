<template>
  <div class="video-cut-panel">
    <t-row :gutter="24">
      <!-- 左侧：文件上传和参数设置 -->
      <t-col :span="6">
        <t-card title="文件选择" :bordered="false" class="settings-card">
          <t-upload v-model="fileList" :max="1" accept="video/*" :auto-upload="false" :show-upload-progress="false"
            @change="handleFileChange">
            <template #file-list-display>
              <div v-if="selectedFile" class="file-info">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
            </template>
          </t-upload>
        </t-card>

        <t-card title="剪切设置" :bordered="false" class="settings-card">
          <t-form :data="cutOptions" label-width="80px">
            <t-form-item label="开始时间" name="startTime">
              <t-input-number v-model="cutOptions.startTime" :min="0" :max="videoDuration" :step="0.1" placeholder="秒"
                style="width: 100%" />
            </t-form-item>
            <t-form-item label="结束时间" name="endTime">
              <t-input-number v-model="cutOptions.endTime" :min="cutOptions.startTime" :max="videoDuration" :step="0.1"
                placeholder="秒" style="width: 100%" />
            </t-form-item>
            <t-form-item label="输出格式" name="outputFormat">
              <t-select v-model="cutOptions.outputFormat" style="width: 100%">
                <t-option value="mp4" label="MP4" />
                <t-option value="webm" label="WebM" />
                <t-option value="avi" label="AVI" />
              </t-select>
            </t-form-item>
            <t-form-item label="编码模式" name="mode">
              <t-radio-group v-model="cutOptions.mode">
                <t-radio value="timeline">时间轴模式（推荐）</t-radio>
                <t-radio value="fast">快速模式</t-radio>
                <t-radio value="precise">精确模式</t-radio>
                <t-radio value="nodeModules">Node Modules模式</t-radio>
                <t-radio value="smartFix">智能修复模式</t-radio>
              </t-radio-group>
            </t-form-item>
            
            <!-- 结尾检测提示 -->
            <t-form-item v-if="endingWarning" label="结尾提醒">
              <t-alert theme="warning" :message="endingWarning" />
            </t-form-item>
            <t-form-item v-if="cutOptions.mode === 'precise'" label="视频质量" name="quality">
              <t-slider v-model="cutOptions.quality" :min="0" :max="51" :step="1"
                :marks="{ 0: '最高', 23: '默认', 51: '最低' }" style="width: 100%" />
            </t-form-item>
          </t-form>

          <div class="action-buttons">
            <t-button theme="primary" :disabled="!selectedFile || processing" :loading="processing" @click="handleCut"
              block>
              {{ processing ? '剪切中...' : '开始剪切' }}
            </t-button>

            <!-- 新增：FFmpeg相关工具按钮 -->
            <t-button v-if="showFixButton" theme="default" @click="showFixPanel = !showFixPanel" block
              style="margin-top: 8px;">
              {{ showFixPanel ? '隐藏' : '显示' }}FFmpeg修复工具
            </t-button>

            <t-button theme="default" @click="showValidationPanel = !showValidationPanel" block
              style="margin-top: 8px;">
              {{ showValidationPanel ? '隐藏' : '显示' }}文件验证工具
            </t-button>
          </div>
        </t-card>

        <!-- 新增：FFmpeg修复面板 -->
        <div v-if="showFixPanel" class="fix-panel">
          <FFmpegLoadFixPanel @ffmpeg-loaded="onFFmpegLoaded" />
        </div>

        <!-- 新增：文件验证面板 -->
        <div v-if="showValidationPanel" class="validation-panel">
          <FFmpegFileValidationPanel />
        </div>
      </t-col>

      <!-- 右侧：视频预览和结果 -->
      <t-col :span="18">
        <t-card title="视频预览" :bordered="false">
          <!-- 原视频预览 -->
          <div v-if="selectedFile" class="video-section">
            <h4>原视频</h4>
            <video ref="originalVideoRef" :src="originalVideoUrl" controls class="video-player"
              @loadedmetadata="handleVideoLoaded" />
            <div class="video-info">
              <span>时长: {{ formatTime(videoDuration) }}</span>
              <span>剪切片段: {{ formatTime(cutOptions.startTime) }} - {{ formatTime(cutOptions.endTime) }}</span>
              <span>片段时长: {{ formatTime(cutOptions.endTime - cutOptions.startTime) }}</span>
            </div>
          </div>

          <!-- 剪切结果 -->
          <div v-if="resultVideoUrl" class="video-section">
            <h4>剪切结果</h4>
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

          <!-- 空状态 -->
          <div v-if="!selectedFile" class="empty-state">
            <video-icon class="empty-icon" />
            <p>请选择视频文件开始剪切</p>
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { VideoIcon, DownloadIcon } from 'tdesign-icons-vue-next';
import FFmpegLoadFixPanel from './FFmpegLoadFixPanel.vue';
import FFmpegFileValidationPanel from './FFmpegFileValidationPanel.vue';
import { cutVideoWithFFmpeg, createPlayableVideoUrl, revokeVideoUrl } from '@/utils/videoProcessor';
import { cutVideoWithTimeline } from '@/utils/advancedVideoProcessor';
import { fixedLoadFFmpeg } from '@/utils/ffmpegLoadFix';
import { cutVideoWithNodeModules } from '@/utils/ffmpegNodeModulesSimple';
import { smartCutVideo } from '@/utils/fixedVideoProcessor';

interface CutOptions {
  startTime: number;
  endTime: number;
  outputFormat: string;
  mode: 'fast' | 'precise' | 'timeline' | 'nodeModules' | 'smartFix';
  quality: number;
}

const fileList = ref([]);
const selectedFile = ref<File | null>(null);
const originalVideoUrl = ref('');
const resultVideoUrl = ref('');
const videoDuration = ref(0);
const processing = ref(false);
const originalVideoRef = ref<HTMLVideoElement>();
const showFixPanel = ref(false);
const showFixButton = ref(false);
const ffmpegLoadAttempts = ref(0);
const showValidationPanel = ref(false);
const endingWarning = ref('');

const cutOptions = reactive<CutOptions>({
  startTime: 0,
  endTime: 10,
  outputFormat: 'mp4',
  mode: 'timeline',
  quality: 23
});

// 检测结尾问题
const checkEndingIssue = () => {
  if (videoDuration.value > 0 && cutOptions.endTime > videoDuration.value - 1.0) {
    endingWarning.value = `⚠️ 检测到剪切包含视频结尾最后1秒，可能导致黑屏。建议使用"智能修复模式"或将结束时间调整为 ${(videoDuration.value - 1.0).toFixed(1)}s`;
  } else {
    endingWarning.value = '';
  }
};

// 监听文件变化
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

// 视频加载完成
const handleVideoLoaded = () => {
  if (originalVideoRef.value) {
    videoDuration.value = originalVideoRef.value.duration;
    cutOptions.endTime = Math.min(10, videoDuration.value);
    checkEndingIssue();
  }
};

// 监听开始时间变化
watch(() => cutOptions.startTime, (newVal) => {
  if (newVal >= cutOptions.endTime) {
    cutOptions.endTime = Math.min(newVal + 1, videoDuration.value);
  }
  checkEndingIssue();
});

// 监听结束时间变化
watch(() => cutOptions.endTime, () => {
  checkEndingIssue();
});

// FFmpeg加载成功回调
const onFFmpegLoaded = () => {
  showFixButton.value = false;
  showFixPanel.value = false;
  MessagePlugin.success('FFmpeg已就绪，可以开始视频处理');
};

// 执行剪切
const handleCut = async () => {
  console.log('🎬 [DEBUG] VideoCutPanel.handleCut() 开始执行');
  console.log('📋 [DEBUG] 当前状态检查:', {
    hasSelectedFile: !!selectedFile.value,
    fileName: selectedFile.value?.name,
    startTime: cutOptions.startTime,
    endTime: cutOptions.endTime,
    mode: cutOptions.mode,
    processing: processing.value
  });

  if (!selectedFile.value) {
    console.log('❌ [DEBUG] 没有选择文件，显示警告');
    MessagePlugin.warning('请先选择视频文件');
    return;
  }

  if (cutOptions.startTime >= cutOptions.endTime) {
    console.log('❌ [DEBUG] 时间参数错误，显示警告');
    MessagePlugin.warning('开始时间必须小于结束时间');
    return;
  }

  try {
    console.log('🚀 [DEBUG] 开始视频剪切流程');
    processing.value = true;

    // 清除之前的结果
    if (resultVideoUrl.value) {
      console.log('🧹 [DEBUG] 清除之前的结果URL');
      revokeVideoUrl(resultVideoUrl.value);
      resultVideoUrl.value = '';
    }

    let result: string;

    console.log(`🎯 [DEBUG] 选择剪切模式: ${cutOptions.mode}`);
    
    if (cutOptions.mode === 'nodeModules') {
      console.log('📦 [DEBUG] 使用 Node Modules 模式');
      
      try {
        // 直接使用 node_modules 的 FFmpeg 进行处理
        const nodeModulesStartTime = performance.now();
        
        const ffmpeg = await getFFmpegInstanceFromNodeModules();
        console.log('✅ [DEBUG] Node Modules FFmpeg 实例获取成功');
        
        // 执行视频剪切
        const inputName = `input.${selectedFile.value.name.split('.').pop()}`;
        const outputName = `output.${cutOptions.outputFormat}`;
        
        console.log('📤 [DEBUG] 写入文件到 FFmpeg...');
        await ffmpeg.writeFile(inputName, await (await fetch(URL.createObjectURL(selectedFile.value))).arrayBuffer());
        
        console.log('🎬 [DEBUG] 执行剪切命令...');
        await ffmpeg.exec([
          '-i', inputName,
          '-ss', cutOptions.startTime.toString(),
          '-t', (cutOptions.endTime - cutOptions.startTime).toString(),
          '-c', 'copy',
          outputName
        ]);
        
        console.log('📖 [DEBUG] 读取输出文件...');
        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data as Uint8Array], { type: `video/${cutOptions.outputFormat}` });
        
        result = createPlayableVideoUrl(blob);
        
        // 清理临时文件
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
        
        const nodeModulesEndTime = performance.now();
        console.log(`✅ [DEBUG] Node Modules 模式完成，耗时: ${(nodeModulesEndTime - nodeModulesStartTime).toFixed(2)}ms`);
        
      } catch (nodeModulesError) {
        console.error('💥 [DEBUG] Node Modules 模式失败:', nodeModulesError);
        throw new Error(`Node Modules 模式失败: ${nodeModulesError instanceof Error ? nodeModulesError.message : String(nodeModulesError)}`);
      }
      
    } else if (cutOptions.mode === 'smartFix') {
      console.log('🧠 [DEBUG] 使用智能修复模式');
      
      try {
        const smartStartTime = performance.now();
        
        result = await smartCutVideo(
          selectedFile.value,
          cutOptions.startTime,
          cutOptions.endTime,
          {
            outputFormat: cutOptions.outputFormat,
            videoQuality: cutOptions.quality
          }
        );
        
        const smartEndTime = performance.now();
        console.log(`✅ [DEBUG] 智能修复模式完成，耗时: ${(smartEndTime - smartStartTime).toFixed(2)}ms`);
        
      } catch (smartError) {
        console.error('💥 [DEBUG] 智能修复模式失败:', smartError);
        throw new Error(`智能修复模式失败: ${smartError instanceof Error ? smartError.message : String(smartError)}`);
      }
      
    } else if (cutOptions.mode === 'timeline') {
      console.log('📅 [DEBUG] 使用时间轴剪切方法');
      const timelineOptions = {
        fastMode: false,
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality
      };
      console.log('📋 [DEBUG] 时间轴剪切参数:', timelineOptions);

      const timelineStartTime = performance.now();
      result = await cutVideoWithTimeline(
        selectedFile.value,
        cutOptions.startTime,
        cutOptions.endTime,
        timelineOptions
      );
      const timelineEndTime = performance.now();
      console.log(`✅ [DEBUG] 时间轴剪切完成，耗时: ${(timelineEndTime - timelineStartTime).toFixed(2)}ms`);
    } else {
      console.log('🔧 [DEBUG] 使用传统FFmpeg剪切方法');
      const ffmpegOptions = {
        keepOriginalCodec: cutOptions.mode === 'fast',
        enableReEncode: cutOptions.mode === 'precise',
        outputFormat: cutOptions.outputFormat,
        videoQuality: cutOptions.quality
      };
      console.log('📋 [DEBUG] FFmpeg剪切参数:', ffmpegOptions);

      const ffmpegStartTime = performance.now();
      result = await cutVideoWithFFmpeg(
        selectedFile.value,
        cutOptions.startTime,
        cutOptions.endTime,
        ffmpegOptions
      );
      const ffmpegEndTime = performance.now();
      console.log(`✅ [DEBUG] FFmpeg剪切完成，耗时: ${(ffmpegEndTime - ffmpegStartTime).toFixed(2)}ms`);
    }

    console.log('🎯 [DEBUG] 剪切结果:', {
      resultType: typeof result,
      resultLength: result.length,
      isBlob: result.startsWith('blob:')
    });

    resultVideoUrl.value = result;
    console.log('🎉 [DEBUG] 视频剪切流程成功完成');
    MessagePlugin.success('视频剪切完成！');
  } catch (error) {
    console.error('💥 [DEBUG] 视频剪切失败:', error);
    console.error('🔴 [DEBUG] 错误详细信息:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // 检查是否是FFmpeg加载相关错误
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('🔍 [DEBUG] 错误类型分析:', {
      isFFmpegError: errorMessage.includes('FFmpeg'),
      isSharedArrayBufferError: errorMessage.includes('SharedArrayBuffer'),
      isBlobURLError: errorMessage.includes('toBlobURL'),
      currentAttempts: ffmpegLoadAttempts.value
    });

    if (errorMessage.includes('FFmpeg') || errorMessage.includes('SharedArrayBuffer') || errorMessage.includes('toBlobURL')) {
      ffmpegLoadAttempts.value++;
      showFixButton.value = true;

      console.log(`⚠️ [DEBUG] 检测到FFmpeg加载错误，尝试次数: ${ffmpegLoadAttempts.value}`);

      MessagePlugin.error({
        content: `FFmpeg加载失败: ${errorMessage}`,
        duration: 5000,
        closeBtn: true
      });

      if (ffmpegLoadAttempts.value === 1) {
        console.log('💡 [DEBUG] 首次失败，显示修复建议');
        MessagePlugin.info('建议使用FFmpeg修复工具来解决加载问题');
        showFixPanel.value = true;
      }
    } else {
      console.log('❌ [DEBUG] 非FFmpeg加载错误，显示通用错误信息');
      MessagePlugin.error(`剪切失败: ${errorMessage}`);
    }
  } finally {
    console.log('🏁 [DEBUG] 视频剪切流程结束，重置processing状态');
    processing.value = false;
  }
};

// 下载结果
const downloadResult = () => {
  if (resultVideoUrl.value) {
    const link = document.createElement('a');
    link.href = resultVideoUrl.value;
    link.download = `cut_video_${Date.now()}.${cutOptions.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 清除结果
const clearResult = () => {
  if (resultVideoUrl.value) {
    revokeVideoUrl(resultVideoUrl.value);
    resultVideoUrl.value = '';
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style lang="less" scoped>
.video-cut-panel {
  .settings-card {
    margin-bottom: 16px;
  }

  .file-info {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;
    margin-top: 8px;

    .file-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .file-size {
      font-size: 12px;
      color: #666;
    }
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

  .fix-panel,
  .validation-panel {
    margin-top: 16px;
    border: 1px solid #e0e6ed;
    border-radius: 6px;
    overflow: hidden;

    :deep(.t-card) {
      border: none;
    }

    :deep(.t-card__header) {
      background: #f8f9fa;
      border-bottom: 1px solid #e0e6ed;
    }
  }
}
</style>
