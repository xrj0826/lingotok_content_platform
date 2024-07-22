// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改练习 PUT /manager/learn/exercises */
export async function update7(body: API.Exercises, options?: { [key: string]: any }) {
  return request<API.ResultMessageBoolean>('/manager/learn/exercises', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传练习 POST /manager/learn/exercises */
export async function save8(body: API.Exercises, options?: { [key: string]: any }) {
  return request<API.ResultMessageString>('/manager/learn/exercises', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除练习 DELETE /manager/learn/exercises */
export async function deleteBatch(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteBatchParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageBoolean>('/manager/learn/exercises', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 练习详情 GET /manager/learn/exercises/${param0} */
export async function get8(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get8Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageExercisesVO>(`/manager/learn/exercises/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除练习 DELETE /manager/learn/exercises/${param0} */
export async function delete6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete6Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/manager/learn/exercises/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 音频文件切割 PUT /manager/learn/exercises/cutAudio/${param0} */
export async function cutAudio(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cutAudioParams,
  options?: { [key: string]: any },
) {
  const { exerciseId: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/learn/exercises/cutAudio/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 视频文件切割 PUT /manager/learn/exercises/cutVideo/${param0} */
export async function cutVideo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cutVideoParams,
  options?: { [key: string]: any },
) {
  const { exerciseId: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/learn/exercises/cutVideo/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 批量删除句子资源 DELETE /manager/learn/exercises/deleteSentenceResource */
export async function deleteSentenceResource(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteSentenceResourceParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageBoolean>('/manager/learn/exercises/deleteSentenceResource', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 视频文件剪切进度查询 PUT /manager/learn/exercises/getProgress */
export async function getProgress(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getProgressParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageString>('/manager/learn/exercises/getProgress', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 音频文件合并拼接 PUT /manager/learn/exercises/mergeAudio */
export async function mergeAudio(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.mergeAudioParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/learn/exercises/mergeAudio', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 句子拼接 PUT /manager/learn/exercises/mergeSentence */
export async function mergeSentence(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.mergeSentenceParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/learn/exercises/mergeSentence', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 视频文件合并拼接 PUT /manager/learn/exercises/mergeVideo */
export async function mergeVideo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.mergeVideoParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/learn/exercises/mergeVideo', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 自动分句 PUT /manager/learn/exercises/splitContent/${param0} */
export async function autoSplitContent(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.autoSplitContentParams,
  options?: { [key: string]: any },
) {
  const { exerciseId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/manager/learn/exercises/splitContent/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 修改句子资源内容 PUT /manager/learn/exercises/updateSentenceResource */
export async function updateSentenceResource(
  body: API.SentenceResource,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageBoolean>('/manager/learn/exercises/updateSentenceResource', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 腾讯云音频识别 PUT /manager/learn/exercises/voice/${param0} */
export async function voiceASR(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.voiceASRParams,
  options?: { [key: string]: any },
) {
  const { exerciseId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/manager/learn/exercises/voice/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}
