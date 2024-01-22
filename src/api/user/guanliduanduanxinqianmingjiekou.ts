// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 新增短信签名 POST /manager/sms/sign */
export async function save1(body: API.SmsSign, options?: { [key: string]: any }) {
  return request<API.ResultMessageSmsSign>('/manager/sms/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询签名详细 GET /manager/sms/sign/${param0} */
export async function getDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDetailParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageSmsSign>(`/manager/sms/sign/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除短信签名 DELETE /manager/sms/sign/${param0} */
export async function delete1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete1Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageSmsSign>(`/manager/sms/sign/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 修改短信签名 PUT /manager/sms/sign/modifySmsSign */
export async function modifySmsSign(body: API.SmsSign, options?: { [key: string]: any }) {
  return request<API.ResultMessageSmsSign>('/manager/sms/sign/modifySmsSign', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询短信签名状态 PUT /manager/sms/sign/querySmsSign */
export async function querySmsSign1(options?: { [key: string]: any }) {
  return request<API.ResultMessageSmsSign>('/manager/sms/sign/querySmsSign', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 查询短信签名分页 GET /manager/sms/sign/querySmsSignPage */
export async function querySmsSignPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.querySmsSignPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageSmsSign>('/manager/sms/sign/querySmsSignPage', {
    method: 'GET',
    params: {
      ...params,
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}
