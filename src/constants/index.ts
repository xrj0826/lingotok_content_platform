// 合同状态枚举
export const CONTRACT_STATUS = {
  FAIL: 0,
  AUDIT_PENDING: 1,
  EXEC_PENDING: 2,
  EXECUTING: 3,
  FINISH: 4,
};

export const CONTRACT_STATUS_OPTIONS = [
  { value: CONTRACT_STATUS.FAIL, label: '审核失败' },
  { value: CONTRACT_STATUS.AUDIT_PENDING, label: '待审核' },
  { value: CONTRACT_STATUS.EXEC_PENDING, label: '待履行' },
  { value: CONTRACT_STATUS.EXECUTING, label: '审核成功' },
  { value: CONTRACT_STATUS.FINISH, label: '已完成' },
];

// 合同类型枚举
export const CONTRACT_TYPES = {
  MAIN: 0,
  SUB: 1,
  SUPPLEMENT: 2,
};

export const CONTRACT_TYPE_OPTIONS = [
  { value: CONTRACT_TYPES.MAIN, label: '主合同' },
  { value: CONTRACT_TYPES.SUB, label: '子合同' },
  { value: CONTRACT_TYPES.SUPPLEMENT, label: '补充合同' },
];

// 合同收付类型枚举
export const CONTRACT_PAYMENT_TYPES = {
  PAYMENT: 0,
  RECEIPT: 1,
};

// 标签类型
type TagTheme = 'default' | 'success' | 'primary' | 'warning' | 'danger';
// 通知的优先级对应的标签类型
export const NOTIFICATION_TYPES: Map<string, TagTheme> = new Map([
  ['low', 'primary'],
  ['middle', 'warning'],
  ['high', 'danger'],
]);

// 通用请求头
export enum ContentTypeEnum {
  Json = 'application/json;charset=UTF-8',
  FormURLEncoded = 'application/x-www-form-urlencoded;charset=UTF-8',
  FormData = 'multipart/form-data;charset=UTF-8',
}

//IM配置
export const SDK_APPID = '1400826231';
export const SDK_KEY = '908acd17f8c82e05aa17355f39d97f930f59d3541ddb63042b1098eacbadfece';
export const IDENTIFIER = 'administrator';
export const USER_SIG =
  'eJw1jl0LgjAYRv-Lbgt5N*c0oZvqqkYEmeTlbKtewg*2JWH03xOty*ccDjxvksljYF4tWkNSATwBmI*sM5akhAVApu30Q7UtapJSDpAwwUI6GdSm9njFMVC6whqdt8o39p-ibTCbfHuPnrUKJTvvsDjF3YolfNbvD9BctBOxzKDMi2rd8*Uv9FgNr6hYUIgi4PzzBbm8M50_';
export const USER_ID = '1686204421482299392';
// export const USER_ID = '272b96f0-fbb7-4a24-8832-26ee8799e810';
export const RANDOM = '1372107022';
export const CONTENT_TYPE = 'json';
