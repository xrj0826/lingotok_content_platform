// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 查询 GET /manager/permission/role */
export async function add2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.add2Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessagePageObject>('/manager/permission/role', {
    method: 'GET',
    params: {
      ...params,
      pageVo: undefined,
      ...params['pageVo'],
      role: undefined,
      ...params['role'],
    },
    ...(options || {}),
  });
}

/** 添加 POST /manager/permission/role */
export async function add(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageRole>('/manager/permission/role', {
    method: 'POST',
    params: {
      ...params,
      role: undefined,
      ...params['role'],
    },
    ...(options || {}),
  });
}

/** 编辑 PUT /manager/permission/role/${param0} */
export async function edit(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.editParams,
  options?: { [key: string]: any },
) {
  const { roleId: param0, ...queryParams } = params;
  return request<API.ResultMessageRole>(`/manager/permission/role/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
      role: undefined,
      ...queryParams['role'],
    },
    ...(options || {}),
  });
}

/** 批量删除 DELETE /manager/permission/role/${param0} */
export async function delByIds(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delByIdsParams,
  options?: { [key: string]: any },
) {
  const { ids: param0, ...queryParams } = params;
  return request<API.ResultMessageRole>(`/manager/permission/role/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
