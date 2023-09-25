// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 公告修改 PUT /staff/cbnotice */
export async function update4(body: API.CbNotice, options?: { [key: string]: any }) {
  return request<API.ResultMessageCbNotice>('/staff/cbnotice', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 公告保存 POST /staff/cbnotice */
export async function save4(body: API.CbNotice, options?: { [key: string]: any }) {
  return request<API.ResultMessageCbNotice>('/staff/cbnotice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据公告id批量删除 DELETE /staff/cbnotice */
export async function delete8(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete8Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/staff/cbnotice', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 公告id查询 GET /staff/cbnotice/${param0} */
export async function get4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get4Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbNotice>(`/staff/cbnotice/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据公告id删除 DELETE /staff/cbnotice/${param0} */
export async function delete9(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete9Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/staff/cbnotice/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 小程序分页查询 GET /staff/cbnotice/page */
export async function page4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page4Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbNotice>('/staff/cbnotice/page', {
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
