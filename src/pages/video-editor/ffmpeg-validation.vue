<template>
  <div class="ffmpeg-validation-page">
    <t-layout>
      <t-header>
        <div class="header-content">
          <h1>FFmpeg 文件验证工具</h1>
          <p>检查所有FFmpeg文件是否可以正常引入和访问</p>
        </div>
      </t-header>

      <t-content>
        <div class="validation-container">
          <!-- 快速验证 -->
          <t-card title="快速验证" :bordered="false" class="validation-card">
            <div class="quick-actions">
              <t-space direction="horizontal" size="large">
                <t-button theme="primary" :loading="quickValidating" @click="runQuickValidation">
                  {{ quickValidating ? '验证中...' : '开始验证' }}
                </t-button>
                <t-button theme="default" :loading="fullValidating" @click="runFullValidation">
                  {{ fullValidating ? '全面检查中...' : '全面检查' }}
                </t-button>
                <t-button theme="default" @click="clearResults">清除结果</t-button>
              </t-space>
            </div>

            <!-- 验证进度 -->
            <div v-if="validationProgress" class="progress-section">
              <t-progress :percentage="validationProgress.percentage" :label="false" size="medium" />
              <div class="progress-text">
                正在检查: {{ validationProgress.currentFile }} ({{ validationProgress.current }}/{{ validationProgress.total
                }})
              </div>
            </div>
          </t-card>

          <!-- 验证结果 -->
          <t-card v-if="validationResult" title="验证结果" :bordered="false" class="validation-card">
            <!-- 总体状态 -->
            <div class="overall-status">
              <t-alert :theme="validationResult.fileValidation.allValid ? 'success' : 'error'"
                :title="validationResult.fileValidation.allValid ? '✅ 所有文件验证通过' : '❌ 发现文件问题'">
                <div class="status-summary">
                  <p>有效文件: {{ validationResult.fileValidation.validFiles }}/{{
                    validationResult.fileValidation.totalFiles }}</p>
                  <p>总大小: {{ formatFileSize(validationResult.fileValidation.totalSize) }}</p>
                </div>
              </t-alert>
            </div>

            <!-- 文件详情表格 -->
            <div class="file-details">
              <h4>文件详情</h4>
              <t-table :data="validationResult.fileValidation.results" :columns="fileColumns" row-key="file"
                size="small" max-height="400">
                <template #status="{ row }">
                  <t-tag :theme="row.accessible ? 'success' : 'danger'">
                    {{ row.accessible ? '✅ 正常' : '❌ 异常' }}
                  </t-tag>
                </template>
                <template #size="{ row }">
                  {{ row.accessible ? formatFileSize(row.size) : '-' }}
                </template>
                <template #loadTime="{ row }">
                  {{ row.loadTime }}ms
                </template>
                <template #error="{ row }">
                  <span v-if="row.error" class="error-text">{{ row.error }}</span>
                  <span v-else>-</span>
                </template>
              </t-table>
            </div>
          </t-card>

          <!-- 全面检查结果 -->
          <t-card v-if="fullValidationResult" title="全面检查结果" :bordered="false" class="validation-card">
            <!-- 环境检查 -->
            <div class="environment-check">
              <h4>环境检查</h4>
              <div class="env-grid">
                <div class="env-item">
                  <span>SharedArrayBuffer</span>
                  <t-tag :theme="fullValidationResult.environment.hasSharedArrayBuffer ? 'success' : 'danger'">
                    {{ fullValidationResult.environment.hasSharedArrayBuffer ? '✅ 支持' : '❌ 不支持' }}
                  </t-tag>
                </div>
                <div class="env-item">
                  <span>跨域隔离</span>
                  <t-tag :theme="fullValidationResult.environment.isCrossOriginIsolated ? 'success' : 'danger'">
                    {{ fullValidationResult.environment.isCrossOriginIsolated ? '✅ 已启用' : '❌ 未启用' }}
                  </t-tag>
                </div>
                <div class="env-item">
                  <span>协议</span>
                  <t-tag
                    :theme="fullValidationResult.environment.protocol === 'https:' || location.hostname === 'localhost' ? 'success' : 'warning'">
                    {{ fullValidationResult.environment.protocol }}
                  </t-tag>
                </div>
                <div class="env-item">
                  <span>FFmpeg工具库</span>
                  <t-tag :theme="fullValidationResult.environment.ffmpegUtilAvailable ? 'success' : 'danger'">
                    {{ fullValidationResult.environment.ffmpegUtilAvailable ? '✅ 可用' : '❌ 不可用' }}
                  </t-tag>
                </div>
              </div>
            </div>

            <!-- toBlobURL测试 -->
            <div class="bloburl-test">
              <h4>toBlobURL 转换测试</h4>
              <t-alert :theme="fullValidationResult.blobURLTest.success ? 'success' : 'error'"
                :title="fullValidationResult.blobURLTest.success ? '✅ toBlobURL 转换正常' : '❌ toBlobURL 转换失败'">
                <p v-if="fullValidationResult.blobURLTest.details">{{ fullValidationResult.blobURLTest.details }}</p>
                <p v-if="fullValidationResult.blobURLTest.error" class="error-text">{{
                  fullValidationResult.blobURLTest.error }}
                </p>
              </t-alert>
            </div>

            <!-- 内容测试 -->
            <div v-if="fullValidationResult.contentTest.length > 0" class="content-test">
              <h4>文件内容测试</h4>
              <div v-for="test in fullValidationResult.contentTest" :key="test.file" class="content-item">
                <div class="content-header">
                  <span class="file-name">{{ test.file }}</span>
                  <t-tag :theme="test.success ? 'success' : 'danger'">
                    {{ test.success ? '✅ 正常' : '❌ 异常' }}
                  </t-tag>
                </div>
                <div v-if="test.preview" class="content-preview">
                  <pre>{{ test.preview }}</pre>
                </div>
                <div v-if="test.error" class="content-error">
                  错误: {{ test.error }}
                </div>
              </div>
            </div>
          </t-card>

          <!-- 建议和解决方案 -->
          <t-card
            v-if="validationResult && (validationResult.fileValidation.issues.length > 0 || validationResult.fileValidation.suggestions.length > 0)"
            title="问题和建议" :bordered="false" class="validation-card">
            <div v-if="validationResult.fileValidation.issues.length > 0" class="issues-section">
              <h4>发现的问题</h4>
              <t-list size="small">
                <t-list-item v-for="(issue, index) in validationResult.fileValidation.issues" :key="index">
                  <div class="issue-item">
                    <t-icon name="error-circle" class="issue-icon" />
                    {{ issue }}
                  </div>
                </t-list-item>
              </t-list>
            </div>

            <div v-if="validationResult.fileValidation.suggestions.length > 0" class="suggestions-section">
              <h4>解决建议</h4>
              <t-list size="small">
                <t-list-item v-for="(suggestion, index) in validationResult.fileValidation.suggestions" :key="index">
                  <div class="suggestion-item">
                    <t-icon name="lightbulb" class="suggestion-icon" />
                    {{ suggestion }}
                  </div>
                </t-list-item>
              </t-list>
            </div>
          </t-card>

          <!-- 验证报告 -->
          <t-card v-if="validationReport" title="详细报告" :bordered="false" class="validation-card">
            <div class="report-actions">
              <t-button theme="default" @click="copyReport">复制报告</t-button>
              <t-button theme="default" @click="downloadReport">下载报告</t-button>
            </div>
            <div class="report-content">
              <pre>{{ validationReport }}</pre>
            </div>
          </t-card>
        </div>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { quickValidateFFmpeg, fullValidateFFmpeg, FFmpegFileValidator } from '@/utils/ffmpegFileValidator';

