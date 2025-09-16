import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import { ConfigEnv, loadEnv, UserConfig } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import svgLoader from 'vite-svg-loader';

const CWD = process.cwd();

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_BASE_URL } = loadEnv(mode, CWD);
  return {
    base: VITE_BASE_URL,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '/@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': {
        NODE_ENV: process.env.NODE_ENV, // 将属性转化为全局变量，让代码中可以正常访问
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },

    plugins: [
      vue(),
      vueJsx(),
      viteMockServe({
        mockPath: 'mock',
        localEnabled: true,
      }),
      svgLoader(),
    ],

    // 确保 node_modules 中的 FFmpeg 文件可以被访问
    assetsInclude: ['**/*.wasm'],

    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
      include: ['@ffmpeg/core']
    },
    server: {
      port: 8888,
      cors: true,
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Resource-Policy": "cross-origin",
        // 添加媒体资源支持
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range",
      },
      proxy: {
        // 媒体资源代理
        '/api/proxy-media': {
          target: 'http://localhost:8888',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // 获取原始URL参数
              const url = new URL(req.url || '', `http://${req.headers.host}`);
              const targetUrl = url.searchParams.get('url');

              if (targetUrl) {
                try {
                  const target = new URL(targetUrl);
                  console.log('🌐 代理媒体资源:', targetUrl);

                  // 重写请求到目标服务器
                  proxyReq.path = target.pathname + target.search;
                  proxyReq.setHeader('host', target.host);
                  proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                  proxyReq.setHeader('Accept', '*/*');
                  proxyReq.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');

                  // 动态设置target
                  (proxy as any).options.target = target.origin;
                } catch (e) {
                  console.error('无效的代理URL:', targetUrl, e);
                }
              }
            });

            proxy.on('proxyRes', (proxyRes, _req, _res) => {
              // 设置CORS头
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Range';
              proxyRes.headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
            });
          }
        },
        '/manager': {
          target: 'https://testapi.lingotok.ai/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace(/^\/manager/, '');
          },
          secure: false, // 跳过证书问题
        },
        '/Common': {
          target: 'http://47.99.90.88:8890/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace(/^\/Common/, '');
          },
          secure: false, // 跳过证书问题
        },
        '/Api': {
          target: 'http://47.99.90.88:8889/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace(/^\/Api/, '');
          },
          secure: false, // 跳过证书问题
        },
        '/test': {
          target: 'http://101.34.243.115:8866/',
          ws: true,
          changeOrigin: false,
          rewrite: (path) => {
            return path.replace(/^\/manager/, '');
          },
        },
        '/refund': {
          target: 'http://139.9.38.185:8889/',
          ws: true,
          changeOrigin: false,
          rewrite: (path) => {
            return path.replace(/^\/refund/, '');
          },
        },
        // '/images/.*\\.(gif|jpg|jpeg|png|bmp|swf)$': {
        //   target: 'https://139.9.38.185:37848/',
        //   ws: true,
        //   changeOrigin: false,
        //   rewrite: (path) => {
        //     return path.replace(/^\/test2/, '');
        //   },
        // },
      },
    },
  };
};
