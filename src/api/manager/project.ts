// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 我接入的任务分页 GET /v1/project/accessProjectPage */
export async function accessProjectPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.accessProjectPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageProjectVO>('/v1/project/accessProjectPage', {
    method: 'GET',
    params: {
      ...params,
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}

/** 待审核任务分页 GET /v1/project/approveProjectPage */
export async function approveProjectPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.approveProjectPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageProjectVO>('/v1/project/approveProjectPage', {
    method: 'GET',
    params: {
      ...params,
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}

/** 处理任务 POST /v1/project/handle/${param0} */
export async function handle(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handleParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/project/handle/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
      approvalRecord: undefined,
      ...queryParams['approvalRecord'],
    },
    ...(options || {}),
  });
}

/** 任务分页 GET /v1/project/ProjectPage */
export async function projectPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.projectPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageProjectVO>('/v1/project/ProjectPage', {
    method: 'GET',
    params: {
      ...params,
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}
