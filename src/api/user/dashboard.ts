// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 图表统计 GET /v1/dashboard */
export async function statisticsChart(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.statisticsChartParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageStatisticsResponse>('/v1/dashboard', {
    method: 'GET',
    params: {
      ...params,
      statisticsQueryParam: undefined,
      ...params['statisticsQueryParam'],
    },
    ...(options || {}),
  });
}

/** 概览统计 GET /v1/dashboard/overview */
export async function overview(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.overviewParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageTaskOverviewVO>('/v1/dashboard/overview', {
    method: 'GET',
    params: {
      ...params,
      statisticsQueryParam: undefined,
      ...params['statisticsQueryParam'],
    },
    ...(options || {}),
  });
}
