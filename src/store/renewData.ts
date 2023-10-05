// 这是一个存储表格请求函数的管理器，主要用于解决子组件数据更新问题
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

const renewData = undefined; // 接收请求函数，用于页面的更新
const querySave = undefined; // 用于删除后，保持页面的排序

const storeIdArr = ref([undefined]);
const storeId = ref();

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
    storeIdArr,
    imgNum,
    querySave,
  }),
  actions: () => ({
    // async getStroeName(storeId) {
    //   const res = await get2(storeId);
    //   storeName.value = res.result.storeName;
    //   return storeName.value;
    // },
  }),
});
