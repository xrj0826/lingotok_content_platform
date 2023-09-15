declare namespace API {
  type acceptBidParams = {
    bidRecordId: string;
  };

  type additionalProjectOrderParams = {
    projectId: string;
    amount: number;
  };

  type addJobTagsParams = {
    /** 关联的ID( / 项目Id / 简历Id) */
    relateId: string;
    /** 关联类型  [ / PROJECT / PROFILE] */
    relateType: 'PROFILE' | 'PROJECT';
  };

  type AfterSale = {
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
    /** 订单号 */
    sn?: string;
    /** 售后订单类型 */
    orderType?:
      | 'SERVICE_COMPLETE'
      | 'COMMISSION_COMPLETE'
      | 'WORKER_COMPLETE'
      | 'EMPLOYER_COMPLETE'
      | 'REFUND';
    /** 售后订单状态 */
    orderStatus?: 'PENDING' | 'CONFIRM' | 'REFUNDED' | 'COMPLETED' | 'CANCEL';
    /** 分账列表 */
    accountingList?: PaymentOrderUser[];
    /** 金额 */
    amount?: number;
    /** 成功时间 */
    successTime?: string;
    /** mallBook业务单号 */
    merOrderId?: string;
    /** 分账时间 */
    accountingTime?: string;
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

  type ArbitrationDTO = {
    /** 仲裁类型 */
    arbitrationType?: 'ESC' | 'REDUCE';
    /** 仲裁发起人ID */
    initiatorUserId?: string;
    /** 专属客服ID */
    serviceId?: string;
    /** 任务ID */
    projectId?: string;
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

  type BidRecord = {
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
    /** 职业者ID */
    freelancerId?: string;
    /** 状态 */
    status?: boolean;
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

  type BindVO = {
    /** 银行卡开户名 */
    cardName?: string;
    /** 银行卡号 */
    cardNo?: string;
    /** 手机号 */
    phone?: string;
  };

  type cancelEmployerProjectParams = {
    projectId: string;
  };

  type Certificate = {
    /** 证书名称 */
    certificate?: string;
    file?: File;
    /** 认证状态 */
    certificationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
  };

  type clearMobileParams = {
    /** 手机号 */
    mobile: string;
    /** 验证码 */
    code: string;
    uuid: string;
  };

  type commitEmployerProjectDetailParams = {
    userId: string;
  };

  type Contact = true;

  type createBidCoinOrderParams = {
    /** 数量 */
    number: number;
  };

  type createProjectOrderParams = {
    projectId: string;
  };

  type deleteEmployerProjectParams = {
    projectId: string;
  };

  type deleteEvaluationParams = {
    id: string;
  };

  type deleteProfileDataParams = {
    id: string;
    jsonb: Jsonb;
  };

  type deleteUsingDELETEParams = {
    /** ID集合 */
    ids: string;
  };

  type editOwnParams = {
    userEditDTO: UserEditDTO;
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

  type employeeAttachmentsParams = {
    projectId: string;
  };

  type employeeFeedbackParams = {
    projectId: string;
    feedback: boolean;
    contract: string;
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

  type employerAttachmentsParams = {
    projectId: string;
    approvalRecord: ApprovalRecord;
  };

  type EmployerVO = {
    /** 雇主ID */
    employerId?: string;
    /** 雇主用户名 */
    username?: string;
    /** 雇主昵称 */
    nickname?: string;
    /** 头像 */
    face?: string;
    evaluationVO?: EvaluationVO;
    /** 认证状态 */
    authenticationStatus?: 'UN_SUBMIT' | 'ON_CHECK' | 'PASS' | 'REJECT';
    employeeProject?: EmpProjectVO;
  };

  type EmpProjectVO = {
    /** 任务经验 */
    projectNum?: number;
    serviceNum?: number;
    bidNum?: number;
    finishNum?: number;
    putNum?: number;
  };

  type Evaluation = {
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
    /** 评价人ID */
    evaluatorId?: string;
    /** 评价人头像 */
    evaluatorFace?: string;
    /** 评价人昵称 */
    evaluatorNickname?: string;
    /** 被评价人ID */
    evaluatedId?: string;
    /** 被评价人头像 */
    evaluatedFace?: string;
    /** 关联项目ID */
    projectId?: string;
    /** 评分 (0-5) */
    rating?: number;
    /** 评价内容 */
    comment?: string;
    /** 文件 */
    file?: string;
    /** 评价类型 (自动AUTO，真人REAL) */
    evaluationType?: string;
  };

  type EvaluationVO = {
    /** 被评价人ID */
    evaluatedId?: string;
    /** 评价均值 */
    ratingAvg?: number;
    /** 评价人数 */
    num?: number;
  };

  type examineWalletPasswordParams = {
    password: string;
    amount: number;
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

  type generateContractParams = {
    projectId: string;
  };

  type get1Params = {
    id: string;
  };

  type getAnnouncementDetailParams = {
    id: string;
  };

  type getAnnouncementListParams = {
    entity: Announcement;
    page: PageVO;
  };

  type getBidDetailParams = {
    id: string;
  };

  type getBidListParams = {
    projectId: string;
  };

  type getByUserId1Params = {
    userId: string;
  };

  type getByUserIdParams = {
    userId: string;
  };

  type getCollectListParams = {
    queryParam: string;
    page: PageVO;
  };

  type getEmployeeByTagsParams = {
    /** 标签名集合 */
    queryParamList: string[];
    pageVO: PageVO;
  };

  type getEmployeeProjectDetailParams = {
    projectId: string;
  };

  type getEmployeeProjectListParams = {
    searchDTO: ProjectSearchParams;
    page: PageVO;
  };

  type getEmployerProjectDetailParams = {
    projectId: string;
  };

  type getEmployerProjectListParams = {
    searchDTO: ProjectSearchParams;
    page: PageVO;
  };

  type getEvaluationDetailParams = {
    id: string;
  };

  type getEvaluationListParams = {
    userId: string;
    pageVO: PageVO;
  };

  type getFrozenRecordsParams = {
    entity: WalletDetail;
    searchVo: SearchVO;
    page: PageVO;
  };

  type getJobTagsParams = {
    /** 关联的ID(  / 项目Id / 简历Id) */
    relateId: string;
    /** 关联类型  [  / PROJECT / PROFILE] */
    relateType: 'PROFILE' | 'PROJECT';
  };

  type getOrderListParams = {
    entity: PaymentOrder;
    searchVo: SearchVO;
    page: PageVO;
  };

  type getParams = {
    id: string;
  };

  type getProjectByTagsParams = {
    /** 标签名集合 */
    queryParamList: string[];
    pageVO: PageVO;
  };

  type getProjectEmployerDetailParams = {
    userId: string;
  };

  type getRoleListParams = {
    entity: Role;
    searchVo: SearchVO;
    page: PageVO;
  };

  type getSecondJobTagsParams = {
    id: string;
  };

  type getTalentDetailParams = {
    userId: string;
  };

  type IPageAnnouncement = {
    size?: number;
    records?: Announcement[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPageEvaluation = {
    size?: number;
    records?: Evaluation[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPageMemberMessage = {
    size?: number;
    records?: MemberMessage[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPagePaymentOrder = {
    size?: number;
    records?: PaymentOrder[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPageProjectVO = {
    size?: number;
    records?: ProjectVO[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPageRole = {
    size?: number;
    records?: Role[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPageUser = {
    size?: number;
    records?: User[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPageUserVO = {
    size?: number;
    records?: UserVO[];
    current?: number;
    total?: number;
    pages?: number;
  };

  type IPageWalletDetail = {
    size?: number;
    records?: WalletDetail[];
    current?: number;
    total?: number;
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

  type LikeDTO = {
    userId?: string;
    employeeId?: string;
    liking?: number[];
  };

  type MemberMessage = {
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
    /** 会员id */
    memberId?: string;
    /** 会员名称 */
    memberName?: string;
    /** 消息标题 */
    title?: string;
    /** 消息内容 */
    content?: string;
    /** 关联消息id */
    messageId?: string;
    /** 状态 */
    status?: string;
  };

  type MemberMessageQueryVO = {
    /** 状态 */
    status?: string;
    /** 消息id */
    messageId?: string;
    /** 消息标题 */
    title?: string;
    /** 会员id */
    memberId?: string;
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

  type modifyWalletPassParams = {
    /** 手机号 */
    phone: string;
    /** 新密码 */
    newPassword: string;
    /** 验证码 */
    code: string;
    uuid: string;
  };

  type overviewParams = {
    statisticsQueryParam: StatisticsQueryParam;
  };

  type pageParams = {
    memberMessageQueryVO: MemberMessageQueryVO;
    page: PageVO;
  };

  type pageUserParams = {
    entity: User;
    searchVo: SearchVO;
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

  type PaymentOrderUser = {
    splitUserId?: string;
    splitAmount?: string;
    splitType?: string;
  };

  type paymentParams = {
    /** 支付方式 */
    paymentMethod: 'WECHAT' | 'ALIPAY';
    /** 调起方式 */
    paymentClient: 'JSAPI' | 'CTOB';
    payParam: PayParam;
  };

  type paymentResultParams = {
    payParam: PayParam;
  };

  type PayParam = {
    /** 交易类型 */
    orderType?:
      | 'PAYMENT_ORDER'
      | 'COMPLETE'
      | 'RECEIVE'
      | 'WITHDRAWAL'
      | 'PAYMENT_ORDER,COMPLETE,RECEIVE,REFUND';
    /** 订单号 */
    sn: string;
    /** MallBook平台支付方式,不用传 */
    paymentType?: string;
    /** 子商户编号,不用传 */
    subMerchantId?: string;
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

  type Project = {
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
    /** 重审提交记录 */
    retrialRecord?: RetrialRecord[];
    /** 验收审核记录 */
    acceptanceReview?: ApprovalRecord[];
    /** 专属客服ID */
    serviceId?: string;
    /** 合同路径 */
    contract?: string;
    /** 合作开始时间 */
    cooperationStartTime?: string;
    /** 封面图 */
    image?: string;
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

  type ProjectSearchParams = {
    /** 标题 */
    title?: string;
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

  type queryEmployeeParams = {
    /** 搜索关键字(Id或名称或标签) */
    queryParam: string;
    page: PageVO;
  };

  type queryProjectParams = {
    /** 搜索关键字(名称或工作标签) */
    queryParam: string;
    page: PageVO;
  };

  type Question = {
    /** 问题描述 */
    question?: string;
    /** 提问附件 */
    questionFile?: File[];
  };

  type readParams = {
    message_id: string;
  };

  type refreshTokenParams = {
    refreshToken: string;
  };

  type RefundDTO = {
    /** 任务id */
    projectId?: string;
    /** 金额 */
    amount?: number;
    /** 描述 */
    description?: string;
  };

  type registerParams = {
    /** 用户名 */
    username: string;
    nickname: string;
    /** 密码 */
    password: string;
    /** 手机号 */
    mobilePhone: string;
    roleId: string;
    uuid: string;
    /** 验证码 */
    code: string;
  };

  type resetMobileParams = {
    /** 手机号 */
    mobile: string;
    /** 验证码 */
    code: string;
    uuid: string;
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

  type ResultMessageAfterSale = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: AfterSale;
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

  type ResultMessageBidRecord = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: BidRecord;
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

  type ResultMessageEmployeeVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: EmployeeVO;
  };

  type ResultMessageEmployerVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: EmployerVO;
  };

  type ResultMessageEvaluation = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Evaluation;
  };

  type ResultMessageEvaluationVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: EvaluationVO;
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

  type ResultMessageIPageEvaluation = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageEvaluation;
  };

  type ResultMessageIPageMemberMessage = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageMemberMessage;
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

  type ResultMessageIPageWalletDetail = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageWalletDetail;
  };

  type ResultMessageListBidRecordVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: BidRecordVO[];
  };

  type ResultMessageListJobTags = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: JobTags[];
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

  type ResultMessagePaymentOrder = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: PaymentOrder;
  };

  type ResultMessageProfileData = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: ProfileData;
  };

  type ResultMessageProjectVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: ProjectVO;
  };

  type ResultMessageStatisticsResponse = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: StatisticsResponse;
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

  type ResultMessageTaskOverviewVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: TaskOverviewVO;
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

  type RetrialRecord = {
    /** 提交时间 */
    time?: string;
    /** 重审之前状态 */
    projectStatusType?:
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
    /** 是否已处理 */
    status?: boolean;
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

  type SearchVO = {
    selecte?: Record<string, any>;
    startDate?: string;
    endDate?: string;
    convertStartDate?: string;
    convertEndDate?: string;
  };

  type smsLoginParams = {
    /** 手机号 */
    mobile: string;
    /** 验证码 */
    code: string;
    uuid: string;
  };

  type statisticsChartParams = {
    statisticsQueryParam: StatisticsQueryParam;
  };

  type StatisticsQueryParam = {
    /** 快捷搜索 */
    searchType?: 'TODAY, YESTERDAY, LAST_SEVEN, LAST_THIRTY,LAST_SIXTY,THIS_YEAR';
    /** 类型：年（YEAR）、月（MONTH） */
    timeType?: string;
    /** 年份 */
    year?: number;
    /** 月份 */
    month?: number;
    /** 用户ID */
    userId?: string;
  };

  type StatisticsResponse = {
    /** 集合数据 */
    data?: TaskStatisticsDataVO[];
    /** 用户角色 */
    role?: string;
  };

  type TaskOverviewVO = {
    /** 用户角色 */
    role?: string;
    /** 任务数量 */
    taskNum?: number;
    /** 已完成数量 */
    finishedTaskNum?: number;
    /** 累计收入 */
    income?: number;
  };

  type TaskStatisticsDataVO = {
    /** 任务金额 */
    price?: number;
    /** 创建时间 */
    createTime?: string;
    /** 任务数量 */
    count?: number;
    /** 角色 */
    role?: string;
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

  type UserEditDTO = {
    /** 昵称 */
    nickName?: string;
    /** 用户性别,1为男，0为女 */
    sex: number;
    /** 用户头像 */
    face?: string;
  };

  type userLoginParams = {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
    uuid: string;
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

  type WalletDetail = {
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
    /** 交易标题 */
    transactionTitle?: string;
    /** 交易类型 */
    transactionType?: 'INCOME' | 'DISBURSE';
    /** 交易金额 */
    transactionAmount?: number;
    /** 冻结天数 */
    freezeDays?: number;
    /** 支付订单ID */
    paymentOrderId?: string;
    /** 用户ID */
    userId?: string;
    /** 项目ID */
    projectId?: string;
    /** 是否已入账 */
    enterAccount?: boolean;
  };

  type wechatLoginParams = {
    /** 授权码 */
    code: string;
    /** UUID */
    state: string;
    platform: string;
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
