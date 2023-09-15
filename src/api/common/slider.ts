// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireCommon';

/** 获取校验接口,一分钟同一个ip请求10次 GET /v1/common/slider/${param0} */
export async function getSliderImage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSliderImageParams,
  options?: { [key: string]: any },
) {
  const { verificationEnums: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/common/slider/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 验证码预校验 POST /v1/common/slider/${param0} */
export async function verificationImage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.verificationImageParams,
  options?: { [key: string]: any },
) {
  const { verificationEnums: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/common/slider/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}
