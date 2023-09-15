// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 查询角色 GET /v1/permission/role/page */
export async function getRoleList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRoleListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageRole>('/v1/permission/role/page', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      searchVo: undefined,
      ...params['searchVo'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}
