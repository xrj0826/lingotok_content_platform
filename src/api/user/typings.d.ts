declare namespace API {
  type AdminUser = {
    id?: number;
    createBy?: string;
    createTime?: string;
    deleteFlag?: boolean;
    updateBy?: string;
    updateTime?: string;
    avatar?: string;
    description?: string;
    email?: string;
    isSuper?: boolean;
    mobile?: string;
    nickName?: string;
    password?: string;
    status?: boolean;
    username?: string;
    roleIds?: string;
    isBan?: boolean;
  };

  type AdminUserAddDTO = {
    /** 管理员名 */
    username?: string;
    /** 管理员密码 */
    password?: string;
    /** 手机号码 */
    mobile: string;
  };

  type AdminUserVo = {
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickName?: string;
    /** 用户手机号码 */
    mobile?: string;
  };

  type CbCard = {
    /** id */
    id?: number;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 修改者 */
    updateBy?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: number;
    /** 卡名称 */
    cardName?: string;
    /** 卡类型（储值卡、月卡、次卡枚举） */
    cardType?: string;
    /** 有效期 */
    days?: number;
    /** 生效日期 */
    startDate?: string;
    /** 结束日期 */
    endDate?: string;
    /** 面值 */
    faceValue?: number;
    /** 赠送金额 */
    bonusAmount?: number;
    /** 当前余额 */
    currentBalance?: number;
    /** 用户id */
    userId?: string;
    /** 门店id */
    storeId?: string;
    /** 折扣值 */
    discountValue?: number;
  };

  type CbCoupon = {
    /** id */
    id?: number;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: boolean;
    /** 更新者 */
    updateBy?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 优惠天数 */
    days?: number;
    /** 邀请人数 */
    numberInvitees?: number;
    /** 是否可叠加 */
    overlay?: number;
    /** 兑换码 */
    code?: string;
    /** 生效日期 */
    startDate?: string;
    /** 结束日期 */
    endDate?: string;
    /** 使用次数限制 */
    usageLimit?: string;
    /** 是否有效（0、1） */
    isActive?: boolean;
    /** 优惠卷使用次数 */
    usageCount?: string;
    /** 折扣类型 */
    discountType?: string;
    /** 折扣值 */
    discountValue?: string;
  };

  type CbNotice = {
    /** id */
    id?: number;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 修改者 */
    updateBy?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: number;
    /** 通知日期 */
    noticeTime?: string;
    /** 通知人 */
    noticePerson?: string;
    /** 通知内容 */
    noticeContent?: string;
    /** 通知标题 */
    noticeTitle?: string;
    /** 通知状态 为0代表通知未被删除,1代表通知被删除了 */
    noticeState?: boolean;
    /** 门店id */
    storeId?: string;
  };

  type CbOrderInfo = {
    /** id */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 修改者 */
    updateBy?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: number;
    /** 用户id */
    userId?: string;
    /** 门店id */
    storeId?: string;
    /** 预约日期 */
    orderDate?: string;
    /** 预约开始时间 */
    orderSt?: string;
    /** 预约结束时间 */
    orderEd?: string;
    /** 订单状态(枚举） */
    orderState?: string;
    /** 订单价格 */
    orderPrice?: number;
    /** 订单类型（枚举） */
    orderType?: string;
    /** 支付方式 */
    paymentMethods?: string;
    /** 分享次数 */
    share?: number;
    /** 场地id */
    venueId?: string;
    /** 手机号码 */
    phoneNumber?: string;
    /** 二维码 */
    qrCode?: string;
    /** 用户进场时间 */
    startTime?: string;
    /** 用户离开时间 */
    endTime?: string;
    transactionId?: string;
  };

  type CbStore = {
    /** id */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 修改者 */
    updateBy?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: number;
    /** 门店名称 */
    storeName?: string;
    /** 场馆介绍 */
    venueIntroduction?: string;
    /** 开店时间 */
    openingTime?: number;
    /** 关店时间 */
    closingTime?: number;
    /** 门店图片 */
    storeImages?: string;
    /** 服务热线 */
    serviceHotline?: string;
    /** 微信号 */
    wxCode?: string;
    /** 实时人数 */
    realTime?: string;
    /** 提前预订天数 */
    advanceDays?: string;
    /** 起订时间 */
    leadTime?: number;
    /** 公告 */
    announcement?: string;
    /** 门店地址 */
    address?: string;
  };

  type CbUser = {
    /** id */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 修改者 */
    updateBy?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: boolean;
    /** 微信openid */
    openId?: string;
    /** 头像 */
    avatar?: string;
    /** 昵称（默认用户+手机号后四位） */
    nickName?: string;
    /** 手机号 */
    phoneNumber?: string;
    /** 生日 */
    birthday?: string;
    /** 性别(0表示男，1表示女） */
    sex?: number;
    /** 邮件 */
    email?: string;
    /** 是否被禁用 */
    isBan?: boolean;
    /** 积分 */
    credit?: string;
    /** 姓名 */
    name?: string;
    /** 状态 默认true正常 false禁用 */
    status?: boolean;
  };

  type CbVenue = {
    /** id */
    id?: number;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 修改者 */
    updateBy?: string;
    /** 修改时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: number;
    /** 场地名称 */
    venueName?: string;
    /** 门店id */
    storeId?: string;
    /** 半场价格 */
    halfPrice?: number;
    /** 全场价格 */
    allPrice?: number;
    /** 价格 */
    price?: number;
    /** 特殊价格 */
    specialValue?: string;
  };

  type delAllByIdsParams = {
    ids: string[];
  };

  type delete10Params = {
    /** ID集合 */
    ids: string;
  };

  type delete11Params = {
    id: string;
  };

  type delete12Params = {
    /** ID集合 */
    ids: string;
  };

  type delete13Params = {
    id: string;
  };

  type delete1Params = {
    id: string;
  };

  type delete2Params = {
    /** ID集合 */
    ids: string;
  };

  type delete3Params = {
    id: string;
  };

  type delete4Params = {
    /** ID集合 */
    ids: string;
  };

  type delete5Params = {
    id: string;
  };

  type delete6Params = {
    /** ID集合 */
    ids: string;
  };

  type delete7Params = {
    id: string;
  };

  type delete8Params = {
    /** ID集合 */
    ids: string;
  };

  type delete9Params = {
    id: string;
  };

  type deleteUsingDELETEParams = {
    /** ID集合 */
    ids: string;
  };

  type editPasswordParams = {
    password: string;
    newPassword: string;
  };

  type get1Params = {
    id: number;
  };

  type get2Params = {
    id: number;
  };

  type get3Params = {
    id: number;
  };

  type get4Params = {
    id: number;
  };

  type get5Params = {
    id: number;
  };

  type get6Params = {
    id: number;
  };

  type getParams = {
    id: number;
  };

  type IPageAdminUser = {
    size?: number;
    total?: number;
    pages?: number;
    records?: AdminUser[];
    current?: number;
  };

  type IPageCbCard = {
    size?: number;
    total?: number;
    pages?: number;
    records?: CbCard[];
    current?: number;
  };

  type IPageCbCoupon = {
    size?: number;
    total?: number;
    pages?: number;
    records?: CbCoupon[];
    current?: number;
  };

  type IPageCbNotice = {
    size?: number;
    total?: number;
    pages?: number;
    records?: CbNotice[];
    current?: number;
  };

  type IPageCbOrderInfo = {
    size?: number;
    total?: number;
    pages?: number;
    records?: CbOrderInfo[];
    current?: number;
  };

  type IPageCbStore = {
    size?: number;
    total?: number;
    pages?: number;
    records?: CbStore[];
    current?: number;
  };

  type IPageCbUser = {
    size?: number;
    total?: number;
    pages?: number;
    records?: CbUser[];
    current?: number;
  };

  type IPageCbVenue = {
    size?: number;
    total?: number;
    pages?: number;
    records?: CbVenue[];
    current?: number;
  };

  type loginParams = {
    username: string;
    password: string;
  };

  type page1Params = {
    entity: CbUser;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page2Params = {
    entity: CbStore;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page3Params = {
    entity: CbOrderInfo;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page4Params = {
    entity: CbNotice;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page5Params = {
    entity: CbCoupon;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page6Params = {
    entity: CbCard;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page7Params = {
    entity: AdminUserVo;
    searchVo: SearchVO;
    page: PageVO;
  };

  type pageParams = {
    entity: CbVenue;
    searchVo: SearchVO;
    page: PageVO;
  };

  type PageVO = {
    pageNumber?: number;
    pageSize?: number;
    sort?: string;
    order?: string;
    notConvert?: boolean;
  };

  type refreshTokenParams = {
    refreshToken: string;
  };

  type ResultMessage = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: Record<string, any>;
  };

  type ResultMessageAdminUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: AdminUser;
  };

  type ResultMessageCbCard = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CbCard;
  };

  type ResultMessageCbCoupon = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CbCoupon;
  };

  type ResultMessageCbNotice = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CbNotice;
  };

  type ResultMessageCbOrderInfo = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CbOrderInfo;
  };

  type ResultMessageCbStore = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CbStore;
  };

  type ResultMessageCbUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CbUser;
  };

  type ResultMessageCbVenue = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CbVenue;
  };

  type ResultMessageIPageAdminUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageAdminUser;
  };

  type ResultMessageIPageCbCard = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageCbCard;
  };

  type ResultMessageIPageCbCoupon = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageCbCoupon;
  };

  type ResultMessageIPageCbNotice = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageCbNotice;
  };

  type ResultMessageIPageCbOrderInfo = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageCbOrderInfo;
  };

  type ResultMessageIPageCbStore = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageCbStore;
  };

  type ResultMessageIPageCbUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageCbUser;
  };

  type ResultMessageIPageCbVenue = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageCbVenue;
  };

  type ResultMessageObject = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: Record<string, any>;
  };

  type ResultMessageToken = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Token;
  };

  type SearchVO = {
    selecte?: Record<string, any>;
    startDate?: string;
    endDate?: string;
    convertEndDate?: string;
    convertStartDate?: string;
  };

  type Token = {
    accessToken?: string;
    refreshToken?: string;
  };
}
