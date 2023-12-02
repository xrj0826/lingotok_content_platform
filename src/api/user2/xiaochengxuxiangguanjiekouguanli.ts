// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 此处后端没有提供注释 GET /v1/QRCode/getAccessToken */
export async function getAccessToken(options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/QRCode/getAccessToken', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /v1/QRCode/getLimit */
export async function getlimit(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getlimitParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/v1/QRCode/getLimit', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /v1/QRCode/getUnlimited */
export async function getUnlimited(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUnlimitedParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/v1/QRCode/getUnlimited', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
