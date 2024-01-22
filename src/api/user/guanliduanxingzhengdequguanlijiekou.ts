// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 增加地区 POST /manager/setting/region */
export async function save2(body: API.Region, options?: { [key: string]: any }) {
  return request<API.ResultMessageRegion>('/manager/setting/region', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 通过id获取地区详情 GET /manager/setting/region/${param0} */
export async function get(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageRegion>(`/manager/setting/region/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新地区 PUT /manager/setting/region/${param0} */
export async function update(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateParams,
  body: API.Region,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageRegion>(`/manager/setting/region/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 批量通过id删除 DELETE /manager/setting/region/${param0} */
export async function delAllByIds(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delAllByIdsParams,
  options?: { [key: string]: any },
) {
  const { ids: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/setting/region/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 通过id获取子地区 GET /manager/setting/region/item/${param0} */
export async function getItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getItemParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageListRegion>(`/manager/setting/region/item/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 同步高德行政地区数据 POST /manager/setting/region/sync */
export async function synchronizationData(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.synchronizationDataParams,
  options?: { [key: string]: any },
) {
  return request<any>('/manager/setting/region/sync', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
