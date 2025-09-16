<template>
  <div class="quick-test-panel">
    <t-card title="快速测试" :bordered="false">
      <div class="test-section">
        <h4>环境状态</h4>
        <div class="status-grid">
          <div class="status-item">
            <span>SharedArrayBuffer</span>
            <t-tag :theme="hasSharedArrayBuffer ? 'success' : 'danger'">
              {{ hasSharedArrayBuffer ? '✅' : '❌' }}
            </t-tag>
          </div>
          <div class="status-item">
            <span>跨域隔离</span>
            <t-tag :theme="isCrossOriginIsolated ? 'success' : 'danger'">
              {{ isCrossOriginIsolated ? '✅' : '❌' }}
            </t-tag>
          </div>
          <div class="status-item">
            <span>协议</span>
            <t-tag theme="default">{{ currentProtocol }}</t-tag>
          </div>
        </div>
      </div>

      <div class="test-section">
        <h4>FFmpeg测试</h4>
        <div class="test-buttons">
          <t-button theme="primary" :loading="testingCorrect" :disabled="!canTest" @click="testCorrectFFmpeg">
            {{ testingCorrect ? '测试中...' : '📚 文档推荐配置' }}
          </t-button>
          <t-button variant="outline" :loading="testingSimple" :disabled="!canTest" @click="testSimpleFFmpeg">
            {{ testingSimple ? '测试中...' : '⚡ 简化版配置' }}
          </t-button>
          <t-button variant="outline" :loading="testingFull" :disabled="!canTest" @click="testFullFFmpeg">
            {{ testingFull ? '测试中...' : '🔧 完整版配置' }}
          </t-button>
          <t-button variant="text" @click="clearResults">
            清除结果
          </t-button>
        </div>
      </div>

      <div v-if="testResults.length > 0" class="test-results">
        <h4>测试结果</h4>
        <div class="results-list">
          <div v-for="(result, index) in testResults" :key="index" class="result-item">
            <t-alert :theme="result.success ? 'success' : 'error'" :message="result.message"
              :description="result.details" />
          </div>
        </div>
      </div>

      <div class="console-section">
        <h4>控制台日志</h4>
        <div class="console-output">
          <pre>{{ consoleLog }}</pre>
        </div>
        <t-button size="small" variant="outline" @click="clearLog">
          清除日志
        </t-button>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { getSimpleFFmpegInstance, resetSimpleFFmpegInstance } from '@/utils/ffmpegConfigSimple';
import { getFFmpegInstance, resetFFmpegInstance } from '@/utils/ffmpegConfig';
import { getCorrectFFmpegInstance, resetCorrectFFmpegInstance } from '@/utils/ffmpegConfigCorrect';

interface TestResult {
  success: boolean;
  message: string;
  details: string;
}

const hasSharedArrayBuffer = ref(typeof SharedArrayBuffer !== 'undefined');
const isCrossOriginIsolated = ref(typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false);
const currentProtocol = ref(typeof window !== 'undefined' && window.location ? window.location.protocol : 'unknown');
const testingCorrect = ref(false);
const testingSimple = ref(false);
const testingFull = ref(false);
const testResults = ref<TestResult[]>([]);
const consoleLog = ref('');

// 新增状态
const validatingFiles = ref(false);
const testingLoadFix = ref(false);

const canTest = computed(() =>
  hasSharedArrayBuffer.value && isCrossOriginIsolated.value
);

// 日志功能
const log = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;
  consoleLog.value += logMessage + '\n';
  console.log(message);
};

const clearLog = () => {
  consoleLog.value = '';
};

