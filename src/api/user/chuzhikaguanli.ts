// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 储值卡修改 PUT /staff/cbcard */
export async function update6(body: API.CbCard, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbcard', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 储值卡保存 POST /staff/cbcard */
export async function save6(body: API.CbCard, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbcard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 储值卡根据id批量删除 DELETE /staff/cbcard */
export async function delete12(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete12Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/staff/cbcard', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 储值卡根据id查询 GET /staff/cbcard/${param0} */
export async function get6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get6Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCbCard>(`/staff/cbcard/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 储值卡根据id删除 DELETE /staff/cbcard/${param0} */
export async function delete13(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete13Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/staff/cbcard/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 储值卡分页查询 GET /staff/cbcard/page */
export async function page6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page6Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageCbCard>('/staff/cbcard/page', {
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
