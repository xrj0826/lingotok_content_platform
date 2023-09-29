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

    server: {
      port: 8888,
      cors: true,
      proxy: {
        '/Manager': {
          target: 'http://139.9.38.185:8887/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace(/^\/Manager/, '');
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
          target: 'http://139.9.38.185:8887/',
          ws: true,
          changeOrigin: false,
          rewrite: (path) => {
            return path.replace(/^\/test/, '');
          },
        },
        '/test2': {
          target: 'http://139.9.38.185:8889/',
          ws: true,
          changeOrigin: false,
          rewrite: (path) => {
            return path.replace(/^\/test2/, '');
          },
        },
      },
    },
  };
};
