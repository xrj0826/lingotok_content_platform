// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 计时卡 POST /v1/hardware/timeCard/${param0} */
export async function timeCard(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.timeCardParams,
  options?: { [key: string]: any },
) {
  const { accessToken: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/hardware/timeCard/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 反扫码设备第三方二维码核销说明 GET /v1/hardware/verification */
export async function hardware(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.hardwareParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/v1/hardware/verification', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
