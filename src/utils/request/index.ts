/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { v4 as uuidv4 } from 'uuid';
// import { useRouter } from 'vue-router';

// const router = useRouter(); // 移除这行，因为在模块级别调用useRouter可能导致问题
const config = {
  // api: 'http://47.99.90.88:8889',
  api: '/manager',
};

// 确保 api 是字符串类型
// console.log('Request config api:', config.api, typeof config.api);

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
  prefix: String(config.api), // 确保prefix是字符串
  timeout: 600000,
});

// console.log('umi-request extend config:', { 
//   prefix: config.api, 
//   prefixType: typeof config.api,
//   timeout: 600000 
// });
// request拦截器, 改变url 或 options
require.interceptors.request.use(
  (url, options) => {
    // console.log('Request interceptor - URL:', url, 'Type:', typeof url);
    // console.log('Request interceptor - Original options:', options);

    // 确保url是字符串
    if (typeof url !== 'string') {
      console.error('URL is not a string in interceptor:', url);
      throw new Error(`URL must be a string, got ${typeof url}: ${url}`);
    }

    // let uuid = getStore('uuid');
    let uuid = '';
    if (!uuid) {
      uuid = uuidv4();
      // setStore('uuid', uuid);
    }
    // console.log('accessToken', localStorage.getItem('accessToken'));
    const headers = localStorage.getItem('accessToken')
      ? {
        accessToken: `${localStorage.getItem('accessToken')}`,
        uuid: `${uuid}`,
      }
      : {
        uuid: `${uuid}`,
      };

    const result = {
      url: String(url), // 确保返回的url是字符串
      options: {
        ...options,
        headers: {
          ...options.headers, // 保留原有headers
          ...headers // 添加新的headers
        }
      },
    };

    // console.log('Request interceptor result:', result);
    // console.log('Final headers:', result.options.headers);
    return result;
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
      // router.push({ path: "/login" });
      console.log('请重新登录');
      return data;
    }
    return data;
  } catch (error) { }
  return response;
});

export default require;
