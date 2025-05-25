// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index';

/** 查看部门拥有的角色 GET /manager/permission/departmentRole/${param0} */
export async function get4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.get4Params,
  options?: { [key: string]: any },
) {
  const { departmentId: param0, ...queryParams } = params;
  return request<API.ResultMessageListDepartmentRole>(
    `/manager/permission/departmentRole/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** 更新部门角色 PUT /manager/permission/departmentRole/${param0} */
export async function update3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.update3Params,
  body: API.DepartmentRole[],
  options?: { [key: string]: any },
) {
  const { departmentId: param0, ...queryParams } = params;
  return request<API.ResultMessageDepartmentRole>(`/manager/permission/departmentRole/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
