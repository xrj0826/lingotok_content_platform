// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改练习 PUT /manager/learn/exercises */
export async function update7(body: API.Exercises, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/learn/exercises', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传练习 POST /manager/learn/exercises */
export async function save8(body: API.Exercises, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/learn/exercises', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除练习 DELETE /manager/learn/exercises */
export async function delete6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete6Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/manager/learn/exercises', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 练习详情 GET /manager/learn/exercises/${param0} */
export async function get8(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get8Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageExercises>(`/manager/learn/exercises/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除练习 DELETE /manager/learn/exercises/${param0} */
export async function delete7(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete7Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/manager/learn/exercises/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 收藏句子 POST /manager/learn/exercises/collect */
export async function collect1(body: API.CollectDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/learn/exercises/collect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
