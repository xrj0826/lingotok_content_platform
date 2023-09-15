// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 分页获取会员站内消息 GET /v1/message/user */
export async function page(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.pageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageMemberMessage>('/v1/message/user', {
    method: 'GET',
    params: {
      ...params,
      memberMessageQueryVO: undefined,
      ...params['memberMessageQueryVO'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 消息已读 PUT /v1/message/user/${param0} */
export async function read(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.readParams,
  options?: { [key: string]: any },
) {
  const { message_id: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/message/user/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}
