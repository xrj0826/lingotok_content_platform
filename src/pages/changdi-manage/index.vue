<!-- 场地管理 -->
<template>
  <div>
    <t-card>
      <div style="margin-left: 20px">
        <div style="font-size: 16px; margin-top: 10px; margin-bottom: 10px">请选择封面图片上传</div>
        <div
          style="
            display: flex;
            justify-content: space-around;
            flex-direction: column;
            align-items: center;
            width: 100%;
            gap: 20px;
          "
        >
          <t-upload
            v-model="picture"
            action="/manager/manager/upload/file"
            theme="image"
            :headers="{ accessToken: accessToken }"
            :max="1"
            accept="image/*"
            @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="pictureUpload"
            @remove="removePicture"
          ></t-upload>
          <t-button @click="ensure">确认修改</t-button>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'ChangDiManage',
};
</script>
<script setup lang="tsx">
// import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { getAnnouncementDetail, getAnnouncementDetail1, updateAnnouncement } from '@/api/user/announcement';
// import { deleteUsingDELETE, page } from '@/api/user/changdeguanli';
import { useRenewDataStore } from '@/store/renewData';

import { columns } from './columnData';
import Add from './components/Add.vue';

const querySave = reactive({
  sort: 'createTime',
  order: false,
  venueType: '',
});
const accessToken = ref<string | null>();

const pic = ref('');
const picture = ref([]);

const id = ref('');

// 挂载时调用请求函数
onMounted(async () => {
  getAnnouncementDetail().then((res) => {
    console.log('res', res);
    pic.value = res.result.image;
    if (pic.value) {
      picture.value[0] = {
        url: pic.value,
      };
    }
    id.value = res.result.id;
  });
  accessToken.value = localStorage.getItem('accessToken');
});

const ensure = () => {
  if (pic.value == '') {
    MessagePlugin.error('请选择图片');
    return;
  }
  const params = {
    id: id.value,
    image: pic.value,
  };
  updateAnnouncement(params).then((res) => {
    console.log('picture', picture.value);

    if (res.code == 200) {
      MessagePlugin.success('修改成功');
    } else {
      MessagePlugin.error('修改失败，请稍后再试');
    }
  });
};

const removePicture = () => {
  picture.value = [];
};

const pictureUpload = (value) => {
  console.log('upload', value);
  pic.value = value.response.result.url;
};

const index = ref();
const data = ref([]);
const isLoading = ref(false);
const store = useRenewDataStore();

// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    // const res = await page({ entity: entityInfo, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result.records; // 获得表格数据
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数 // 数据加载完成，设置数据总条数
    store.renewData = queryData;
    store.querySave = querySave;
    // 如果总页数小于当前页数
    if (res.result.pages < res.result.current) {
      pagination.current = res.result.pages;
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null, // @ts-ignore
        querySave,
      );
    }
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
const selectedRowKeys = ref([]);

// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
  console.log(value, params);
};

const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      // const res = await deleteUsingDELETE({ ids });
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
};
const handleRowClick = (e) => {
  console.log(e);
};
// 过滤等发生变化时会出发 change 事件
const onFilterChange = (filterValue, context) => {
  console.log('过滤函数', filterValue, context);

  querySave.venueType = filterValue.venueType;

  queryData(
    {
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: querySave.sort,
      order: querySave.order === false ? 'asc' : 'desc',
    },
    null,
    // @ts-ignore
    querySave,
  );
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info.sorter, context.trigger);
  if (context.trigger === 'sorter') {
    if (info.sorter === undefined) {
      querySave.sort = 'createTime';
      querySave.order = false;
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null, // @ts-ignore
        querySave,
      );
    } else {
      querySave.sort = info.sorter.sortBy;
      querySave.order = info.sorter.descending;
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null, // @ts-ignore
        querySave,
      );
    }
  }
};
// const onInputChange = (keyword) => {
//   console.log('搜索', keyword);
//   queryData(
//     {
//       pageNumber: pagination.current,
//       pageSize: pagination.pageSize,
//     },
//     {
//       selecte: {
//         additionalProp1: { keyword },
//       },
//     },
//   );
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
    queryData(
      {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      },
      null, // @ts-ignore
      querySave,
    ); // 分页数据改变时调用请求函数
    console.log('pagination.onChange', pageInfo);
  },
});

const AddFinsh = (newData) => {
  console.log(newData);
  queryData(
    {
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: querySave.sort,
      order: querySave.order === false ? 'asc' : 'desc',
    },
    null, // @ts-ignore
    querySave,
  );
};
</script>

<style lang="less" scoped></style>
