// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 发送短信验证码,一分钟同一个ip请求1次 GET /v1/sms/${param1}/${param0} */
export async function getSmsCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSmsCodeParams,
  options?: { [key: string]: any },
) {
  const { mobile: param0, verificationEnums: param1, ...queryParams } = params;
  return request<API.ResultMessageMemberSmsLoginDto>(`/v1/sms/${param1}/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 校验短信是否正确 POST /v1/sms/checkSms */
export async function checkSms(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkSmsParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessage>('/v1/sms/checkSms', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
