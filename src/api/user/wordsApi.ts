// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 删除单词 DELETE /manager/words/deleteWord */
export async function deleteWord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteWordParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/words/deleteWord', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取单词组详情 GET /manager/words/getByGroupId/${param0} */
export async function getByGroupId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByGroupIdParams,
  options?: { [key: string]: any },
) {
  const { groupId: param0, ...queryParams } = params;
  return request<API.ResultMessageListEnglishWord>(`/manager/words/getByGroupId/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取单词详情 GET /manager/words/getById/${param0} */
export async function getById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByIdParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageEnglishWord>(`/manager/words/getById/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查询单词 GET /manager/words/search/${param0}/${param1}/${param2} */
export async function search(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.searchParams,
  options?: { [key: string]: any },
) {
  const { query: param0, pageNumber: param1, pageSize: param2, ...queryParams } = params;
  return request<API.ResultMessageListWordTranslation>(
    `/manager/words/search/${param0}/${param1}/${param2}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** 此处后端没有提供注释 POST /manager/words/tts */
export async function tts(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ttsParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/words/tts', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改单词 POST /manager/words/updateWord/${param0} */
export async function updateWord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateWordParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/words/updateWord/${param0}`, {
    method: 'POST',
    params: {
      ...queryParams,
      value: undefined,
      ...queryParams['value'],
    },
  
    ...(options || {}),
  });
}

/** 更新资源 会覆写，注意保留原资源 POST /manager/words/uploadResource/${param0} */
export async function upload(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadParams,
  body: API.Resource,
  options?: { [key: string]: any },
) {
  const { headword: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/words/uploadResource/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
