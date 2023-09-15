// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 接入 PUT /in/${param0} */
export async function inUsingPUT(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.inUsingPUTParams,
  options?: { [key: string]: any },
) {
  const { groupId: param0, ...queryParams } = params;
  return request<API.ResultMessageImConversation>(`/in/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 在线客服会话分页 GET /TGS */
export async function page1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageListImConversation>('/TGS', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
