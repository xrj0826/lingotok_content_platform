// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 关键字任务列表查询 GET /v1/project/query */
export async function queryProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryProjectParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageProjectVO>('/v1/project/query', {
    method: 'GET',
    params: {
      ...params,
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 标签任务列表查询 GET /v1/project/queryByTags */
export async function getProjectByTags(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getProjectByTagsParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageProjectVO>('/v1/project/queryByTags', {
    method: 'GET',
    params: {
      ...params,
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}
