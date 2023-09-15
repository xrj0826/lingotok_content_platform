// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

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

/** 平台发布公告 POST /v1/announcement */
export async function saveAnnouncement(body: API.Announcement, options?: { [key: string]: any }) {
  return request<API.ResultMessageAnnouncement>('/v1/announcement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 平台批量删除公告 DELETE /v1/announcement */
export async function deleteAnnouncementList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAnnouncementListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageString>('/v1/announcement', {
    method: 'DELETE',
    params: {
      ...params,
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

/** 平台删除公告 DELETE /v1/announcement/${param0} */
export async function deleteAnnouncement(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteAnnouncementParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageString>(`/v1/announcement/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
