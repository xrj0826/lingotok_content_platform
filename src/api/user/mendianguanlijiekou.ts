// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 门店修改 PUT /staff/cbstore */
export async function update2(body: API.CbStore, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbstore', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 门店保存 POST /staff/cbstore */
export async function save2(body: API.CbStore, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbstore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据id批量删除门店 DELETE /staff/cbstore */
export async function delete4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete4Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbstore', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据门店id查询 GET /staff/cbstore/${param0} */
export async function get2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get2Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbStore>(`/staff/cbstore/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据id删除门店 DELETE /staff/cbstore/${param0} */
export async function delete5(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete5Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbstore/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页查询接口 GET /staff/cbstore/page */
export async function page2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page2Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbStore>('/staff/cbstore/page', {
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
