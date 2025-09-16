<template>
  <div class="media-test-panel">
    <t-card title="在线媒体资源测试" :bordered="false">
      <div class="test-content">
        <!-- URL输入区域 -->
        <div class="input-section">
          <t-form :data="testForm" label-width="100px">
            <t-form-item label="媒体URL" name="url">
              <t-input
                v-model="testForm.url"
                placeholder="请输入图片或视频的在线URL"
                @enter="testMedia"
              />
            </t-form-item>
            <t-form-item label="媒体类型" name="type">
              <t-radio-group v-model="testForm.type">
                <t-radio value="image">图片</t-radio>
                <t-radio value="video">视频</t-radio>
                <t-radio value="auto">自动检测</t-radio>
              </t-radio-group>
            </t-form-item>
            <t-form-item label="调试模式" name="debug">
              <t-switch v-model="testForm.debug" />
            </t-form-item>
          </t-form>

          <t-space>
            <t-button theme="primary" @click="testMedia" :loading="testing">
              测试媒体
            </t-button>
            <t-button @click="clearTest">清除</t-button>
            <t-button variant="outline" @click="loadPresetUrls">
              加载示例URL
            </t-button>
          </t-space>
        </div>

        <!-- 预设URL -->
        <div v-if="showPresets" class="preset-section">
          <h4>示例URL</h4>
          <div class="preset-grid">
            <div
              v-for="preset in presetUrls"
              :key="preset.url"
              class="preset-item"
              @click="selectPreset(preset)"
            >
              <div class="preset-type">{{ preset.type }}</div>
              <div class="preset-description">{{ preset.description }}</div>
              <div class="preset-url">{{ preset.url.substring(0, 50) }}...</div>
            </div>
          </div>
        </div>

        <!-- 媒体显示区域 -->
        <div v-if="currentTest.url" class="display-section">
          <h4>媒体显示测试</h4>
          <div class="media-display">
            <SafeMediaDisplay
              :src="currentTest.url"
              :media-type="currentTest.type"
              :show-debug-info="testForm.debug"
              @load="handleMediaLoad"
              @error="handleMediaError"
              @retry="handleMediaRetry"
            />
          </div>
        </div>

        <!-- 传统方式对比 -->
        <div v-if="currentTest.url" class="comparison-section">
          <h4>传统方式对比</h4>
          <div class="traditional-display">
            <div v-if="currentTest.type === 'image'" class="traditional-image">
              <img
                :src="currentTest.url"
                alt="传统方式加载"
                @load="handleTraditionalLoad"
                @error="handleTraditionalError"
              />
              <div class="traditional-status">
                传统方式: {{ traditionalStatus }}
              </div>
            </div>
            <div v-else-if="currentTest.type === 'video'" class="traditional-video">
              <video
                :src="currentTest.url"
                controls
                @loadedmetadata="handleTraditionalLoad"
                @error="handleTraditionalError"
              >
                您的浏览器不支持视频播放
              </video>
              <div class="traditional-status">
                传统方式: {{ traditionalStatus }}
              </div>
            </div>
          </div>
        </div>

        <!-- 测试结果 -->
        <div v-if="testResults.length > 0" class="results-section">
          <h4>
            测试结果
            <t-button size="small" variant="text" @click="clearResults">清除结果</t-button>
          </h4>
          <div class="results-list">
            <div
              v-for="(result, index) in testResults"
              :key="index"
              :class="['result-item', result.success ? 'success' : 'failed']"
            >
              <div class="result-header">
                <span class="result-status">
                  {{ result.success ? '✅' : '❌' }}
                </span>
                <span class="result-type">{{ result.type }}</span>
                <span class="result-time">{{ result.timestamp }}</span>
              </div>
              <div class="result-url">{{ result.url }}</div>
              <div v-if="result.error" class="result-error">{{ result.error }}</div>
              <div v-if="result.loadTime" class="result-time-info">
                加载耗时: {{ result.loadTime }}ms
              </div>
            </div>
          </div>
        </div>

        <!-- 缓存状态 -->
        <div class="cache-section">
          <h4>
            缓存状态
            <t-button size="small" variant="text" @click="refreshCacheStatus">刷新</t-button>
            <t-button size="small" variant="text" @click="clearCache">清除缓存</t-button>
          </h4>
          <div class="cache-info">
            <div class="cache-stats">
              <span>缓存项目: {{ cacheStatus.cacheSize }}</span>
              <span>加载中: {{ cacheStatus.loadingCount }}</span>
            </div>
            <div v-if="cacheStatus.cacheEntries.length > 0" class="cache-entries">
              <div
                v-for="entry in cacheStatus.cacheEntries"
                :key="entry.original"
                class="cache-entry"
              >
                <div class="cache-original">{{ entry.original }}</div>
                <div class="cache-accessible">
                  {{ entry.accessible }}
                  <span v-if="entry.isBlob" class="blob-indicator">(Blob)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import SafeMediaDisplay from '@/components/SafeMediaDisplay.vue';
