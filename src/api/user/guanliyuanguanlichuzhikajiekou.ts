// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改 PUT /staff/cbcardadmin */
export async function update9(body: API.CbCardAdmin, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbcardadmin', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 保存 POST /staff/cbcardadmin */
export async function save9(body: API.CbCardAdmin, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbcardadmin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除 DELETE /staff/cbcardadmin */
export async function delete18(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete18Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbcardadmin', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** id查询 GET /staff/cbcardadmin/${param0} */
export async function get8(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get8Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbCardAdmin>(`/staff/cbcardadmin/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除 DELETE /staff/cbcardadmin/${param0} */
export async function delete19(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete19Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbcardadmin/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页 GET /staff/cbcardadmin/page */
export async function page8(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page8Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbCardAdmin>('/staff/cbcardadmin/page', {
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
