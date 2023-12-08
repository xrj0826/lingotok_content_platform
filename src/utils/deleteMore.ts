import { MessagePlugin } from 'tdesign-vue-next';

import { useRenewDataStore } from '@/store/renewData';
/**
 * 删除函数
 */
const store = useRenewDataStore();
export const useMoreDelete = async (deleteIds: string, deleteApi: any) => {
  try {
    const ids = deleteIds; // 提取数组里面的字符串

    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await deleteApi({ ids });
      console.log('批量删除后', res);
      store.renewData(
        {
          pageNumber: store.pagination.current,
          pageSize: store.pagination.pageSize,
          sort: 'createTime',
          order: 'asc',
        },
        null,
        store.querySave,
      );
      MessagePlugin.success('删除成功');
    }
  } catch (error) {
    console.log(error);
  }
};
