// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 爬虫更新词库 GET /manager/web */
export async function update9(options?: { [key: string]: any }) {
  return request<API.ResultMessageBoolean>('/manager/web', {
    method: 'GET',
    ...(options || {}),
  });
}

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
