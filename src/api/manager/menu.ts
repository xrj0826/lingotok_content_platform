// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 修改 PUT /v1/permission/menu */
export async function updateMenu(body: API.Menu, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/permission/menu', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 保存 POST /v1/permission/menu */
export async function saveMenu(body: API.Menu, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/permission/menu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除 DELETE /v1/permission/menu */
export async function deleteMenus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteMenusParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/v1/permission/menu', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** id查询 GET /v1/permission/menu/${param0} */
export async function getMenuDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMenuDetailParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageMenu>(`/v1/permission/menu/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除 DELETE /v1/permission/menu/${param0} */
export async function deleteMenu(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteMenuParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/permission/menu/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取所有菜单--根据当前用户角色 GET /v1/permission/menu/memberMenu */
export async function memberMenu(options?: { [key: string]: any }) {
  return request<API.ResultMessageListMenuVO>('/v1/permission/menu/memberMenu', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 分页 GET /v1/permission/menu/page */
export async function getMenuList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMenuListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageMenu>('/v1/permission/menu/page', {
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
