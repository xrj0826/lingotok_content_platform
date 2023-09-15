// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 售后异步通知 POST /v1/aftersale/cashier/notify */
export async function notify1(options?: { [key: string]: any }) {
  return request<any>('/v1/aftersale/cashier/notify', {
    method: 'POST',
    ...(options || {}),
  });
}
