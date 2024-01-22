// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改读物 PUT /manager/learn/readingMaterials */
export async function update6(body: API.ReadingMaterials, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/learn/readingMaterials', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传读物 POST /manager/learn/readingMaterials */
export async function save7(body: API.ReadingMaterials, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/learn/readingMaterials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除读物 DELETE /manager/learn/readingMaterials */
export async function delete4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete4Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/manager/learn/readingMaterials', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 读物详情 GET /manager/learn/readingMaterials/${param0} */
export async function get7(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get7Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageReadingMaterials>(`/manager/learn/readingMaterials/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除读物 DELETE /manager/learn/readingMaterials/${param0} */
export async function delete5(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete5Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/manager/learn/readingMaterials/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 读物列表 GET /manager/learn/readingMaterials/page */
export async function page(options?: { [key: string]: any }) {
  return request<API.ResultMessageListReadingMaterials>('/manager/learn/readingMaterials/page', {
    method: 'GET',
    ...(options || {}),
  });
}
