// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改 PUT /staff/cbimage */
export async function update6(body: API.CbImage, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbimage', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 保存 POST /staff/cbimage */
export async function save6(body: API.CbImage, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbimage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除 DELETE /staff/cbimage */
export async function delete13(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete13Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbimage', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** id查询 GET /staff/cbimage/${param0} */
export async function get6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get6Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbImage>(`/staff/cbimage/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除 DELETE /staff/cbimage/${param0} */
export async function delete14(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete14Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbimage/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页 GET /staff/cbimage/page */
export async function page6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page6Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbImage>('/staff/cbimage/page', {
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
