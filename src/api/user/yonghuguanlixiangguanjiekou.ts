// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 用户修改 PUT /staff/cbuser */
export async function update1(body: API.CbUser, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbuser', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 新增用户 POST /staff/cbuser */
export async function save1(body: API.CbUser, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbuser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据id批量删除用户 DELETE /staff/cbuser */
export async function delete2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete2Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbuser', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 用户id查询 GET /staff/cbuser/${param0} */
export async function get1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbUser>(`/staff/cbuser/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据id删除用户 DELETE /staff/cbuser/${param0} */
export async function delete3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbuser/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 用户分页查询分页 GET /staff/cbuser/page */
export async function page1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbUser>('/staff/cbuser/page', {
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
