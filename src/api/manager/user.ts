// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 处理异常用户 PUT /v1/user/handlerErrorUser */
export async function handlerUser1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handlerUser1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageBoolean>('/v1/user/handlerErrorUser', {
    method: 'PUT',
    params: {
      ...params,
      errorUser: undefined,
      ...params['errorUser'],
    },
    ...(options || {}),
  });
}

/** 处理(封禁/解封)用户 PUT /v1/user/handlerUser/${param0} */
export async function handlerUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handlerUserParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageIPageUser>(`/v1/user/handlerUser/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 异常用户分页 GET /v1/user/userErrorPage */
export async function userErrorPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.userErrorPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageErrorUser>('/v1/user/userErrorPage', {
    method: 'GET',
    params: {
      ...params,
      errorUser: undefined,
      ...params['errorUser'],
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}

/** 用户分页 GET /v1/user/userPage */
export async function userPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.userPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUser>('/v1/user/userPage', {
    method: 'GET',
    params: {
      ...params,
      user: undefined,
      ...params['user'],
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}
