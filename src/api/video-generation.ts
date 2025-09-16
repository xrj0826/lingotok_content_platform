// 视频生成相关API接口
import request from '@/utils/request/index';

// 定义接口类型
export interface VideoGenerationRequest {
  content: string;
  contentType: 'dialogue' | 'article';
  voice: string;
  speed: number;
  scenePrompt?: string;
  videoCollection?: string;
  videoName?: string;
  roleADialogue?: string[];
  roleBDialogue?: string[];
  roleAVoice?: string;
  roleBVoice?: string;
  roleASpeed?: number;
  roleBSpeed?: number;
  imageUrls?: string[];
}

export interface TTSRequest {
  content: string;
  voice: string;
  speed: number;
}

export interface ContentReviewRequest {
  content: string;
  audioUrl: string;
}

export interface VideoListRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'processing' | 'completed' | 'failed' | 'all';
  type?: 'dialogue' | 'article' | 'all';
}

export interface Video {
  id: string;
  title: string;
  content: string;
  type: 'dialogue' | 'article';
  voice: string;
  speed: number;
  status: 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  duration?: number;
  createTime: number;
  updateTime: number;
  userId: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface VideoListResponse {
  list: Video[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
}

export interface ReviewResponse {
  status: 'approved' | 'rejected';
  reason?: string;
  issues?: Array<{
    type: string;
    description: string;
  }>;
  suggestion?: string;
}

export interface GenerationResponse {
  videoId: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}

// API接口函数

/**
 * 提交TTS转换请求
 */
export const submitTTSConversion = (data: TTSRequest): Promise<ApiResponse<TTSResponse>> => {
  return request({
    url: '/api/v1/video-generation/tts',
    method: 'POST',
    data
  });
};

/**
 * 提交内容审核请求
 */
export const submitContentReview = (data: ContentReviewRequest): Promise<ApiResponse<ReviewResponse>> => {
  return request({
    url: '/api/v1/video-generation/review',
    method: 'POST',
    data
  });
};

/**
 * 提交视频生成请求
 */
export const submitVideoGeneration = (data: VideoGenerationRequest): Promise<ApiResponse<GenerationResponse>> => {
  return request({
    url: '/api/v1/video-generation/generate',
    method: 'POST',
    data
  });
};

/**
 * 获取视频生成状态
 */
export const getVideoGenerationStatus = (videoId: string): Promise<ApiResponse<GenerationResponse>> => {
  return request({
    url: `/api/v1/video-generation/status/${videoId}`,
    method: 'GET'
  });
};

/**
 * 获取视频列表
 */
export const getVideoList = (params: VideoListRequest): Promise<ApiResponse<VideoListResponse>> => {
  return request({
    url: '/api/v1/video-generation/list',
    method: 'GET',
    params
  });
};

/**
 * 获取视频详情
 */
export const getVideoDetail = (videoId: string): Promise<ApiResponse<Video>> => {
  return request({
    url: `/api/v1/video-generation/detail/${videoId}`,
    method: 'GET'
  });
};

/**
 * 删除视频
 */
export const deleteVideo = (videoId: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/api/v1/video-generation/delete/${videoId}`,
    method: 'DELETE'
  });
};

/**
 * 重新生成视频
 */
export const retryVideoGeneration = (videoId: string): Promise<ApiResponse<GenerationResponse>> => {
  return request({
    url: `/api/v1/video-generation/retry/${videoId}`,
    method: 'POST'
  });
};

/**
 * 获取音色列表
 */
export const getVoiceList = (): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  description: string;
  avatar: string;
  tags: string[];
  sampleUrl: string;
  gender: 'male' | 'female';
  language: 'zh' | 'en' | 'mixed';
}>>> => {
  return request({
    url: '/api/v1/video-generation/voices',
    method: 'GET'
  });
};

/**
 * 获取生成进度
 */
export const getGenerationProgress = (taskId: string): Promise<ApiResponse<{
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  estimatedTime: number;
  result?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  };
  error?: string;
}>> => {
  return request({
    url: `/api/v1/video-generation/progress/${taskId}`,
    method: 'GET'
  });
};

/**
 * 取消生成任务
 */
export const cancelGeneration = (taskId: string): Promise<ApiResponse<null>> => {
  return request({
    url: `/api/v1/video-generation/cancel/${taskId}`,
    method: 'POST'
  });
};

/**
 * 获取用户配额信息
 */
export const getUserQuota = (): Promise<ApiResponse<{
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  resetTime: number;
}>> => {
  return request({
    url: '/api/v1/video-generation/quota',
    method: 'GET'
  });
};

/**
 * 分享视频
 */
export const shareVideo = (videoId: string, options: {
  platform: 'wechat' | 'weibo' | 'qq' | 'link';
  title?: string;
  description?: string;
}): Promise<ApiResponse<{
  shareUrl: string;
  shareCode?: string;
}>> => {
  return request({
    url: `/api/v1/video-generation/share/${videoId}`,
    method: 'POST',
    data: options
  });
};

/**
 * 上传自定义音频
 */
export const uploadCustomAudio = (file: File): Promise<ApiResponse<{
  audioUrl: string;
  duration: number;
}>> => {
  const formData = new FormData();
  formData.append('audio', file);

  return request({
    url: '/api/v1/video-generation/upload-audio',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取视频模板列表
 */
export const getVideoTemplates = (): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  settings: {
    resolution: string;
    aspectRatio: string;
    style: string;
  };
}>>> => {
  return request({
    url: '/api/v1/video-generation/templates',
    method: 'GET'
  });
};

/**
 * 批量删除视频
 */
export const batchDeleteVideos = (videoIds: string[]): Promise<ApiResponse<{
  successCount: number;
  failedCount: number;
  failedIds: string[];
}>> => {
  return request({
    url: '/api/v1/video-generation/batch-delete',
    method: 'POST',
    data: { videoIds }
  });
};

/**
 * 导出视频数据
 */
export const exportVideoData = (videoIds: string[], format: 'json' | 'csv'): Promise<ApiResponse<{
  downloadUrl: string;
  filename: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/export',
    method: 'POST',
    data: { videoIds, format }
  });
};

// 工具函数

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * 格式化视频时长
 */
export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * 获取视频状态颜色
 */
export const getVideoStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'processing': '#f59e0b',
    'completed': '#10b981',
    'failed': '#ef4444'
  };
  return colorMap[status] || '#6b7280';
};

/**
 * 验证视频内容
 */
export const validateVideoContent = (content: string, type: 'dialogue' | 'article'): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push('内容不能为空');
  }

  if (content.length < 10) {
    errors.push('内容长度至少需要10个字符');
  }

  if (content.length > 5000) {
    errors.push('内容长度不能超过5000个字符');
  }

  if (type === 'dialogue') {
    const lines = content.split('\n').filter(line => line.trim());
    const dialoguePattern = /^[AB]:\s*.+$/;
    const hasValidDialogue = lines.some(line => dialoguePattern.test(line));

    if (!hasValidDialogue) {
      errors.push('对话格式不正确，请使用 A: 和 B: 开头');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 生成AI场景图
 */
export const generateSceneImage = (prompt: string): Promise<ApiResponse<{
  imageUrl: string;
  generationId: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/scene/generate',
    method: 'POST',
    data: { prompt }
  });
};

/**
 * 生成全景图
 */
export const generateFullScene = (data: {
  scenePrompt: string;
  imageUrls: string[];
}): Promise<ApiResponse<{
  fullSceneUrl: string;
  generationId: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/scene/full',
    method: 'POST',
    data
  });
};

/**
 * 图片裁剪放大功能
 */
export const cropAndResize = (data: {
  imageUrl: string;
  width: number;
  height: number;
  keepAspectRatio: boolean;
}): Promise<ApiResponse<{
  croppedUrl: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/image/crop',
    method: 'POST',
    data
  });
};

/**
 * 生成近景图按钮
 */
export const generateCloseUpScene = (data: {
  fullSceneUrl: string;
  scenePrompt: string;
}): Promise<ApiResponse<{
  closeUpUrl: string;
  generationId: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/scene/closeup',
    method: 'POST',
    data
  });
};

/**
 * 生成AI提示词
 */
export const generateAIPrompt = (data: {
  scenePrompt: string;
  characterDetails: string;
  fullSceneUrl: string;
}): Promise<ApiResponse<{
  generatedPrompt: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/prompt/generate',
    method: 'POST',
    data
  });
};

/**
 * 生成单人视频按钮
 */
export const generateSinglePersonVideo = (data: {
  dialogueContent: string;
  voice: string;
  speed: number;
  sceneUrl: string;
  characterType: 'A' | 'B';
}): Promise<ApiResponse<{
  videoUrl: string;
  generationId: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/character/single',
    method: 'POST',
    data
  });
};

/**
 * 获取视频合集列表
 */
export const getVideoCollections = (): Promise<ApiResponse<Array<{
  id: string;
  name: string;
  description: string;
  type: 'dialogue' | 'single-word';
  count: number;
}>>> => {
  return request({
    url: '/api/v1/video-generation/collections',
    method: 'GET'
  });
};

/**
 * 生成单词视频 - 调用Doubao-Seedance-1.0-pro模型
 */
export const generateWordVideo = (data: {
  word: string;
  prompt: string;
  videoCollection: string;
  videoName: string;
}): Promise<ApiResponse<{
  imageUrl: string;
  videoUrl: string;
  generationId: string;
}>> => {
  return request({
    url: '/api/v1/video-generation/word/generate',
    method: 'POST',
    data
  });
};

/**
 * 保存单词视频到存储
 */
export const saveWordVideo = (data: {
  videoUrl: string;
  imageUrl: string;
  word: string;
  videoCollection: string;
  videoName: string;
}): Promise<ApiResponse<{
  videoId: string;
  saved: boolean;
}>> => {
  return request({
    url: '/api/v1/video-generation/word/save',
    method: 'POST',
    data
  });
};

/**
 * 获取视频存储库列表
 */
export const getStorageVideoList = (params: {
  collectionId?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<ApiResponse<{
  list: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'dialogue' | 'word';
    collectionId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    createTime: number;
    updateTime: number;
    fileSize?: number;
  }>;
  total: number;
  page: number;
  pageSize: number;
}>> => {
  return request({
    url: '/api/v1/video-storage/list',
    method: 'GET',
    params
  });
};

/**
 * 删除存储视频
 */
export const deleteStorageVideo = (videoId: string): Promise<ApiResponse<{
  deleted: boolean;
}>> => {
  return request({
    url: `/api/v1/video-storage/delete/${videoId}`,
    method: 'DELETE'
  });
};

/**
 * 生成视频缩略图
 */
export const generateVideoThumbnail = (videoUrl: string, time: number = 1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('无法创建canvas上下文'));
      return;
    }

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = Math.min(time, video.duration);
    });

    video.addEventListener('seeked', () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailUrl);
    });

    video.addEventListener('error', () => {
      reject(new Error('视频加载失败'));
    });

    video.src = videoUrl;
    video.load();
  });
};

export default {
  submitTTSConversion,
  submitContentReview,
  submitVideoGeneration,
  getVideoGenerationStatus,
  getVideoList,
  getVideoDetail,
  deleteVideo,
  retryVideoGeneration,
  getVoiceList,
  getGenerationProgress,
  cancelGeneration,
  getUserQuota,
  shareVideo,
  uploadCustomAudio,
  getVideoTemplates,
  batchDeleteVideos,
  exportVideoData,
  formatFileSize,
  formatVideoDuration,
  getVideoStatusColor,
  validateVideoContent,
  generateVideoThumbnail
};

