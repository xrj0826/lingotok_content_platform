<template>
  <div class="ffmpeg-file-validation-panel">
    <t-card title="FFmpeg 文件验证" :bordered="false">
      <!-- 验证状态概览 -->
      <div class="status-overview">
        <div class="status-card"
          :class="{ 'status-success': validationResult?.overall, 'status-error': validationResult && !validationResult.overall }">
          <div class="status-icon">
            <template v-if="validating">
              <t-loading size="24px" />
            </template>
            <template v-else-if="validationResult?.overall">
              ✅
            </template>
            <template v-else-if="validationResult">
              ❌
            </template>
            <template v-else>
              ❓
            </template>
          </div>
          <div class="status-text">
            <h3>
              {{ validating ? '验证中...' :
                validationResult?.overall ? 'FFmpeg 环境正常' :
                  validationResult ? 'FFmpeg 环境有问题' : '点击开始验证' }}
            </h3>
            <p v-if="validationResult">
              {{ validationResult.fileValidation.validFiles }}/{{ validationResult.fileValidation.totalFiles }} 文件可用
            </p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <t-space>
          <t-button theme="primary" :loading="validating" @click="startValidation">
            {{ validating ? '验证中...' : '开始验证' }}
          </t-button>

          <t-button v-if="validationResult" theme="default" @click="downloadReport">
            下载报告
          </t-button>

          <t-button v-if="validationResult && !validationResult.overall" theme="warning" @click="showFixSuggestions">
            查看修复建议
          </t-button>
        </t-space>
      </div>

      <!-- 验证进度 -->
      <div v-if="validating || validationProgress" class="progress-section">
        <t-progress :percentage="validationProgress?.current || 0" :label="true"
          :color="validationProgress?.current === 100 ? '#52c41a' : '#1890ff'" />
        <p class="progress-text">
          {{ validationProgress?.message || '准备验证...' }}
        </p>
      </div>

      <!-- 文件验证结果 -->
      <div v-if="validationResult" class="file-results">
        <h4>文件验证结果</h4>
        <div class="file-grid">
          <div v-for="file in validationResult.fileValidation.results" :key="file.file" class="file-item"
            :class="{ 'file-valid': file.accessible, 'file-invalid': !file.accessible }">
            <div class="file-header">
              <span class="file-icon">
                {{ file.accessible ? '✅' : '❌' }}
              </span>
              <span class="file-name">{{ file.file }}</span>
            </div>
            <div class="file-details">
              <div v-if="file.accessible">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-time">{{ file.loadTime }}ms</span>
              </div>
              <div v-else class="file-error">
                {{ file.error || '无法访问' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 环境检查结果 -->
      <div v-if="validationResult" class="environment-results">
        <h4>环境检查</h4>
        <div class="env-grid">
          <div class="env-item">
            <span class="env-label">SharedArrayBuffer</span>
            <t-tag :theme="validationResult.environment.hasSharedArrayBuffer ? 'success' : 'danger'">
              {{ validationResult.environment.hasSharedArrayBuffer ? '✅ 支持' : '❌ 不支持' }}
            </t-tag>
          </div>
          <div class="env-item">
            <span class="env-label">跨域隔离</span>
            <t-tag :theme="validationResult.environment.isCrossOriginIsolated ? 'success' : 'danger'">
              {{ validationResult.environment.isCrossOriginIsolated ? '✅ 已启用' : '❌ 未启用' }}
            </t-tag>
          </div>
          <div class="env-item">
            <span class="env-label">协议</span>
            <t-tag :theme="isSecureProtocol ? 'success' : 'warning'">
              {{ validationResult.environment.protocol }}
            </t-tag>
          </div>
          <div class="env-item">
            <span class="env-label">FFmpeg工具库</span>
            <t-tag :theme="validationResult.environment.ffmpegUtilAvailable ? 'success' : 'danger'">
              {{ validationResult.environment.ffmpegUtilAvailable ? '✅ 可用' : '❌ 不可用' }}
            </t-tag>
          </div>
        </div>
      </div>

      <!-- toBlobURL 测试结果 -->
      <div v-if="validationResult" class="bloburl-results">
        <h4>toBlobURL 测试</h4>
        <div class="test-result"
          :class="{ 'test-success': validationResult.blobURLTest.success, 'test-failed': !validationResult.blobURLTest.success }">
          <div class="test-status">
            <span class="test-icon">
              {{ validationResult.blobURLTest.success ? '✅' : '❌' }}
            </span>
            <span class="test-text">
              {{ validationResult.blobURLTest.success ? '转换成功' : '转换失败' }}
            </span>
          </div>
          <div v-if="validationResult.blobURLTest.error" class="test-error">
            错误: {{ validationResult.blobURLTest.error }}
          </div>
          <div v-if="validationResult.blobURLTest.details" class="test-details">
            {{ validationResult.blobURLTest.details }}
          </div>
        </div>
      </div>

      <!-- 内容测试结果 -->
      <div v-if="validationResult && validationResult.contentTest.length > 0" class="content-results">
        <h4>文件内容测试</h4>
        <t-collapse>
          <t-collapse-panel v-for="test in validationResult.contentTest" :key="test.file"
            :header="`${test.file} - ${test.success ? '✅ 成功' : '❌ 失败'}`">
            <div v-if="test.success">
              <p><strong>内容类型:</strong> {{ test.contentType }}</p>
              <p><strong>预览:</strong></p>
              <pre class="content-preview">{{ test.preview }}</pre>
            </div>
            <div v-else>
              <p class="error-text">错误: {{ test.error }}</p>
            </div>
          </t-collapse-panel>
        </t-collapse>
      </div>

      <!-- 问题和建议 -->
      <div
        v-if="validationResult && (validationResult.fileValidation.issues.length > 0 || validationResult.fileValidation.suggestions.length > 0)"
        class="issues-suggestions">
        <div v-if="validationResult.fileValidation.issues.length > 0" class="issues">
          <h4>发现的问题</h4>
          <t-alert theme="error" title="需要解决的问题">
            <ul>
              <li v-for="issue in validationResult.fileValidation.issues" :key="issue">
                {{ issue }}
              </li>
            </ul>
          </t-alert>
        </div>

        <div v-if="validationResult.fileValidation.suggestions.length > 0" class="suggestions">
          <h4>解决建议</h4>
          <t-alert theme="warning" title="建议采取以下措施">
            <ul>
              <li v-for="suggestion in validationResult.fileValidation.suggestions" :key="suggestion">
                {{ suggestion }}
              </li>
            </ul>
          </t-alert>
        </div>
      </div>

      <!-- 详细日志 -->
      <div class="log-section">
        <div class="log-header">
          <h4>验证日志</h4>
          <t-button size="small" variant="text" @click="clearLogs">清除</t-button>
        </div>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" :class="['log-item', `log-${log.type}`]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">
            暂无验证日志...
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { FFmpegFileValidator } from '@/utils/ffmpegFileValidator';

interface LogItem {
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface ValidationProgress {
  current: number;
  total: number;
  message: string;
}

const validating = ref(false);
const validationResult = ref<any>(null);
const validationProgress = ref<ValidationProgress | null>(null);
const logs = ref<LogItem[]>([]);

// 计算属性
const isSecureProtocol = computed(() => {
  if (!validationResult.value) return false;
  const protocol = validationResult.value.environment.protocol;
  return protocol === 'https:' || location.hostname === 'localhost';
});

// 添加日志
const addLog = (type: LogItem['type'], message: string) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  });

  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100);
  }
};

