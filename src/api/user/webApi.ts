// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 资源文件上传 POST /manager/web/file */
export async function upload1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.upload1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageBoolean>('/manager/web/file', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** minio分片资源上传 POST /manager/web/minioFile */
export async function completeMultipartUpload(
  body: API.CompleteMultipartUploadRequest,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageBoolean>('/manager/web/minioFile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 腾讯云音频识别请求 POST /manager/web/voice */
export async function CreateRecTask(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.CreateRecTaskParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageCreateRecTaskResponse>('/manager/web/voice', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 腾讯云音频识别结果 POST /manager/web/voiceResult/${param0} */
export async function voiceResult(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.voiceResultParams,
  options?: { [key: string]: any },
) {
  const { taskId: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/web/voiceResult/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
