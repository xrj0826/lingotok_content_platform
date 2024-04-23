// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 文件上传 POST /manager/upload/file */
export async function upload2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.upload2Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageFile>('/manager/upload/file', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** oss获取url GET /manager/upload/getOssUrl */
export async function getOssUrl(options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/manager/upload/getOssUrl', {
    method: 'GET',
    ...(options || {}),
  });
}

/** oss获取StsToken GET /manager/upload/getStsToken/ */
export async function getStsToken(options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/manager/upload/getStsToken/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** minio合并分片 POST /manager/upload/multipart/complete */
export async function completeMultipartUpload1(
  body: API.CompleteMultipartUploadRequest,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageFileUploadResponse>('/manager/upload/multipart/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** minio创建分片上传 POST /manager/upload/multipart/create */
export async function createMultipartUpload(
  body: API.MultipartUploadCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageMultipartUploadCreateResponse>(
    '/manager/upload/multipart/create',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 修改一级目录 PUT /manager/upload/updateBookMenu */
export async function updateBookMenu(body: API.BookMenu, options?: { [key: string]: any }) {
  return request<API.ResultMessageBoolean>('/manager/upload/updateBookMenu', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
