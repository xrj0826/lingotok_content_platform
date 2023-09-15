// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireCommon';

/** 查看聊天详情 GET /v1/common/im/conversation/${param0} */
export async function get(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageImConversation>(`/v1/common/im/conversation/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页获取用户聊天 GET /v1/common/im/conversation/list */
export async function getUserTalkList(options?: { [key: string]: any }) {
  return request<API.ResultMessageListImConversationVO>('/v1/common/im/conversation/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 查看用户聊天详情 GET /v1/common/im/conversation/user/${param0} */
export async function getUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageImConversation>(`/v1/common/im/conversation/user/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查看任务聊天详情 GET /v1/common/im/conversation/user/${param0}/${param1} */
export async function getUser1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUser1Params,
  options?: { [key: string]: any },
) {
  const { userId: param0, projectId: param1, ...queryParams } = params;
  return request<API.ResultMessageImConversation>(
    `/v1/common/im/conversation/user/${param0}/${param1}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}
