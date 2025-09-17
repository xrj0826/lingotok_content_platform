/**
 * 批量更新AIGC视频生成API的认证方式脚本
 * 将所有API从Bearer token认证改为Timestamp+Signature认证
 */

// 需要更新的API函数列表
const apiUpdates = [
  // 单词视频相关
  { function: 'operateAIGCWordGenImg', apiName: 'aigc_word_operate' },
  { function: 'operateAIGCWordGenVideo', apiName: 'aigc_word_operate' },
  { function: 'operateAIGCWordGenFinalVideo', apiName: 'aigc_word_operate' },
  
  // 对话视频相关
  { function: 'createAIGCDialog', apiName: 'aigc_dialog_create' },
  { function: 'getAIGCDialog', apiName: 'aigc_dialog_get' },
  { function: 'operateAIGCDialogGenFarImg', apiName: 'aigc_dialog_operate' },
  { function: 'operateAIGCDialogGenNearImgA', apiName: 'aigc_dialog_operate' },
  { function: 'operateAIGCDialogGenNearImgB', apiName: 'aigc_dialog_operate' },
  { function: 'operateAIGCDialogGenVideo', apiName: 'aigc_dialog_operate' },
  { function: 'tryAIGCDialogAudio', apiName: 'aigc_dialog_try_audio' },
  
  // 火山引擎服务
  { function: 'generateImageFromText', apiName: 'huoshan_text_to_image' },
  { function: 'generateImageFromImage', apiName: 'huoshan_image_to_image' },
  { function: 'generateVideoFromImage', apiName: 'huoshan_image_to_video' },
  { function: 'generateTTS', apiName: 'huoshan_tts' },
  { function: 'generateSubtitles', apiName: 'huoshan_subtitle_generate' },
  
  // 其他服务
  { function: 'getAIGCFinalVideoList', apiName: 'aigc_final_video_list' },
];

console.log('需要更新的API函数:', apiUpdates);
console.log('请手动将这些函数的headers更新为使用generatePostAuthHeaders()或generateAuthHeaders()');

// 示例更新模板
console.log(`
更新模板:

// GET请求
export const functionName = (params) => {
  return request('/api/path', {
    method: 'GET',
    headers: generateAuthHeaders('api_name'),
    params,
  });
};

// POST请求
export const functionName = (data) => {
  return request('/api/path', {
    method: 'POST', 
    headers: generatePostAuthHeaders('api_name'),
    data,
  });
};
`);








































































