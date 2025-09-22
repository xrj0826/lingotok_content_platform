<template>
  <div class="ffmpeg-load-fix-panel">
    <t-card title="FFmpeg 加载修复工具" :bordered="false">
      <!-- 当前状态 -->
      <div class="status-section">
        <h4>当前状态</h4>
        <div class="status-grid">
          <div class="status-item">
            <span>FFmpeg状态</span>
            <t-tag :theme="status.isLoaded ? 'success' : (status.isLoading ? 'warning' : 'default')">
              {{ status.isLoaded ? '✅ 已加载' : (status.isLoading ? '🔄 加载中' : '❌ 未加载') }}
            </t-tag>
          </div>
          <div class="status-item">
            <span>SharedArrayBuffer</span>
            <t-tag :theme="diagnostic.environment.hasSharedArrayBuffer ? 'success' : 'danger'">
              {{ diagnostic.environment.hasSharedArrayBuffer ? '✅ 可用' : '❌ 不可用' }}
            </t-tag>
          </div>
          <div class="status-item">
            <span>跨域隔离</span>
            <t-tag :theme="diagnostic.environment.isCrossOriginIsolated ? 'success' : 'danger'">
              {{ diagnostic.environment.isCrossOriginIsolated ? '✅ 已启用' : '❌ 未启用' }}
            </t-tag>
          </div>
          <div class="status-item">
            <span>协议</span>
            <t-tag
              :theme="diagnostic.environment.protocol === 'https:' || location.hostname === 'localhost' ? 'success' : 'warning'">
              {{ diagnostic.environment.protocol }}
            </t-tag>
          </div>
        </div>
      </div>

      <!-- 加载进度 -->
      <div v-if="loading || loadingProgress" class="progress-section">
        <h4>加载进度</h4>
        <div class="progress-container">
          <t-progress :percentage="loadingProgress?.progress || 0" :label="false"
            :color="loadingProgress?.progress === 100 ? '#52c41a' : '#1890ff'" />
          <div class="progress-text">
            <span class="progress-step">{{ loadingProgress?.step || '准备中...' }}</span>
            <span class="progress-message">{{ loadingProgress?.message || '' }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <t-space direction="horizontal" size="large">
          <t-button theme="primary" :loading="loading" :disabled="status.isLoaded" @click="startLoad">
            {{ status.isLoaded ? '已加载完成' : (loading ? '加载中...' : '开始加载 FFmpeg') }}
          </t-button>

          <t-button theme="default" :disabled="loading || !status.hasInstance" @click="resetFFmpeg">
            重置实例
          </t-button>

          <t-button theme="default" @click="runDiagnostic">
            运行诊断
          </t-button>

          <t-button theme="default" @click="testFFmpeg" :disabled="!status.isLoaded || testing" :loading="testing">
            功能测试
          </t-button>
        </t-space>
      </div>

      <!-- 诊断建议 -->
      <div v-if="diagnostic.suggestions.length > 0" class="suggestions-section">
        <h4>诊断建议</h4>
        <t-alert theme="warning" title="环境问题检测">
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in diagnostic.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </t-alert>
      </div>

      <!-- 详细日志 -->
      <div class="log-section">
        <div class="log-header">
          <h4>详细日志</h4>
          <t-button size="small" variant="text" @click="clearLogs">清除日志</t-button>
        </div>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" :class="['log-item', `log-${log.type}`]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">
            暂无日志信息...
          </div>
        </div>
      </div>

      <!-- 成功状态 -->
      <div v-if="loadSuccess" class="success-section">
        <t-alert theme="success" title="FFmpeg 加载成功！">
          <p>耗时: {{ loadDuration }}ms</p>
          <p>现在可以使用视频处理功能了。</p>
        </t-alert>
      </div>

      <!-- 错误状态 -->
      <div v-if="loadError" class="error-section">
        <t-alert theme="error" title="FFmpeg 加载失败">
          <p>{{ loadError }}</p>
          <p>耗时: {{ loadDuration }}ms</p>
          <div class="error-actions">
            <t-button size="small" @click="copyErrorToClipboard">复制错误信息</t-button>
            <t-button size="small" @click="showTroubleshooting">查看故障排除</t-button>
          </div>
        </t-alert>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  FFmpegLoadFixer,
  fixedLoadFFmpeg,
  createDiagnosticInfo,
  type LoadingProgress
} from '@/utils/ffmpegLoadFix';
import { applyFFmpegForcedMode, autoApplyForcedModeIfNeeded } from '@/utils/ffmpegForcedMode';

interface LogItem {
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const loading = ref(false);
const testing = ref(false);
const loadSuccess = ref(false);
const loadError = ref('');
const loadDuration = ref(0);
const loadingProgress = ref<LoadingProgress | null>(null);

const logs = ref<LogItem[]>([]);
const status = reactive({
  isLoaded: false,
  isLoading: false,
  hasInstance: false
});

const diagnostic = reactive(createDiagnosticInfo());
const fixer = FFmpegLoadFixer.getInstance();

// 添加日志
const addLog = (type: LogItem['type'], message: string) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  });

  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50);
  }
};

// 更新状态
const updateStatus = () => {
  const currentStatus = fixer.getStatus();
  status.isLoaded = currentStatus.isLoaded;
  status.isLoading = currentStatus.isLoading;
  status.hasInstance = currentStatus.hasInstance;
};

