// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 展示该门店所有卡 GET /v1/card/${param1}/${param0} */
export async function showCard(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.showCardParams,
  options?: { [key: string]: any },
) {
  const { id: param0, cardTypeEnum: param1, ...queryParams } = params;
  return request<API.ResultMessageListCard>(`/v1/card/${param1}/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 提交卡购买订单 POST /v1/card/generateCardOrder/${param0} */
export async function generateCardOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.generateCardOrderParams,
  body: API.OrderCardReq,
  options?: { [key: string]: any },
) {
  const { accessToken: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/card/generateCardOrder/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 提交充值卡订单信息 POST /v1/card/getChargeCardOrder/${param0}/${param1} */
export async function getChargeCardOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChargeCardOrderParams,
  options?: { [key: string]: any },
) {
  const { accessToken: param0, cardId: param1, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/card/getChargeCardOrder/${param0}/${param1}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 获得月卡对应的二维码 POST /v1/card/getQrCodeByCard/${param0} */
export async function getQrCodeByCard(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getQrCodeByCardParams,
  options?: { [key: string]: any },
) {
  const { cardId: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/card/getQrCodeByCard/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 使用散客储值卡支付 POST /v1/card/personCardPay/${param0}/${param1} */
export async function personCardPay(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.personCardPayParams,
  options?: { [key: string]: any },
) {
  const { orderId: param0, cardId: param1, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/card/personCardPay/${param0}/${param1}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 展示卡详细信息 POST /v1/card/showCardDetails/${param0} */
export async function showCardDetails(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.showCardDetailsParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageCardVo>(`/v1/card/showCardDetails/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 使用储值卡支付 POST /v1/card/valueCardPay/${param0}/${param1} */
export async function valueCardPay(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.valueCardPayParams,
  options?: { [key: string]: any },
) {
  const { orderId: param0, cardId: param1, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/card/valueCardPay/${param0}/${param1}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
