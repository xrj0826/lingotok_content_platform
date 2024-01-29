// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 文件上传 POST /manager/upload/file */
export async function upload1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.upload1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageFile>('/manager/upload/file', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
