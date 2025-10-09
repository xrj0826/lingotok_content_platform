// AIGC视频生成相关API接口
import axios from 'axios';
import { generateRequestParams } from '@/utils/crypto';

const API_BASE_URL = 'https://api.lingotok.ai';

// 工具函数：生成带签名的请求头
function generateAuthHeaders(apiName: string) {
  const requestParams = generateRequestParams(apiName);
  return {
    'Timestamp': requestParams.Timestamp.toString(),
    'Signature': requestParams.Signature,
  };
}

// 工具函数：生成带签名的POST请求头
function generatePostAuthHeaders(apiName: string) {
  return {
    'Content-Type': 'application/json',
    ...generateAuthHeaders(apiName),
  };
}

// 工具函数：通用API请求
async function apiRequest(endpoint: string, method: 'GET' | 'POST', apiName: string, data?: any, params?: any) {
  const headers = method === 'POST' ? generatePostAuthHeaders(apiName) : generateAuthHeaders(apiName);

  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      ...(method === 'POST' && data && { data }),
      ...(method === 'GET' && params && { params }),
    };

    console.log(`=== API请求详情 [${apiName}] ===`);
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);

    const response = await axios(config);

    console.log(`=== API响应详情 [${apiName}] ===`);
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    return response.data;
  } catch (error) {
    console.error(`API请求失败 [${apiName}]:`, error);
    if (error.response) {
      console.error('错误响应状态:', error.response.status);
      console.error('错误响应数据:', error.response.data);
      console.error('错误响应头:', error.response.headers);
    }
    throw error;
  }
}

// 枚举定义 - 根据IDL文档
export enum AIGCWordStatus {
  img_generating = 1,
  img_reviewing = 2,
  video_generating = 3,
  video_reviewing = 4,
  video_processing = 5,
  video_process_failed = 6,
  finished = 7
}

export enum AIGCDialogStatus {
  far_img_generating = 1,
  far_img_reviewing = 2,
  near_img_generating = 3,
  near_img_reviewing = 4,
  dialog_generating = 5,
  dialog_reviewing = 6,
  video_processing = 7,
  video_process_failed = 8,
  finished = 9
}

export enum AIGCWordOperation {
  gen_ai_img = "gen_ai_img",
  gen_ai_video = "gen_ai_video",
  gen_final_video = "gen_final_video"
}

export enum AIGCDialogOperation {
  gen_ai_far_img = "gen_ai_far_img",
  gen_ai_near_img_a = "gen_ai_near_img_a",
  gen_ai_near_img_b = "gen_ai_near_img_b",
  gen_ai_dialog_video = "gen_ai_dialog_video",
  submit_final_video = "submit_final_video"
}

export enum AIGCType {
  word = 'word',
  dialog = 'dialog'
}

export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US'
}

// 接口类型定义
export interface AIGCWord {
  id: string;
  title: string;
  status: AIGCWordStatus;
  word: string;
  ai_gen_img_url?: string;
  ai_gen_video_url?: string;
  play_url?: string;
  cover_url?: string;
}

/**
 * 对应 struct AIGCDialogDetail
 * 1: optional string near_ai_img_url,
 * 2: optional string audio_type,
 * 3: optional double audio_ratio,
 * 4: optional list<string> content_list,
 * 5: optional list<string> ai_video_url_list,
 * 6: required bool gen_ai_video_succeed, //触发gen_ai_dialog_video后轮询，detailA和detailB的该字段都为true，才能进入编辑视频页面
 */
export interface AIGCDialogDetail {
  near_ai_img_url?: string;
  audio_type?: string;
  audio_ratio?: number; // 浮点数类型
  content_list?: string[];
  ai_video_url_list?: string[];
  gen_ai_video_succeed?: boolean; // 字段由后端处理，前端不需要传递
}

