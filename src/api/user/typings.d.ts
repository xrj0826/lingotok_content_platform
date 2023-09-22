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
  };

  type delAllByIdsParams = {
    ids: string[];
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

  type getParams = {
    id: number;
  };

  type IPageAdminUser = {
    size?: number;
    total?: number;
    records?: AdminUser[];
    current?: number;
    pages?: number;
  };

  type IPageCbCard = {
    size?: number;
    total?: number;
    records?: CbCard[];
    current?: number;
    pages?: number;
  };

  type IPageCbNotice = {
    size?: number;
    total?: number;
    records?: CbNotice[];
    current?: number;
    pages?: number;
  };

  type IPageCbStore = {
    size?: number;
    total?: number;
    records?: CbStore[];
    current?: number;
    pages?: number;
  };

  type IPageCbVenue = {
    size?: number;
    total?: number;
    records?: CbVenue[];
    current?: number;
    pages?: number;
  };

  type loginParams = {
    username: string;
    password: string;
  };

  type page1Params = {
    entity: CbStore;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page2Params = {
    entity: CbNotice;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page3Params = {
    entity: CbCard;
    searchVo: SearchVO;
    page: PageVO;
  };

  type page4Params = {
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
