// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 参与投标,回答问题 POST /v1/bidRecord */
export async function saveBid(body: API.BidRecord, options?: { [key: string]: any }) {
  return request<API.ResultMessageProjectVO>('/v1/bidRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取投标列表 GET /v1/bidRecord/${param0} */
export async function getBidList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBidListParams,
  options?: { [key: string]: any },
) {
  const { projectId: param0, ...queryParams } = params;
  return request<API.ResultMessageListBidRecordVO>(`/v1/bidRecord/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查看投标详情 GET /v1/bidRecord/${param0} */
export async function getBidDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBidDetailParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageBidRecord>(`/v1/bidRecord/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 接收投标 POST /v1/bidRecord/acceptBid/${param0} */
export async function acceptBid(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.acceptBidParams,
  options?: { [key: string]: any },
) {
  const { bidRecordId: param0, ...queryParams } = params;
  return request<API.ResultMessageProjectVO>(`/v1/bidRecord/acceptBid/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}
