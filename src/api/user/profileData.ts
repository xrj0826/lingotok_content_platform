// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 个人简介查询接口 GET /v1/profileData */
export async function getSelf(options?: { [key: string]: any }) {
  return request<API.ResultMessageProfileData>('/v1/profileData', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 保存并提交审核简介 PUT /v1/profileData */
export async function saveProfileData(body: API.ProfileData, options?: { [key: string]: any }) {
  return request<API.ResultMessageProfileData>('/v1/profileData', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户简介详情 GET /v1/profileData/${param0} */
export async function getByUserId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByUserIdParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageProfileData>(`/v1/profileData/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除简介相关内容 PUT /v1/profileData/delete/${param0} */
export async function deleteProfileData(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteProfileDataParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageProfileData>(`/v1/profileData/delete/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
      jsonb: undefined,
      ...queryParams['jsonb'],
    },
    ...(options || {}),
  });
}
