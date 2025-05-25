// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 查看某角色拥有到菜单 GET /manager/permission/roleMenu/${param0} */
export async function get3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get3Params,
  options?: { [key: string]: any },
) {
  const { roleId: param0, ...queryParams } = params;
  return request<API.ResultMessageListRoleMenu>(`/manager/permission/roleMenu/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 保存角色菜单 POST /manager/permission/roleMenu/${param0} */
export async function save4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.save4Params,
  body: API.RoleMenu[],
  options?: { [key: string]: any },
) {
  const { roleId: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/manager/permission/roleMenu/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
