// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 批量删除 DELETE /backend/passport/user */
export async function delete21(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete21Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/backend/passport/user', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 添加管理员 POST /backend/passport/user/add/adminuser */
export async function save10(body: API.AdminUserAddDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessageAdminUser>('/backend/passport/user/add/adminuser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员修改密码 PUT /backend/passport/user/editPassword */
export async function editPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.editPasswordParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/backend/passport/user/editPassword', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取当前登录用户接口 GET /backend/passport/user/info */
export async function getUserInfo(options?: { [key: string]: any }) {
  return request<API.ResultMessageAdminUser>('/backend/passport/user/info', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 登录管理员 POST /backend/passport/user/login */
export async function login(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.loginParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageToken>('/backend/passport/user/login', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 注销接口 POST /backend/passport/user/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/backend/passport/user/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 管理员分页查询 GET /backend/passport/user/page */
export async function page10(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page10Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageAdminUser>('/backend/passport/user/page', {
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

/** 刷新token GET /backend/passport/user/refresh/${param0} */
export async function refreshToken(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.refreshTokenParams,
  options?: { [key: string]: any },
) {
  const { refreshToken: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/backend/passport/user/refresh/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
