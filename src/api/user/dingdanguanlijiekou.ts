// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 订单修改 PUT /staff/cborderinfo */
export async function update4(body: API.CbOrderInfo, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cborderinfo', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 订单保存 POST /staff/cborderinfo */
export async function save4(body: API.CbOrderInfo, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cborderinfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 订单id批量删除 DELETE /staff/cborderinfo */
export async function delete9(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete9Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cborderinfo', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 订单id查询 GET /staff/cborderinfo/${param0} */
export async function get4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get4Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbOrderInfo>(`/staff/cborderinfo/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 订单id删除 DELETE /staff/cborderinfo/${param0} */
export async function delete10(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete10Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cborderinfo/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 订单分页接口 GET /staff/cborderinfo/page */
export async function page4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page4Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbOrderInfo>('/staff/cborderinfo/page', {
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
