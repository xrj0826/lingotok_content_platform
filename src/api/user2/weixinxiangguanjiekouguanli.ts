// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 用户修改 PUT /v1/wx/user */
export async function update(body: API.User, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/wx/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /v1/wx/user/currentUser */
export async function getUserInfo(options?: { [key: string]: any }) {
  return request<API.ResultMessageUser>('/v1/wx/user/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/wx/user/login */
export async function login(body: API.WechatMPLoginParams, options?: { [key: string]: any }) {
  return request<API.ResultMessageMapStringObject>('/v1/wx/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /v1/wx/user/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/v1/wx/user/logout', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/wx/user/phone */
export async function phone(body: API.WechatMPLoginParams, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/wx/user/phone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/wx/user/phone2 */
export async function phone1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.phone1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/v1/wx/user/phone2', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /v1/wx/user/queryUserById/${param0} */
export async function queryUserById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryUserByIdParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageUser>(`/v1/wx/user/queryUserById/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 刷新token GET /v1/wx/user/refresh/${param0} */
export async function refreshToken(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.refreshTokenParams,
  options?: { [key: string]: any },
) {
  const { refreshToken: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/v1/wx/user/refresh/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/wx/user/updateAvatar */
export async function updateAvatar(body: API.User, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/wx/user/updateAvatar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/wx/user/updateUsername */
export async function updateUsername(body: API.User, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/wx/user/updateUsername', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
