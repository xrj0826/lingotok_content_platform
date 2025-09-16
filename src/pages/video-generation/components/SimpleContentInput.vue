<!-- 简化版内容输入组件 -->
<template>
  <div class="content-input-container">
    <div class="step-header">
      <div class="header-icon">
        <t-icon :name="contentType === 'dialogue' ? 'chat' : 'books'" />
      </div>
      <h3>{{ contentType === 'dialogue' ? '创建对话内容' : '添加单词列表' }}</h3>
      <p>{{ getDescription() }}</p>
    </div>

    <div class="content-form">
      <!-- 对话内容输入 -->
      <div v-if="contentType === 'dialogue'" class="dialogue-input">
        <div class="form-group">
          <label class="form-label">对话内容 <span class="required">*</span></label>
          <t-textarea v-model="localContent"
            placeholder="请输入对话内容，格式如下：&#10;A: 你好，今天天气怎么样？&#10;B: 今天天气很好，阳光明媚。&#10;A: 那我们去公园散步吧。&#10;B: 好的，我们一起去。"
            :autosize="{ minRows: 8, maxRows: 15 }" :maxlength="2000" show-limit @blur="handleContentChange" />
        </div>

        <!-- 对话预览 -->
        <div v-if="dialogueLines.length > 0" class="dialogue-preview">
          <h4>对话预览</h4>
          <div class="preview-content">
            <div v-for="(line, index) in dialogueLines" :key="index" class="dialogue-line"
              :class="{ 'speaker-a': line.speaker === 'A', 'speaker-b': line.speaker === 'B' }">
              <span class="speaker">{{ line.speaker }}:</span>
              <span class="content">{{ line.content }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 单词内容输入 -->
      <div v-else class="word-input">
        <div class="form-group">
          <label class="form-label">单词列表 <span class="required">*</span></label>
          <t-textarea v-model="localContent"
            placeholder="请输入要学习的单词，每行一个单词，格式如下：&#10;apple - 苹果&#10;banana - 香蕉&#10;orange - 橙子&#10;grape - 葡萄"
            :autosize="{ minRows: 8, maxRows: 15 }" :maxlength="2000" show-limit @blur="handleContentChange" />
        </div>

        <!-- 单词预览 -->
        <div v-if="wordList.length > 0" class="word-preview">
          <h4>单词预览 ({{ wordList.length }} 个单词)</h4>
          <div class="preview-content">
            <div v-for="(word, index) in wordList" :key="index" class="word-item">
              <span class="word-en">{{ word.english }}</span>
              <span class="word-separator">-</span>
              <span class="word-cn">{{ word.chinese }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容统计 -->
      <div class="content-stats">
        <div class="stat-item">
          <span class="stat-label">内容长度:</span>
          <span class="stat-value">{{ localContent.length }} 字符</span>
        </div>
        <div v-if="contentType === 'dialogue'" class="stat-item">
          <span class="stat-label">对话轮数:</span>
          <span class="stat-value">{{ dialogueLines.length }} 轮</span>
        </div>
        <div v-else class="stat-item">
          <span class="stat-label">单词数量:</span>
          <span class="stat-value">{{ wordList.length }} 个</span>
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
  contentType: 'dialogue' | 'word';
}

interface Emits {
  (e: 'update:content', value: string): void;
  (e: 'next'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localContent = ref(props.content);

// 监听 props 变化
watch(() => props.content, (newValue) => {
  localContent.value = newValue;
});

// 解析对话内容
const dialogueLines = computed(() => {
  if (props.contentType !== 'dialogue' || !localContent.value) return [];

  const lines = localContent.value.split('\n').filter(line => line.trim());
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
  }).filter(line => line.content);
});

// 解析单词内容
const wordList = computed(() => {
  if (props.contentType !== 'word' || !localContent.value) return [];

  const lines = localContent.value.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const parts = line.split('-').map(part => part.trim());
    if (parts.length >= 2) {
      return {
        english: parts[0],
        chinese: parts.slice(1).join('-')
      };
    }
    return {
      english: parts[0] || line,
      chinese: ''
    };
  }).filter(word => word.english);
});

// 验证内容有效性
const isContentValid = computed(() => {
  if (!localContent.value.trim()) return false;

  if (props.contentType === 'dialogue') {
    return dialogueLines.value.length >= 2;
  } else {
    return wordList.value.length >= 1;
  }
});

// 获取描述文本
const getDescription = () => {
  if (props.contentType === 'dialogue') {
    return '输入生动的对话内容，AI将为您生成自然流畅的对话视频';
  } else {
    return '添加要学习的单词列表，AI将创建专业的词汇学习视频';
  }
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
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header-icon {
  font-size: 40px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.step-header h3 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.step-header p {
  font-size: 15px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.content-form {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
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

.dialogue-preview,
.word-preview {
  margin-top: 24px;
}

.dialogue-preview h4,
.word-preview h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.preview-content {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.dialogue-line {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
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
  min-width: 24px;
}

.content {
  flex: 1;
  color: #4b5563;
  line-height: 1.5;
}

.word-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.word-item:hover {
  background: #f9fafb;
}

.word-item:last-child {
  border-bottom: none;
}

.word-en {
  font-weight: 600;
  color: #1f2937;
  min-width: 120px;
}

.word-separator {
  margin: 0 12px;
  color: #9ca3af;
}

.word-cn {
  color: #4b5563;
  flex: 1;
}

.content-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.stat-value {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
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

  .content-stats {
    flex-direction: column;
    gap: 8px;
  }

  .step-header h3 {
    font-size: 20px;
  }

  .word-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .word-separator {
    display: none;
  }
}
</style>
