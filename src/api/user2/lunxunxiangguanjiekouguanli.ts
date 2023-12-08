// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 轮询计时码订单状态 GET /v1/poll/getTimer/${param0} */
export async function getTimer(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTimerParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/poll/getTimer/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