// 状态
const quickValidating = ref(false);
const fullValidating = ref(false);
const validationResult = ref<any>(null);
const fullValidationResult = ref<any>(null);
const validationReport = ref('');

// 进度状态
const validationProgress = ref<{
  current: number;
  total: number;
  percentage: number;
  currentFile: string;
} | null>(null);

// 表格列定义
const fileColumns = [
  { colKey: 'file', title: '文件名', width: 200 },
  { colKey: 'status', title: '状态', width: 100, cell: 'status' },
  { colKey: 'size', title: '大小', width: 100, cell: 'size' },
  { colKey: 'loadTime', title: '加载时间', width: 100, cell: 'loadTime' },
  { colKey: 'error', title: '错误信息', cell: 'error' }
];

// 快速验证
const runQuickValidation = async () => {
  quickValidating.value = true;
  validationResult.value = null;
  validationProgress.value = null;

  try {
    const result = await quickValidateFFmpeg();
    validationResult.value = { fileValidation: result };

    if (result.allValid) {
      MessagePlugin.success('所有FFmpeg文件验证通过！');
    } else {
      MessagePlugin.warning(`发现 ${result.issues.length} 个问题，请查看详细信息`);
    }
  } catch (error) {
    console.error('验证失败:', error);
    MessagePlugin.error(`验证失败: ${error}`);
  } finally {
    quickValidating.value = false;
  }
};

