// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 添加系统标签 POST /v1/jobTags/addSysJobsTags/${param0} */
export async function addJobTags(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addJobTagsParams,
  body: API.JobTags,
  options?: { [key: string]: any },
) {
  const { fatherId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/jobTags/addSysJobsTags/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
