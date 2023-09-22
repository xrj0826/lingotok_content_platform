declare namespace API {
  type File = {
    /** 唯一标识 */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新者 */
    updateBy?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: boolean;
    /** 原文件名 */
    name?: string;
    /** 存储文件名 */
    fileKey?: string;
    /** 大小 */
    fileSize?: number;
    /** 文件类型 */
    fileType?: string;
    /** 路径 */
    url?: string;
    /** 拥有者id */
    ownerId?: string;
    /** 用户类型 */
    userEnums?: string;
  };

  type getFileDetailParams = {
    id: string;
  };

  type getFileListParams = {
    entity: File;
    searchVo: SearchVO;
    page: PageVO;
  };

  type getItemByLastNameParams = {
    lastName: string;
  };

  type getParams = {
    id: string;
  };

  type getRegionItemParams = {
    /** 地区ID */
    id: string;
  };

  type getRegionParams = {
    /** 城市code */
    cityCode: string;
    /** 镇名称 */
    townName: any;
  };

  type getSliderImageParams = {
    verificationEnums: 'LOGIN' | 'REGISTER' | 'FIND_USER' | 'UPDATE_PASSWORD' | 'WALLET_PASSWORD';
  };

  type getSmsCodeParams = {
    /** 手机号 */
    mobile: string;
    verificationEnums: 'LOGIN' | 'REGISTER' | 'FIND_USER' | 'UPDATE_PASSWORD' | 'WALLET_PASSWORD';
  };

  type getUser1Params = {
    userId: string;
    projectId: string;
  };

  type getUserParams = {
    userId: string;
  };

  type getUserSignatureParams = {
    userId: string;
  };

  type historyMessageByUserParams = {
    messageQueryParams: MessageQueryParams;
    userId1: string;
    userId2: string;
  };

  type historyMessageParams = {
    messageQueryParams: MessageQueryParams;
  };

  type ImConversation = {
    /** 唯一标识 */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新者 */
    updateBy?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: boolean;
    /** 会话类型 */
    conversationType?: string;
    /** 用户1 id */
    userId1?: string;
    /** 用户2 id */
    userId2?: string;
    /** 用户1 身份 */
    userRole1?: string;
    /** 用户2 身份 */
    userRole2?: string;
    /** 用户1置顶 */
    top1?: boolean;
    /** 用户2置顶 */
    top2?: boolean;
    /** 用户1 不可见 */
    disable1?: boolean;
    /** 用户2 不可见 */
    disable2?: boolean;
    /** 用户1名字 */
    username1?: string;
    /** 用户2名字 */
    username2?: string;
    /** 用户1昵称 */
    nickname1?: string;
    /** 用户2昵称 */
    nickname2?: string;
    /** 用户1头像 */
    face1?: string;
    /** 用户2头像 */
    face2?: string;
    /** 最后聊天时间 */
    lastConversationTime?: string;
    /** 最后聊天内容 */
    lastConversationContent?: string;
    /** 最后发送消息类型 */
    lastConversationType?: string;
    /** 项目ID */
    projectId?: string;
    /** 客服 */
    serviceId?: string;
    /** 成员ID */
    memberList?: Member[];
    /** 群Id */
    groupId?: string;
  };

  type ImConversationVO = {
    /** id */
    id?: string;
    /** 用户 id */
    userId?: string;
    /** 置顶 */
    top?: boolean;
    /** 用户 不可见 */
    disable?: boolean;
    /** 用户名字 */
    name?: string;
    /** 用户头像 */
    face?: string;
    /** 最后聊天内容 */
    lastTalkMessage?: string;
    /** 最后发送消息类型 */
    lastMessageType?: string;
    /** 未读数量 */
    unread?: number;
  };

  type ImImage = {
    height?: number;
    size?: number;
    url?: string;
    type?: number;
    width?: number;
  };

  type ImMessage = {
    /** 唯一标识 */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新者 */
    updateBy?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: boolean;
    /** 发送者 */
    fromUser?: string;
    /** 接受者 */
    toUser?: string;
    /** 已阅 */
    read?: boolean;
    /** 消息类型 */
    messageType?:
      | 'TIMTextElem'
      | 'TIMLocationElem'
      | 'TIMFaceElem'
      | 'TIMCustomElem'
      | 'TIMSoundElem'
      | 'TIMImageElem'
      | 'TIMFileElem'
      | 'TIMVideoFileElem'
      | 'TIMRelayElem';
    /** 会话ID */
    conversationId?: string;
    content?: MsgContent;
  };

  type IPageFile = {
    size?: number;
    records?: File[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type Member = {
    member_Account?: string;
  };

  type MessageQueryParams = {
    /** 页号 */
    pageNumber?: number;
    /** 页面大小 */
    pageSize?: number;
    /** 排序字段 */
    sort?: string;
    /** 排序方式 升序降序asc/desc */
    order?: string;
    /** 需要驼峰转换蛇形 */
    notConvert?: boolean;
    conversationId?: string;
    lastMessageId?: string;
  };

  type MsgContent = {
    text?: string;
    url?: string;
    fileSize?: number;
    uuid?: string;
    imageInfoArray?: ImImage[];
    imageFormat?: number;
    fileName?: string;
  };

  type PageVO = {
    /** 页号 */
    pageNumber?: number;
    /** 页面大小 */
    pageSize?: number;
    /** 排序字段 */
    sort?: string;
    /** 排序方式 升序降序asc/desc */
    order?: string;
    /** 需要驼峰转换蛇形 */
    notConvert?: boolean;
  };

  type Region = {
    /** 唯一标识 */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新者 */
    updateBy?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: boolean;
    /** 父id */
    parentId: string;
    /** 区域编码 */
    adCode: string;
    /** 城市代码 */
    cityCode?: string;
    /** 区域中心点经纬度 */
    center: string;
    /** 行政区划级别country:国家province:省份（直辖市会在province和city显示）city:市（直辖市会在province和city显示）district:区县street:街道 */
    level: string;
    /** 名称 */
    name: string;
    /** 行政地区路径，类似：1，2，3  */
    path: string;
    /** 排序 */
    orderNum: number;
  };

  type RegionVO = {
    /** 唯一标识 */
    id?: string;
    /** 创建者 */
    createBy?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新者 */
    updateBy?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 删除标志 true/false 删除/未删除 */
    deleteFlag?: boolean;
    /** 父id */
    parentId: string;
    /** 区域编码 */
    adCode: string;
    /** 城市代码 */
    cityCode?: string;
    /** 区域中心点经纬度 */
    center: string;
    /** 行政区划级别country:国家province:省份（直辖市会在province和city显示）city:市（直辖市会在province和city显示）district:区县street:街道 */
    level: string;
    /** 名称 */
    name: string;
    /** 行政地区路径，类似：1，2，3  */
    path: string;
    /** 排序 */
    orderNum: number;
    children?: RegionVO[];
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

  type ResultMessageFile = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: File;
  };

  type ResultMessageImConversation = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: ImConversation;
  };

  type ResultMessageIPageFile = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageFile;
  };

  type ResultMessageListImConversationVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: ImConversationVO[];
  };

  type ResultMessageListImMessage = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: ImMessage[];
  };

  type ResultMessageListRegion = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: Region[];
  };

  type ResultMessageListRegionVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: RegionVO[];
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

  type SearchVO = {
    selecte?: Record<string, any>;
    startDate?: string;
    endDate?: string;
    convertStartDate?: string;
    convertEndDate?: string;
  };

  type uploadContentParams = {
    file: string;
  };

  type verificationImageParams = {
    xPos: number;
    verificationEnums: 'LOGIN' | 'REGISTER' | 'FIND_USER' | 'UPDATE_PASSWORD' | 'WALLET_PASSWORD';
  };
}
