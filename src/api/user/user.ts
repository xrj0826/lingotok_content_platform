// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 获取当前登录用户接口 GET /v1/passport/user */
export async function getUserInfo(options?: { [key: string]: any }) {
  return request<API.ResultMessageUser>('/v1/passport/user', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 实名认证 POST /v1/passport/user/authentication */
export async function authentication(body: API.User, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/passport/user/authentication', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 清除手机号 POST /v1/passport/user/clearMobile */
export async function clearMobile(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.clearMobileParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageUser>('/v1/passport/user/clearMobile', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改用户自己资料 PUT /v1/passport/user/editOwn */
export async function editOwn(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.editOwnParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageUser>('/v1/passport/user/editOwn', {
    method: 'PUT',
    params: {
      ...params,
      userEditDTO: undefined,
      ...params['userEditDTO'],
    },
    ...(options || {}),
  });
}

/** 获取微信OAuth2.0 授权登录参数 GET /v1/passport/user/login/getLink */
export async function getLink(options?: { [key: string]: any }) {
  return request<API.ResultMessageString>('/v1/passport/user/login/getLink', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 微信扫码登录 GET /v1/passport/user/login/wechatLogin/${param0} */
export async function wechatLogin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.wechatLoginParams,
  options?: { [key: string]: any },
) {
  const { platform: param0, ...queryParams } = params;
  return request<API.ResultMessageToken>(`/v1/passport/user/login/wechatLogin/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 登出接口 POST /v1/passport/user/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/v1/passport/user/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 刷新token GET /v1/passport/user/refresh/${param0} */
export async function refreshToken(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.refreshTokenParams,
  options?: { [key: string]: any },
) {
  const { refreshToken: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/v1/passport/user/refresh/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 注册用户 POST /v1/passport/user/register */
export async function register(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.registerParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/v1/passport/user/register', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 通过短信重置手机号 POST /v1/passport/user/resetMobile */
export async function resetMobile(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.resetMobileParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageUser>('/v1/passport/user/resetMobile', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 短信登录接口 POST /v1/passport/user/smsLogin */
export async function smsLogin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.smsLoginParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/v1/passport/user/smsLogin', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改登录密码 PUT /v1/passport/user/updatePassword */
export async function modifyPass(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.modifyPassParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageUser>('/v1/passport/user/updatePassword', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 登录接口 POST /v1/passport/user/userLogin */
export async function userLogin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.userLoginParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageToken>('/v1/passport/user/userLogin', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改交易密码 PUT /v1/passport/user/wallet/updatePassword */
export async function modifyWalletPass(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.modifyWalletPassParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageUser>('/v1/passport/user/wallet/updatePassword', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改 PUT /v1/usermanage */
export async function update(body: API.User, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/usermanage', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 保存 POST /v1/usermanage */
export async function save(body: API.User, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/usermanage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** id查询 GET /v1/usermanage/${param0} */
export async function get(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageUserVO>(`/v1/usermanage/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页 GET /v1/usermanage/page */
export async function pageUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.pageUserParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUser>('/v1/usermanage/page', {
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
