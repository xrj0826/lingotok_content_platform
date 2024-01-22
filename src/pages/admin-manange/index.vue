<!-- 客服管理 -->
<template>
  <div>
    <t-card>
      <t-space style="margin: 0 20px 20px 0">
        <add @add="AddFinsh"></add>
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDelete"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
        <!-- 
        <t-select-input
          placeholder="请输入任意关键词"
          allow-input
          clearable
          style="width: 300px"
          @input-change="onInputChange"
        >
          <template #suffixIcon><search-icon /></template>
        </t-select-input> -->
      </t-space>
      <t-table
        :row-key="index"
        :data="data"
        :columns="columns"
        table-layout="fixed"
        :bordered="true"
        size="small"
        :pagination="pagination"
        cell-empty-content="-"
        resizable
        :loading="isLoading"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeys"
        @row-click="handleRowClick"
        @select-change="onSelectChange"
        @change="onChange"
      >
        <!-- 自定义表头，title值为插槽名称  -->
        <template #title-slot-name>
          <div style="display: flex; justify-content: center"><UserCircleIcon style="margin-right: 8px" />申请人</div>
        </template>
      </t-table></t-card
    >

    <t-dialog theme="info" header="更改读物名称" @close="visible = false" @confirm="edit()"
      :visible.sync="visible" >
          <t-input v-model="name"></t-input>
    </t-dialog>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'AdminManager',
};
</script>
<script setup lang="tsx">
// import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

// import { delete21, page10 } from '@/api/user/guanliyuan';
import { useRenewDataStore } from '@/store/renewData';

import { columns,visible,id,name } from './columnData';
import Add from './components/Add.vue';
import { delete4, page, update6 } from '@/api/user/readingMaterials';

// 挂载时调用请求函数
onMounted(async () => {
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
  store.renewData = queryData; // 挂载时，将请求函数给pinia
  store.pagination.current = pagination.current; // 分页数据也一起给
  store.pagination.pageSize = pagination.pageSize;
});
const querySave = reactive({
  sort: '',
  order: null,
});
const index = ref();
const data = ref([]);
const isLoading = ref(false);
const store = useRenewDataStore();

const cencel = () =>{
  visible.value = false

}

// const name = ref("")

// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result; // 获得表格数据
    pagination.total = res.result.length; // 数据加载完成，设置数据总条数
    store.renewData = queryData;
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
const selectedRowKeys = ref([]);

const handleMoreDelete = async () => {
  // if (data.value.length === 1) {
  //   MessagePlugin.error('至少保留一位管理员');
  // } else {
    try {
      const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
      if (ids === '') {
        MessagePlugin.error('未勾选删除项');
      } else {
        const res = await delete4({ ids });
        console.log('批量删除后', res);
        queryData({
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
        });
        MessagePlugin.success('删除成功');
      }
    } catch (error) {
      console.log(error);
    }
  // }
};
// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
  console.log(value, params);
};

const handleRowClick = (e) => {
  console.log(e);
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info.sorter, context.trigger);

  if (context.trigger === 'sorter') {
    if (info.sorter === undefined) {
      querySave.sort = '';
      querySave.order = null;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
    } else {
      querySave.sort = info.sorter.sortBy;
      querySave.order = info.sorter.descending;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      });
    }
  }
};

const edit = async () => {
  // if (data.value.length === 1) {
  //   MessagePlugin.error('至少保留一位管理员');
  // } else {
    try {

      if (name.value == '') {
        MessagePlugin.error('读物名称不能为空');
      } else {
        const params = {
          id:id.value,
          name:name.value
        }
        const res = await update6( params );
        console.log('批量删除后', res);
        queryData({
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
        });
        MessagePlugin.success('更改成功');
        visible.value = false
      }
    } catch (error) {
      console.log(error);
    }
  // }
};
// 搜索框
// const onInputChange = (keyword) => {
//   console.log(keyword);
// };

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    store.pagination.current = pagination.current; // 分页数据也一起给
    store.pagination.pageSize = pagination.pageSize;
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    }); // 分页数据改变时调用请求函数
    console.log('pagination.onChange', pageInfo);
  },
});

const AddFinsh = (newData) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
};
</script>

<style lang="less" scoped></style>
