/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { v4 as uuidv4 } from 'uuid';
import { rejects } from 'assert';
const config = {
  api: '/manager',
};

/**
 * 异常处理程序
 */
const errorHandler = (error) => {
  const { response } = error;
  if (response && response.status) {
    if (error.data.code === 20033) return response;
    const errorText = error.data.message;
    // const errorText = codeMessage[response.status] || response.statusText
    const { status, url } = response;
    // ElMessage.error(errorText)
  } else if (!response) {
    // ElMessage.error('网络异常')
  }
  // return response
};

/**
 * 配置request请求时的默认参数
 */
const require = extend({
  errorHandler, // 默认错误处理
  // prefix: config.mockApi,
  prefix: config.api,
  timeout: 600000,
});
// request拦截器, 改变url 或 options
require.interceptors.request.use(
  (url, options) => {
    // let uuid = getStore('uuid');
    let uuid = '';
    if (!uuid) {
      uuid = uuidv4();
      // setStore('uuid', uuid);
    }
    console.log('accessToken', localStorage.getItem('accessToken'));
    const headers = localStorage.getItem('accessToken')
      ? {
        accessToken: `${localStorage.getItem('accessToken')}`,
        uuid: `${uuid}`,
      }
      : {
        uuid: `${uuid}`,
      };

    return {
      url,
      options: { ...options, headers },
    };
  },
  { global: false },
);

const key = 'updatable';
// 克隆响应对象做解析处理
require.interceptors.response.use(async (response) => {
  try {
    const data = await response.clone().json();

    if (data && (data.status === 403 || data.code === 403)) {
      // clearToken()
      // ElMessage.error('登录已过期，请重新登录')
      // router.push('/login')
      // window.__POWERED_BY_QIANKUN__ ? (window.location.href = '/#/') : router.replace('/user/login')
      return;
    }
  } catch (error) { }
  return response;
});

export default require;
