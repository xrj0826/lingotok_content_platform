// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 订场情况查询 GET /v1/order/bookStatus/${param0} */
export async function bookStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.bookStatusParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageString>(`/v1/order/bookStatus/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 提交订单 POST /v1/order/generateOrder/${param0} */
export async function generateOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.generateOrderParams,
  body: API.OrderReq,
  options?: { [key: string]: any },
) {
  const { accessToken: param0, ...queryParams } = params;
  return request<API.ResultMessageLong>(`/v1/order/generateOrder/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
