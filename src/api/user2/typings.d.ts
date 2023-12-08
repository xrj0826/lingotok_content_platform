declare namespace API {
  type adminCardRefundParams = {
    orderId: string;
  };

  type adminRefundParams = {
    paymentMethod: string;
    sn: string;
  };

  type bookStatusParams = {
    id: number;
    dateTime: string;
  };

  type callback1Params = {
    paymentMethod: string;
  };

  type callbackParams = {
    paymentMethod: string;
  };

  type Card = {
    id?: number;
    createBy?: string;
    createTime?: string;
    updateBy?: string;
    updateTime?: string;
    deleteFlag?: number;
    cardName?: string;
    cardType?: string;
    days?: number;
    startDate?: string;
    endDate?: string;
    faceValue?: number;
    bonusAmount?: number;
    currentBalance?: number;
    userId?: string;
    storeId?: number;
    discountValue?: number;
    times?: number;
    orderId?: string;
  };

  type cardRefundParams = {
    orderId: string;
  };

  type CardVo = {
    cardName?: string;
    cardType?: string;
    days?: number;
    startDate?: string;
    endDate?: string;
    faceValue?: number;
    bonusAmount?: number;
    currentBalance?: number;
    times?: number;
    /** 详情简介 */
    detailedIntroduction?: string;
    /** 使用说明 */
    usageInstructions?: string;
    orderId?: string;
  };

  type CbCardAdmin = {
    /** id */
    id?: number;
    /** 卡名称 */
    cardName?: string;
    /** 卡类型（储值卡，月卡，次卡，散客储值卡枚举） */
    cardType?: string;
    /** 有效期 */
    days?: number;
    /** 面值 */
    faceValue?: number;
    /** 赠送金额 */
    bonusAmount?: number;
    /** 折扣值 */
    discountValue?: number;
    /** 创建时间 */
    createTime?: string;
    /** 次卡次数 */
    times?: number;
    /** 详情简介 */
    detailedIntroduction?: string;
    /** 使用说明 */
    usageInstructions?: string;
    /** 生效日期 */
    startDate?: string;
    /** 结束日期 */
    endDate?: string;
  };

  type checkSmsParams = {
    /** 手机号 */
    mobile: string;
    /** 验证码 */
    code: string;
  };

  type CouponUser = {
    id?: number;
    createBy?: string;
    createTime?: string;
    deleteFlag?: boolean;
    updateBy?: string;
    updateTime?: string;
    userId?: number;
    couponId?: number;
    effective?: number;
    illustrate?: string;
  };

  type deleteUsingGETParams = {
    objectName: string;
  };

  type generateCardOrderParams = {
    accessToken: string;
  };

  type generateOrderParams = {
    accessToken: string;
  };

  type getChargeCardOrderParams = {
    accessToken: string;
    cardId: number;
    currentBalance: number;
  };

  type getCodeParams = {
    userId: string;
  };

  type getCourtDetailsParams = {
    id: number;
  };

  type getlimitParams = {
    wxaccessToken: string;
    page: string;
  };

  type getQrCodeByCardParams = {
    cardId: string;
  };

  type getSmsCodeParams = {
    /** 手机号 */
    mobile: string;
    verificationEnums: 'LOGIN' | 'REGISTER' | 'FIND_USER' | 'UPDATE_PASSWORD' | 'WALLET_PASSWORD';
  };

  type getTimerParams = {
    userId: string;
  };

  type getUnlimitedParams = {
    wxaccessToken: string;
    page: string;
    scene: string;
    checkPath: string;
    envVersion: string;
  };

  type hardwareParams = {
    data: string;
  };

  type MemberSmsLoginDto = {
    uuid?: string;
    mobile?: string;
  };

  type OrderCardReq = {
    cardId?: number;
    storeId?: number;
  };

  type OrderReq = {
    venueId?: number;
    storeId?: number;
    storeName?: string;
    address?: string;
    orderDate?: string;
    /** 预约开始时间 */
    orderSt?: string;
    /** 预约结束时间 */
    orderEd?: string;
    orderType?: string;
    phoneNumber?: string;
    orderPrice?: number;
    id?: number;
    relevancyId?: string;
  };

  type paymentParams = {
    paymentMethod: string;
    paymentClient: string;
    sn: string;
  };

  type personCardPayParams = {
    orderId: string;
    cardId: number;
  };

  type phone1Params = {
    phoneNumber: string;
    openId: string;
  };

  type processRefundParams = {
    paymentMethod: string;
    sn: string;
  };

  type queryUserByIdParams = {
    id: string;
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

  type ResultMessageCardVo = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CardVo;
  };

  type ResultMessageCouponUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: CouponUser;
  };

  type ResultMessageListCard = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: Card[];
  };

  type ResultMessageListCbCardAdmin = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: CbCardAdmin[];
  };

  type ResultMessageListString = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: string[];
  };

  type ResultMessageLong = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: number;
  };

  type ResultMessageMapStringObject = {
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

  type ResultMessageMemberSmsLoginDto = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: MemberSmsLoginDto;
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

  type ResultMessageStoreDetailsVo = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: StoreDetailsVo;
  };

  type ResultMessageString = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: string;
  };

  type ResultMessageUpdateUserForm = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: UpdateUserForm;
  };

  type ResultMessageUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: User;
  };

  type showAllCardParams = {
    cardTypeEnum: 'STORED_VALUE' | 'MONTHLY' | 'TICKET' | 'PERSON_CARD';
  };

  type showCardDetailsParams = {
    id: number;
  };

  type showCardParams = {
    id: number;
    cardTypeEnum: 'STORED_VALUE' | 'MONTHLY' | 'TICKET' | 'PERSON_CARD';
  };

  type showMyCardParams = {
    id: number;
    cardTypeEnum: 'STORED_VALUE' | 'MONTHLY' | 'TICKET' | 'PERSON_CARD';
  };

  type showMyCouponParams = {
    accessToken: string;
  };

  type showOrderByTypeParams = {
    id: string;
    orderTypeEnum: 'RENTAL' | 'TICKET' | 'TIMER';
  };

  type showOrderParams = {
    id: string;
  };

  type StoreDetailsVo = {
    storeVo?: StoreVo;
    venueList?: Venue[];
  };

  type StoreVo = {
    storeName?: string;
    address?: string;
    venueIntroduction?: string;
    openingTime?: string;
    closingTime?: string;
    serviceHotline?: string;
    wxCode?: string;
    realTime?: string;
    advanceDays?: string;
    leadTime?: number;
    announcement?: string;
    scheduledNotice?: string;
  };

  type timeCardParams = {
    accessToken: string;
  };

  type UpdateUserForm = {
    id: string;
    createBy?: string;
    createTime?: string;
    updateBy?: string;
    updateTime?: string;
    deleteFlag?: boolean;
    openId?: string;
    avatar?: string;
    nickName?: string;
    phoneNumber?: string;
    birthday?: string;
    sex?: number;
    email?: string;
    credit?: number;
    name?: string;
    status?: boolean;
  };

  type updateUserParams = {
    accessToken: string;
  };

  type upload1Params = {
    file: string[];
    moudle: string;
  };

  type uploadParams = {
    moudle: string;
  };

  type User = {
    id: string;
    createBy?: string;
    createTime?: string;
    updateBy?: string;
    updateTime?: string;
    deleteFlag?: boolean;
    openId?: string;
    avatar?: string;
    nickName?: string;
    phoneNumber?: string;
    /** 生日 */
    birthday?: string;
    sex?: number;
    email?: string;
    credit?: number;
    name?: string;
    status?: boolean;
  };

  type valueCardPayParams = {
    orderId: string;
    cardId: number;
  };

  type Venue = {
    id?: number;
    createBy?: string;
    createTime?: string;
    updateBy?: string;
    updateTime?: string;
    deleteFlag?: number;
    venueName?: string;
    storeId?: number;
    amHalfPrice?: number;
    pmHalfPrice?: number;
    amAllPrice?: number;
    pmAllPrice?: number;
    relevancyId?: string;
    purchaseInstructions?: string;
    specialValue?: string;
    venueType?: string;
    leadTime?: number;
    /** 场地分享次数 */
    shareFrequency?: number;
  };

  type WechatMPLoginParams = {
    appid?: string;
    code?: string;
    signature?: string;
    sessionKey?: string;
    rawData?: string;
    encryptedData?: string;
    iv?: string;
    image?: string;
    nickName?: string;
    openId?: string;
    invitedCode?: string;
  };
}
