// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 此处后端没有提供注释 GET /v1/payment/callback/${param0} */
export async function callback(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.callbackParams,
  options?: { [key: string]: any },
) {
  const { paymentMethod: param0, ...queryParams } = params;
  return request<string>(`/v1/payment/callback/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/payment/callback/${param0} */
export async function callback1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.callback1Params,
  options?: { [key: string]: any },
) {
  const { paymentMethod: param0, ...queryParams } = params;
  return request<string>(`/v1/payment/callback/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /v1/payment/pay/${param0}/${param1} */
export async function payment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.paymentParams,
  options?: { [key: string]: any },
) {
  const { paymentMethod: param0, paymentClient: param1, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/payment/pay/${param0}/${param1}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}
