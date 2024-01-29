declare namespace API {
  type add1Params = {
    menu: Menu;
  };

  type add2Params = {
    pageVo: PageVO;
    role: Role;
  };

  type addParams = {
    role: Role;
  };

  type AdminUser = {
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
    /** 用户头像 */
    avatar?: string;
    /** 是否是超级管理员 超级管理员/普通管理员 */
    isSuper?: boolean;
    /** 状态 默认true正常 false禁用 */
    status?: boolean;
    /** 描述/详情/备注 */
    description?: string;
    /** 所属部门id */
    departmentId?: string;
    /** 角色id集合 */
    roleIds?: string;
  };

  type AdminUserDTO = {
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
    /** 用户头像 */
    avatar?: string;
    /** 是否是超级管理员 超级管理员/普通管理员 */
    isSuper?: boolean;
    /** 状态 默认true正常 false禁用 */
    status?: boolean;
    /** 描述/详情/备注 */
    description?: string;
    /** 所属部门id */
    departmentId?: string;
    /** 角色id集合 */
    roleIds?: string;
    /** 所属部门名称 */
    departmentTitle?: string;
    /** 用户拥有角色 */
    roles?: Role[];
    /** 用户拥有的权限 */
    menus?: Menu[];
  };

  type Articles = {
    /** 所属读物ID */
    readingMaterialId?: string;
    /** 文章标题 */
    title?: string;
    /** 文章介绍 */
    introduction?: string;
    /** 封面 */
    picture?: string;
    /** 文章数量 */
    articleCount?: number;
    /** 播放量 */
    viewCount?: number;
    /** 练习列表 */
    exercisesList?: Exercises[];
    /** 是否收藏 */
    isCollect?: boolean;
  };

  type Book = {
    /** 对应mongodb中书本ID（书本名字） */
    bookId?: string;
    /** 单词数量 */
    wordCount?: number;
    /** 书本描述 */
    bookDescription?: string;
    /** 标签 */
    label?: string;
    /** 封面地址 */
    url?: string;
    /** 单词书名称 */
    bookName?: string;
  };

  type BookGroupVO = {
    index?: string[];
    groupVOS?: GroupVO[][];
  };

  type CollectDTO = {
    bindId?: string;
    type?: 'WORD' | 'ARTICLES' | 'SENTENCE' | 'WRONG';
    content?: string;
  };

  type Content = {
    word?: Word;
  };

  type delAllByIds1Params = {
    ids: string[];
  };

  type delAllByIds2Params = {
    ids: string[];
  };

  type delAllByIdsParams = {
    ids: string[];
  };

  type delByIds1Params = {
    ids: string[];
  };

  type delByIdsParams = {
    ids: string[];
  };

  type delete10Params = {
    bookId: string;
  };

  type delete1Params = {
    /** 短信签名id */
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
    /** 短信模板CODE */
    templateCode: string;
  };

  type deleteWordParams = {
    ids: string[];
  };

  type Department = {
    /** 部门名称 */
    title: string;
    /** 父id */
    parentId?: string;
    /** 排序值 */
    sortOrder?: number;
  };

  type DepartmentRole = {
    /** 角色id */
    roleId?: string;
    /** 部门id */
    departmentId?: string;
  };

  type DepartmentVO = {
    /** 部门名称 */
    title: string;
    /** 父id */
    parentId?: string;
    /** 排序值 */
    sortOrder?: number;
    children?: DepartmentVO[];
  };

  type disableParams = {
    /** 用户唯一id标识 */
    userId: string;
    status: boolean;
  };

  type edit1Params = {
    /** 菜单ID */
    id: string;
    menu: Menu;
  };

  type edit2Params = {
    roles?: string[];
  };

  type editOwnerParams = {
    adminUser: AdminUser;
  };

  type editParams = {
    roleId: string;
    role: Role;
  };

  type editPasswordParams = {
    password: string;
    newPassword: string;
  };

  type EnglishWord = {
    /** id */
    id?: string;
    /** 单词序号 */
    wordRank?: number;
    /** 单词全拼 */
    headWord?: string;
    content?: Content;
    /** 单词书ID */
    bookId?: string;
    resource?: Resource;
    /** 英语释义 */
    definition?: string;
    /** 等级信息 */
    grade?: string[];
    isCollect?: boolean;
    familiarity?: 'FAMILIAR' | 'VAGUE' | 'RARE';
  };

  type Exercises = {
    /** 所属文章ID */
    articleId?: string;
    /** 标题 */
    title?: string;
    /** 难度分类字段 */
    difficultyLevel?: 'EASY' | 'MIDDLE' | 'HARD';
    userNote?: UserNote;
    /** 句子列表 */
    sentenceList?: Sentence[];
    /** 是否收藏 */
    isCollect?: boolean;
  };

  type File = {
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

  type get1Params = {
    id: string;
  };

  type get2Params = {
    userId: string;
  };

  type get3Params = {
    roleId: string;
  };

  type get4Params = {
    departmentId: string;
  };

  type get5Params = {
    id: string;
  };

  type get6Params = {
    /** 会员ID */
    id: string;
  };

  type get7Params = {
    id: string;
  };

  type get8Params = {
    id: string;
  };

  type get9Params = {
    id: string;
  };

  type getByConditionParams = {
    user: AdminUserDTO;
    searchVo: SearchVO;
    pageVo: PageVO;
  };

  type getByGroupIdParams = {
    groupId: string;
  };

  type getByIdParams = {
    id: string;
  };

  type getByPage1Params = {
    memberSearchVO: MemberSearchVO;
    page: PageVO;
  };

  type getByPage2Params = {
    memberSearchVO: MemberSearchVO;
  };

  type getByPageParams = {
    entity: Department;
    searchVo: SearchVO;
  };

  type getDetailParams = {
    /** 短信签名id */
    id: string;
  };

  type getItemParams = {
    /** 地区ID */
    id: string;
  };

  type getParams = {
    /** 地区ID */
    id: string;
  };

  type groupDetailParams = {
    groupId: string;
  };

  type groupInsertParams = {
    bookId: string;
  };

  type groupParams = {
    bookId: string;
  };

  type GroupVO = {
    groupId?: string;
    /** 索引 */
    index?: number;
    /** 熟悉单词 */
    familiarList?: string[];
    /** 模糊单词 */
    vagueList?: string[];
    /** 生僻单词 */
    rareList?: string[];
    /** 通过标记 */
    finish?: boolean;
    /** 单词总数 */
    total?: number;
  };

  type IPageAdminUserVO = {
    total?: number;
    records?: AdminUserVO[];
    current?: number;
    pages?: number;
    size?: number;
  };

  type IPageBook = {
    total?: number;
    records?: Book[];
    current?: number;
    pages?: number;
    size?: number;
  };

  type IPageMemberVO = {
    total?: number;
    records?: MemberVO[];
    current?: number;
    pages?: number;
    size?: number;
  };

  type IPageSmsSign = {
    total?: number;
    records?: SmsSign[];
    current?: number;
    pages?: number;
    size?: number;
  };

  type IPageSmsTemplate = {
    total?: number;
    records?: SmsTemplate[];
    current?: number;
    pages?: number;
    size?: number;
  };

  type loginParams = {
    username: string;
    password: string;
    uuid: string;
  };

  type ManagerMemberEditDTO = {
    id: string;
    /** 会员用户名,用户名不能进行修改 */
    username: string;
    /** 会员密码 */
    password?: string;
    /** 昵称 */
    nickName?: string;
    /** 地区 */
    region?: string;
    /** 地区ID */
    regionId?: string;
    /** 会员性别,1为男，0为女 */
    sex: number;
    /** 会员生日 */
    birthday?: string;
    /** 会员头像 */
    face?: string;
  };

  type Member = {
    /** 会员用户名 */
    username?: string;
    /** 会员密码 */
    password?: string;
    /** 昵称 */
    nickName?: string;
    /** 会员性别,1为男，0为女 */
    sex?: number;
    /** 会员生日 */
    birthday?: string;
    /** 手机号码 */
    mobile: string;
    /** 积分数量 */
    point?: number;
    /** 积分总数量 */
    totalPoint?: number;
    /** 会员头像 */
    face?: string;
    /** 会员状态 */
    disabled?: boolean;
    /** 客户端 */
    clientEnum?: string;
    /** 最后一次登录时间 */
    lastLoginDate?: string;
    /** 会员等级ID */
    gradeId?: string;
    /** 经验值数量 */
    experience?: number;
    /** 自动发音 */
    pronounce?: boolean;
    /** 美音 */
    usSpeak?: boolean;
    /** 英音 */
    ukSpeak?: boolean;
    /** 简介 */
    introduction?: string;
  };

  type MemberAddDTO = {
    /** 会员用户名 */
    username: string;
    /** 会员密码 */
    password?: string;
    /** 手机号码 */
    mobile: string;
  };

  type MemberSearchVO = {
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickName?: string;
    /** 用户手机号码 */
    mobile?: string;
    /** 会员状态 */
    disabled?: string;
  };

  type MemberVO = {
    /** 会员用户名 */
    username?: string;
    /** 昵称 */
    nickName?: string;
    /** 会员性别,1为男，0为女 */
    sex?: number;
    /** 会员生日 */
    birthday?: string;
    /** 会员地址ID */
    regionId?: string;
    /** 会员地址 */
    region?: string;
    /** 手机号码 */
    mobile: string;
    /** 积分数量 */
    point?: number;
    /** 积分总数量 */
    totalPoint?: number;
    /** 会员头像 */
    face?: string;
    /** 会员状态 */
    disabled?: boolean;
    /** 是否开通店铺 */
    haveStore?: boolean;
    /** 店铺ID */
    storeId?: string;
    /** openId */
    openId?: string;
    /** 客户端 */
    clientEnum?: string;
    /** 最后一次登录时间 */
    lastLoginDate?: string;
    /** 会员等级ID */
    gradeId?: string;
    /** 经验值数量 */
    experience?: number;
  };

  type Menu = {
    /** 菜单标题 */
    title?: string;
    /** 路由名称 */
    name?: string;
    /** 路径 */
    path?: string;
    /** 菜单层级 */
    level?: number;
    /** 前端目录文件 */
    frontRoute?: string;
    /** 父id */
    parentId?: string;
    /** 排序值 */
    sortOrder?: number;
    /** 权限URL，*号模糊匹配，逗号分割 */
    permission?: string;
  };

  type MenuSearchParams = {
    /** 菜单/权限名称 */
    name?: string;
    /** 层级 */
    level?: number;
    /** 菜单标题 */
    title?: string;
    /** 赋权API地址,正则表达式 */
    path?: string;
    /** 前端路由 */
    frontRoute?: string;
    /** 图标 */
    icon?: string;
  };

  type MenuVO = {
    /** 菜单标题 */
    title?: string;
    /** 路由名称 */
    name?: string;
    /** 路径 */
    path?: string;
    /** 菜单层级 */
    level?: number;
    /** 前端目录文件 */
    frontRoute?: string;
    /** 父id */
    parentId?: string;
    /** 排序值 */
    sortOrder?: number;
    /** 权限URL，*号模糊匹配，逗号分割 */
    permission?: string;
    /** 子菜单 */
    children?: MenuVO[];
  };

  type NewWord = {
    /** id */
    id?: string;
    /** 单词全拼 */
    headWord?: string;
    /** 书ID */
    bookId?: string;
    /** 单词索引 */
    wordIndex?: string;
  };

  type OrderItem = {
    column?: string;
    asc?: boolean;
  };

  type page1Params = {
    entity: Book;
    page: PageVO;
  };

  type PageObject = {
    records?: Record<string, any>[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: boolean;
    searchCount?: boolean;
    optimizeJoinOfCountSql?: boolean;
    countId?: string;
    maxLimit?: number;
    pages?: number;
  };

  type PageVO = {
    pageNumber?: number;
    pageSize?: number;
    sort?: string;
    order?: string;
    notConvert?: boolean;
  };

  type Phrase = {
    /** 短语 */
    phrases?: Phrases[];
    /** 短语 */
    desc?: string;
  };

  type Phrases = {
    pcn?: string;
    pcontent?: string;
  };

  type querySmsSignPageParams = {
    page: PageVO;
    signStatus: number;
  };

  type querySmsTemplatePageParams = {
    page: PageVO;
    templateStatus: number;
  };

  type ReadingMaterials = {
    /** 读物名称 */
    name?: string;
    /** 文章列表 */
    articlesList?: Articles[];
  };

  type RealExamSentence = {
    /** 短语 */
    sentences?: Sentences[];
    /** 真题例句 */
    desc?: string;
  };

  type refreshTokenParams = {
    refreshToken: string;
  };

  type Region = {
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

  type registerParams = {
    roles?: string[];
  };

  type RelatedItem = {
    /** 词性 */
    pos?: string;
    words?: RelatedWordItem[];
  };

  type RelatedWord = {
    rels?: RelatedItem[];
    /** 同根 */
    desc?: string;
  };

  type RelatedWordItem = {
    /** 单词全拼 */
    hwd?: string;
    /** 翻译 */
    tran?: string;
  };

  type RemMethod = {
    val?: string;
    /** 记忆方法 */
    desc?: string;
  };

  type resetPasswordParams = {
    ids: Record<string, any>[];
  };

  type Resource = {
    images?: File[];
    videos?: File[];
    voices?: File[];
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

  type ResultMessageArticles = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Articles;
  };

  type ResultMessageBookGroupVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: BookGroupVO;
  };

  type ResultMessageDepartment = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Department;
  };

  type ResultMessageDepartmentRole = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: DepartmentRole;
  };

  type ResultMessageEnglishWord = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: EnglishWord;
  };

  type ResultMessageExercises = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Exercises;
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

  type ResultMessageGroupVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: GroupVO;
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

  type ResultMessageIPageBook = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageBook;
  };

  type ResultMessageIPageMemberVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageMemberVO;
  };

  type ResultMessageIPageSmsSign = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageSmsSign;
  };

  type ResultMessageIPageSmsTemplate = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: IPageSmsTemplate;
  };

  type ResultMessageListDepartmentRole = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: DepartmentRole[];
  };

  type ResultMessageListDepartmentVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: DepartmentVO[];
  };

  type ResultMessageListEnglishWord = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: EnglishWord[];
  };

  type ResultMessageListMenu = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: Menu[];
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

  type ResultMessageListReadingMaterials = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: ReadingMaterials[];
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

  type ResultMessageListRoleMenu = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: RoleMenu[];
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

  type ResultMessageListWordTranslation = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    /** 结果对象 */
    result?: WordTranslation[];
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

  type ResultMessageMember = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Member;
  };

  type ResultMessageMemberVO = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: MemberVO;
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

  type ResultMessagePageObject = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: PageObject;
  };

  type ResultMessageReadingMaterials = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: ReadingMaterials;
  };

  type ResultMessageRegion = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Region;
  };

  type ResultMessageRole = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Role;
  };

  type ResultMessageSentence = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: Sentence;
  };

  type ResultMessageSmsSign = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: SmsSign;
  };

  type ResultMessageSmsTemplate = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: SmsTemplate;
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

  type ResultMessageUserRole = {
    /** 成功标志 */
    success?: boolean;
    /** 消息 */
    message?: string;
    /** 返回代码 */
    code?: number;
    /** 时间戳 */
    timestamp?: number;
    result?: UserRole;
  };

  type Role = {
    /** 角色名 */
    name?: string;
    /** 是否为注册默认角色 */
    defaultRole?: boolean;
    /** 备注 */
    description?: string;
  };

  type RoleMenu = {
    /** 角色id */
    roleId?: string;
    /** 菜单 */
    menuId?: string;
    /** 是否拥有操作数据权限，为否则只有查看权限 */
    isSuper?: boolean;
  };

  type save4Params = {
    roleId: string;
  };

  type saveConfigParams = {
    key: string;
  };

  type searchParams = {
    query: string;
    pageNumber: number;
    pageSize: number;
  };

  type searchPermissionListParams = {
    searchParams: MenuSearchParams;
  };

  type SearchVO = {
    selecte?: Record<string, any>;
    startDate?: string;
    endDate?: string;
    convertEndDate?: string;
    convertStartDate?: string;
  };

  type Sentence = {
    /** 所属练习ID */
    exercisesId?: string;
    /** 内容 */
    content?: string;
    /** 翻译 */
    translation?: string;
  };

  type Sentences = {
    sourceInfo?: SourceInfo;
    scontent?: string;
  };

  type settingGetParams = {
    key: string;
  };

  type SmsSign = {
    /** 签名名称 */
    signName: string;
    /** 签名来源 */
    signSource: number;
    /** 短信签名申请说明 */
    remark: string;
    /** 营业执照 */
    businessLicense: string;
    /** 授权委托书 */
    license: string;
    /** 签名审核状态 */
    signStatus?: number;
    /** 审核备注 */
    reason?: string;
  };

  type SmsTemplate = {
    /** 模板名称 */
    templateName: string;
    /** 短信类型 */
    templateType: number;
    /** 短信模板申请说明 */
    remark: string;
    /** 模板内容 */
    templateContent: string;
    /** 模板审核状态 */
    templateStatus?: number;
    /** 短信模板CODE */
    templateCode?: string;
    /** 审核备注 */
    reason?: string;
  };

  type SourceInfo = {
    /** 考试类型 */
    level?: string;
    /** 年份 */
    year?: string;
    /** 题型 */
    type?: string;
  };

  type synchronizationDataParams = {
    url: string;
  };

  type Syno = {
    /** 近义词列表 */
    synos?: SynonymItem[];
    desc?: string;
  };

  type SynonymItem = {
    /** 词性 */
    pos?: string;
    /** 对应词义 */
    tran?: string;
    /** 近义词/词组 */
    hwds?: SynonymWord[];
  };

  type SynonymWord = {
    /** 单词全拼 */
    w?: string;
  };

  type Token = {
    accessToken?: string;
    refreshToken?: string;
  };

  type Translation = {
    /** 中文翻译 */
    tranCn?: string;
    descOther?: string;
    descCn?: string;
    /** 词性 */
    pos?: string;
    tranOther?: string;
  };

  type ttsParams = {
    msg: string;
  };

  type update2Params = {
    userId: string;
    userRole: UserRole[];
  };

  type update3Params = {
    departmentId: string;
  };

  type update4Params = {
    id: string;
  };

  type updateMemberStatusParams = {
    /** 会员ID */
    memberIds: string;
    disabled: boolean;
  };

  type updateParams = {
    /** 地区ID */
    id: string;
  };

  type updateWordParams = {
    id: string;
  };

  type upload1Params = {
    file: string;
    base64: string;
    fileLocation: string;
  };

  type uploadParams = {
    headword: string;
  };

  type uploadWordByExcelParams = {
    file: string;
    bookId: string;
  };

  type uploadWordByJsonParams = {
    file: string;
    bookId: string;
  };

  type UserNote = {
    /** 用户ID */
    userId?: string;
    /** 练习ID */
    exercisesId?: string;
    /** 笔记 */
    note?: string;
  };

  type UserRole = {
    /** 用户唯一id */
    userId?: string;
    /** 角色唯一id */
    roleId?: string;
  };

  type Word = {
    /** 单词全拼 */
    wordHead?: string;
    wordId?: string;
    content?: WordContent;
  };

  type WordContent = {
    sentence?: Sentence;
    syno?: Syno;
    phrase?: Phrase;
    remMethod?: RemMethod;
    realExamSentence?: RealExamSentence;
    relWord?: RelatedWord;
    /** 翻译 */
    trans?: Translation[];
    /** 美音音标 */
    usphone?: string;
    /** 英音音标 */
    ukphone?: string;
    /** 英音发音https请求参数 */
    ukspeech?: string;
    /** 美音发音https请求参数 */
    usspeech?: string;
    star?: number;
    phone?: string;
    speech?: string;
  };

  type WordTranslation = {
    word?: string;
    translation?: string;
    dbId?: string;
  };
}
