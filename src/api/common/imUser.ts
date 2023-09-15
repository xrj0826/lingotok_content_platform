// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireCommon';

/** 获取签名 GET /v1/common/imUser/userSig/${param0} */
export async function getUserSignature(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserSignatureParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageString>(`/v1/common/imUser/userSig/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
