// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 获取树状结构 GET /manager/permission/department */
export async function getByPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageListDepartmentVO>('/manager/permission/department', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      searchVo: undefined,
      ...params['searchVo'],
    },
    ...(options || {}),
  });
}

/** 新增部门 POST /manager/permission/department */
export async function save5(body: API.Department, options?: { [key: string]: any }) {
  return request<API.ResultMessageDepartment>('/manager/permission/department', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查看部门详情 GET /manager/permission/department/${param0} */
export async function get5(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get5Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageDepartment>(`/manager/permission/department/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新部门 PUT /manager/permission/department/${param0} */
export async function update4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.update4Params,
  body: API.Department,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageDepartment>(`/manager/permission/department/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除部门 DELETE /manager/permission/department/${param0} */
export async function delAllByIds1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delAllByIds1Params,
  options?: { [key: string]: any },
) {
  const { ids: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/permission/department/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