/**
 * 对应 struct OperateAIGCDialogReq
 * 1: required string id,
 * 2: required AIGCDialogOperation operation,
 * 3: optional string series_name, //submit_final_video必传
 * 4: optional string title, //submit_final_video必传
 * 5: optional string ai_far_img_prompt, //gen_ai_far_img必传
 * 6: optional AIGCDialogDetail detail_a, //gen_ai_dialog_video必传
 * 7: optional AIGCDialogDetail detail_b, //gen_ai_dialog_video必传
 * 8: optional string final_video_url, //submit_final_video必传
 * 扩展字段(根据实际需要添加的负载参数):
 * 9: optional string ai_near_img_prompt_a, //gen_ai_near_img_a需要的负载参数
 * 10: optional string character_desc_a, //gen_ai_near_img_a需要的负载参数
 * 11: optional string ai_near_img_prompt_b, //gen_ai_near_img_b需要的负载参数
 * 12: optional string character_desc_b, //gen_ai_near_img_b需要的负载参数
 */
export interface OperateAIGCDialogReq {
  id: string; // required
  operation: AIGCDialogOperation; // required
  series_name?: string; // submit_final_video必传
  title?: string; // submit_final_video必传
  ai_far_img_prompt?: string; // gen_ai_far_img必传
  detail_a?: AIGCDialogDetail; // gen_ai_dialog_video必传 (注意拼写与IDL保持一致)
  detail_b?: AIGCDialogDetail; // gen_ai_dialog_video必传
  final_video_url?: string; // submit_final_video必传
  // 扩展字段 - 为近景图生成操作添加的负载参数
  ai_near_img_prompt_a?: string; // gen_ai_near_img_a需要的负载参数
  character_desc_a?: string; // gen_ai_near_img_a需要的负载参数
  ai_near_img_prompt_b?: string; // gen_ai_near_img_b需要的负载参数
  character_desc_b?: string; // gen_ai_near_img_b需要的负载参数
}

/**
 * 对应 struct AIGCDialog
 * 1: required string id,
 * 2: required string title,
 * 3: optional string ai_far_img_url,
 * 4: optional AIGCDialogDetail detail_a,
 * 5: optional AIGCDialogDetail detail_b,
 * 6: optional string play_url,
 * 7: optional string cover_url,
 * 8: optional map<Language, string> subtitles,
 */
