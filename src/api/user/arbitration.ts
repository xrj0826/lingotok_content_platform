// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 发起仲裁 POST /v1/arbitration */
export async function save1(body: API.ArbitrationDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessageBoolean>('/v1/arbitration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取仲裁详情 GET /v1/arbitration/${param0} */
export async function get1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageArbitration>(`/v1/arbitration/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
