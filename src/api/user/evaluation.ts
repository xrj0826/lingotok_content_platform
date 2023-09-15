// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改评价 PUT /v1/evaluation */
export async function updateEvaluation(body: API.Evaluation, options?: { [key: string]: any }) {
  return request<API.ResultMessageEvaluation>('/v1/evaluation', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户评价 GET /v1/evaluation/${param0} */
export async function getByUserId1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByUserId1Params,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageEvaluationVO>(`/v1/evaluation/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除评价 DELETE /v1/evaluation/${param0} */
export async function deleteEvaluation(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteEvaluationParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageString>(`/v1/evaluation/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取评价详情 GET /v1/evaluation/detail/${param0} */
export async function getEvaluationDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEvaluationDetailParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageEvaluation>(`/v1/evaluation/detail/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 发起评价 POST /v1/evaluation/evaluation */
export async function evaluation(body: API.Evaluation, options?: { [key: string]: any }) {
  return request<API.ResultMessageEvaluationVO>('/v1/evaluation/evaluation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户评价分页 GET /v1/evaluation/page/${param0} */
export async function getEvaluationList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getEvaluationListParams,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageIPageEvaluation>(`/v1/evaluation/page/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
      pageVO: undefined,
      ...queryParams['pageVO'],
    },
    ...(options || {}),
  });
}
