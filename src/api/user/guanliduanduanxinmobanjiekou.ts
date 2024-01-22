// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 新增短信模板 POST /manager/sms/template */
export async function save(body: API.SmsTemplate, options?: { [key: string]: any }) {
  return request<API.ResultMessageSmsTemplate>('/manager/sms/template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除短信模板 DELETE /manager/sms/template */
export async function deleteUsingDELETE(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageSmsTemplate>('/manager/sms/template', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改短信模板 PUT /manager/sms/template/modifySmsTemplate */
export async function modifySmsTemplate(body: API.SmsTemplate, options?: { [key: string]: any }) {
  return request<API.ResultMessageSmsTemplate>('/manager/sms/template/modifySmsTemplate', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询短信模板状态 PUT /manager/sms/template/querySmsSign */
export async function querySmsSign(options?: { [key: string]: any }) {
  return request<API.ResultMessageSmsTemplate>('/manager/sms/template/querySmsSign', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 查询短信模板分页 GET /manager/sms/template/querySmsTemplatePage */
export async function querySmsTemplatePage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.querySmsTemplatePageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageSmsTemplate>('/manager/sms/template/querySmsTemplatePage', {
    method: 'GET',
    params: {
      ...params,
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}
