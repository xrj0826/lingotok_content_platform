// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 职业者获取任务详情 GET /v1/project/employee/${param0} */
export async function getEmployeeProjectDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeProjectDetailParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageProjectVO>(`/v1/project/employee/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 提交验收 POST /v1/project/employee/acceptance/${param0} */
export async function employeeAttachments(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.employeeAttachmentsParams,
  body: API.Answer,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageProjectVO>(`/v1/project/employee/acceptance/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 回复合作意向详情 POST /v1/project/employee/feedback/${param0} */
export async function employeeFeedback(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.employeeFeedbackParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/project/employee/feedback/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 生成合同 GET /v1/project/employee/generateContract/${param0} */
export async function generateContract(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.generateContractParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageString>(`/v1/project/employee/generateContract/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取雇主信息 GET /v1/project/employee/getEmployer */
export async function getProjectEmployerDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getProjectEmployerDetailParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageEmployerVO>('/v1/project/employee/getEmployer', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 我的任务列表查询 GET /v1/project/employee/myProject */
export async function getEmployeeProjectList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeProjectListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageProjectVO>('/v1/project/employee/myProject', {
    method: 'GET',
    params: {
      ...params,
      searchDTO: undefined,
      ...params['searchDTO'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}