// 测试文档推荐的FFmpeg配置
const testCorrectFFmpeg = async () => {
  if (!canTest.value) {
    MessagePlugin.warning('环境不支持FFmpeg');
    return;
  }

  testingCorrect.value = true;
  const startTime = Date.now();

  try {
    log('🚀 开始测试文档推荐的FFmpeg配置...');

    // 重置之前的实例
    resetCorrectFFmpegInstance();

    const ffmpeg = await getCorrectFFmpegInstance();
    const duration = Date.now() - startTime;

    log(`✅ 文档推荐配置加载成功！用时: ${duration}ms`);

    testResults.value.unshift({
      success: true,
      message: '📚 文档推荐配置测试成功',
      details: `加载用时: ${duration}ms，使用标准toBlobURL方式，完全按照CSDN文档配置。`
    });

    MessagePlugin.success('文档推荐配置测试成功！');

  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ 文档推荐配置测试失败: ${error}`);

    testResults.value.unshift({
      success: false,
      message: '📚 文档推荐配置测试失败',
      details: `错误: ${error}，用时: ${duration}ms。请检查FFmpeg文件是否正确放置在public/ffmpeg/目录中。`
    });

    MessagePlugin.error('文档推荐配置测试失败');
  } finally {
    testingCorrect.value = false;
  }
};

// 测试简化版FFmpeg
const testSimpleFFmpeg = async () => {
  if (!canTest.value) {
    MessagePlugin.warning('环境不支持FFmpeg');
    return;
  }

  testingSimple.value = true;
  const startTime = Date.now();

  try {
    log('🚀 开始测试简化版FFmpeg...');

    // 重置之前的实例
    resetSimpleFFmpegInstance();

    const ffmpeg = await getSimpleFFmpegInstance();
    const duration = Date.now() - startTime;

    log(`✅ 简化版FFmpeg加载成功！用时: ${duration}ms`);

    testResults.value.unshift({
      success: true,
      message: '简化版FFmpeg测试成功',
      details: `加载用时: ${duration}ms，可以正常使用视频处理功能。`
    });

    MessagePlugin.success('简化版FFmpeg测试成功！');

  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ 简化版FFmpeg测试失败: ${error}`);

    testResults.value.unshift({
      success: false,
      message: '简化版FFmpeg测试失败',
      details: `错误: ${error}，用时: ${duration}ms`
    });

    MessagePlugin.error('简化版FFmpeg测试失败');
  } finally {
    testingSimple.value = false;
  }
};

// 测试完整版FFmpeg
const testFullFFmpeg = async () => {
  if (!canTest.value) {
    MessagePlugin.warning('环境不支持FFmpeg');
    return;
  }

  testingFull.value = true;
  const startTime = Date.now();

  try {
    log('🚀 开始测试完整版FFmpeg...');

    // 重置之前的实例
    resetFFmpegInstance();

    const ffmpeg = await getFFmpegInstance();
    const duration = Date.now() - startTime;

    log(`✅ 完整版FFmpeg加载成功！用时: ${duration}ms`);

    testResults.value.unshift({
      success: true,
      message: '完整版FFmpeg测试成功',
      details: `加载用时: ${duration}ms，可以正常使用视频处理功能。`
    });

    MessagePlugin.success('完整版FFmpeg测试成功！');

  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ 完整版FFmpeg测试失败: ${error}`);

    testResults.value.unshift({
      success: false,
      message: '完整版FFmpeg测试失败',
      details: `错误: ${error}，用时: ${duration}ms`
    });

    MessagePlugin.error('完整版FFmpeg测试失败');
  } finally {
    testingFull.value = false;
  }
};

// 清除结果
const clearResults = () => {
  testResults.value = [];
  clearLog();

  // 重置所有FFmpeg实例
  resetCorrectFFmpegInstance();
  resetSimpleFFmpegInstance();
  resetFFmpegInstance();

  log('🔄 已清除所有测试结果和FFmpeg实例');
};

onMounted(() => {
  log('📋 快速测试面板已加载');
  log(`环境检查: SharedArrayBuffer=${hasSharedArrayBuffer.value}, crossOriginIsolated=${isCrossOriginIsolated.value}`);
  log(`当前协议: ${currentProtocol.value}`);
});
</script>

<style lang="less" scoped>
.quick-test-panel {
  .test-section {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
      color: #1f2937;
      font-weight: 600;
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .test-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .test-results {
    .results-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .console-section {
    h4 {
      margin-bottom: 12px;
      color: #1f2937;
      font-weight: 600;
    }

    .console-output {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      border-radius: 4px;
      max-height: 200px;
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
  }
}
</style>
