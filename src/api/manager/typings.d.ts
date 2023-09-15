declare namespace API {
  type accessProjectPageParams = {
    status:
      | 'ON_CHECK'
      | 'RE_EXAMINATION'
      | 'REJECT'
      | 'WAIT_PAY'
      | 'BIDDING'
      | 'WAIT_BEGAN'
      | 'COLLABORATING'
      | 'CHECKING'
      | 'COMPLETE'
      | 'WAIT_REVIEW'
      | 'FINISH'
      | 'CANCEL';
    pageVO: PageVO;
  };

  type addJobTagsParams = {
    fatherId: string;
  };

  type AdminUser = {
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
    /** 用户名 */
    username?: string;
    /** 密码 */
    password?: string;
    /** 性别 */
    sex?: string;
    /** 昵称 */
    nickName?: string;
    /** 手机 */
    mobile?: string;
    /** 邮件 */
    email?: string;
    /** 用户头像 */
    avatar?: string;
    /** 是否是超级管理员 超级管理员/普通管理员 */
    isSuper?: boolean;
    /** 状态 默认true正常 false禁用 */
    status?: boolean;
    /** 描述/详情/备注 */
    description?: string;
    /** 角色id集合 */
    roleIds?: string;
  };

  type AdminUserDTO = {
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
    /** 用户名 */
    username?: string;
    /** 密码 */
    password?: string;
    /** 昵称 */
    nickName?: string;
    /** 手机 */
    mobile?: string;
    /** 邮件 */
    email?: string;
    /** 头像 */
    avatar?: string;
    /** 描述/详情/备注 */
    description?: string;
    /** 所属部门id */
    departmentId?: string;
    /** 是否为超级管理员 */
    isSuper?: boolean;
  };

  type AdminUserVO = {
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
    /** 用户名 */
    username?: string;
    /** 密码 */
    password?: string;
    /** 性别 */
    sex?: string;
    /** 昵称 */
    nickName?: string;
    /** 手机 */
    mobile?: string;
    /** 邮件 */
    email?: string;
    /** 用户头像 */
    avatar?: string;
    /** 是否是超级管理员 超级管理员/普通管理员 */
    isSuper?: boolean;
    /** 状态 默认true正常 false禁用 */
    status?: boolean;
    /** 描述/详情/备注 */
    description?: string;
    /** 角色id集合 */
    roleIds?: string;
    /** 所属部门名称 */
    departmentTitle?: string;
    /** 用户拥有角色 */
    roles?: Role[];
    /** 用户拥有的权限 */
    menus?: Menu[];
  };

  type Announcement = {
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
    /** 公告内容 */
    content?: string;
    /** 公告图片 */
    image?: string;
    /** 公告标题 */
    title?: string;
    /** 是否置顶,true置顶 */
    onTop?: boolean;
  };

  type Answer = {
    /** 验收简述 */
    answer?: string;
    /** 回答附件 */
    file?: File[];
    /** 提交时间 */
    submitTime?: string;
  };

  type ApprovalRecord = {
    /** 时间 */
    time?: string;
    /** 状态 */
    status?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    /** 描述 */
    description?: string;
  };

  type approveProjectPageParams = {
    pageVO: PageVO;
  };

  type Arbitration = {
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
    /** 仲裁类型 */
    arbitrationType?: 'ESC' | 'REDUCE';
    /** 仲裁发起人ID */
    initiatorUserId?: string;
    /** 专属客服ID */
    serviceId?: string;
    /** 任务ID */
    projectId?: string;
    /** 仲裁结果 */
    reason?: string;
    /** 仲裁结果 */
    result?: string;
    /** 仲裁状态 1：正在处理  0：处理完毕 */
    status?: boolean;
  };

  type ArbitrationResult = {
    /** 是否继续合作 */
    keepOn?: boolean;
    /** 是否需要分账/退款 */
    sub?: boolean;
    /** 雇主分账得 */
    employeeGet?: number;
    /** 职业者分账得 */
    employerGet?: number;
    /** 新预算 */
    newBudget?: number;
    /** 原预算 */
    oldBudget?: number;
    /** 仲裁结果 */
    finalResult?: string;
  };

  type AuthenticationData = {
    /** 真实姓名 */
    name?: string;
    /** 身份证号 */
    idCardNo?: string;
    /** 公司名称 */
    companyName?: string;
    /** 社会统一信用编码 */
    creditGeneration?: string;
  };

  type BidRecordVO = {
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
    employeeVO?: EmployeeVO;
    /** 任务ID */
    taskId?: string;
    /** 报价 */
    quote?: number;
    /** 需要时间 */
    requiredTime?: number;
    /** 回答 */
    answer?: string;
    /** 原因 */
    reason?: string;
    /** 文件 */
    file?: File[];
    /** 状态 */
    status?: string;
  };

  type Certificate = {
    /** 证书名称 */
    certificate?: string;
    file?: File;
    /** 认证状态 */
    certificationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
  };

  type Contact = true;

  type delAllByIdsParams = {
    ids: string[];
  };

  type deleteAnnouncementListParams = {
    /** ID集合 */
    ids: string;
  };

  type deleteAnnouncementParams = {
    id: string;
  };

  type deleteMenuParams = {
    id: string;
  };

  type deleteMenusParams = {
    /** ID集合 */
    ids: string;
  };

  type disableParams = {
    /** 用户唯一id标识 */
    userId: string;
    status: boolean;
  };

  type editOwnerParams = {
    adminUser: AdminUser;
  };

  type editParams = {
    roles?: string[];
  };

  type editPasswordParams = {
    password: string;
    newPassword: string;
  };

  type Education = {
    /** 学历阶段 */
    grade?: string;
    /** 证书编号 */
    certificateNo?: string;
    /** 认证状态 */
    certificationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
  };

  type EducationExperience = {
    /** 学校名称 */
    schoolName?: string;
    education?: Education;
    /** 专业 */
    speciality?: string;
    /** 入学时间 */
    startTime?: string;
    /** 毕业时间 */
    endTime?: string;
    /** 证书 */
    certificate?: Certificate[];
  };

  type EmployeeVO = {
    /** 职业者ID */
    freelancerId?: string;
    /** 投标者用户名 */
    username?: string;
    /** 投标者昵称 */
    nickname?: string;
    /** 头像 */
    face?: string;
    evaluationVO?: EvaluationVO;
    /** 认证状态 */
    authenticationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    employeeProject?: EmpProjectVO;
  };

  type employerPageParams = {
    status: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    pageVO: PageVO;
  };

  type EmpProjectVO = {
    /** 任务经验 */
    projectNum?: number;
    serviceNum?: number;
    bidNum?: number;
    finishNum?: number;
    putNum?: number;
  };

  type ErrorUser = {
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
    /** 触发异常的一方用户ID/消息发送者 */
    userId1?: string;
    /** 触发异常的一另方用户ID/消息接送者 */
    userId2?: string;
    /** 订单ID */
    orderId?: string;
    /** 异常类型 */
    errorType?: 'CHAT_BAN' | 'OFFLINE_TRADE' | 'OTHER';
    /** 处理状态 */
    status?: boolean;
    /** 处理备注 */
    comment?: string;
    /** 触发异常内容 */
    sensitiveComment?: string;
  };

  type EvaluationVO = {
    /** 被评价人ID */
    evaluatedId?: string;
    /** 评价均值 */
    ratingAvg?: number;
    /** 评价人数 */
    num?: number;
  };

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

  type getAnnouncementDetailParams = {
    id: string;
  };

  type getAnnouncementListParams = {
    entity: Announcement;
    page: PageVO;
  };

  type getByConditionParams = {
    user: AdminUserDTO;
    pageVo: PageVO;
  };

  type getByUserIdParams = {
    userId: string;
  };

  type getMenuDetailParams = {
    id: number;
  };

  type getMenuListParams = {
    entity: Menu;
    searchVo: SearchVO;
    page: PageVO;
  };

  type getOrderListParams = {
    entity: PaymentOrder;
    page: PageVO;
  };

  type getParams = {
    id: string;
  };

  type getRoleListParams = {
    entity: Role;
    searchVo: SearchVO;
    page: PageVO;
  };

  type getUserWalletListParams = {
    entity: UserWallet;
    page: PageVO;
  };

  type handle1Params = {
    /** sn */
    sn: string;
    /** 是否批准 */
    result: boolean;
    /** 审核原因/意见 */
    reason: string;
  };

  type handleArbitrationParams = {
    arbitrationId: string;
    result: ArbitrationResult;
  };

  type handleCertificateParams = {
    profileDataId: string;
    jsonb: Jsonb;
    approvalStatusType: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
  };

  type handleEmployerParams = {
    employerId: string;
    approvalRecord: ApprovalRecord;
  };

  type handleParams = {
    projectId: string;
    approvalRecord: ApprovalRecord;
  };

  type handleProfileDataParams = {
    profileDataId: string;
    approvalRecord: ApprovalRecord;
  };

  type handlerUser1Params = {
    errorUser: ErrorUser;
  };

  type handlerUserParams = {
    userId: string;
    status: boolean;
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

  type inUsingPUTParams = {
    groupId: string;
  };

  type IPageAdminUserVO = {
    size?: number;
    current?: number;
    total?: number;
    records?: AdminUserVO[];
    pages?: number;
  };

  type IPageAnnouncement = {
    size?: number;
    current?: number;
    total?: number;
    records?: Announcement[];
    pages?: number;
  };

  type IPageArbitration = {
    size?: number;
    current?: number;
    total?: number;
    records?: Arbitration[];
    pages?: number;
  };

  type IPageErrorUser = {
    size?: number;
    current?: number;
    total?: number;
    records?: ErrorUser[];
    pages?: number;
  };

  type IPageMenu = {
    size?: number;
    current?: number;
    total?: number;
    records?: Menu[];
    pages?: number;
  };

  type IPagePaymentOrder = {
    size?: number;
    current?: number;
    total?: number;
    records?: PaymentOrder[];
    pages?: number;
  };

  type IPageProjectVO = {
    size?: number;
    current?: number;
    total?: number;
    records?: ProjectVO[];
    pages?: number;
  };

  type IPageRole = {
    size?: number;
    current?: number;
    total?: number;
    records?: Role[];
    pages?: number;
  };

  type IPageUser = {
    size?: number;
    current?: number;
    total?: number;
    records?: User[];
    pages?: number;
  };

  type IPageUserVO = {
    size?: number;
    current?: number;
    total?: number;
    records?: UserVO[];
    pages?: number;
  };

  type IPageUserWalletVO = {
    size?: number;
    current?: number;
    total?: number;
    records?: UserWalletVO[];
    pages?: number;
  };

  type JobTags = {
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
    /** 父级标签 */
    fatherId?: string;
    /** 标签名称 */
    tagName?: string;
    /** 是否为系统标签 */
    sysTag?: boolean;
  };

  type Jsonb = {
    /** 列名 */
    column?: string;
    /** 字段名 */
    filed?: string;
    /** 索引 */
    index?: number;
    /** 字段索引 */
    filedIndex?: number;
  };

  type loginParams = {
    username: string;
    password: string;
    uuid: string;
  };

  type Member = {
    member_Account?: string;
  };

  type Menu = {
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
    /** 说明备注 */
    description?: string;
    /** 前端路由 */
    frontRoute?: string;
    /** 图标 */
    icon?: string;
    /** 层级 */
    level?: number;
    /** 菜单/权限名称 */
    name?: string;
    /** 父ID */
    parentId?: string;
    /** 赋权API地址，正则表达式 */
    path?: string;
    /** 排序值 */
    sortOrder?: number;
    /** 菜单标题 */
    title?: string;
    /** 文件地址 */
    frontComponent?: string;
    /** 权限URL */
    permission?: string;
  };

  type MenuVO = {
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
    /** 说明备注 */
    description?: string;
    /** 前端路由 */
    frontRoute?: string;
    /** 图标 */
    icon?: string;
    /** 层级 */
    level?: number;
    /** 菜单/权限名称 */
    name?: string;
    /** 父ID */
    parentId?: string;
    /** 赋权API地址，正则表达式 */
    path?: string;
    /** 排序值 */
    sortOrder?: number;
    /** 菜单标题 */
    title?: string;
    /** 文件地址 */
    frontComponent?: string;
    /** 权限URL */
    permission?: string;
    /** 子菜单 */
    children?: MenuVO[];
  };

  type modifyPassParams = {
    /** 手机号 */
    phone: string;
    /** 新密码 */
    newPassword: string;
    /** 验证码 */
    code: string;
    uuid: string;
  };

  type page1Params = {
    in: boolean;
  };

  type pageParams = {
    entity: Arbitration;
    page: PageVO;
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

  type PaymentOrder = {
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
    /** 名称 */
    name?: string;
    /** 订单类型 */
    orderType?:
      | 'BID_COIN'
      | 'PROJECT_SETTLEMENT'
      | 'PROJECT_DEDUCTION'
      | 'WITHDRAW'
      | 'PLATFORM_WITHDRAW';
    /** 订单编号 */
    sn?: string;
    /** 支付方式 */
    paymentMethod?: string;
    /** 支付金额 */
    amount?: number;
    /** 退款金额 */
    refundAmount?: number;
    /** 可退款金额 */
    refundableAmount?: number;
    /** 用户ID */
    userId?: string;
    /** 付款状态,UNPAID("待付款"),
    PAID("已付款"),
    CANCEL("已取消"); */
    paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED' | 'PENDING' | 'PASS' | 'ACCOUNTED' | 'CANCEL';
    /** 付款时间 */
    paymentTime?: string;
    /** 订单结束时间 */
    endTime?: string;
    /** 支付方式返回的交易号 */
    transactionId?: string;
    /** 支持的支付方式 */
    supportList?: string;
    /** 支付方 */
    payer?: string;
    /** 项目ID */
    projectId?: string;
    /** 描述信息 */
    description?: string;
    /** mallBook订单号 */
    mallbookOrderId?: string;
    /** 处理人 */
    handler?: string;
    /** 原因/意见 */
    reason?: string;
    /** 商品数量 */
    commodityQuantity?: number;
    /** 项目服务费 */
    serviceCharge?: number;
    /** 任务款 */
    projectFund?: number;
    /** 服务费是否已结算 */
    serviceSettlement?: boolean;
  };

  type platformWithdrawalListParams = {
    entity: PaymentOrder;
    page: PageVO;
  };

  type preHandleParams = {
    arbitrationId: string;
    /** 是否继续合作 */
    keepOn: boolean;
  };

  type ProfileData = {
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
    /** 用户ID */
    userId?: string;
    /** 工作经历（JSON） */
    workExperience?: WorkExperience[];
    /** 项目经验（JSON） */
    projectExperience?: ProjectExperience[];
    /** 教育经历（JSON） */
    educationExperience?: EducationExperience[];
    /** 薪资期望（JSON） */
    salaryExpectation?: SalaryExpectation[];
    /** 资格证书（JSON） */
    qualificationCertificate?: QualificationCertificate[];
    /** 可工作内容 */
    workContents?: string;
    /** 审核状态 */
    approvalStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    /** 审核记录值 */
    approvalRecord?: ApprovalRecord[];
  };

  type profileDataPageParams = {
    status: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    pageVO: PageVO;
  };

  type ProjectExperience = {
    /** 项目名称 */
    projectName?: string;
    /** 工作职责 */
    responsibility?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 简介 */
    profile?: string;
    /** 图片资料 */
    data?: File[];
  };

  type projectPageParams = {
    status:
      | 'ON_CHECK'
      | 'RE_EXAMINATION'
      | 'REJECT'
      | 'WAIT_PAY'
      | 'BIDDING'
      | 'WAIT_BEGAN'
      | 'COLLABORATING'
      | 'CHECKING'
      | 'COMPLETE'
      | 'WAIT_REVIEW'
      | 'FINISH'
      | 'CANCEL';
    pageVO: PageVO;
  };

  type ProjectVO = {
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
    /** 雇主ID */
    employerId?: string;
    /** 标题 */
    title?: string;
    /** 详情 */
    details?: string;
    /** 工期 */
    duration?: number;
    /** 投标截止时间 */
    bidDeadline?: string;
    /** 接收投标人数 */
    maxBidCount?: number;
    /** 项目预算 */
    budget?: number;
    /** 订单类型 */
    orderType?:
      | 'BID_COIN'
      | 'PROJECT_SETTLEMENT'
      | 'PROJECT_DEDUCTION'
      | 'WITHDRAW'
      | 'PLATFORM_WITHDRAW';
    /** 职业者ID */
    freelancerId?: string;
    question?: Question;
    /** 需求附件 (JSONB) */
    attachments?: File[];
    /** 状态 */
    status?:
      | 'ON_CHECK'
      | 'RE_EXAMINATION'
      | 'REJECT'
      | 'WAIT_PAY'
      | 'BIDDING'
      | 'WAIT_BEGAN'
      | 'COLLABORATING'
      | 'CHECKING'
      | 'COMPLETE'
      | 'WAIT_REVIEW'
      | 'FINISH'
      | 'CANCEL';
    /** 验收描述 */
    acceptanceDescription?: string;
    acceptanceAttachments?: Answer;
    /** 审核记录 */
    approvalRecord?: ApprovalRecord[];
    /** 验收审核记录 */
    acceptanceReview?: ApprovalRecord[];
    /** 工作标签 */
    jobTags?: JobTags[];
    /** 投标列表 */
    bidRecords?: BidRecordVO[];
    /** 专属客服 */
    serviceId?: string;
    /** 可修改字段 */
    modifiable?: string[];
    /** 投标状态 */
    bidStatus?: boolean;
    /** 封面图 */
    image?: string;
    /** 合同 */
    contract?: string;
    /** 是否评价 */
    evolution?: boolean;
    /** 职业者信息 */
    employeeName?: string;
    /** 发布者信息 */
    employerName?: string;
  };

  type QualificationCertificate = {
    /** 证书名称 */
    certificateName?: string;
    /** 证书编号 */
    certificateNum?: string;
    file?: File;
    /** 认证状态 */
    certificationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
  };

  type Question = {
    /** 问题描述 */
    question?: string;
    /** 提问附件 */
    questionFile?: File[];
  };

  type registerParams = {
    roles?: string[];
  };

  type resetPasswordParams = {
    ids: Record<string, any>[];
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

  type ResultMessageAnnouncement = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Announcement;
  };

  type ResultMessageArbitration = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Arbitration;
  };

  type ResultMessageArbitrationResult = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: ArbitrationResult;
  };

  type ResultMessageBoolean = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: boolean;
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

  type ResultMessageIPageAdminUserVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageAdminUserVO;
  };

  type ResultMessageIPageAnnouncement = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageAnnouncement;
  };

  type ResultMessageIPageArbitration = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageArbitration;
  };

  type ResultMessageIPageErrorUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageErrorUser;
  };

  type ResultMessageIPageMenu = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageMenu;
  };

  type ResultMessageIPagePaymentOrder = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPagePaymentOrder;
  };

  type ResultMessageIPageProjectVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageProjectVO;
  };

  type ResultMessageIPageRole = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageRole;
  };

  type ResultMessageIPageUser = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageUser;
  };

  type ResultMessageIPageUserVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageUserVO;
  };

  type ResultMessageIPageUserWalletVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageUserWalletVO;
  };

  type ResultMessageListImConversation = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: ImConversation[];
  };

  type ResultMessageListMenuVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: MenuVO[];
  };

  type ResultMessageMenu = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Menu;
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

  type ResultMessageUserVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: UserVO;
  };

  type ResultMessageUserWalletVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: UserWalletVO;
  };

  type Role = {
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
    /** 角色名称 */
    roleName?: string;
  };

  type SalaryExpectation = {
    /** 行业名称 */
    industryName?: string;
    /** 薪资详情 */
    salaryDetail?: string;
  };

  type saveConfigParams = {
    key: string;
  };

  type SearchVO = {
    selecte?: Record<string, any>;
    startDate?: string;
    endDate?: string;
    convertStartDate?: string;
    convertEndDate?: string;
  };

  type settingGetParams = {
    key: string;
  };

  type Token = {
    accessToken?: string;
    refreshToken?: string;
  };

  type User = {
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
    /** 用户名 */
    username?: string;
    /** 手机号 */
    mobile?: string;
    /** 邮箱 */
    email?: string;
    /** 其它联系方式 */
    otherContact?: Contact[];
    /** 性别 */
    sex?: number;
    /** 用户昵称 */
    nickName?: string;
    /** 最后一次登录时间 */
    lastLoginTime?: string;
    /** 用户状态 */
    disabled?: boolean;
    /** 头像 */
    face?: string;
    /** 微信openId */
    openid?: string;
    /** 密码 */
    password?: string;
    /** 评价均值 */
    ratingAvg?: number;
    /** 角色id */
    roleId?: string;
    /** 身份证号码 */
    idCardNo?: string;
    authenticationData?: AuthenticationData;
    /** 认证类型 */
    authenticationType?: 'ENTERPRISE' | 'PERSON';
    /** 认证状态 */
    authenticationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    /** 审核记录值 */
    approvalRecord?: ApprovalRecord[];
    /** 是否提交简历 */
    profile?: boolean;
  };

  type userErrorPageParams = {
    errorUser: ErrorUser;
    pageVO: PageVO;
  };

  type userPageParams = {
    user: User;
    pageVO: PageVO;
  };

  type UserVO = {
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
    /** 是否收藏 */
    liked?: boolean;
    /** 用户名 */
    username?: string;
    /** 手机号 */
    mobile?: string;
    /** 邮箱 */
    email?: string;
    otherContact?: Contact;
    /** 性别 */
    sex?: number;
    /** 用户昵称 */
    nickName?: string;
    /** 最后一次登录时间 */
    lastLoginTime?: string;
    /** 用户状态 */
    disabled?: boolean;
    /** 头像 */
    face?: string;
    /** 身份证号码 */
    idCardNo?: string;
    /** 角色名称 */
    roleName?: string;
    /** 评价均值 */
    ratingAvg?: number;
    authenticationData?: AuthenticationData;
    /** 认证状态 */
    authenticationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    /** 认证类型 */
    authenticationType?: 'ENTERPRISE' | 'PERSON';
    /** 审核记录值 */
    approvalRecord?: ApprovalRecord[];
    evaluationVO?: EvaluationVO;
    empProjectVO?: EmpProjectVO;
    /** 工作标签 */
    jobTags?: JobTags[];
    profileData?: ProfileData;
    /** 工作标签 */
    jobTagsList?: JobTags[];
  };

  type UserWallet = {
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
    /** 用户id */
    userId?: string;
    /** 用户名 */
    userName?: string;
    /** 总余额 */
    totalBalance?: number;
    /** 可提现余额 */
    withdrawable?: number;
    /** 冻结余额 */
    freeze?: number;
    /** 投标币 */
    tenderCurrency?: number;
    /** 赠送投标币 */
    giftBidCoin?: number;
    /** 赠送时间 */
    giftTime?: string;
    /** 交易密码 */
    walletPassword?: string;
    /** 子商户编号 */
    subMerchantId?: string;
    /** 银行卡开户名 */
    cardName?: string;
    /** 银行卡号 */
    cardNo?: string;
    /** 手机号 */
    phone?: string;
    /** 绑定状态，TRUE已设置，FALSE未设置 */
    bindStatus?: boolean;
    /** 密码状态,TRUE已设置，FALSE未设置 */
    passwordStatus?: boolean;
  };

  type UserWalletDetailVO = {
    /** 收入 */
    income?: number;
    /** 支出 */
    expenditure?: number;
    /** 总结余 */
    balance?: number;
  };

  type UserWalletVO = {
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
    /** 用户id */
    userId?: string;
    /** 用户名 */
    userName?: string;
    /** 总余额 */
    totalBalance?: number;
    /** 可提现余额 */
    withdrawable?: number;
    /** 冻结余额 */
    freeze?: number;
    /** 投标币 */
    tenderCurrency?: number;
    /** 赠送投标币 */
    giftBidCoin?: number;
    /** 赠送时间 */
    giftTime?: string;
    /** 交易密码 */
    walletPassword?: string;
    /** 子商户编号 */
    subMerchantId?: string;
    /** 银行卡开户名 */
    cardName?: string;
    /** 银行卡号 */
    cardNo?: string;
    /** 手机号 */
    phone?: string;
    /** 绑定状态，TRUE已设置，FALSE未设置 */
    bindStatus?: boolean;
    /** 密码状态,TRUE已设置，FALSE未设置 */
    passwordStatus?: boolean;
    userWalletDetailVO?: UserWalletDetailVO;
    /** 邮箱 */
    email?: string;
    /** 角色id */
    roleId?: string;
    /** 认证状态 */
    authenticationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    authenticationData?: AuthenticationData;
  };

  type WorkExperience = {
    /** 公司名称 */
    companyName?: string;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 岗位 */
    post?: string;
    /** 工作内容 */
    jobContent?: string;
    /** 图片资料 */
    data?: File[];
  };
}
