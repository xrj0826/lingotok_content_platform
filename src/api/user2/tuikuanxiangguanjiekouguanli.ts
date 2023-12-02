// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 后台管理员租场订场退款 POST /v1/payment/refund/adminCardRefund/${param0} */
export async function adminCardRefund(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminCardRefundParams,
  options?: { [key: string]: any },
) {
  const { orderId: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/payment/refund/adminCardRefund/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/payment/refund/adminRefund/${param0}/${param1} */
export async function adminRefund(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminRefundParams,
  options?: { [key: string]: any },
) {
  const { paymentMethod: param0, sn: param1, ...queryParams } = params;
  return request<Record<string, any>>(`/v1/payment/refund/adminRefund/${param0}/${param1}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 使用储值卡购买租场订场退款 POST /v1/payment/refund/cardRefund/${param0} */
export async function cardRefund(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.cardRefundParams,
  options?: { [key: string]: any },
) {
  const { orderId: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/payment/refund/cardRefund/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /v1/payment/refund/refund/${param0}/${param1} */
export async function processRefund(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.processRefundParams,
  options?: { [key: string]: any },
) {
  const { paymentMethod: param0, sn: param1, ...queryParams } = params;
  return request<Record<string, any>>(`/v1/payment/refund/refund/${param0}/${param1}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
