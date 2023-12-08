// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 此处后端没有提供注释 POST /v1/oss/batch/upload/${param0} */
export async function upload1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.upload1Params,
  options?: { [key: string]: any },
) {
  const { moudle: param0, ...queryParams } = params;
  return request<API.ResultMessageListString>(`/v1/oss/batch/upload/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /v1/oss/del */
export async function deleteUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<string>('/v1/oss/del', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/oss/upload/${param0} */
export async function upload(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadParams,
  body: {},
  options?: { [key: string]: any },
) {
  const { moudle: param0, ...queryParams } = params;
  return request<string>(`/v1/oss/upload/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
