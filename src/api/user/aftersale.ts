// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 申请退款单 POST /v1/aftersale/refund */
export async function refund(body: API.RefundDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessageAfterSale>('/v1/aftersale/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
