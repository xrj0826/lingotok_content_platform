// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 首页图片 GET /v1/announcement */
export async function getAnnouncementDetail(options?: { [key: string]: any }) {
  return request<API.ResultMessageAnnouncement>('/v1/announcement', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 平台修改公告 PUT /v1/announcement */
export async function updateAnnouncement(body: API.Announcement, options?: { [key: string]: any }) {
  return request<API.ResultMessageAnnouncement>('/v1/announcement', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 平台获取公告详情 GET /v1/announcement/${param0} */
export async function getAnnouncementDetail1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAnnouncementDetail1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageAnnouncement>(`/v1/announcement/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
