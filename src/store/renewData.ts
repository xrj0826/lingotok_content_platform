// 这是一个存储表格请求函数的管理器，主要用于解决子组件数据更新问题
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

const renewData = undefined; // 接收请求函数，用于页面的更新
const storeId = ref([undefined]);
const imgNum = ref(0);
const pagination = reactive({
  current: undefined,
  pageSize: undefined,
  total: undefined,
});
export const useRenewDataStore = defineStore('renewData', {
  state: () => ({
    renewData,
    pagination,
    storeId,
    imgNum,
  }),
});
