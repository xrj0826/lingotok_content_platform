<template>
  <div class="test-ffmpeg">
    <t-card title="FFmpeg环境测试" :bordered="false">
      <div class="test-section">
        <h4>基础环境检查</h4>
        <div class="test-item">
          <span>SharedArrayBuffer:</span>
          <t-tag :theme="hasSharedArrayBuffer ? 'success' : 'danger'">
            {{ hasSharedArrayBuffer ? '✅ 支持' : '❌ 不支持' }}
          </t-tag>
        </div>
        <div class="test-item">
          <span>crossOriginIsolated:</span>
          <t-tag :theme="isCrossOriginIsolated ? 'success' : 'danger'">
            {{ isCrossOriginIsolated ? '✅ 已启用' : '❌ 未启用' }}
          </t-tag>
        </div>
        <div class="test-item">
          <span>协议:</span>
          <t-tag :theme="isSecureContext ? 'success' : 'warning'">
            {{ currentProtocol }}
          </t-tag>
        </div>
        <div class="test-item">
          <span>域名:</span>
          <t-tag theme="default">{{ currentHostname }}</t-tag>
        </div>
      </div>

      <div class="test-section">
        <h4>FFmpeg文件测试</h4>
        <div class="test-item">
          <span>ffmpeg-core.js:</span>
          <t-tag :theme="fileStatus.core">
            {{ fileStatusText.core }}
          </t-tag>
        </div>
        <div class="test-item">
          <span>ffmpeg-core.wasm:</span>
          <t-tag :theme="fileStatus.wasm">
            {{ fileStatusText.wasm }}
          </t-tag>
        </div>
        <div class="test-item">
          <span>ffmpeg-core.worker.js:</span>
          <t-tag :theme="fileStatus.worker">
            {{ fileStatusText.worker }}
          </t-tag>
        </div>
      </div>

      <div class="test-section">
        <h4>FFmpeg加载测试</h4>
        <div class="test-actions">
          <t-button 
            theme="primary" 
            :loading="testing" 
            @click="testFFmpegLoad"
            :disabled="!canTestFFmpeg"
          >
            {{ testing ? '测试中...' : '测试FFmpeg加载' }}
          </t-button>
          <t-button variant="outline" @click="checkFiles">刷新文件检查</t-button>
        </div>
        
        <div v-if="testResult" class="test-result">
          <t-alert 
            :theme="testResult.success ? 'success' : 'error'" 
            :message="testResult.message"
            :description="testResult.details"
          />
        </div>
      </div>

      <div class="test-section">
        <h4>控制台日志</h4>
        <div class="console-log">
          <pre>{{ consoleLog }}</pre>
        </div>
        <t-button size="small" variant="outline" @click="clearLog">清除日志</t-button>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 基础环境检查
const hasSharedArrayBuffer = ref(typeof SharedArrayBuffer !== 'undefined');
const isCrossOriginIsolated = ref(crossOriginIsolated);
const currentProtocol = ref(location.protocol);
const currentHostname = ref(location.hostname);
const isSecureContext = computed(() => 
  currentProtocol.value === 'https:' || 
  currentHostname.value === 'localhost' || 
  currentHostname.value === '127.0.0.1'
);

// 文件状态检查
const fileStatus = reactive({
  core: 'default' as 'success' | 'error' | 'default',
  wasm: 'default' as 'success' | 'error' | 'default',
  worker: 'default' as 'success' | 'error' | 'default'
});

const fileStatusText = reactive({
  core: '检查中...',
  wasm: '检查中...',
  worker: '检查中...'
});

// 测试状态
const testing = ref(false);
const testResult = ref<{
  success: boolean;
  message: string;
  details?: string;
} | null>(null);

const consoleLog = ref('');

// 是否可以测试FFmpeg
const canTestFFmpeg = computed(() => 
  hasSharedArrayBuffer.value && 
  isCrossOriginIsolated.value &&
  fileStatus.core === 'success' &&
  fileStatus.wasm === 'success' &&
  fileStatus.worker === 'success'
);

// 检查文件可访问性
const checkFiles = async () => {
  const files = [
    { key: 'core', path: '/ffmpeg/ffmpeg-core.js' },
    { key: 'wasm', path: '/ffmpeg/ffmpeg-core.wasm' },
    { key: 'worker', path: '/ffmpeg/ffmpeg-core.worker.js' }
  ];

  for (const file of files) {
    try {
      const response = await fetch(file.path);
      if (response.ok) {
        fileStatus[file.key] = 'success';
        fileStatusText[file.key] = '✅ 可访问';
        logToConsole(`✅ ${file.path} 文件可访问 (${response.status})`);
      } else {
        fileStatus[file.key] = 'error';
        fileStatusText[file.key] = `❌ 错误 ${response.status}`;
        logToConsole(`❌ ${file.path} 访问失败: ${response.status}`);
      }
    } catch (error) {
      fileStatus[file.key] = 'error';
      fileStatusText[file.key] = '❌ 网络错误';
      logToConsole(`❌ ${file.path} 网络错误: ${error}`);
    }
  }
};

// 测试FFmpeg加载
const testFFmpegLoad = async () => {
  if (!canTestFFmpeg.value) {
    MessagePlugin.warning('环境不满足FFmpeg加载条件');
    return;
  }

  testing.value = true;
  testResult.value = null;
  
  try {
    logToConsole('🚀 开始测试FFmpeg加载...');
    
    // 动态导入FFmpeg
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');
    
    logToConsole('📦 FFmpeg模块导入成功');
    
    const ffmpeg = new FFmpeg();
    
    // 设置日志回调
    ffmpeg.on('log', ({ message }) => {
      logToConsole(`📝 FFmpeg: ${message}`);
    });
    
    logToConsole('🔄 开始加载FFmpeg核心...');
    
    const localBaseURL = '/ffmpeg';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${localBaseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${localBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${localBaseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });
    
    logToConsole('✅ FFmpeg加载成功！');
    
    testResult.value = {
      success: true,
      message: 'FFmpeg加载成功！',
      details: 'FFmpeg已成功初始化，可以正常使用视频处理功能。'
    };
    
  } catch (error) {
    logToConsole(`❌ FFmpeg加载失败: ${error}`);
    
    testResult.value = {
      success: false,
      message: 'FFmpeg加载失败',
      details: `错误详情: ${error}`
    };
  } finally {
    testing.value = false;
  }
};

// 日志功能
const logToConsole = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  consoleLog.value += `[${timestamp}] ${message}\n`;
  console.log(message);
};

const clearLog = () => {
  consoleLog.value = '';
};

// 页面加载时自动检查
onMounted(() => {
  logToConsole('🔍 开始环境检查...');
  logToConsole(`SharedArrayBuffer: ${hasSharedArrayBuffer.value}`);
  logToConsole(`crossOriginIsolated: ${isCrossOriginIsolated.value}`);
  logToConsole(`协议: ${currentProtocol.value}`);
  logToConsole(`域名: ${currentHostname.value}`);
  
  checkFiles();
});
</script>

<style lang="less" scoped>
.test-ffmpeg {
  padding: 24px;
}

.test-section {
  margin-bottom: 32px;
  
  h4 {
    margin-bottom: 16px;
    color: #1f2937;
    font-weight: 600;
  }
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  span {
    font-weight: 500;
  }
}

.test-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.test-result {
  margin-top: 16px;
}

.console-log {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
  }
}
</style>









































