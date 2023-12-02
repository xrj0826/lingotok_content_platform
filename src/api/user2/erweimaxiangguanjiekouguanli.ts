// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 获得免费场次的二维码 GET /v1/qrcode/getCode/${param0} */
export async function getCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCodeParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageString>(`/v1/qrcode/getCode/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
