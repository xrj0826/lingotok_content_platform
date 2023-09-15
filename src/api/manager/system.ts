// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/requireManager';

/** 查看配置 GET /manager/setting/get/${param0} */
export async function settingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.settingGetParams,
  options?: { [key: string]: any },
) {
  const { key: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/manager/setting/get/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新配置 PUT /manager/setting/put/${param0} */
export async function saveConfig(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.saveConfigParams,
  body: string,
  options?: { [key: string]: any },
) {
  const { key: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/manager/setting/put/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
