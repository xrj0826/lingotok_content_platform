// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 核销二维码时被调用接口 POST /staff/cbdoor */
export async function pass(body: API.Cbdoor, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/staff/cbdoor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
