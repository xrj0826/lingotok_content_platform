// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 优惠券修改 PUT /staff/cbcoupon */
export async function update7(body: API.CbCoupon, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbcoupon', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 新增优惠券 POST /staff/cbcoupon */
export async function save7(body: API.CbCoupon, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbcoupon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 优惠券id批量删除 DELETE /staff/cbcoupon */
export async function delete15(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete15Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbcoupon', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 优惠券id查询 GET /staff/cbcoupon/${param0} */
export async function get7(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get7Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbCoupon>(`/staff/cbcoupon/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 优惠券删除 DELETE /staff/cbcoupon/${param0} */
export async function delete16(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete16Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbcoupon/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 优惠券分页查询 GET /staff/cbcoupon/page */
export async function page7(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page7Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbCoupon>('/staff/cbcoupon/page', {
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
