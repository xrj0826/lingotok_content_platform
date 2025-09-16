<template>
  <div class="ffmpeg-test-panel">
    <t-card title="FFmpeg Node Modules 测试" :bordered="false">
      <div class="test-content">
        <div class="status-section">
          <h4>当前状态</h4>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">FFmpeg 状态:</span>
              <span :class="statusClass">{{ statusText }}</span>
            </div>
            <div class="status-item">
              <span class="label">加载方式:</span>
              <span>{{ loadMethod }}</span>
            </div>
            <div class="status-item">
              <span class="label">耗时:</span>
              <span>{{ loadTime }}</span>
            </div>
          </div>
        </div>

        <div class="action-section">
          <t-space>
            <t-button 
              theme="primary" 
              :loading="loading" 
              :disabled="loaded"
              @click="testNodeModulesLoad"
            >
              测试 Node Modules 加载
            </t-button>
            
            <t-button 
              theme="default" 
              :loading="loading" 
              :disabled="loaded"
              @click="testFallbackLoad"
            >
              测试回退方案
            </t-button>
            
            <t-button 
              variant="outline" 
              @click="resetInstance"
              :disabled="loading"
            >
              重置实例
            </t-button>
          </t-space>
        </div>

        <div v-if="logMessages.length > 0" class="log-section">
          <h4>
            加载日志 
            <t-button size="small" variant="text" @click="clearLogs">清除</t-button>
          </h4>
          <div class="log-container">
            <div 
              v-for="(log, index) in logMessages" 
              :key="index"
              :class="['log-item', log.type]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>

        <div v-if="errorInfo" class="error-section">
          <h4>错误信息</h4>
          <div class="error-content">
            <pre>{{ errorInfo }}</pre>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { getFFmpegInstanceFromNodeModules, resetFFmpegNodeModulesInstance } from '@/utils/ffmpegNodeModulesConfig';
import { getFFmpegFromNodeModules, resetFFmpegInstance } from '@/utils/ffmpegNodeModulesLoader';
import { getFFmpegInstance } from '@/utils/ffmpegConfig';

interface LogMessage {
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  message: string;
}

const loading = ref(false);
const loaded = ref(false);
const loadMethod = ref('未加载');
const loadTime = ref('');
const logMessages = ref<LogMessage[]>([]);
const errorInfo = ref('');

const statusClass = computed(() => ({
  'status-loaded': loaded.value,
  'status-loading': loading.value,
  'status-unloaded': !loaded.value && !loading.value
}));

const statusText = computed(() => {
  if (loading.value) return '加载中...';
  if (loaded.value) return '已加载';
  return '未加载';
});

// 添加日志
const addLog = (type: LogMessage['type'], message: string) => {
  logMessages.value.push({
    type,
    time: new Date().toLocaleTimeString(),
    message
  });
  
  // 限制日志数量
  if (logMessages.value.length > 50) {
    logMessages.value.splice(0, 10);
  }
};

// 清除日志
const clearLogs = () => {
  logMessages.value = [];
  errorInfo.value = '';
};

// 重写 console 方法来捕获调试信息
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

const captureConsole = () => {
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('[DEBUG]') || message.includes('[FFmpeg')) {
      if (message.includes('✅') || message.includes('🎉')) {
        addLog('success', message);
      } else if (message.includes('⚠️') || message.includes('❌')) {
        addLog('warning', message);
      } else {
        addLog('info', message);
      }
    }
    originalConsoleLog(...args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    addLog('warning', message);
    originalConsoleWarn(...args);
  };

  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('[DEBUG]')) {
      addLog('error', message);
    }
    originalConsoleError(...args);
  };
};

const restoreConsole = () => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
};

