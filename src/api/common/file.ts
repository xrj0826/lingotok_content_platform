// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireCommon';

/** 修改文件 PUT /v1/common/file */
export async function updateFile(body: API.File, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/common/file', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 信息 GET /v1/common/file/get/${param0} */
export async function getFileDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFileDetailParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/common/file/get/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取文件 GET /v1/common/file/page */
export async function getFileList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFileListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageFile>('/v1/common/file/page', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      searchVo: undefined,
      ...params['searchVo'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 上传保存文件 POST /v1/common/file/uploadContent */
export async function uploadContent(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadContentParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageFile>('/v1/common/file/uploadContent', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
