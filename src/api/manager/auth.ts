// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 获取用户简介详情 GET /v1/auth/${param0} */
export async function getByUserId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByUserIdParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageUserVO>(`/v1/auth/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 雇主分页 GET /v1/auth/employerPage */
export async function employerPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.employerPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUser>('/v1/auth/employerPage', {
    method: 'GET',
    params: {
      ...params,
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}

/** 处理证书 POST /v1/auth/handleCertificate/${param0} */
export async function handleCertificate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handleCertificateParams,
  options?: { [key: string]: any },
) {
  const { profileDataId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/auth/handleCertificate/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
      jsonb: undefined,
      ...queryParams['jsonb'],
    },
    ...(options || {}),
  });
}

/** 处理雇主 POST /v1/auth/handleEmployer/${param0} */
export async function handleEmployer(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handleEmployerParams,
  options?: { [key: string]: any },
) {
  const { employerId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/auth/handleEmployer/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
      approvalRecord: undefined,
      ...queryParams['approvalRecord'],
    },
    ...(options || {}),
  });
}

/** 处理简历 POST /v1/auth/handleProfileData/${param0} */
export async function handleProfileData(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handleProfileDataParams,
  options?: { [key: string]: any },
) {
  const { profileDataId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/auth/handleProfileData/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
      approvalRecord: undefined,
      ...queryParams['approvalRecord'],
    },
    ...(options || {}),
  });
}

/** 简历状态分页 GET /v1/auth/profileDataPage/status */
export async function profileDataPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.profileDataPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUserVO>('/v1/auth/profileDataPage/status', {
    method: 'GET',
    params: {
      ...params,
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}
