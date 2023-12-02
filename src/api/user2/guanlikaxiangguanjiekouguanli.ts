// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 展示该门店所有卡 GET /v1/cardAdmin/showAllCard/${param0} */
export async function showAllCard(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.showAllCardParams,
  options?: { [key: string]: any },
) {
  const { cardTypeEnum: param0, ...queryParams } = params;
  return request<API.ResultMessageListCbCardAdmin>(`/v1/cardAdmin/showAllCard/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
