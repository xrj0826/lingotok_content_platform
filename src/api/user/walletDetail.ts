// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 冻结记录 GET /v1/wallet/frozen */
export async function getFrozenRecords(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFrozenRecordsParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageWalletDetail>('/v1/wallet/frozen', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      searchVo: undefined,
      ...params['searchVo'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}
