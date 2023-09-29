// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 此处后端没有提供注释 DELETE /staff/cbupload/delete */
export async function delete4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete4Params,
  options?: { [key: string]: any },
) {
  return request<any>('/staff/cbupload/delete', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /staff/cbupload/download */
export async function download(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.downloadParams,
  options?: { [key: string]: any },
) {
  return request<any>('/staff/cbupload/download', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 文件上传接口 POST /staff/cbupload/upload */
export async function upload(body: {}, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbupload/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
