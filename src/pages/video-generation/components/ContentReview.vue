<!-- 内容审核步骤组件 -->
<template>
  <div class="content-review-container">
    <div class="step-header">
      <h3>内容审核</h3>
      <p>正在对您的内容进行安全性和合规性审核</p>
    </div>

    <div class="review-content">
      <!-- 审核状态 -->
      <div class="review-status">
        <div class="status-header">
          <h4>审核状态</h4>
          <div class="status-badge" :class="localReviewStatus">
            {{ getStatusText() }}
          </div>
        </div>

        <div class="status-progress">
          <t-progress :percentage="reviewProgress" :status="progressStatus" :show-info="true" size="large" />
          <div class="progress-info">
            <span class="current-task">{{ currentTask }}</span>
            <span v-if="localReviewStatus === 'pending'" class="estimated-time">
              预计剩余: {{ estimatedTime }}
            </span>
          </div>
        </div>
      </div>

      <!-- 审核项目 -->
      <div class="review-items">
        <h4>审核项目</h4>
        <div class="items-list">
          <div v-for="item in reviewItems" :key="item.id" class="review-item" :class="item.status">
            <div class="item-icon">
              <t-icon :name="getItemIcon(item.status)" :class="item.status" />
            </div>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-description">{{ item.description }}</div>
            </div>
            <div class="item-status">
              <span class="status-text" :class="item.status">
                {{ getItemStatusText(item.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容预览 -->
      <div class="content-preview">
        <h4>内容预览</h4>
        <div class="preview-tabs">
          <t-tabs v-model="activeTab" placement="top">
            <t-tab-panel value="text" label="文本内容">
              <div class="text-preview">
                <div class="preview-box">
                  {{ content }}
                </div>
              </div>
            </t-tab-panel>
            <t-tab-panel value="audio" label="音频内容">
              <div class="audio-preview">
                <audio v-if="audioUrl" :src="audioUrl" controls preload="metadata" class="audio-player">
                  您的浏览器不支持音频播放
                </audio>
                <div v-else class="no-audio">
                  暂无音频文件
                </div>
              </div>
            </t-tab-panel>
          </t-tabs>
        </div>
      </div>

      <!-- 审核结果 -->
      <div v-if="localReviewStatus !== 'pending'" class="review-result">
        <div v-if="localReviewStatus === 'approved'" class="result-success">
          <t-alert theme="success" :close="false">
            <template #icon>
              <t-icon name="check-circle" />
            </template>
            <div class="alert-content">
              <div class="alert-title">审核通过</div>
              <div class="alert-message">您的内容符合平台规范，可以继续生成视频。</div>
            </div>
          </t-alert>
        </div>

        <div v-else-if="localReviewStatus === 'rejected'" class="result-error">
          <t-alert theme="error" :close="false">
            <template #icon>
              <t-icon name="error-circle" />
            </template>
            <div class="alert-content">
              <div class="alert-title">审核未通过</div>
              <div class="alert-message">{{ rejectionReason }}</div>
            </div>
          </t-alert>

          <div class="rejection-details">
            <h5>问题详情：</h5>
            <ul class="issue-list">
              <li v-for="issue in rejectionIssues" :key="issue.type">
                <strong>{{ issue.type }}：</strong>{{ issue.description }}
              </li>
            </ul>

            <div class="suggestion">
              <h5>修改建议：</h5>
              <p>{{ rejectionSuggestion }}</p>
            </div>
          </div>

          <div class="retry-actions">
            <t-button theme="primary" @click="goBackToEdit">
              返回修改内容
            </t-button>
            <t-button theme="default" @click="retryReview">
              重新审核
            </t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <t-button theme="default" size="large" :disabled="localReviewStatus === 'pending'" @click="handlePrev">
        上一步
      </t-button>
      <t-button theme="primary" size="large" :disabled="localReviewStatus !== 'approved'" @click="handleNext">
        下一步：生成视频
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义审核项目接口
interface ReviewItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
}

// 定义拒绝原因接口
interface RejectionIssue {
  type: string;
  description: string;
}

// 定义 props 和 emits
interface Props {
  content: string;
  audioUrl: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

interface Emits {
  (e: 'update:reviewStatus', value: 'pending' | 'approved' | 'rejected'): void;
  (e: 'next'): void;
  (e: 'prev'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地状态
const localReviewStatus = ref<'pending' | 'approved' | 'rejected'>(props.reviewStatus);
const reviewProgress = ref(0);
const currentTask = ref('准备开始审核');
const activeTab = ref('text');
const rejectionReason = ref('');
const rejectionIssues = ref<RejectionIssue[]>([]);
const rejectionSuggestion = ref('');

// 监听 props 变化
watch(() => props.reviewStatus, (newValue) => {
  localReviewStatus.value = newValue;
});

// 审核项目
const reviewItems = ref<ReviewItem[]>([
  {
    id: 'content-safety',
    title: '内容安全检测',
    description: '检测是否包含违规、暴力、色情等不当内容',
    status: 'pending'
  },
  {
    id: 'spam-detection',
    title: '垃圾信息检测',
    description: '检测是否为垃圾信息、广告推广等',
    status: 'pending'
  },
  {
    id: 'copyright-check',
    title: '版权合规检查',
    description: '检查内容是否涉及版权问题',
    status: 'pending'
  },
  {
    id: 'quality-assessment',
    title: '内容质量评估',
    description: '评估内容的完整性和可读性',
    status: 'pending'
  },
  {
    id: 'audio-quality',
    title: '音频质量检查',
    description: '检查音频文件的质量和完整性',
    status: 'pending'
  }
]);

// 计算属性
const progressStatus = computed(() => {
  if (localReviewStatus.value === 'rejected') return 'error';
  if (localReviewStatus.value === 'approved') return 'success';
  if (reviewProgress.value > 0) return 'active';
  return 'normal';
});

const estimatedTime = computed(() => {
  const remaining = Math.ceil((100 - reviewProgress.value) / 20);
  return `${remaining} 秒`;
});

// 获取状态文本
const getStatusText = () => {
  switch (localReviewStatus.value) {
    case 'pending': return '审核中';
    case 'approved': return '审核通过';
    case 'rejected': return '审核未通过';
    default: return '未知状态';
  }
};

// 获取审核项目图标
const getItemIcon = (status: string) => {
  switch (status) {
    case 'pending': return 'time';
    case 'checking': return 'loading';
    case 'passed': return 'check-circle';
    case 'failed': return 'error-circle';
    default: return 'time';
  }
};

// 获取审核项目状态文本
const getItemStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '等待中';
    case 'checking': return '检查中';
    case 'passed': return '通过';
    case 'failed': return '未通过';
    default: return '未知';
  }
};

// 开始审核流程
const startReview = async () => {
  if (localReviewStatus.value !== 'pending') return;

  try {
    reviewProgress.value = 0;
    currentTask.value = '正在初始化审核流程...';

    // 逐项审核
    for (let i = 0; i < reviewItems.value.length; i++) {
      const item = reviewItems.value[i];

      // 设置当前项目为检查中
      item.status = 'checking';
      currentTask.value = `正在进行${item.title}...`;

      // 模拟审核过程
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 模拟审核结果（90%通过率）
      const passed = Math.random() > 0.1;
      item.status = passed ? 'passed' : 'failed';

      // 更新进度
      reviewProgress.value = ((i + 1) / reviewItems.value.length) * 100;

      // 如果有项目未通过，设置审核失败
      if (!passed) {
        await handleReviewFailure(item);
        return;
      }
    }

    // 所有项目都通过
    await handleReviewSuccess();

  } catch (error) {
    console.error('审核过程出错:', error);
    MessagePlugin.error('审核过程中发生错误');
  }
};

// 处理审核成功
const handleReviewSuccess = async () => {
  currentTask.value = '审核完成';
  reviewProgress.value = 100;
  localReviewStatus.value = 'approved';
  emit('update:reviewStatus', 'approved');
  MessagePlugin.success('内容审核通过！');
};

// 处理审核失败
const handleReviewFailure = async (failedItem: ReviewItem) => {
  localReviewStatus.value = 'rejected';
  emit('update:reviewStatus', 'rejected');

  // 生成拒绝原因
  const reasonMap: Record<string, { reason: string; issues: RejectionIssue[]; suggestion: string }> = {
    'content-safety': {
      reason: '内容包含不当信息，不符合平台安全规范',
      issues: [
        { type: '内容安全', description: '检测到可能的敏感或不当内容' }
      ],
      suggestion: '请检查并修改内容中可能存在争议的部分，确保内容积极正面。'
    },
    'spam-detection': {
      reason: '内容被识别为垃圾信息或过度营销',
      issues: [
        { type: '垃圾信息', description: '内容可能包含过度的广告推广信息' }
      ],
      suggestion: '请减少广告性质的内容，专注于提供有价值的信息。'
    },
    'copyright-check': {
      reason: '内容可能存在版权问题',
      issues: [
        { type: '版权合规', description: '检测到可能的版权保护内容' }
      ],
      suggestion: '请确保使用的内容拥有合法授权，或替换为原创内容。'
    },
    'quality-assessment': {
      reason: '内容质量不符合要求',
      issues: [
        { type: '内容质量', description: '内容过于简短或缺乏实质性信息' }
      ],
      suggestion: '请丰富内容，增加更多有价值的信息和细节。'
    },
    'audio-quality': {
      reason: '音频质量不符合要求',
      issues: [
        { type: '音频质量', description: '音频文件存在质量问题或格式不支持' }
      ],
      suggestion: '请检查音频生成设置，确保音频质量符合要求。'
    }
  };

  const failureInfo = reasonMap[failedItem.id] || {
    reason: '内容审核未通过',
    issues: [{ type: '未知问题', description: '审核过程中发现问题' }],
    suggestion: '请修改内容后重新提交审核。'
  };

  rejectionReason.value = failureInfo.reason;
  rejectionIssues.value = failureInfo.issues;
  rejectionSuggestion.value = failureInfo.suggestion;

  MessagePlugin.error('内容审核未通过');
};

// 返回修改内容
const goBackToEdit = () => {
  // 返回到第一步
  emit('prev');
  emit('prev');
  emit('prev');
  emit('prev');
};

// 重新审核
const retryReview = () => {
  localReviewStatus.value = 'pending';
  emit('update:reviewStatus', 'pending');
  reviewProgress.value = 0;
  rejectionReason.value = '';
  rejectionIssues.value = [];
  rejectionSuggestion.value = '';

  // 重置所有审核项目状态
  reviewItems.value.forEach(item => {
    item.status = 'pending';
  });

  startReview();
};

// 处理上一步
const handlePrev = () => {
  emit('prev');
};

// 处理下一步
const handleNext = () => {
  if (localReviewStatus.value === 'approved') {
    emit('next');
  }
};

// 组件挂载时开始审核
onMounted(() => {
  if (localReviewStatus.value === 'pending') {
    // 延迟开始审核，给用户查看的时间
    setTimeout(() => {
      startReview();
    }, 1000);
  }
});
</script>

<style scoped>
.content-review-container {
  max-width: 900px;
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

.review-content {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.review-status {
  margin-bottom: 32px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-header h4 {
  color: #374151;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fbbf24;
  color: #92400e;
}

.status-badge.approved {
  background: #10b981;
  color: #ffffff;
}

.status-badge.rejected {
  background: #ef4444;
  color: #ffffff;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
}

.current-task {
  color: #374151;
  font-weight: 500;
}

.estimated-time {
  color: #6b7280;
}

.review-items {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.review-items h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.review-item.checking {
  border-color: #3b82f6;
  background: #eff6ff;
}

.review-item.passed {
  border-color: #10b981;
  background: #ecfdf5;
}

.review-item.failed {
  border-color: #ef4444;
  background: #fef2f2;
}

.item-icon {
  margin-right: 12px;
  font-size: 20px;
}

.item-icon.pending {
  color: #6b7280;
}

.item-icon.checking {
  color: #3b82f6;
}

.item-icon.passed {
  color: #10b981;
}

.item-icon.failed {
  color: #ef4444;
}

.item-content {
  flex: 1;
}

.item-title {
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
}

.item-description {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

.item-status {
  margin-left: 12px;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-text.pending {
  background: #f3f4f6;
  color: #6b7280;
}

.status-text.checking {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-text.passed {
  background: #dcfce7;
  color: #166534;
}

.status-text.failed {
  background: #fee2e2;
  color: #dc2626;
}

.content-preview {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.content-preview h4 {
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.text-preview .preview-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.audio-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.audio-player {
  width: 100%;
  max-width: 400px;
}

.no-audio {
  color: #6b7280;
  font-style: italic;
}

.review-result {
  margin-bottom: 0;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alert-title {
  font-weight: 600;
  font-size: 16px;
}

.alert-message {
  font-size: 14px;
  opacity: 0.9;
}

.rejection-details {
  background: #ffffff;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
}

.rejection-details h5 {
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.issue-list {
  margin: 0 0 16px 20px;
  padding: 0;
}

.issue-list li {
  color: #7f1d1d;
  font-size: 14px;
  margin-bottom: 4px;
}

.suggestion p {
  color: #7f1d1d;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.retry-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-review-container {
    padding: 0 16px;
  }

  .review-content {
    padding: 16px;
  }

  .status-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .progress-info {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }

  .review-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .item-content {
    order: 2;
  }

  .item-status {
    order: 3;
    margin-left: 0;
  }

  .retry-actions {
    flex-direction: column;
  }

  .step-actions {
    flex-direction: column;
    gap: 12px;
  }

  .step-actions .t-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .step-header h3 {
    font-size: 20px;
  }
}
</style>


