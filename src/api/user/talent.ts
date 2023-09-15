// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 我收藏的人才列表 GET /v1/talent/collect */
export async function getCollectList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCollectListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUserVO>('/v1/talent/collect', {
    method: 'GET',
    params: {
      ...params,
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 收藏人才 POST /v1/talent/collect/add */
export async function collect(body: API.LikeDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessageUserVO>('/v1/talent/collect/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 人才详情 GET /v1/talent/query */
export async function getTalentDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTalentDetailParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageUserVO>('/v1/talent/query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 标签人才列表查询 GET /v1/talent/queryByEmpTags */
export async function getEmployeeByTags(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEmployeeByTagsParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUserVO>('/v1/talent/queryByEmpTags', {
    method: 'GET',
    params: {
      ...params,
      pageVO: undefined,
      ...params['pageVO'],
    },
    ...(options || {}),
  });
}

/** 关键字人才列表查询 GET /v1/talent/queryEmp */
export async function queryEmployee(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryEmployeeParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUserVO>('/v1/talent/queryEmp', {
    method: 'GET',
    params: {
      ...params,
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}
