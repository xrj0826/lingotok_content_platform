// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 交易钱包详情 GET /v1/payment */
export async function getUserWallet(options?: { [key: string]: any }) {
  return request<API.ResultMessageUserWalletVO>('/v1/payment', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 提现处理 POST /v1/payment/handle/${param0} */
export async function handle1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.handle1Params,
  options?: { [key: string]: any },
) {
  const { sn: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/v1/payment/handle/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 平台提现记录 GET /v1/payment/platformWithdrawalList */
export async function platformWithdrawalList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.platformWithdrawalListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPagePaymentOrder>('/v1/payment/platformWithdrawalList', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 账户分页 GET /v1/payment/userWalletPage */
export async function getUserWalletList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserWalletListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageUserWalletVO>('/v1/payment/userWalletPage', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 提现分页 GET /v1/payment/withdrawOrderPage */
export async function getOrderList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrderListParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPagePaymentOrder>('/v1/payment/withdrawOrderPage', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}
