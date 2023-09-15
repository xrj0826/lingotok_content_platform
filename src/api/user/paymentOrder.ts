// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 项目增加款项下单 POST /v1/paymentorder/additional/projectOrder/${param0}/${param1} */
export async function additionalProjectOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.additionalProjectOrderParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, amount: param1, ...queryParams } = params;
  return request<API.ResultMessagePaymentOrder>(
    `/v1/paymentorder/additional/projectOrder/${param0}/${param1}`,
    {
      method: 'POST',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** 投标币下单 POST /v1/paymentorder/create/bidCoinOrder/${param0} */
export async function createBidCoinOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.createBidCoinOrderParams,
  options?: { [key: string]: any },
) {
  const { number: param0, ...queryParams } = params;
  return request<API.ResultMessagePaymentOrder>(`/v1/paymentorder/create/bidCoinOrder/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 项目下单 POST /v1/paymentorder/create/projectOrder/${param0} */
export async function createProjectOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.createProjectOrderParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessagePaymentOrder>(`/v1/paymentorder/create/projectOrder/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 交易记录 GET /v1/paymentorder/page */
export async function getOrderList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrderListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPagePaymentOrder>('/v1/paymentorder/page', {
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