// 测试 node_modules 方式（简化版）
const testNodeModulesLoad = async () => {
  loading.value = true;
  loaded.value = false;
  errorInfo.value = '';
  const startTime = performance.now();
  
  addLog('info', '🚀 开始测试 node_modules 方式（简化版）...');
  
  try {
    captureConsole();
    await getFFmpegInstanceFromNodeModules();
    
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    loaded.value = true;
    loadMethod.value = 'Node Modules (简化版)';
    loadTime.value = `${duration}ms`;
    
    addLog('success', `✅ node_modules 方式加载成功！耗时: ${duration}ms`);
    MessagePlugin.success('Node Modules FFmpeg 加载成功！');
    
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    const errorMsg = error instanceof Error ? error.message : String(error);
    errorInfo.value = errorMsg;
    loadTime.value = `失败 (${duration}ms)`;
    
    addLog('error', `💥 node_modules 方式加载失败: ${errorMsg}`);
    MessagePlugin.error(`加载失败: ${errorMsg}`);
  } finally {
    loading.value = false;
    restoreConsole();
  }
};

// 测试复杂版本
const testFallbackLoad = async () => {
  loading.value = true;
  loaded.value = false;
  errorInfo.value = '';
  const startTime = performance.now();
  
  addLog('info', '🚀 开始测试 node_modules 方式（复杂版）...');
  
  try {
    captureConsole();
    await getFFmpegFromNodeModules();
    
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    loaded.value = true;
    loadMethod.value = 'Node Modules (复杂版)';
    loadTime.value = `${duration}ms`;
    
    addLog('success', `✅ 复杂版本加载成功！耗时: ${duration}ms`);
    MessagePlugin.success('复杂版本 FFmpeg 加载成功！');
    
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    const errorMsg = error instanceof Error ? error.message : String(error);
    errorInfo.value = errorMsg;
    loadTime.value = `失败 (${duration}ms)`;
    
    addLog('error', `💥 复杂版本加载失败: ${errorMsg}`);
    
    // 如果复杂版本失败，尝试传统方式
    try {
      addLog('info', '🔄 尝试传统方式...');
      await getFFmpegInstance();
      
      const fallbackEndTime = performance.now();
      const fallbackDuration = (fallbackEndTime - startTime).toFixed(2);
      
      loaded.value = true;
      loadMethod.value = '传统方式（回退）';
      loadTime.value = `${fallbackDuration}ms`;
      
      addLog('success', `✅ 传统方式回退成功！耗时: ${fallbackDuration}ms`);
      MessagePlugin.success('传统方式回退成功！');
    } catch (fallbackError) {
      const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      addLog('error', `💥 传统方式也失败: ${fallbackErrorMsg}`);
      MessagePlugin.error(`所有方式都失败: ${fallbackErrorMsg}`);
    }
  } finally {
    loading.value = false;
    restoreConsole();
  }
};

// 重置实例
const resetInstance = () => {
  resetFFmpegNodeModulesInstance();
  resetFFmpegInstance();
  
  loaded.value = false;
  loadMethod.value = '未加载';
  loadTime.value = '';
  
  addLog('info', '🔄 FFmpeg 实例已重置');
  MessagePlugin.info('实例已重置');
};

onMounted(() => {
  addLog('info', '🎬 FFmpeg Node Modules 测试面板已加载');
});
</script>

<style lang="less" scoped>
.ffmpeg-test-panel {
  .test-content {
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
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 4px;

          .label {
            font-weight: 500;
            color: #6b7280;
          }

          .status-loaded {
            color: #059669;
            font-weight: 500;
          }

          .status-loading {
            color: #d97706;
            font-weight: 500;
          }

          .status-unloaded {
            color: #6b7280;
          }
        }
      }
    }

    .action-section {
      margin-bottom: 24px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #f9fafb;
    }

    .log-section {
      margin-bottom: 24px;

      h4 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        color: #1f2937;
      }

      .log-container {
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
            word-break: break-all;
          }

          &.info {
            background: #f8fafc;
          }

          &.success {
            background: #f0fdf4;
            color: #166534;
          }

          &.warning {
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

    .error-section {
      h4 {
        margin-bottom: 12px;
        color: #dc2626;
      }

      .error-content {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 4px;
        padding: 12px;

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          color: #dc2626;
        }
      }
    }
  }
}
</style>
























