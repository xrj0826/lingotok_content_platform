// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 查看管理员角色 GET /manager/permission/userRole/${param0} */
export async function get2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get2Params,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageUserRole>(`/manager/permission/userRole/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新角色菜单 PUT /manager/permission/userRole/${param0} */
export async function update2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.update2Params,
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.ResultMessageUserRole>(`/manager/permission/userRole/${param0}`, {
    method: 'PUT',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}