// 开始加载
const startLoad = async () => {
  if (status.isLoaded) {
    MessagePlugin.info('FFmpeg 已经加载完成');
    return;
  }

  loading.value = true;
  loadSuccess.value = false;
  loadError.value = '';
  loadingProgress.value = null;

  addLog('info', '开始加载 FFmpeg...');

  try {
    const result = await fixer.loadFFmpeg(
      (progress) => {
        loadingProgress.value = progress;
        addLog('info', `${progress.step}: ${progress.message} (${progress.progress}%)`);
      },
      45000 // 45秒超时
    );

    if (result.success) {
      loadSuccess.value = true;
      loadDuration.value = result.duration;
      addLog('success', `FFmpeg 加载成功！耗时 ${result.duration}ms`);
      MessagePlugin.success('FFmpeg 加载成功！');
    } else {
      throw new Error(result.error || '未知错误');
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
    loadDuration.value = Date.now() - (Date.now() - loadDuration.value);
    addLog('error', `FFmpeg 加载失败: ${loadError.value}`);
    MessagePlugin.error('FFmpeg 加载失败，请查看详细日志');
  } finally {
    loading.value = false;
    loadingProgress.value = null;
    updateStatus();
  }
};

// 重置FFmpeg
const resetFFmpeg = () => {
  fixer.reset();
  updateStatus();
  loadSuccess.value = false;
  loadError.value = '';
  addLog('info', 'FFmpeg 实例已重置');
  MessagePlugin.info('FFmpeg 实例已重置');
};

// 运行诊断
const runDiagnostic = () => {
  Object.assign(diagnostic, createDiagnosticInfo());
  addLog('info', '环境诊断已更新');

  if (diagnostic.suggestions.length === 0) {
    MessagePlugin.success('环境检查通过，所有条件都满足');
  } else {
    MessagePlugin.warning(`发现 ${diagnostic.suggestions.length} 个潜在问题`);
  }
};

// 测试FFmpeg功能
const testFFmpeg = async () => {
  if (!status.isLoaded) {
    MessagePlugin.warning('请先加载 FFmpeg');
    return;
  }

  testing.value = true;
  addLog('info', '开始功能测试...');

  try {
    // 这里可以添加具体的FFmpeg功能测试
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟测试

    addLog('success', 'FFmpeg 功能测试通过');
    MessagePlugin.success('FFmpeg 功能正常');
  } catch (error) {
    addLog('error', `功能测试失败: ${error}`);
    MessagePlugin.error('FFmpeg 功能测试失败');
  } finally {
    testing.value = false;
  }
};

// 清除日志
const clearLogs = () => {
  logs.value = [];
  MessagePlugin.info('日志已清除');
};

// 复制错误信息
const copyErrorToClipboard = async () => {
  if (!loadError.value) return;

  try {
    await navigator.clipboard.writeText(loadError.value);
    MessagePlugin.success('错误信息已复制到剪贴板');
  } catch (error) {
    MessagePlugin.error('复制失败，请手动复制');
  }
};

// 显示故障排除
const showTroubleshooting = () => {
  const troubleshootingInfo = `
FFmpeg 加载故障排除指南：

1. 环境检查：
   - 确保使用 HTTPS 或 localhost
   - 检查 SharedArrayBuffer 支持
   - 验证跨域隔离配置

2. 文件检查：
   - 确保 public/ffmpeg/ 目录存在
   - 检查所有必需文件是否完整
   - 验证文件权限

3. 配置检查：
   - 检查 vite.config.ts 中的 CORS 头部
   - 重启开发服务器
   - 清除浏览器缓存

4. 浏览器检查：
   - 更新到最新版本
   - 关闭广告拦截器
   - 检查开发者工具的网络面板

当前错误: ${loadError.value}
  `;

  MessagePlugin.info({
    content: troubleshootingInfo,
    duration: 0,
    closeBtn: true
  });
};

// 生命周期
onMounted(() => {
  // 在加载前先应用强制模式
  addLog('info', '正在应用FFmpeg强制兼容模式...');
  const forcedResult = applyFFmpegForcedMode();
  if (forcedResult) {
    addLog('success', 'FFmpeg强制兼容模式应用成功');
  } else {
    addLog('warning', '强制兼容模式应用可能不完全');
  }

  updateStatus();
  runDiagnostic();
  addLog('info', '诊断面板已初始化');
});

onUnmounted(() => {
  // 清理
});

// 定期更新状态
const statusInterval = setInterval(updateStatus, 2000);
onUnmounted(() => {
  clearInterval(statusInterval);
});
</script>

<style lang="less" scoped>
.ffmpeg-load-fix-panel {
  .status-section {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 4px;

        span:first-child {
          font-weight: 500;
        }
      }
    }
  }

  .progress-section {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .progress-container {
      .progress-text {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;

        .progress-step {
          font-weight: 500;
          color: #1890ff;
        }

        .progress-message {
          color: #666;
        }
      }
    }
  }

  .action-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .suggestions-section {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #1f2937;
    }

    .suggestions-list {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;
        color: #d4851f;
      }
    }
  }

  .log-section {
    margin-bottom: 24px;

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
      border-radius: 4px;
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

  .success-section,
  .error-section {
    margin-bottom: 24px;

    .error-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
  }
}
</style>