import { getMediaCacheStatus, clearMediaCache } from '@/utils/mediaResourceLoader';

interface TestForm {
  url: string;
  type: 'image' | 'video' | 'auto';
  debug: boolean;
}

interface TestResult {
  url: string;
  type: string;
  success: boolean;
  error?: string;
  loadTime?: number;
  timestamp: string;
}

interface PresetUrl {
  url: string;
  type: 'image' | 'video';
  description: string;
}

const testForm = reactive<TestForm>({
  url: '',
  type: 'auto',
  debug: false
});

const testing = ref(false);
const showPresets = ref(false);
const traditionalStatus = ref('未测试');

const currentTest = reactive({
  url: '',
  type: 'image' as 'image' | 'video',
  startTime: 0
});

const testResults = ref<TestResult[]>([]);
const cacheStatus = ref(getMediaCacheStatus());

// 预设URL示例
const presetUrls: PresetUrl[] = [
  {
    url: 'https://picsum.photos/800/600',
    type: 'image',
    description: 'Lorem Picsum 随机图片'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    type: 'image',
    description: 'Unsplash 示例图片'
  },
  {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    type: 'video',
    description: 'W3Schools 示例视频'
  },
  {
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    type: 'video',
    description: 'Sample Videos 测试视频'
  }
];

// 自动检测媒体类型
const detectMediaType = (url: string): 'image' | 'video' => {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const videoExts = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv'];
  
  const lowerUrl = url.toLowerCase();
  
  if (imageExts.some(ext => lowerUrl.includes(ext))) {
    return 'image';
  }
  if (videoExts.some(ext => lowerUrl.includes(ext))) {
    return 'video';
  }
  
  // 默认返回图片
  return 'image';
};

// 测试媒体
const testMedia = async () => {
  if (!testForm.url.trim()) {
    MessagePlugin.warning('请输入媒体URL');
    return;
  }

  testing.value = true;
  traditionalStatus.value = '测试中...';
  
  const url = testForm.url.trim();
  const type = testForm.type === 'auto' ? detectMediaType(url) : testForm.type;
  
  currentTest.url = url;
  currentTest.type = type;
  currentTest.startTime = performance.now();

  console.log('🎬 [MediaTest] 开始测试媒体:', { url, type });
  
  setTimeout(() => {
    testing.value = false;
  }, 1000);
};

// 处理安全媒体加载成功
const handleMediaLoad = (event: Event) => {
  const loadTime = performance.now() - currentTest.startTime;
  
  const result: TestResult = {
    url: currentTest.url,
    type: `安全方式-${currentTest.type}`,
    success: true,
    loadTime: Math.round(loadTime),
    timestamp: new Date().toLocaleTimeString()
  };
  
  testResults.value.unshift(result);
  console.log('✅ [MediaTest] 安全方式加载成功:', result);
  MessagePlugin.success(`安全方式加载成功 (${result.loadTime}ms)`);
};

// 处理安全媒体加载失败
const handleMediaError = (error: string) => {
  const result: TestResult = {
    url: currentTest.url,
    type: `安全方式-${currentTest.type}`,
    success: false,
    error,
    timestamp: new Date().toLocaleTimeString()
  };
  
  testResults.value.unshift(result);
  console.error('💥 [MediaTest] 安全方式加载失败:', result);
  MessagePlugin.error(`安全方式加载失败: ${error}`);
};

// 处理安全媒体重试
const handleMediaRetry = (count: number) => {
  console.log(`🔄 [MediaTest] 安全方式重试第${count}次`);
  MessagePlugin.info(`正在重试 (${count})`);
};

// 处理传统方式加载成功
const handleTraditionalLoad = () => {
  traditionalStatus.value = '加载成功';
  
  const result: TestResult = {
    url: currentTest.url,
    type: `传统方式-${currentTest.type}`,
    success: true,
    timestamp: new Date().toLocaleTimeString()
  };
  
  testResults.value.unshift(result);
  console.log('✅ [MediaTest] 传统方式加载成功:', result);
};

