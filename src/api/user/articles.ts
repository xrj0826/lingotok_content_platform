// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 修改文章 PUT /manager/learn/articles */
export async function update8(body: API.Articles, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/learn/articles', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传文章 POST /manager/learn/articles */
export async function save9(body: API.Articles, options?: { [key: string]: any }) {
  return request<API.ResultMessage>('/manager/learn/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量删除文章 DELETE /manager/learn/articles */
export async function delete7(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete7Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/manager/learn/articles', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 文章详情 GET /manager/learn/articles/${param0} */
export async function get9(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get9Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageArticlesVO>(`/manager/learn/articles/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除文章 DELETE /manager/learn/articles/${param0} */
export async function delete8(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete8Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/manager/learn/articles/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
