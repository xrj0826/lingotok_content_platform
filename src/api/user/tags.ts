// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 添加自定义工作标签 POST /v1/jobTags/addJobsTags */
export async function addJobTags(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addJobTagsParams,
  body: API.JobTags[],
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageListJobTags>('/v1/jobTags/addJobsTags', {
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

/** 删除工作标签 DELETE /v1/jobTags/delete */
export async function deleteUsingDELETE(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageString>('/v1/jobTags/delete', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取一级工作标签 GET /v1/jobTags/getFirstJobTags */
export async function getFirstJobTags(options?: { [key: string]: any }) {
  return request<API.ResultMessageListJobTags>('/v1/jobTags/getFirstJobTags', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取工作标签 GET /v1/jobTags/getJobsTags */
export async function getJobTags(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getJobTagsParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageListJobTags>('/v1/jobTags/getJobsTags', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据二级标签获取标签 GET /v1/jobTags/getSecondJobTags/${param0} */
export async function getSecondJobTags(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSecondJobTagsParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageListJobTags>(`/v1/jobTags/getSecondJobTags/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
