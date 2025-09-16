<!-- 内容输入步骤组件 -->
<template>
  <div class="content-input-container">
    <div class="step-header">
      <h3>输入对话内容</h3>
      <p>请选择内容类型并输入要生成视频的内容</p>
    </div>

    <div class="content-form">
      <!-- 内容类型选择 -->
      <div class="form-group">
        <label class="form-label">内容类型</label>
        <t-radio-group v-model="localContentType" @change="handleContentTypeChange">
          <t-radio value="dialogue">对话视频</t-radio>
          <t-radio value="article">文字生成</t-radio>
        </t-radio-group>
      </div>

      <!-- 内容输入区域 -->
      <div class="form-group">
        <label class="form-label">
          {{ localContentType === 'dialogue' ? '对话内容' : '文章内容' }}
          <span class="required">*</span>
        </label>
        <t-textarea v-model="localContent" :placeholder="getPlaceholder()" :autosize="{ minRows: 8, maxRows: 15 }"
          :maxlength="5000" show-limit @blur="handleContentChange" />
        <div class="input-tips">
          <div v-if="localContentType === 'dialogue'" class="tips-content">
            <p><strong>对话格式示例：</strong></p>
            <p>A: 你好，今天天气怎么样？</p>
            <p>B: 今天天气很好，阳光明媚。</p>
            <p>A: 那我们去公园散步吧。</p>
            <p>B: 好的，我们一起去。</p>
          </div>
          <div v-else class="tips-content">
            <p><strong>文章内容提示：</strong></p>
            <p>• 支持中英文混合输入</p>
            <p>• 建议控制在合理长度，过长可能影响生成效果</p>
            <p>• 避免使用特殊符号和敏感词汇</p>
          </div>
        </div>
      </div>

      <!-- 内容预览 -->
      <div v-if="localContent.trim()" class="content-preview">
        <label class="form-label">内容预览</label>
        <div class="preview-box">
          <div v-if="localContentType === 'dialogue'" class="dialogue-preview">
            <div v-for="(line, index) in parseDialogue(localContent)" :key="index" class="dialogue-line"
              :class="{ 'speaker-a': line.speaker === 'A', 'speaker-b': line.speaker === 'B' }">
              <span class="speaker">{{ line.speaker }}:</span>
              <span class="content">{{ line.content }}</span>
            </div>
          </div>
          <div v-else class="article-preview">
            <p v-for="(paragraph, index) in localContent.split('\n').filter(p => p.trim())" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <t-button theme="primary" size="large" :disabled="!isContentValid" @click="handleNext">
        下一步：选择音色
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

// 定义 props 和 emits
interface Props {
  content: string;
  contentType: 'dialogue' | 'article';
}

interface Emits {
  (e: 'update:content', value: string): void;
  (e: 'update:contentType', value: 'dialogue' | 'article'): void;
  (e: 'next'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localContent = ref(props.content);
const localContentType = ref(props.contentType);

// 监听 props 变化
watch(() => props.content, (newValue) => {
  localContent.value = newValue;
});

watch(() => props.contentType, (newValue) => {
  localContentType.value = newValue;
});

// 计算属性
const isContentValid = computed(() => {
  return localContent.value.trim().length >= 10;
});

// 获取占位符文本
const getPlaceholder = () => {
  if (localContentType.value === 'dialogue') {
    return '请输入对话内容，格式如下：\nA: 你的第一句话\nB: 对方的回复\nA: 你的第二句话\n...';
  } else {
    return '请输入文章内容，支持中英文混合输入...';
  }
};

// 解析对话内容
const parseDialogue = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const match = line.match(/^([AB]):\s*(.+)$/);
    if (match) {
      return {
        speaker: match[1],
        content: match[2]
      };
    }
    return {
      speaker: '?',
      content: line
    };
  });
};

// 处理内容类型变化
const handleContentTypeChange = () => {
  emit('update:contentType', localContentType.value);
  // 清空内容，让用户重新输入
  localContent.value = '';
  emit('update:content', '');
};

// 处理内容变化
const handleContentChange = () => {
  emit('update:content', localContent.value);
};

// 处理下一步
const handleNext = () => {
  if (isContentValid.value) {
    emit('update:content', localContent.value);
    emit('next');
  }
};
</script>

<style scoped>
.content-input-container {
  max-width: 800px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h3 {
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.step-header p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.content-form {
  background: #f8fafc;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  color: #374151;
  font-weight: 500;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
  margin-left: 4px;
}

.input-tips {
  margin-top: 8px;
  padding: 12px;
  background: #e0f2fe;
  border-radius: 6px;
  border-left: 4px solid #0ea5e9;
}

.tips-content {
  color: #0c4a6e;
  font-size: 13px;
  line-height: 1.5;
}

.tips-content p {
  margin: 4px 0;
}

.tips-content strong {
  font-weight: 600;
}

.content-preview {
  margin-top: 24px;
}

.preview-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.dialogue-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialogue-line {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.dialogue-line.speaker-a {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.dialogue-line.speaker-b {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
}

.speaker {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 20px;
}

.content {
  flex: 1;
  color: #4b5563;
  line-height: 1.5;
}

.article-preview p {
  margin: 8px 0;
  color: #4b5563;
  line-height: 1.6;
}

.step-actions {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-input-container {
    padding: 0 16px;
  }

  .content-form {
    padding: 16px;
  }

  .step-header h3 {
    font-size: 20px;
  }
}
</style>


