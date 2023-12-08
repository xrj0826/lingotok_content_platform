// @ts-ignore
/* eslint-disable */
import request from '/@/utils/request/index2';

/** 查看我的卡 POST /v1/user/show/${param1}/${param0} */
export async function showMyCard(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.showMyCardParams,
  options?: { [key: string]: any },
) {
  const { id: param0, cardTypeEnum: param1, ...queryParams } = params;
  return request<API.ResultMessageListCard>(`/v1/user/show/${param1}/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查看我的优惠卷 POST /v1/user/showMyCoupon/${param0} */
export async function showMyCoupon(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.showMyCouponParams,
  options?: { [key: string]: any },
) {
  const { accessToken: param0, ...queryParams } = params;
  return request<API.ResultMessageCouponUser>(`/v1/user/showMyCoupon/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查看订单信息 POST /v1/user/showOrder/${param0} */
export async function showOrder(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.showOrderParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/user/showOrder/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查看对应类型的订单信息 GET /v1/user/showOrder/${param1}/${param0} */
export async function showOrderByType(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.showOrderByTypeParams,
  options?: { [key: string]: any },
) {
  const { id: param0, orderTypeEnum: param1, ...queryParams } = params;
  return request<API.ResultMessage>(`/v1/user/showOrder/${param1}/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 修改用户信息 PUT /v1/user/update/${param0} */
export async function updateUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateUserParams,
  body: API.UpdateUserForm,
  options?: { [key: string]: any },
) {
  const { accessToken: param0, ...queryParams } = params;
  return request<API.ResultMessageUpdateUserForm>(`/v1/user/update/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
