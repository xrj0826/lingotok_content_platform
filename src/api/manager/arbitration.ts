// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 仲裁ID查询 GET /v1/arbitration/${param0} */
export async function get(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageArbitration>(`/v1/arbitration/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 处理仲裁 PUT /v1/arbitration/handle/${param0} */
export async function handleArbitration(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handleArbitrationParams,
  options?: { [key: string]: any },
) {
  const { arbitrationId: param0, ...queryParams } = params;
  return request<API.ResultMessageArbitration>(`/v1/arbitration/handle/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
      result: undefined,
      ...queryParams['result'],
    },
    ...(options || {}),
  });
}

/** 获取仲裁分页 GET /v1/arbitration/page */
export async function page(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.pageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageArbitration>('/v1/arbitration/page', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 预处理 PUT /v1/arbitration/prHandle/${param0} */
export async function preHandle(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.preHandleParams,
  options?: { [key: string]: any },
) {
  const { arbitrationId: param0, ...queryParams } = params;
  return request<API.ResultMessageArbitrationResult>(`/v1/arbitration/prHandle/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}
