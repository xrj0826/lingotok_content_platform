<!-- 视频库页面 -->
<template>
  <div class="video-library-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <t-breadcrumb>
        <t-breadcrumb-item>视频管理</t-breadcrumb-item>
        <t-breadcrumb-item>视频库</t-breadcrumb-item>
      </t-breadcrumb>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <div class="search-controls">
        <div class="search-left">
          <t-input v-model="searchKeyword" placeholder="搜索视频标题" style="width: 300px;" clearable />
          <t-select v-model="selectedCollection" placeholder="选择合集" style="width: 200px;" clearable>
            <t-option value="dialogue" label="对话视频" />
            <t-option value="word" label="单词视频" />
            <t-option value="grammar" label="语法视频" />
          </t-select>
          <t-button theme="primary" @click="searchVideos">搜索</t-button>
        </div>
        <div class="search-right">
          <t-button theme="primary" @click="goToCreate">创建视频</t-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <t-table :data="tableData" :columns="columns" row-key="id" :pagination="pagination" :loading="loading"
        @page-change="handlePageChange" bordered stripe>
        <!-- 视频标题列 -->
        <template #title="{ row }">
          <div class="video-title-cell">
            <div class="video-thumbnail-small">
              <t-icon name="play-circle" />
            </div>
            <div class="title-info">
              <div class="title-text">{{ row.title }}</div>
              <div class="title-meta">{{ row.duration }} | {{ row.createTime }}</div>
            </div>
          </div>
        </template>

        <!-- 合集列 -->
        <template #collection="{ row }">
          <t-tag :theme="getCollectionTheme(row.collection)">
            {{ getCollectionName(row.collection) }}
          </t-tag>
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <t-tag :theme="row.status === 'completed' ? 'success' : row.status === 'processing' ? 'warning' : 'danger'">
            {{ getStatusText(row.status) }}
          </t-tag>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <t-space>
            <t-button size="small" theme="primary" variant="text" @click="viewVideo(row)">
              查看
            </t-button>
            <t-button size="small" theme="success" variant="text" @click="downloadVideo(row)"
              v-if="row.status === 'completed'">
              下载
            </t-button>
            <t-button size="small" theme="danger" variant="text" @click="deleteVideo(row)">
              删除
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  getAIGCFinalVideoList,
  AIGCType,
  type AIGCWord,
  type AIGCDialog,
  getWordStatusText,
  getDialogStatusText
} from '@/api/aigc-video';

// 路由
const router = useRouter();

// 接口定义
interface VideoData {
  id: string;
  title: string;
  collection: string;
  duration: string;
  createTime: string;
  status: 'completed' | 'processing' | 'failed';
  description?: string;
  play_url?: string;
  cover_url?: string;
  word?: string;  // 单词视频特有
}

// 数据定义
const searchKeyword = ref('');
const selectedCollection = ref('');
const loading = ref(false);

// API数据
const wordVideoList = ref<AIGCWord[]>([]);
const dialogVideoList = ref<AIGCDialog[]>([]);

// 计算属性：合并和过滤数据
const tableData = computed(() => {
  const allVideos: VideoData[] = [];

  // 添加单词视频
  wordVideoList.value.forEach(video => {
    allVideos.push({
      id: video.id,
      title: video.title,
      collection: 'word',
      duration: '未知', // API中没有duration字段
      createTime: '未知', // API中没有createTime字段  
      status: 'completed', // 在最终视频列表中的都是已完成的
      description: `单词: ${video.word}`,
      play_url: video.play_url,
      cover_url: video.cover_url,
      word: video.word
    });
  });

  // 添加对话视频
  dialogVideoList.value.forEach(video => {
    allVideos.push({
      id: video.id,
      title: video.title,
      collection: 'dialogue',
      duration: '未知',
      createTime: '未知',
      status: 'completed',
      description: '对话视频',
      play_url: video.play_url,
      cover_url: video.cover_url
    });
  });

  // 根据搜索关键字和合集类型过滤
  return allVideos.filter(video => {
    const matchesKeyword = !searchKeyword.value ||
      video.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (video.word && video.word.toLowerCase().includes(searchKeyword.value.toLowerCase()));

    const matchesCollection = !selectedCollection.value || video.collection === selectedCollection.value;

    return matchesKeyword && matchesCollection;
  });
});

// 表格列配置
const columns = [
  { colKey: 'title', title: '视频标题', width: 300 },
  { colKey: 'collection', title: '所属合集', width: 120 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'actions', title: '操作', width: 200 }
];

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showSizer: true
});

// 获取视频数据
const fetchVideoData = async () => {
  try {
    loading.value = true;

    // 获取单词视频
    const wordResponse = await getAIGCFinalVideoList({
      offset: 0,
      limit: 1000, // 获取所有视频
      aigc_type: AIGCType.word
    });

    if (wordResponse.code === 200) {
      wordVideoList.value = wordResponse.data.aigc_word_list || [];
    }

    // 获取对话视频
    const dialogResponse = await getAIGCFinalVideoList({
      offset: 0,
      limit: 1000, // 获取所有视频
      aigc_type: AIGCType.dialog
    });

    if (dialogResponse.code === 200) {
      dialogVideoList.value = dialogResponse.data.aigc_dialog_list || [];
    }

    // 更新分页总数
    pagination.total = wordVideoList.value.length + dialogVideoList.value.length;

  } catch (error: any) {
    console.error('获取视频数据失败:', error);
    MessagePlugin.error(error.message || '获取视频数据失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 方法
const searchVideos = () => {
  MessagePlugin.info(`搜索: ${searchKeyword.value || '全部'} | 合集: ${selectedCollection.value || '全部'}`);
  // 搜索功能通过计算属性实现，这里可以添加其他逻辑
};

const goToCreate = () => {
  router.push('/video-generation/create');
};

const getCollectionTheme = (collection: string) => {
  const themes: Record<string, string> = {
    dialogue: 'primary',
    word: 'success',
    grammar: 'warning'
  };
  return themes[collection] || 'default';
};

const getCollectionName = (collection: string) => {
  const names: Record<string, string> = {
    dialogue: '对话视频',
    word: '单词视频',
    grammar: '语法视频'
  };
  return names[collection] || collection;
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    completed: '已完成',
    processing: '生成中',
    failed: '生成失败'
  };
  return texts[status] || status;
};

const viewVideo = (row: VideoData) => {
  if (row.play_url) {
    // 在新窗口打开视频
    window.open(row.play_url, '_blank');
  } else {
    MessagePlugin.warning('该视频暂无播放地址');
  }
};

const downloadVideo = (row: VideoData) => {
  if (!row.play_url) {
    MessagePlugin.warning('该视频暂无下载地址');
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = row.play_url;
    link.download = `${row.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    MessagePlugin.success(`开始下载: ${row.title}`);
  } catch (error) {
    console.error('下载失败:', error);
    MessagePlugin.error('下载失败，请重试');
  }
};

const deleteVideo = (row: VideoData) => {
  MessagePlugin.warning(`删除功能暂未实现: ${row.title}`);
  // TODO: 实现删除功能
};

const handlePageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  MessagePlugin.info(`跳转到第 ${pageInfo.current} 页`);
};

onMounted(() => {
  fetchVideoData();
});
</script>

<style scoped>
.video-library-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.breadcrumb-nav {
  margin-bottom: 24px;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.video-title-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-thumbnail-small {
  width: 40px;
  height: 30px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfbfbf;
}

.title-info {
  flex: 1;
}

.title-text {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.title-meta {
  font-size: 12px;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-library-container {
    padding: 16px;
  }

  .search-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-left {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>