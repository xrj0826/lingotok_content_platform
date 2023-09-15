// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改任务 PUT /v1/project/employer */
export async function updateEmployerProject(body: API.ProjectVO, options?: { [key: string]: any }) {
  return request<API.ResultMessageProjectVO>('/v1/project/employer', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 发布任务并提交审核 POST /v1/project/employer */
export async function commitEmployerProject(body: API.Project, options?: { [key: string]: any }) {
  return request<API.ResultMessageProjectVO>('/v1/project/employer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 雇主获取任务详情 GET /v1/project/employer/${param0} */
export async function getEmployerProjectDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployerProjectDetailParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageProjectVO>(`/v1/project/employer/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 验收回复 POST /v1/project/employer/acceptance/${param0} */
export async function employerAttachments(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.employerAttachmentsParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/project/employer/acceptance/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
      approvalRecord: undefined,
      ...queryParams['approvalRecord'],
    },
    ...(options || {}),
  });
}

/** 取消任务 DELETE /v1/project/employer/cancel/${param0} */
export async function cancelEmployerProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cancelEmployerProjectParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/project/employer/cancel/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除任务 DELETE /v1/project/employer/delete/${param0} */
export async function deleteEmployerProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteEmployerProjectParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/project/employer/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取职业者信息 GET /v1/project/employer/getBidEmployee */
export async function commitEmployerProjectDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.commitEmployerProjectDetailParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageEmployeeVO>('/v1/project/employer/getBidEmployee', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 我的任务列表查询 GET /v1/project/employer/myProject */
export async function getEmployerProjectList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployerProjectListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageProjectVO>('/v1/project/employer/myProject', {
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
