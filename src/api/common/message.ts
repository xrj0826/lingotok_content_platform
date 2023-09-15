// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireCommon';

/** 聊天记录分页查询 GET /v1/common/im/message */
export async function historyMessage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.historyMessageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageListImMessage>('/v1/common/im/message', {
    method: 'GET',
    params: {
      ...params,
      messageQueryParams: undefined,
      ...params['messageQueryParams'],
    },
    ...(options || {}),
  });
}

/** Im回调 POST /v1/common/im/message/im/callback */
export async function imCallback(body: string, options?: { [key: string]: any }) {
  return request<string>('/v1/common/im/message/im/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据双方ID查询聊天记录 GET /v1/common/im/message/pageByUser/${param0}/${param1} */
export async function historyMessageByUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.historyMessageByUserParams,
  options?: { [key: string]: any },
) {
  const { userId1: param0, userId2: param1, ...queryParams } = params;
  return request<API.ResultMessageListImMessage>(
    `/v1/common/im/message/pageByUser/${param0}/${param1}`,
    {
      method: 'GET',
      params: {
        ...queryParams,
        messageQueryParams: undefined,
        ...queryParams['messageQueryParams'],
      },
      ...(options || {}),
    },
  );
}
