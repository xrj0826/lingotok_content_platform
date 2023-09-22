// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 场地修改 PUT /staff/cbvenue */
export async function update(body: API.CbVenue, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbvenue', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 场地保存 POST /staff/cbvenue */
export async function save(body: API.CbVenue, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbvenue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 场地根据id批量删除 DELETE /staff/cbvenue */
export async function deleteUsingDELETE(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbvenue', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 场地id查询 GET /staff/cbvenue/${param0} */
export async function get(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbVenue>(`/staff/cbvenue/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 场地根据id删除 DELETE /staff/cbvenue/${param0} */
export async function delete1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbvenue/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 场地分页查询 GET /staff/cbvenue/page */
export async function page(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.pageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbVenue>('/staff/cbvenue/page', {
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
