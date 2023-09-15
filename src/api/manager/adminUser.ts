// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 多条件分页获取管理员列表 GET /v1/passport/adminUser */
export async function getByCondition(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByConditionParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageAdminUserVO>('/v1/passport/adminUser', {
    method: 'GET',
    params: {
      ...params,
      user: undefined,
      ...params['user'],
      pageVo: undefined,
      ...params['pageVo'],
    },
    ...(options || {}),
  });
}

/** 添加管理员 POST /v1/passport/adminUser */
export async function register(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.registerParams,
  body: API.AdminUserDTO,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/v1/passport/adminUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量通过ids删除管理员 DELETE /v1/passport/adminUser/${param0} */
export async function delAllByIds(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delAllByIdsParams,
  options?: { [key: string]: any },
) {
  const { ids: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/v1/passport/adminUser/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 超级管理员修改其他管理员资料 PUT /v1/passport/adminUser/admin/edit */
export async function edit(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.editParams,
  body: API.AdminUser,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/v1/passport/adminUser/admin/edit', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改管理员自己资料 用户名密码不会修改 PUT /v1/passport/adminUser/edit */
export async function editOwner(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.editOwnerParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/v1/passport/adminUser/edit', {
    method: 'PUT',
    params: {
      ...params,
      adminUser: undefined,
      ...params['adminUser'],
    },
    ...(options || {}),
  });
}

/** 修改管理员密码 PUT /v1/passport/adminUser/editPassword */
export async function editPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.editPasswordParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/v1/passport/adminUser/editPassword', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 禁用/启用 管理员 PUT /v1/passport/adminUser/enable/${param0} */
export async function disable(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.disableParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/v1/passport/adminUser/enable/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 获取当前登录用户接口 GET /v1/passport/adminUser/info */
export async function getUserInfo(options?: { [key: string]: any }) {
  return request<API.ResultMessageAdminUser>('/v1/passport/adminUser/info', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 登录管理员 POST /v1/passport/adminUser/login */
export async function login(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.loginParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageToken>('/v1/passport/adminUser/login', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 重置密码 POST /v1/passport/adminUser/resetPassword/${param0} */
export async function resetPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.resetPasswordParams,
  options?: { [key: string]: any },
) {
  const { ids: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/v1/passport/adminUser/resetPassword/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 修改登录密码 PUT /v1/passport/adminUser/updatePassword */
export async function modifyPass(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.modifyPassParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageAdminUser>('/v1/passport/adminUser/updatePassword', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
