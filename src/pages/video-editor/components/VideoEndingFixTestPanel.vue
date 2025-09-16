<template>
  <div class="video-ending-fix-panel">
    <t-card title="视频结尾黑屏修复测试" :bordered="false">
      <div class="test-content">
        <!-- 文件上传区域 -->
        <div class="upload-section">
          <t-upload
            v-model="fileList"
            :max="1"
            accept="video/*"
            :auto-upload="false"
            :show-upload-progress="false"
            @change="handleFileChange"
          >
            <template #file-list-display>
              <div v-if="selectedFile" class="file-info">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-details">
                  <span>大小: {{ formatFileSize(selectedFile.size) }}</span>
                  <span v-if="videoDuration > 0">时长: {{ formatTime(videoDuration) }}</span>
                </div>
              </div>
            </template>
          </t-upload>
        </div>

        <!-- 视频预览 -->
        <div v-if="selectedFile" class="video-preview-section">
          <h4>原视频预览</h4>
          <video
            ref="originalVideoRef"
            :src="originalVideoUrl"
            controls
            class="video-player"
            @loadedmetadata="handleVideoLoaded"
          />
        </div>

        <!-- 剪切配置 -->
        <div v-if="videoDuration > 0" class="cut-config-section">
          <h4>剪切配置</h4>
          <t-form :data="cutConfig" label-width="120px">
            <t-form-item label="开始时间" name="startTime">
              <t-input-number
                v-model="cutConfig.startTime"
                :min="0"
                :max="videoDuration"
                :step="0.1"
                placeholder="秒"
                style="width: 150px"
              />
              <t-button size="small" @click="setStartTime(0)" style="margin-left: 8px">
                开头
              </t-button>
            </t-form-item>
            
            <t-form-item label="结束时间" name="endTime">
              <t-input-number
                v-model="cutConfig.endTime"
                :min="cutConfig.startTime"
                :max="videoDuration"
                :step="0.1"
                placeholder="秒"
                style="width: 150px"
              />
              <t-button size="small" @click="setEndTime(videoDuration)" style="margin-left: 8px">
                结尾
              </t-button>
              <t-button size="small" @click="setEndTime(videoDuration - 0.5)" style="margin-left: 4px">
                结尾-0.5s
              </t-button>
            </t-form-item>

            <t-form-item label="剪切时长" name="duration">
              <span>{{ formatTime(cutConfig.endTime - cutConfig.startTime) }}</span>
            </t-form-item>

            <t-form-item label="测试模式" name="testMode">
              <t-checkbox-group v-model="selectedModes">
                <t-checkbox value="traditional">传统方式</t-checkbox>
                <t-checkbox value="safe">安全模式</t-checkbox>
                <t-checkbox value="precise">精确模式</t-checkbox>
                <t-checkbox value="smart">智能模式</t-checkbox>
              </t-checkbox-group>
            </t-form-item>
          </t-form>

          <!-- 问题检测 -->
          <div v-if="detectionResult" class="detection-section">
            <h5>
              <t-icon :name="detectionResult.hasEndingIssue ? 'error-circle' : 'check-circle'" />
              问题检测结果
            </h5>
            <div class="detection-info">
              <div class="detection-status">
                <span :class="detectionResult.hasEndingIssue ? 'has-issue' : 'no-issue'">
                  {{ detectionResult.hasEndingIssue ? '⚠️ 可能存在结尾黑屏问题' : '✅ 无结尾问题' }}
                </span>
              </div>
              <div v-if="detectionResult.recommendations.length > 0" class="recommendations">
                <strong>建议:</strong>
                <ul>
                  <li v-for="rec in detectionResult.recommendations" :key="rec">{{ rec }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 测试按钮 -->
          <div class="test-actions">
            <t-button
              theme="primary"
              :loading="testing"
              :disabled="selectedModes.length === 0"
              @click="runTests"
            >
              开始测试 ({{ selectedModes.length }}种模式)
            </t-button>
            <t-button @click="detectIssues" :loading="detecting">
              检测问题
            </t-button>
            <t-button variant="outline" @click="clearResults">
              清除结果
            </t-button>
          </div>
        </div>

        <!-- 测试结果 -->
        <div v-if="testResults.length > 0" class="results-section">
          <h4>测试结果对比</h4>
          <div class="results-grid">
            <div
              v-for="result in testResults"
              :key="result.mode"
              :class="['result-card', result.success ? 'success' : 'failed']"
            >
              <div class="result-header">
                <h5>{{ getModeDisplayName(result.mode) }}</h5>
                <span class="result-status">
                  {{ result.success ? '✅' : '❌' }}
                </span>
              </div>
              
              <div class="result-info">
                <div v-if="result.success">
                  <div>处理时间: {{ result.processingTime }}ms</div>
                  <div>文件大小: {{ formatFileSize(result.outputSize || 0) }}</div>
                </div>
                <div v-if="result.error" class="error-info">
                  错误: {{ result.error }}
                </div>
              </div>

              <div v-if="result.success && result.videoUrl" class="result-video">
                <video
                  :src="result.videoUrl"
                  controls
                  class="result-player"
                  preload="metadata"
                />
                <div class="video-actions">
                  <t-button size="small" @click="downloadResult(result)">
                    下载
                  </t-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 测试日志 -->
        <div v-if="testLogs.length > 0" class="logs-section">
          <h4>
            测试日志
            <t-button size="small" variant="text" @click="clearLogs">清除</t-button>
          </h4>
          <div class="logs-container">
            <div
              v-for="(log, index) in testLogs"
              :key="index"
              :class="['log-item', log.level]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { cutVideoFixed, smartCutVideo, detectEndingIssues } from '@/utils/fixedVideoProcessor';
import { cutVideoWithFFmpeg } from '@/utils/videoProcessor';
import { createPlayableVideoUrl, revokeVideoUrl } from '@/utils/videoProcessor';

interface CutConfig {
  startTime: number;
  endTime: number;
}

interface TestResult {
  mode: string;
  success: boolean;
  processingTime?: number;
  outputSize?: number;
  videoUrl?: string;
  error?: string;
}

interface TestLog {
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

const fileList = ref([]);
const selectedFile = ref<File | null>(null);
const originalVideoUrl = ref('');
const videoDuration = ref(0);
const originalVideoRef = ref<HTMLVideoElement>();

const cutConfig = reactive<CutConfig>({
  startTime: 0,
  endTime: 5
});

const selectedModes = ref(['traditional', 'smart']);
const testing = ref(false);
const detecting = ref(false);
const testResults = ref<TestResult[]>([]);
const testLogs = ref<TestLog[]>([]);
const detectionResult = ref<any>(null);

// 处理文件变化
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
    cutConfig.endTime = Math.min(videoDuration.value, 5);
    
    // 自动检测问题
    detectIssues();
  }
};

