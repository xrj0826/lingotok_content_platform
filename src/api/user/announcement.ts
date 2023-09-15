// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 平台获取公告列表 GET /v1/announcement */
export async function getAnnouncementList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAnnouncementListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageAnnouncement>('/v1/announcement', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 平台获取公告详情 GET /v1/announcement/${param0} */
export async function getAnnouncementDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAnnouncementDetailParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageAnnouncement>(`/v1/announcement/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
