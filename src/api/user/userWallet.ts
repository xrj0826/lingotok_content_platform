// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 交易钱包详情 GET /v1/userwallet */
export async function getUserWallet(options?: { [key: string]: any }) {
  return request<API.ResultMessageUserWalletVO>('/v1/userwallet', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 绑定银行卡 POST /v1/userwallet/bind */
export async function bindCard(body: API.BindVO, options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/v1/userwallet/bind', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 解绑银行卡 POST /v1/userwallet/unbind */
export async function unbindCard(options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/v1/userwallet/unbind', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 提现认证并下单 GET /v1/userwallet/verify */
export async function examineWalletPassword(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.examineWalletPasswordParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessagePaymentOrder>('/v1/userwallet/verify', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