// 全面验证
const runFullValidation = async () => {
  fullValidating.value = true;
  fullValidationResult.value = null;
  validationProgress.value = null;

  try {
    // 设置进度回调
    const onProgress = (current: number, total: number, fileName: string) => {
      validationProgress.value = {
        current,
        total,
        percentage: Math.round((current / total) * 100),
        currentFile: fileName
      };
    };

    // 执行验证
    const result = await FFmpegFileValidator.validateEnvironment();
    fullValidationResult.value = result;

    // 生成报告
    validationReport.value = FFmpegFileValidator.generateReport(result);

    if (result.overall) {
      MessagePlugin.success('全面检查通过，FFmpeg环境正常！');
    } else {
      MessagePlugin.warning('检查发现问题，请查看详细报告');
    }
  } catch (error) {
    console.error('全面验证失败:', error);
    MessagePlugin.error(`全面验证失败: ${error}`);
  } finally {
    fullValidating.value = false;
    validationProgress.value = null;
  }
};

// 清除结果
const clearResults = () => {
  validationResult.value = null;
  fullValidationResult.value = null;
  validationReport.value = '';
  validationProgress.value = null;
  MessagePlugin.info('结果已清除');
};

// 复制报告
const copyReport = async () => {
  if (!validationReport.value) return;

  try {
    await navigator.clipboard.writeText(validationReport.value);
    MessagePlugin.success('报告已复制到剪贴板');
  } catch (error) {
    MessagePlugin.error('复制失败，请手动复制');
  }
};

// 下载报告
const downloadReport = () => {
  if (!validationReport.value) return;

  const blob = new Blob([validationReport.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ffmpeg-validation-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  MessagePlugin.success('报告已下载');
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style lang="less" scoped>
.ffmpeg-validation-page {
  min-height: 100vh;
  background: #f5f7fa;

  .header-content {
    padding: 16px 24px;

    h1 {
      margin: 0 0 8px 0;
      color: #1f2937;
    }

    p {
      margin: 0;
      color: #6b7280;
    }
  }

  .validation-container {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .validation-card {
    margin-bottom: 24px;
  }

  .quick-actions {
    margin-bottom: 24px;
  }

  .progress-section {
    .progress-text {
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }
  }

  .overall-status {
    margin-bottom: 24px;

    .status-summary {
      margin: 0;

      p {
        margin: 4px 0;
      }
    }
  }

  .file-details {
    h4 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .error-text {
      color: #ff4d4f;
      font-size: 12px;
    }
  }

  .environment-check {
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
        border-radius: 4px;

        span:first-child {
          font-weight: 500;
        }
      }
    }
  }

  .bloburl-test {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .error-text {
      color: #ff4d4f;
      margin: 0;
    }
  }

  .content-test {
    h4 {
      margin-bottom: 16px;
      color: #1f2937;
    }

    .content-item {
      margin-bottom: 16px;
      border: 1px solid #e0e6ed;
      border-radius: 4px;

      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f8f9fa;
        border-bottom: 1px solid #e0e6ed;

        .file-name {
          font-weight: 500;
        }
      }

      .content-preview {
        padding: 12px;

        pre {
          margin: 0;
          font-size: 12px;
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          overflow-x: auto;
        }
      }

      .content-error {
        padding: 12px;
        color: #ff4d4f;
        font-size: 14px;
      }
    }
  }

  .issues-section,
  .suggestions-section {
    margin-bottom: 16px;

    h4 {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .issue-item,
    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .issue-icon {
      color: #ff4d4f;
    }

    .suggestion-icon {
      color: #1890ff;
    }
  }

  .report-actions {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
  }

  .report-content {
    pre {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }
  }
}
</style>























































































