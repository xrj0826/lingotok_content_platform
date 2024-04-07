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
