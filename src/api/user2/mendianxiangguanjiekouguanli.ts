// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 门店信息 GET /v1/court/getCourtDetails/${param0} */
export async function getCourtDetails(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCourtDetailsParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageStoreDetailsVo>(`/v1/court/getCourtDetails/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取轮播图 GET /v1/court/getPhoto */
export async function getPhoto(options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/court/getPhoto', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取特殊价格 GET /v1/court/getSpecialValue */
export async function getSpecialValue(options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/v1/court/getSpecialValue', {
    method: 'GET',
    ...(options || {}),
  });
}
