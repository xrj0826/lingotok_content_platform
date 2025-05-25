// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireCommon';

/** 获取所有的省-市 GET /v1/common/region/allCity */
export async function getAllCity(options?: { [key: string]: any }) {
  return request<API.ResultMessageListRegionVO>('/v1/common/region/allCity', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 通过id获取子地区 GET /v1/common/region/item/${param0} */
export async function getRegionItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRegionItemParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageListRegion>(`/v1/common/region/item/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据名字获取地区地址id GET /v1/common/region/name */
export async function getItemByLastName(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getItemByLastNameParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageString>('/v1/common/region/name', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 点地图获取地址信息 GET /v1/common/region/region */
export async function getRegion(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRegionParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/v1/common/region/region', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
