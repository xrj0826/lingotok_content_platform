<template>
  <div>
    <!-- v-if="tableData.length !== 0" -->
    <div style="display: flex; flex-wrap: wrap">
      <div v-for="item in tableData" :key="item.id" class="item">
        <div class="decorate"></div>
        <div class="center">
          <img class="douhao" src="./images/Frame28.png" alt="" />
          <t-rate :value="item.rating"></t-rate>
          <div class="content">{{ item.comment }}</div>
        </div>
        <div class="userItem">
          <t-image shape="circle" style="width: 55px; height: 55px"
            :src="'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg9.doubanio.com%2Fview%2Fgroup_topic%2Fl%2Fpublic%2Fp515054775.jpg&refer=http%3A%2F%2Fimg9.doubanio.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1693661988&t=d5e54cb6137bd6f24cc8137265a51500'"></t-image>
          <span class="name">{{ item.createBy }}</span>
        </div>
      </div>
    </div>
    <!-- <no-pass v-else text="该用户暂时没有评论" warm="好"></no-pass> -->
  </div>
</template>
<script lang="tsx">
export default {
  name: 'CommentDetail',
};
</script>
<script setup lang="tsx">
import { reactive, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';

// import { getEvaluationList } from '@/api/openapi/evaluation';
// import NoPass from '@/components/no-pass/index.vue';
import { useUserStore } from '@/store';
import { useActiveFeature } from '@/utils/active';

const route = useRoute();
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  fliterValue: {
    status: undefined,
    title: '',
  },
});

const tableData: Ref<API.Evaluation[]> = ref([]);
// const userStore = useUserStore();
// const userId = ref('');
// useActiveFeature(async () => {
//   const id = route.query.id as string;
//   userId.value = id;
//   if (id === undefined) {
//     userId.value = userStore.userInfo.id;
//   }
//   pagination.current = 1;
//   onPageChange(pagination);
// });
// const onPageChange = async (pageInfo) => {
//   pagination.current = pageInfo.current;
//   pagination.pageSize = pageInfo.pageSize;
//   const { records, total } = await getEvaluationList({
//     userId: userId.value,
//     pageVO: {
//       pageNumber: pagination.current,
//       pageSize: pagination.pageSize,
//     },
//   });
//   tableData.value = records;
//   pagination.total = total;
// };
</script>

<style lang="less" scoped>
.item {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 200px;
  margin: 30px;
  background: rgb(255, 255, 255);
  border-radius: 8px 8px 0px 0px;

  .decorate {
    position: absolute;
    top: 0;
    left: 0;
    width: 100px;
    height: 11px;
    background: rgb(160, 205, 158);
    border-radius: 8px 0px 0px 0px;
  }

  .center {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px 13px 0;

    .douhao {
      float: right;
    }

    .content {
      margin-top: 12px;
      color: rgb(45, 46, 46);
      font-weight: 400;
      font-size: 16px;
      font-family: Inter;
      line-height: 22px;
    }
  }

  .userItem {
    display: flex;
    align-items: center;
    height: 72px;
    padding: 0 13px;
    background: rgb(76, 83, 255);

    .name {
      margin-left: 14px;
      color: rgb(248, 248, 255);
      font-weight: 400;
      font-size: 16px;
      font-family: Inter;
      line-height: 22px;
    }
  }
}
</style>