// 处理传统方式加载失败
const handleTraditionalError = () => {
  traditionalStatus.value = '加载失败';
  
  const result: TestResult = {
    url: currentTest.url,
    type: `传统方式-${currentTest.type}`,
    success: false,
    error: '传统方式加载失败',
    timestamp: new Date().toLocaleTimeString()
  };
  
  testResults.value.unshift(result);
  console.error('💥 [MediaTest] 传统方式加载失败:', result);
};

// 选择预设URL
const selectPreset = (preset: PresetUrl) => {
  testForm.url = preset.url;
  testForm.type = preset.type;
  MessagePlugin.info(`已选择: ${preset.description}`);
};

// 加载预设URL
const loadPresetUrls = () => {
  showPresets.value = !showPresets.value;
};

// 清除测试
const clearTest = () => {
  testForm.url = '';
  currentTest.url = '';
  traditionalStatus.value = '未测试';
  MessagePlugin.info('测试已清除');
};

// 清除结果
const clearResults = () => {
  testResults.value = [];
  MessagePlugin.info('结果已清除');
};

// 刷新缓存状态
const refreshCacheStatus = () => {
  cacheStatus.value = getMediaCacheStatus();
  MessagePlugin.info('缓存状态已刷新');
};

// 清除缓存
const clearCache = () => {
  clearMediaCache();
  refreshCacheStatus();
  MessagePlugin.success('缓存已清除');
};

onMounted(() => {
  console.log('🎬 [MediaTest] 媒体资源测试面板已加载');
  refreshCacheStatus();
});
</script>

<style lang="less" scoped>
.media-test-panel {
  .test-content {
    .input-section {
      margin-bottom: 24px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #f9fafb;
    }

    .preset-section {
      margin-bottom: 24px;

      h4 {
        margin-bottom: 12px;
        color: #1f2937;
      }

      .preset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 12px;

        .preset-item {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            border-color: #3b82f6;
            background: #f0f9ff;
          }

          .preset-type {
            font-weight: 500;
            color: #3b82f6;
            margin-bottom: 4px;
          }

          .preset-description {
            font-size: 14px;
            color: #374151;
            margin-bottom: 4px;
          }

          .preset-url {
            font-size: 12px;
            color: #6b7280;
            font-family: monospace;
          }
        }
      }
    }

    .display-section,
    .comparison-section {
      margin-bottom: 24px;

      h4 {
        margin-bottom: 12px;
        color: #1f2937;
      }

      .media-display,
      .traditional-display {
        width: 100%;
        max-width: 600px;
        height: 300px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        overflow: hidden;
      }

      .traditional-display {
        position: relative;

        .traditional-image,
        .traditional-video {
          width: 100%;
          height: 100%;

          img,
          video {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }

        .traditional-status {
          position: absolute;
          bottom: 8px;
          right: 8px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 12px;
          border-radius: 4px;
        }
      }
    }

    .results-section,
    .cache-section {
      margin-bottom: 24px;

      h4 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        color: #1f2937;
      }

      .results-list {
        max-height: 300px;
        overflow-y: auto;

        .result-item {
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          margin-bottom: 8px;

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
            align-items: center;
            gap: 12px;
            margin-bottom: 4px;

            .result-status {
              font-size: 16px;
            }

            .result-type {
              font-weight: 500;
            }

            .result-time {
              font-size: 12px;
              color: #6b7280;
            }
          }

          .result-url {
            font-size: 12px;
            color: #6b7280;
            font-family: monospace;
            margin-bottom: 4px;
            word-break: break-all;
          }

          .result-error {
            font-size: 12px;
            color: #ef4444;
            margin-bottom: 4px;
          }

          .result-time-info {
            font-size: 12px;
            color: #059669;
          }
        }
      }

      .cache-info {
        .cache-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #374151;
        }

        .cache-entries {
          max-height: 200px;
          overflow-y: auto;

          .cache-entry {
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            margin-bottom: 4px;
            font-size: 12px;

            .cache-original {
              color: #374151;
              margin-bottom: 2px;
              word-break: break-all;
            }

            .cache-accessible {
              color: #6b7280;
              font-family: monospace;
              word-break: break-all;

              .blob-indicator {
                color: #3b82f6;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}
</style>
