export interface AIGCDialog {
  id: string; // required
  title: string; // required
  ai_far_img_url?: string;
  detail_a?: AIGCDialogDetail;
  detail_b?: AIGCDialogDetail;
  play_url?: string;
  cover_url?: string;
  subtitles?: Record<Language, string>;
  // 新增：后端轮询返回的服务端状态描述
  gen_ai_video_status?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// ========================== 单词类视频API ==========================

/**
 * 创建单词视频
 */
export const createAIGCWord = async (data: {
  series_name: string;
  title: string;
  word: string;
}): Promise<ApiResponse<{ aigc_word: { id: string; title: string; word: string } }>> => {
  console.log('=== createAIGCWord called ===');
  console.log('Input data:', data);

  return await apiRequest('/api/v1/aigc/create_aigc_word', 'POST', 'create_aigc_word', data);
};

/**
 * 获取单词视频详情
 */
export const getAIGCWord = async (id: string): Promise<ApiResponse<{ aigc_word: AIGCWord }>> => {
  console.log('=== getAIGCWord called ===', id);

  return await apiRequest('/api/v1/aigc/get_aigc_word', 'POST', 'get_aigc_word', { id });
};

/**
 * 操作单词视频 - 生成AI图片
 */
export const operateAIGCWordGenImg = async (data: {
  id: string;
  word_prompt: string;
}): Promise<ApiResponse<AIGCWord>> => {
  console.log('=== operateAIGCWordGenImg called ===', data);

  const requestData = {
    id: data.id,
    operation: AIGCWordOperation.gen_ai_img,
    word_prompt: data.word_prompt
  };

  console.log('=== Sending request data ===', requestData);
  console.log('=== Operation value ===', AIGCWordOperation.gen_ai_img);
  console.log('=== Request URL ===', `${API_BASE_URL}/api/v1/aigc/operate_aigc_word`);

  return await apiRequest('/api/v1/aigc/operate_aigc_word', 'POST', 'operate_aigc_word', requestData);
};

/**
 * 操作单词视频 - 生成AI视频
 */
export const operateAIGCWordGenVideo = async (id: string): Promise<ApiResponse<AIGCWord>> => {
  console.log('=== operateAIGCWordGenVideo called ===', id);

  const requestData = {
    id,
    operation: AIGCWordOperation.gen_ai_video
  };

  console.log('=== Sending request data for gen_ai_video ===', requestData);

  return await apiRequest('/api/v1/aigc/operate_aigc_word', 'POST', 'operate_aigc_word', requestData);
};

/**
 * 操作单词视频 - 生成最终视频
 */
export const operateAIGCWordGenFinalVideo = async (id: string): Promise<ApiResponse<AIGCWord>> => {
  console.log('=== operateAIGCWordGenFinalVideo called ===', id);

  const requestData = {
    id,
    operation: AIGCWordOperation.gen_final_video
  };

  console.log('=== Sending request data for gen_final_video ===', requestData);

  return await apiRequest('/api/v1/aigc/operate_aigc_word', 'POST', 'operate_aigc_word', requestData);
};

// ========================== 对话类视频API ==========================

/**
 * 创建对话视频
 */
export const createAIGCDialog = async (data: {
  series_name: string;
  title: string;
}): Promise<ApiResponse<{ aigc_dialog: AIGCDialog }>> => {
  console.log('=== createAIGCDialog called ===', data);

  return await apiRequest('/api/v1/aigc/create_aigc_dialog', 'POST', 'create_aigc_dialog', data);
};

/**
 * 获取对话视频详情
 */
export const getAIGCDialog = async (id: string): Promise<ApiResponse<{ aigc_dialog: AIGCDialog }>> => {
  console.log('=== getAIGCDialog called ===', id);

  return await apiRequest('/api/v1/aigc/get_aigc_dialog', 'POST', 'get_aigc_dialog', { id });
};

/**
 * 操作对话视频 - 生成远景图
 * 对应 OperateAIGCDialogReq 接口
 * 5: optional string ai_far_img_prompt, //gen_ai_far_img必传
 */
export const operateAIGCDialogGenFarImg = async (data: {
  id: string;
  ai_far_img_prompt: string; // gen_ai_far_img必传
}): Promise<ApiResponse<{ aigc_dialog: AIGCDialog }>> => {
  console.log('=== operateAIGCDialogGenFarImg called ===', data);

  // 严格按照IDL定义的OperateAIGCDialogReq结构
  const requestPayload: Partial<OperateAIGCDialogReq> = {
    id: data.id,
    operation: AIGCDialogOperation.gen_ai_far_img,
    ai_far_img_prompt: data.ai_far_img_prompt,
    // 显式设置其他可选字段为undefined（确保不传递）
    series_name: undefined,
    title: undefined,
    detail_a: undefined,
    detail_b: undefined,
    final_video_url: undefined,
    ai_near_img_prompt_a: undefined,
    character_desc_a: undefined,
    ai_near_img_prompt_b: undefined,
    character_desc_b: undefined
  };

  // 清理undefined字段
  const cleanPayload = Object.fromEntries(
    Object.entries(requestPayload).filter(([_, value]) => value !== undefined)
  );

  console.log('=== Request payload ===', cleanPayload);
  console.log('=== Operation value ===', AIGCDialogOperation.gen_ai_far_img);

  return await apiRequest('/api/v1/aigc/operate_aigc_dialog', 'POST', 'operate_aigc_dialog', cleanPayload);
};

/**
 * 操作对话视频 - 生成角色A近景图
 * 对应 OperateAIGCDialogReq 接口
 * 根据IDL定义，gen_ai_near_img_a 操作需要额外的负载参数
 */
export const operateAIGCDialogGenNearImgA = async (data: {
  id: string;
}): Promise<ApiResponse<{ aigc_dialog: AIGCDialog }>> => {
  console.log('=== operateAIGCDialogGenNearImgA called ===', data);
  console.log('=== Request payload ===', {
    id: data.id,
    operation: AIGCDialogOperation.gen_ai_near_img_a
  });

  return await apiRequest('/api/v1/aigc/operate_aigc_dialog', 'POST', 'operate_aigc_dialog', {
    id: data.id,
    operation: AIGCDialogOperation.gen_ai_near_img_a
  });
};

/**
 * 操作对话视频 - 生成角色B近景图
 * 对应 OperateAIGCDialogReq 接口
 * 根据IDL定义，gen_ai_near_img_b 操作需要额外的负载参数
 */
export const operateAIGCDialogGenNearImgB = async (data: {
  id: string;
}): Promise<ApiResponse<{ aigc_dialog: AIGCDialog }>> => {
  console.log('=== operateAIGCDialogGenNearImgB called ===', data);
  console.log('=== Request payload ===', {
    id: data.id,
    operation: AIGCDialogOperation.gen_ai_near_img_b
  });

  return await apiRequest('/api/v1/aigc/operate_aigc_dialog', 'POST', 'operate_aigc_dialog', {
    id: data.id,
    operation: AIGCDialogOperation.gen_ai_near_img_b
  });
};

/**
 * 操作对话视频 - 生成对话视频
 * 对应 OperateAIGCDialogReq 接口
 * 注意：参数中的 detail_a 是文档中的拼写，保留原样
 */
export const operateAIGCDialogGenVideo = async (data: {
  id: string;
  detail_a: AIGCDialogDetail; // 注意这里是 detail_a 而不是 detail_a (文档中的拼写)
  detail_b: AIGCDialogDetail;
}): Promise<ApiResponse<{ aigc_dialog: AIGCDialog }>> => {
  console.log('=== operateAIGCDialogGenVideo called ===', data);

  return await apiRequest('/api/v1/aigc/operate_aigc_dialog', 'POST', 'operate_aigc_dialog', {
    id: data.id,
    operation: AIGCDialogOperation.gen_ai_dialog_video,
    detail_a: data.detail_a, // 与接口文档保持一致
    detail_b: data.detail_b
  });
};

/**
 * 操作对话视频 - 提交最终视频
 * 对应 OperateAIGCDialogReq 接口
 * 3: optional string series_name, //submit_final_video必传
 * 4: optional string title, //submit_final_video必传
 * 8: optional string final_video_url, //submit_final_video必传
 */
export const operateAIGCDialogSubmitFinal = async (data: {
  id: string;
  series_name: string; // submit_final_video必传
  title: string; // submit_final_video必传
  final_video_url: string; // submit_final_video必传
}): Promise<ApiResponse<{ aigc_dialog: AIGCDialog }>> => {
  console.log('=== operateAIGCDialogSubmitFinal called ===', data);

  return await apiRequest('/api/v1/aigc/operate_aigc_dialog', 'POST', 'operate_aigc_dialog', {
    id: data.id,
    operation: AIGCDialogOperation.submit_final_video,
    series_name: data.series_name,
    title: data.title,
    final_video_url: data.final_video_url
  });
};

/**
 * 试听对话音频
 * 对应 TryAudioReq 接口
 * 1: required string content,
 * 2: required string audio_type,
 * 3: required double audio_ratio,
 */
export const tryAIGCDialogAudio = async (data: {
  content: string; // 必填
  audio_type: string; // 必填
  audio_ratio: number; // 必填，浮点数类型
}): Promise<ApiResponse<{ audio_url: string }>> => {
  console.log('=== tryAIGCDialogAudio called ===', data);

  // 使用测试域名
  const response = await axios({
    method: 'POST',
    url: `https://testapi.lingotok.ai/api/v1/aigc/try_audio`,
    headers: generateAuthHeaders('try_audio'),
    data: data
  });
  return response.data;
};

// ========================== 视频展示API ==========================

/**
 * 获取最终视频列表
 */
export const getAIGCFinalVideoList = async (params: {
  offset: number;
  limit: number;
  aigc_type: AIGCType;
}): Promise<ApiResponse<{
  aigc_word_list: AIGCWord[];
  aigc_dialog_list: AIGCDialog[];
  total: number;
}>> => {
  console.log('=== getAIGCFinalVideoList called ===', params);

  return await apiRequest('/api/v1/aigc/get_aigc_final_video_list', 'POST', 'get_aigc_final_video_list', params);
};

// ========================== 火山引擎服务API ==========================

/**
 * 文生图服务 - 使用doubao-seedream-3-0-t2i-250415模型
 */
export const generateImageFromText = async (data: {
  prompt: string;
  size?: string;
  watermark?: boolean;
}): Promise<ApiResponse<{ image_url: string; tos_key: string }>> => {
  console.log('=== generateImageFromText called ===', data);
  return await apiRequest('/api/v1/huoshan/text-to-image', 'POST', 'huoshan_text_to_image', {
    model: 'doubao-seedream-3-0-t2i-250415',
    size: data.size || '720x1280',
    watermark: data.watermark !== undefined ? data.watermark : false,
    prompt: data.prompt
  });
};

/**
 * 图生图服务 - 使用doubao-seededit-3-0-i2i-250628模型
 */
export const generateImageFromImage = async (data: {
  prompt: string;
  image_url: string;
  watermark?: boolean;
}): Promise<ApiResponse<{ image_url: string; tos_key: string }>> => {
  console.log('=== generateImageFromImage called ===', data);
  return await apiRequest('/api/v1/huoshan/image-to-image', 'POST', 'huoshan_image_to_image', {
    model: 'doubao-seededit-3-0-i2i-250628',
    prompt: data.prompt,
    image: data.image_url,
    watermark: data.watermark !== undefined ? data.watermark : false
  });
};

/**
 * 图生视频服务 - 使用doubao-seedance-1-0-pro-250528模型（异步）
 */
export const generateVideoFromImage = async (data: {
  prompt: string;
  image_url: string;
}): Promise<ApiResponse<{ task_id: string }>> => {
  return await apiRequest('/api/v1/huoshan/image-to-video', 'POST', 'huoshan_image_to_video', {
    model: 'doubao-seedance-1-0-pro-250528',
    ...data
  });
};

/**
 * 获取图生视频任务结果
 */
export const getVideoGenerationTask = async (task_id: string): Promise<ApiResponse<{
  status: string;
  video_url?: string;
}>> => {
  return await apiRequest('/api/v1/huoshan/video-task/get', 'GET', 'huoshan_video_task_get', null, { task_id });
};

/**
 * 对口型服务（异步）
 */
export const generateVideoWithLipSync = async (data: {
  image_url: string;
  audio_url: string;
}): Promise<ApiResponse<{ task_id: string }>> => {
  return await apiRequest('/api/v1/huoshan/lip-sync', 'POST', 'huoshan_lip_sync', data);
};

/**
 * 获取对口型任务结果
 */
export const getLipSyncTask = (task_id: string): Promise<ApiResponse<{
  status: string;
  video_url?: string;
}>> => {
  return apiRequest('/api/v1/huoshan/lip-sync-task/get', 'GET', 'huoshan_lip_sync_task_get', null, { task_id });
};

/**
 * TTS服务（同步）
 */
export const generateTTS = (data: {
  text: string;
  audio_type?: string;
  audio_ratio?: number;
}): Promise<ApiResponse<{ audio_url: string; tos_key: string }>> => {
  return apiRequest('/api/v1/huoshan/tts', 'POST', 'huoshan_tts', {
    voice_type: 'BV001_streaming',
    encoding: 'mp3',
    speed_ratio: 1.0,
    volume_ratio: 1.0,
    pitch_ratio: 1.0,
    ...data
  });
};

/**
 * 字幕生成服务（异步）
 */
export const generateSubtitles = (data: {
  video_url: string;
  language?: string;
  words_per_line?: number;
}): Promise<ApiResponse<{ task_id: string }>> => {
  return apiRequest('/api/v1/huoshan/subtitle/generate', 'POST', 'huoshan_subtitle_generate', {
    language: 'zh-CN',
    words_per_line: 15,
    ...data
  });
};

/**
 * 获取字幕生成任务结果
 */
export const getSubtitleTask = (task_id: string): Promise<ApiResponse<{
  status: string;
  utterances?: Array<{
    start_time: number;
    end_time: number;
    text: string;
  }>;
}>> => {
  return apiRequest('/api/v1/huoshan/subtitle-task/get', 'GET', 'huoshan_subtitle_task_get', null, { task_id });
};

// ========================== 回调接口 ==========================

/**
 * 单词视频处理回调
 */
export const processAIGCWordCallback = (data: {
  id: string;
  success: boolean;
  final_video_key: string;
}): Promise<ApiResponse<{}>> => {
  return apiRequest('/api/v1/aigc/word/process-callback', 'POST', 'aigc_word_process_callback', data);
};

/**
 * 处理单词视频
 */
export const processAIGCWord = (data: {
  id: string;
  video_url: string;
  audio_url: string;
  zh_text: string;
  pinyin_text: string;
}): Promise<ApiResponse<{}>> => {
  return apiRequest('/api/v1/aigc/word/process', 'POST', 'aigc_word_process', data);
};

// ========================== 工具函数 ==========================

/**
 * 获取状态文本
 */
export const getWordStatusText = (status: AIGCWordStatus): string => {
  const statusMap: Record<AIGCWordStatus, string> = {
    [AIGCWordStatus.img_generating]: '图片生成中',
    [AIGCWordStatus.img_reviewing]: '图片生成完成',
    [AIGCWordStatus.video_generating]: '视频生成中',
    [AIGCWordStatus.video_reviewing]: '视频生成完成',
    [AIGCWordStatus.video_processing]: '最终处理中',
    [AIGCWordStatus.video_process_failed]: '处理失败',
    [AIGCWordStatus.finished]: '全部完成'
  };
  return statusMap[status] || '未知状态';
};

/**
 * 获取对话状态文本
 */
export const getDialogStatusText = (status: AIGCDialogStatus): string => {
  const statusMap = {
    [AIGCDialogStatus.far_img_generating]: '远景图生成中',
    [AIGCDialogStatus.far_img_reviewing]: '远景图审核中',
    [AIGCDialogStatus.near_img_generating]: '近景图生成中',
    [AIGCDialogStatus.near_img_reviewing]: '近景图审核中',
    [AIGCDialogStatus.dialog_generating]: '对话视频生成中',
    [AIGCDialogStatus.dialog_reviewing]: '对话视频审核中',
    [AIGCDialogStatus.video_processing]: '视频处理中',
    [AIGCDialogStatus.video_process_failed]: '视频处理失败',
    [AIGCDialogStatus.finished]: '已完成'
  };
  return statusMap[status] || '未知状态';
};

/**
 * 轮询任务状态
 */
export const pollTaskStatus = async <T>(
  getTaskFn: () => Promise<ApiResponse<T>>,
  checkComplete: (data: T) => boolean,
  interval: number = 2000,
  maxAttempts: number = 30
): Promise<T> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await getTaskFn();
      if (response.code === 0 && checkComplete(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error);
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('任务超时或轮询次数超限');
};

export default {
  // 单词视频相关
  createAIGCWord,
  getAIGCWord,
  operateAIGCWordGenImg,
  operateAIGCWordGenVideo,
  operateAIGCWordGenFinalVideo,

  // 对话视频相关
  createAIGCDialog,
  getAIGCDialog,
  operateAIGCDialogGenFarImg,
  operateAIGCDialogGenNearImgA,
  operateAIGCDialogGenNearImgB,
  operateAIGCDialogGenVideo,
  operateAIGCDialogSubmitFinal,
  tryAIGCDialogAudio,

  // 视频展示
  getAIGCFinalVideoList,

  // 火山引擎服务
  generateImageFromText,
  generateImageFromImage,
  generateVideoFromImage,
  getVideoGenerationTask,
  generateVideoWithLipSync,
  getLipSyncTask,
  generateTTS,
  generateSubtitles,
  getSubtitleTask,

  // 回调处理
  processAIGCWordCallback,
  processAIGCWord,

  // 工具函数
  getWordStatusText,
  getDialogStatusText,
  pollTaskStatus
};