// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 删除单词书 DELETE /manager/book/${param0} */
export async function delete10(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete10Params,
  options?: { [key: string]: any },
) {
  const { bookId: param0, ...queryParams } = params;
  return request<API.ResultMessageObject>(`/manager/book/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 新增一级目录 POST /manager/book/addBookMenu */
export async function addBookMenu(body: API.BookMenu, options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/manager/book/addBookMenu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 词组新添单词 POST /manager/book/addWord */
export async function addWord(body: API.NewWord, options?: { [key: string]: any }) {
  return request<API.ResultMessageString>('/manager/book/addWord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 一级目录列表 GET /manager/book/bookMenuList */
export async function bookMenuList(options?: { [key: string]: any }) {
  return request<API.ResultMessageListBookMenu>('/manager/book/bookMenuList', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 删除一级目录 DELETE /manager/book/deleteBookMenu/${param0} */
export async function deleteBookMenu(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteBookMenuParams,
  options?: { [key: string]: any },
) {
  const { menuId: param0, ...queryParams } = params;
  return request<API.ResultMessageBoolean>(`/manager/book/deleteBookMenu/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 单词书词组列表 GET /manager/book/group/${param0} */
export async function group(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.groupParams,
  options?: { [key: string]: any },
) {
  const { bookId: param0, ...queryParams } = params;
  return request<API.ResultMessageBookGroupVO>(`/manager/book/group/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 词组详情 GET /manager/book/groupDetail/${param0} */
export async function groupDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.groupDetailParams,
  options?: { [key: string]: any },
) {
  const { groupId: param0, ...queryParams } = params;
  return request<API.ResultMessageGroupVO>(`/manager/book/groupDetail/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 单词书自动分组 GET /manager/book/groupInsert/${param0} */
export async function groupInsert(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.groupInsertParams,
  options?: { [key: string]: any },
) {
  const { bookId: param0, ...queryParams } = params;
  return request<any>(`/manager/book/groupInsert/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 单词书分页 GET /manager/book/page */
export async function page1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.page1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageBook>('/manager/book/page', {
    method: 'GET',
    params: {
      ...params,
      entity: undefined,
      ...params['entity'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 同步数据库 GET /manager/book/sync */
export async function sync(options?: { [key: string]: any }) {
  return request<API.ResultMessageListString>('/manager/book/sync', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 修改单词书 POST /manager/book/updateBook */
export async function updateWord1(body: API.Book, options?: { [key: string]: any }) {
  return request<API.ResultMessageObject>('/manager/book/updateBook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改一级目录 PUT /manager/book/updateBookMenu */
export async function updateBookMenu1(body: API.BookMenu, options?: { [key: string]: any }) {
  return request<API.ResultMessageBoolean>('/manager/book/updateBookMenu', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 单词批量上传ByExcel 文件格式为.excel,按行读取,每行单独为一个单词 POST /manager/book/uploadWordByExcel */
export async function uploadWordByExcel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadWordByExcelParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/book/uploadWordByExcel', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 单词批量上传ByJson 文件格式为.json,按行读取,每行单独为一个单词 POST /manager/book/uploadWordByJson */
export async function uploadWordByJson(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadWordByJsonParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/book/uploadWordByJson', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
