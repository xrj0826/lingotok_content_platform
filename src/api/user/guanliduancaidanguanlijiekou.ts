// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 搜索菜单 GET /manager/permission/menu */
export async function searchPermissionList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.searchPermissionListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageListMenu>('/manager/permission/menu', {
    method: 'GET',
    params: {
      ...params,
      searchParams: undefined,
      ...params['searchParams'],
    },
    ...(options || {}),
  });
}

/** 添加 POST /manager/permission/menu */
export async function add1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.add1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageMenu>('/manager/permission/menu', {
    method: 'POST',
    params: {
      ...params,
      menu: undefined,
      ...params['menu'],
    },
    ...(options || {}),
  });
}

/** 编辑 PUT /manager/permission/menu/${param0} */
export async function edit1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.edit1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageMenu>(`/manager/permission/menu/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
      menu: undefined,
      ...queryParams['menu'],
    },
    ...(options || {}),
  });
}

/** 批量删除 DELETE /manager/permission/menu/${param0} */
export async function delByIds1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delByIds1Params,
  options?: { [key: string]: any },
) {
  const { ids: param0, ...queryParams } = params;
  return request<API.ResultMessageMenu>(`/manager/permission/menu/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有菜单--根据当前用户角色 GET /manager/permission/menu/memberMenu */
export async function memberMenu(options?: { [key: string]: any }) {
  return request<API.ResultMessageListMenuVO>('/manager/permission/menu/memberMenu', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有菜单 GET /manager/permission/menu/tree */
export async function getAllMenuList(options?: { [key: string]: any }) {
  return request<API.ResultMessageListMenuVO>('/manager/permission/menu/tree', {
    method: 'GET',
    ...(options || {}),
  });
}
