// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改 PUT /staff/cbspecialvalue */
export async function update3(body: API.CbSpecialValue, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbspecialvalue', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 保存 POST /staff/cbspecialvalue */
export async function save3(body: API.CbSpecialValue, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbspecialvalue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除 DELETE /staff/cbspecialvalue */
export async function delete7(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete7Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbspecialvalue', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** id查询 GET /staff/cbspecialvalue/${param0} */
export async function get3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbSpecialValue>(`/staff/cbspecialvalue/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除 DELETE /staff/cbspecialvalue/${param0} */
export async function delete8(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete8Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbspecialvalue/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页 GET /staff/cbspecialvalue/page */
export async function page3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page3Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbSpecialValue>('/staff/cbspecialvalue/page', {
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