// 开始验证
const startValidation = async () => {
  if (validating.value) return;

  validating.value = true;
  validationResult.value = null;
  validationProgress.value = null;

  addLog('info', '开始FFmpeg文件验证...');

  try {
    // 更新进度
    validationProgress.value = { current: 10, total: 100, message: '初始化验证环境...' };

    // 执行完整验证
    const result = await FFmpegFileValidator.validateEnvironment();

    validationProgress.value = { current: 100, total: 100, message: '验证完成' };
    validationResult.value = result;

    if (result.overall) {
      addLog('success', 'FFmpeg环境验证通过！所有文件和环境都正常');
      MessagePlugin.success('FFmpeg环境验证通过！');
    } else {
      addLog('warning', `验证完成，发现 ${result.fileValidation.issues.length} 个问题`);
      MessagePlugin.warning('FFmpeg环境验证发现问题，请查看详细结果');
    }

    // 记录详细结果
    addLog('info', `文件验证: ${result.fileValidation.validFiles}/${result.fileValidation.totalFiles} 个文件可用`);
    addLog('info', `环境检查: SharedArrayBuffer ${result.environment.hasSharedArrayBuffer ? '✅' : '❌'}, 跨域隔离 ${result.environment.isCrossOriginIsolated ? '✅' : '❌'}`);
    addLog('info', `toBlobURL测试: ${result.blobURLTest.success ? '✅ 成功' : '❌ 失败'}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog('error', `验证失败: ${errorMessage}`);
    MessagePlugin.error(`验证失败: ${errorMessage}`);
  } finally {
    validating.value = false;
    validationProgress.value = null;
  }
};

// 下载报告
const downloadReport = () => {
  if (!validationResult.value) return;

  try {
    const report = FFmpegFileValidator.generateReport(validationResult.value);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ffmpeg-validation-report-${new Date().toISOString().slice(0, 19)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    addLog('success', '验证报告已下载');
    MessagePlugin.success('验证报告已下载');
  } catch (error) {
    addLog('error', '下载报告失败');
    MessagePlugin.error('下载报告失败');
  }
};

// 显示修复建议
const showFixSuggestions = () => {
  if (!validationResult.value) return;

  const suggestions = validationResult.value.fileValidation.suggestions;
  if (suggestions.length === 0) {
    MessagePlugin.info('暂无修复建议');
    return;
  }

  const message = `修复建议:\n\n${suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;

  MessagePlugin.info({
    content: message,
    duration: 0,
    closeBtn: true
  });
};

// 清除日志
const clearLogs = () => {
  logs.value = [];
  addLog('info', '日志已清除');
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 自动开始验证
// startValidation();
</script>

<style lang="less" scoped>
.ffmpeg-file-validation-panel {
  .status-overview {
    margin-bottom: 24px;

    .status-card {
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e0e6ed;
      transition: all 0.3s;

      &.status-success {
        border-color: #52c41a;
        background: #f6ffed;
      }

      &.status-error {
        border-color: #ff4d4f;
        background: #fff2f0;
      }

      .status-icon {
        font-size: 32px;
        margin-right: 16px;
      }

      .status-text {
        h3 {
          margin: 0 0 4px 0;
          color: #1f2937;
        }

        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
  }

  .action-buttons {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .progress-section {
    margin-bottom: 24px;

    .progress-text {
      margin-top: 8px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  }

  .file-results {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;

      .file-item {
        border: 1px solid #e0e6ed;
        border-radius: 6px;
        padding: 12px;
        transition: all 0.3s;

        &.file-valid {
          border-color: #52c41a;
          background: #f6ffed;
        }

        &.file-invalid {
          border-color: #ff4d4f;
          background: #fff2f0;
        }

        .file-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .file-icon {
            margin-right: 8px;
            font-size: 16px;
          }

          .file-name {
            font-weight: 500;
            color: #1f2937;
          }
        }

        .file-details {
          font-size: 12px;
          color: #666;

          .file-size {
            margin-right: 12px;
          }

          .file-error {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .environment-results,
  .bloburl-results {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .env-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;

      .env-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;

        .env-label {
          font-weight: 500;
        }
      }
    }

    .test-result {
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0e6ed;

      &.test-success {
        border-color: #52c41a;
        background: #f6ffed;
      }

      &.test-failed {
        border-color: #ff4d4f;
        background: #fff2f0;
      }

      .test-status {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .test-icon {
          margin-right: 8px;
          font-size: 16px;
        }

        .test-text {
          font-weight: 500;
        }
      }

      .test-error {
        color: #ff4d4f;
        font-size: 14px;
      }

      .test-details {
        color: #666;
        font-size: 14px;
      }
    }
  }

  .content-results {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .content-preview {
      background: #f8f9fa;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      max-height: 150px;
      overflow-y: auto;
    }

    .error-text {
      color: #ff4d4f;
    }
  }

  .issues-suggestions {
    margin-bottom: 24px;

    .issues,
    .suggestions {
      margin-bottom: 16px;

      h4 {
        margin-bottom: 8px;
        color: #1f2937;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 4px;
        }
      }
    }
  }

  .log-section {
    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: #1f2937;
      }
    }

    .log-container {
      max-height: 300px;
      overflow-y: auto;
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;

      .log-item {
        display: flex;
        margin-bottom: 4px;
        font-size: 12px;

        .log-time {
          color: #999;
          margin-right: 8px;
          min-width: 80px;
        }

        .log-message {
          flex: 1;
        }

        &.log-info .log-message {
          color: #666;
        }

        &.log-success .log-message {
          color: #52c41a;
        }

        &.log-warning .log-message {
          color: #d4851f;
        }

        &.log-error .log-message {
          color: #ff4d4f;
        }
      }

      .log-empty {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 20px;
      }
    }
  }
}
</style>


















































