// 设置时间快捷方法
const setStartTime = (time: number) => {
  cutConfig.startTime = time;
};

const setEndTime = (time: number) => {
  cutConfig.endTime = Math.min(time, videoDuration.value);
};

// 检测问题
const detectIssues = async () => {
  if (!selectedFile.value) return;

  detecting.value = true;
  try {
    detectionResult.value = await detectEndingIssues(
      selectedFile.value,
      cutConfig.startTime,
      cutConfig.endTime
    );
    
    addLog('info', `问题检测完成: ${detectionResult.value.hasEndingIssue ? '发现潜在问题' : '无问题'}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addLog('error', `问题检测失败: ${errorMsg}`);
  } finally {
    detecting.value = false;
  }
};

// 运行测试
const runTests = async () => {
  if (!selectedFile.value) {
    MessagePlugin.warning('请先选择视频文件');
    return;
  }

  testing.value = true;
  testResults.value = [];

  addLog('info', `开始测试 ${selectedModes.value.length} 种模式`);

  for (const mode of selectedModes.value) {
    await runSingleTest(mode);
  }

  testing.value = false;
  addLog('success', '所有测试完成');
  MessagePlugin.success('测试完成');
};

// 运行单个测试
const runSingleTest = async (mode: string) => {
  const startTime = performance.now();
  
  try {
    addLog('info', `开始测试 ${getModeDisplayName(mode)} 模式`);
    
    let videoUrl: string;
    
    switch (mode) {
      case 'traditional':
        videoUrl = await cutVideoWithFFmpeg(
          selectedFile.value!,
          cutConfig.startTime,
          cutConfig.endTime,
          { keepOriginalCodec: true }
        );
        break;
        
      case 'safe':
        videoUrl = await cutVideoFixed(selectedFile.value!, {
          startTime: cutConfig.startTime,
          endTime: cutConfig.endTime,
          mode: 'safe'
        });
        break;
        
      case 'precise':
        videoUrl = await cutVideoFixed(selectedFile.value!, {
          startTime: cutConfig.startTime,
          endTime: cutConfig.endTime,
          mode: 'precise'
        });
        break;
        
      case 'smart':
        videoUrl = await smartCutVideo(
          selectedFile.value!,
          cutConfig.startTime,
          cutConfig.endTime
        );
        break;
        
      default:
        throw new Error(`未知的测试模式: ${mode}`);
    }
    
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);
    
    // 获取输出文件大小
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    
    testResults.value.push({
      mode,
      success: true,
      processingTime,
      outputSize: blob.size,
      videoUrl
    });
    
    addLog('success', `${getModeDisplayName(mode)} 模式测试成功 (${processingTime}ms)`);
    
  } catch (error) {
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    testResults.value.push({
      mode,
      success: false,
      processingTime,
      error: errorMsg
    });
    
    addLog('error', `${getModeDisplayName(mode)} 模式测试失败: ${errorMsg}`);
  }
};

// 获取模式显示名称
const getModeDisplayName = (mode: string): string => {
  const names: Record<string, string> = {
    traditional: '传统方式',
    safe: '安全模式',
    precise: '精确模式',
    smart: '智能模式'
  };
  return names[mode] || mode;
};

// 下载结果
const downloadResult = (result: TestResult) => {
  if (result.videoUrl) {
    const link = document.createElement('a');
    link.href = result.videoUrl;
    link.download = `test_${result.mode}_${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 添加日志
const addLog = (level: TestLog['level'], message: string) => {
  testLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    level,
    message
  });
  
  // 限制日志数量
  if (testLogs.value.length > 100) {
    testLogs.value.splice(50);
  }
};

// 清除结果
const clearResults = () => {
  // 清理视频URL
  testResults.value.forEach(result => {
    if (result.videoUrl) {
      revokeVideoUrl(result.videoUrl);
    }
  });
  
  testResults.value = [];
  detectionResult.value = null;
  MessagePlugin.info('结果已清除');
};

// 清除日志
const clearLogs = () => {
  testLogs.value = [];
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
  const ms = Math.floor((seconds % 1) * 1000);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};
</script>

<style lang="less" scoped>
.video-ending-fix-panel {
  .test-content {
    .upload-section {
      margin-bottom: 24px;
      padding: 16px;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      text-align: center;

      .file-info {
        .file-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .file-details {
          font-size: 12px;
          color: #6b7280;

          span {
            margin-right: 16px;
          }
        }
      }
    }

    .video-preview-section {
      margin-bottom: 24px;

      h4 {
        margin-bottom: 12px;
        color: #1f2937;
      }

      .video-player {
        width: 100%;
        max-width: 600px;
        height: auto;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .cut-config-section {
      margin-bottom: 24px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 6px;

      h4 {
        margin-bottom: 16px;
        color: #1f2937;
      }

      .detection-section {
        margin: 16px 0;
        padding: 12px;
        border-radius: 4px;

        h5 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .detection-info {
          .detection-status {
            margin-bottom: 8px;

            .has-issue {
              color: #ef4444;
              font-weight: 500;
            }

            .no-issue {
              color: #10b981;
              font-weight: 500;
            }
          }

          .recommendations {
            ul {
              margin: 4px 0 0 16px;
              
              li {
                margin-bottom: 2px;
                font-size: 14px;
                color: #374151;
              }
            }
          }
        }
      }

      .test-actions {
        margin-top: 16px;
        display: flex;
        gap: 12px;
      }
    }

    .results-section {
      margin-bottom: 24px;

      h4 {
        margin-bottom: 16px;
        color: #1f2937;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;

        .result-card {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 16px;

          &.success {
            border-color: #10b981;
            background: #f0fdf4;
          }

          &.failed {
            border-color: #ef4444;
            background: #fef2f2;
          }

          .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            h5 {
              margin: 0;
              color: #1f2937;
            }

            .result-status {
              font-size: 18px;
            }
          }

          .result-info {
            margin-bottom: 12px;
            font-size: 14px;

            .error-info {
              color: #ef4444;
            }
          }

          .result-video {
            .result-player {
              width: 100%;
              height: auto;
              border-radius: 4px;
              margin-bottom: 8px;
            }

            .video-actions {
              text-align: center;
            }
          }
        }
      }
    }

    .logs-section {
      h4 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        color: #1f2937;
      }

      .logs-container {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        background: #f8f9fa;

        .log-item {
          display: flex;
          padding: 4px 8px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          border-bottom: 1px solid #e5e7eb;

          .log-time {
            min-width: 80px;
            color: #6b7280;
            margin-right: 8px;
          }

          .log-message {
            flex: 1;
          }

          &.info {
            background: #f8fafc;
          }

          &.success {
            background: #f0fdf4;
            color: #166534;
          }

          &.warn {
            background: #fffbeb;
            color: #d97706;
          }

          &.error {
            background: #fef2f2;
            color: #dc2626;
          }
        }
      }
    }
  }
}
</style>
























