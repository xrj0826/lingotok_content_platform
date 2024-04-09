// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 爬虫更新词库 GET /manager/web */
export async function update9(options?: { [key: string]: any }) {
  return request<API.ResultMessageBoolean>('/manager/web', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 文件上传 POST /manager/web/file */
export async function upload1(body: string, options?: { [key: string]: any }) {
  const formData = new FormData();

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      formData.append(
        ele,
        typeof item === 'object' && !(item instanceof File) ? JSON.stringify(item) : item,
      );
    }
  });

  return request<API.ResultMessageBoolean>('/manager/web/file', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}
