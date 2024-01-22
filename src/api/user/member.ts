// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 会员分页列表 GET /manager/passport/member */
export async function getByPage1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByPage1Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageIPageMemberVO>('/manager/passport/member', {
    method: 'GET',
    params: {
      ...params,
      memberSearchVO: undefined,
      ...params['memberSearchVO'],
      page: undefined,
      ...params['page'],
    },
    ...(options || {}),
  });
}

/** 修改会员基本信息 PUT /manager/passport/member */
export async function update5(body: API.ManagerMemberEditDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessageMember>('/manager/passport/member', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 添加会员 POST /manager/passport/member */
export async function save6(body: API.MemberAddDTO, options?: { [key: string]: any }) {
  return request<API.ResultMessageMember>('/manager/passport/member', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 通过ID获取会员信息 GET /manager/passport/member/${param0} */
export async function get6(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get6Params,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessageMemberVO>(`/manager/passport/member/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 根据条件查询会员总数 GET /manager/passport/member/num */
export async function getByPage2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByPage2Params,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageLong>('/manager/passport/member/num', {
    method: 'GET',
    params: {
      ...params,
      memberSearchVO: undefined,
      ...params['memberSearchVO'],
    },
    ...(options || {}),
  });
}

/** 修改会员状态,开启关闭会员 PUT /manager/passport/member/updateMemberStatus */
export async function updateMemberStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateMemberStatusParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultMessageObject>('/manager/passport/member/updateMemberStatus', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
