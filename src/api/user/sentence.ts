// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改 PUT /manager/sentence */
export async function update1(body: API.Sentence, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/sentence', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 保存 POST /manager/sentence */
export async function save3(body: API.Sentence, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/sentence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除 DELETE /manager/sentence */
export async function delete2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete2Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/manager/sentence', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 句子详情 GET /manager/sentence/${param0} */
export async function get1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageSentence>(`/manager/sentence/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除 DELETE /manager/sentence/${param0} */
export async function delete3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete3Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/manager/sentence/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 收藏句子 POST /manager/sentence/collect */
export async function collect(body: API.CollectDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/sentence/collect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
