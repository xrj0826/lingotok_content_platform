<template>
  <div class="ffmpeg-diagnostic-panel">
    <t-card title="FFmpeg 环境诊断" :bordered="false">
      <div class="diagnostic-section">
        <h4>🔍 环境检查</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">SharedArrayBuffer:</span>
            <span :class="['status', sharedArrayBufferStatus.available ? 'success' : 'error']">
              {{ sharedArrayBufferStatus.available ? '✅ 可用' : '❌ 不可用' }}
            </span>
          </div>

          <div class="status-item">
            <span class="label">跨域隔离:</span>
            <span :class="['status', crossOriginIsolatedStatus ? 'success' : 'error']">
              {{ crossOriginIsolatedStatus ? '✅ 已启用' : '❌ 未启用' }}
            </span>
          </div>

          <div class="status-item">
            <span class="label">安全上下文:</span>
            <span :class="['status', isSecureContext ? 'success' : 'error']">
              {{ isSecureContext ? '✅ 安全' : '❌ 不安全' }}
            </span>
          </div>

          <div class="status-item">
            <span class="label">协议:</span>
            <span class="status">{{ location.protocol }}</span>
          </div>

          <div class="status-item">
            <span class="label">主机:</span>
            <span class="status">{{ location.hostname }}</span>
          </div>

          <div class="status-item">
            <span class="label">端口:</span>
            <span class="status">{{ location.port }}</span>
          </div>
        </div>
      </div>

      <div class="diagnostic-section">
        <h4>🧪 FFmpeg 测试</h4>
        <div class="test-actions">
          <t-button @click="testFFmpegLoad" :loading="testingLoad" theme="primary">
            测试FFmpeg加载
          </t-button>

          <t-button @click="testFFmpegFiles" :loading="testingFiles">
            检查FFmpeg文件
          </t-button>

          <t-button @click="clearLogs" variant="outline">
            清除日志
          </t-button>
        </div>

        <div v-if="testResults.length > 0" class="test-results">
          <h5>测试结果:</h5>
          <div class="log-container">
            <div v-for="(result, index) in testResults" :key="index" :class="['log-item', result.type]">
              <span class="timestamp">{{ result.timestamp }}</span>
              <span class="message">{{ result.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!sharedArrayBufferStatus.available || !crossOriginIsolatedStatus" class="recommendations">
        <h4>💡 解决建议</h4>
        <div class="recommendation-list">
          <div v-if="!sharedArrayBufferStatus.available" class="recommendation">
            <h5>SharedArrayBuffer不可用</h5>
            <ul>
              <li>确保使用现代浏览器（Chrome 68+, Firefox 79+, Safari 15.2+）</li>
              <li>检查浏览器设置中是否禁用了SharedArrayBuffer</li>
            </ul>
          </div>

          <div v-if="!crossOriginIsolatedStatus" class="recommendation">
            <h5>跨域隔离未启用</h5>
            <ul>
              <li>检查 vite.config.ts 中的 CORS 头部配置</li>
              <li>确保 Cross-Origin-Embedder-Policy 设置为 "require-corp"</li>
              <li>重启开发服务器</li>
              <li>清除浏览器缓存</li>
            </ul>
          </div>

          <div v-if="location.protocol !== 'https:' && location.hostname !== 'localhost'" class="recommendation">
            <h5>不安全的协议环境</h5>
            <ul>
              <li>使用 HTTPS 协议或 localhost 环境</li>
              <li>SharedArrayBuffer 需要安全上下文</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="diagnostic-section">
        <h4>🔧 快速修复</h4>
        <div class="quick-fix-actions">
          <t-button @click="showViteConfig">查看Vite配置建议</t-button>
          <t-button @click="showBrowserInstructions">浏览器设置指南</t-button>
          <t-button @click="downloadDiagnosticReport">下载诊断报告</t-button>
        </div>
      </div>
    </t-card>

    <!-- 配置建议弹窗 -->
    <t-dialog v-model:visible="showConfigDialog" title="Vite配置建议" width="600px">
      <div class="config-suggestion">
        <p>在 <code>vite.config.ts</code> 中确保以下配置：</p>
        <pre><code>{{ viteConfigExample }}</code></pre>
        <p class="note">⚠️ 修改配置后需要重启开发服务器</p>
      </div>
    </t-dialog>

    <!-- 浏览器设置弹窗 -->
    <t-dialog v-model:visible="showBrowserDialog" title="浏览器设置指南" width="600px">
      <div class="browser-instructions">
        <h5>Chrome / Edge:</h5>
        <ol>
          <li>打开 <code>chrome://flags/</code></li>
          <li>搜索 "SharedArrayBuffer"</li>
          <li>启用相关选项</li>
          <li>重启浏览器</li>
        </ol>

        <h5>Firefox:</h5>
        <ol>
          <li>打开 <code>about:config</code></li>
          <li>搜索 "javascript.options.shared_memory"</li>
          <li>设置为 true</li>
          <li>重启浏览器</li>
        </ol>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { logFFmpegDiagnostic } from '@/utils/ffmpegDiagnostic';
import { getFFmpegInstance } from '@/utils/ffmpegConfig';

interface TestResult {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

// 响应式状态
const sharedArrayBufferStatus = reactive({
  available: typeof SharedArrayBuffer !== 'undefined'
});

const crossOriginIsolatedStatus = ref(crossOriginIsolated);
const isSecureContext = ref(window.isSecureContext);
const testingLoad = ref(false);
const testingFiles = ref(false);
const testResults = ref<TestResult[]>([]);
const showConfigDialog = ref(false);
const showBrowserDialog = ref(false);

// 配置示例
const viteConfigExample = `export default ({ mode }: ConfigEnv): UserConfig => {
  return {
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    },
  };
};`;

// 添加日志
const addLog = (message: string, type: TestResult['type'] = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  testResults.value.push({ timestamp, message, type });
};

// 测试FFmpeg加载
const testFFmpegLoad = async () => {
  testingLoad.value = true;
  addLog('开始测试FFmpeg加载...', 'info');

  try {
    // 检查基础环境
    if (!sharedArrayBufferStatus.available) {
      addLog('❌ SharedArrayBuffer不可用', 'error');
      return;
    }

    if (!crossOriginIsolatedStatus.value) {
      addLog('❌ 跨域隔离未启用', 'error');
      return;
    }

    addLog('✅ 基础环境检查通过', 'success');

    // 尝试创建FFmpeg实例
    addLog('正在创建FFmpeg实例...', 'info');
    const ffmpeg = await getFFmpegInstance();

    addLog('✅ FFmpeg实例创建成功', 'success');
    addLog('🎉 FFmpeg加载测试完成！', 'success');

    MessagePlugin.success('FFmpeg加载测试通过！');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog(`❌ FFmpeg加载失败: ${errorMessage}`, 'error');
    MessagePlugin.error(`FFmpeg加载失败: ${errorMessage}`);
  } finally {
    testingLoad.value = false;
  }
};

// 测试FFmpeg文件
const testFFmpegFiles = async () => {
  testingFiles.value = true;
  addLog('开始检查FFmpeg文件...', 'info');

  try {
    const baseURL = '/ffmpeg';
    const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'];

    for (const file of files) {
      try {
        addLog(`检查文件: ${file}`, 'info');
        const response = await fetch(`${baseURL}/${file}`);

        if (response.ok) {
          const size = response.headers.get('content-length');
          const sizeText = size ? `(${Math.round(Number(size) / 1024)}KB)` : '';
          addLog(`✅ ${file} 可访问 ${sizeText}`, 'success');
        } else {
          addLog(`❌ ${file} 访问失败: ${response.status}`, 'error');
        }
      } catch (error) {
        addLog(`❌ ${file} 访问异常: ${error}`, 'error');
      }
    }

    addLog('🎉 FFmpeg文件检查完成！', 'info');

  } catch (error) {
    addLog(`❌ 文件检查失败: ${error}`, 'error');
  } finally {
    testingFiles.value = false;
  }
};

// 清除日志
const clearLogs = () => {
  testResults.value = [];
  addLog('日志已清除', 'info');
};

// 显示配置建议
const showViteConfig = () => {
  showConfigDialog.value = true;
};

// 显示浏览器设置
const showBrowserInstructions = () => {
  showBrowserDialog.value = true;
};

// 下载诊断报告
const downloadDiagnosticReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      sharedArrayBuffer: sharedArrayBufferStatus.available,
      crossOriginIsolated: crossOriginIsolatedStatus.value,
      secureContext: isSecureContext.value,
      protocol: location.protocol,
      hostname: location.hostname,
      port: location.port,
      userAgent: navigator.userAgent
    },
    testResults: testResults.value
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `ffmpeg-diagnostic-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  MessagePlugin.success('诊断报告已下载');
};

// 页面加载时执行诊断
onMounted(() => {
  addLog('页面加载完成，开始环境诊断...', 'info');

  // 在控制台输出详细诊断信息
  logFFmpegDiagnostic();

  // 检查基础环境
  if (sharedArrayBufferStatus.available) {
    addLog('✅ SharedArrayBuffer 可用', 'success');
  } else {
    addLog('❌ SharedArrayBuffer 不可用', 'error');
  }

  if (crossOriginIsolatedStatus.value) {
    addLog('✅ 跨域隔离已启用', 'success');
  } else {
    addLog('❌ 跨域隔离未启用', 'error');
  }

  if (isSecureContext.value) {
    addLog('✅ 安全上下文', 'success');
  } else {
    addLog('⚠️ 非安全上下文', 'warning');
  }

  addLog(`协议: ${location.protocol}`, 'info');
  addLog(`主机: ${location.hostname}:${location.port}`, 'info');
});
</script>

<style lang="less" scoped>
.ffmpeg-diagnostic-panel {
  .diagnostic-section {
    margin-bottom: 32px;

    h4 {
      margin-bottom: 16px;
      color: #1f2937;
      font-weight: 600;
    }

    h5 {
      margin-bottom: 12px;
      color: #374151;
      font-weight: 500;
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    margin-bottom: 16px;

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;

      .label {
        font-weight: 500;
        color: #374151;
      }

      .status {
        font-family: monospace;

        &.success {
          color: #059669;
          font-weight: 600;
        }

        &.error {
          color: #dc2626;
          font-weight: 600;
        }
      }
    }
  }

  .test-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .test-results {
    margin-top: 16px;

    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #f9fafb;
    }

    .log-item {
      display: flex;
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      font-family: monospace;
      font-size: 13px;

      &:last-child {
        border-bottom: none;
      }

      .timestamp {
        color: #6b7280;
        margin-right: 12px;
        min-width: 80px;
      }

      .message {
        flex: 1;
      }

      &.success .message {
        color: #059669;
      }

      &.error .message {
        color: #dc2626;
      }

      &.warning .message {
        color: #d97706;
      }
    }
  }

  .recommendations {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;

    h4 {
      color: #92400e;
      margin-bottom: 16px;
    }

    .recommendation {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      h5 {
        color: #92400e;
        margin-bottom: 8px;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        color: #78350f;

        li {
          margin-bottom: 4px;
        }
      }
    }
  }

  .quick-fix-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .config-suggestion {
    pre {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 16px 0;

      code {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
    }

    .note {
      color: #d97706;
      font-weight: 500;
      margin-top: 12px;
    }
  }

  .browser-instructions {
    h5 {
      color: #374151;
      margin-top: 20px;
      margin-bottom: 8px;

      &:first-child {
        margin-top: 0;
      }
    }

    ol {
      margin-bottom: 16px;
      padding-left: 20px;

      li {
        margin-bottom: 4px;

        code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
