// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 同步支付回调 POST /v1/payment/cashier/callback */
export async function callback(options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/v1/payment/cashier/callback', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 支付异步通知 POST /v1/payment/cashier/notify */
export async function notify(options?: { [key: string]: any }) {
  return request<any>('/v1/payment/cashier/notify', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 支付 GET /v1/payment/cashier/pay/${param0}/${param1} */
export async function payment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.paymentParams,
  options?: { [key: string]: any },
) {
  const { paymentMethod: param0, paymentClient: param1, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/payment/cashier/pay/${param0}/${param1}`, {
    method: 'GET',
    params: {
      ...queryParams,
      payParam: undefined,
      ...queryParams['payParam'],
    },
    ...(options || {}),
  });
}

/** 查询支付结果 GET /v1/payment/cashier/result */
export async function paymentResult(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.paymentResultParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageBoolean>('/v1/payment/cashier/result', {
    method: 'GET',
    params: {
      ...params,
      payParam: undefined,
      ...params['payParam'],
    },
    ...(options || {}),
  });
}
