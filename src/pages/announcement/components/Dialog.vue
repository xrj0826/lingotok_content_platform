<template>
  <div>
    <t-space>
      <t-space>
        <t-link theme="primery" @click="handlerEdit">编辑</t-link>
      </t-space>
      <t-dialog v-model:visible="visible" header="保存订单" body="订单保存中，请稍后" :confirm-btn="{
        content: '提交',
        theme: 'primary',
        loading,
      }" :on-confirm="edit" :on-close="close" />
    </t-space>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({ editId: String || Number })//为什么这里类型只能用大写，不然会警告?

const emit = defineEmits(['edit'])

const visible = ref(false);
const loading = ref(false);

const close = () => {
  console.error('===close');
  visible.value = false;
};

const handlerEdit = (e) => {
  visible.value = true
  console.log(props.editId);
  // axios({
  //   method: 'GET',
  //   url: `/dish/selectOne/${props.editId}`,
  // }).then(res => {
  //   console.log("后端返回的数据:", res);
  //   const data = res.data.data
  // }).catch(error => {
  //   alert(error)
  // })
};
//确定编辑
const edit = () => {
  emit('edit', "emit传来喜报:组件通信成功")
  loading.value = true;
  const timer = setTimeout(() => {
    loading.value = false;
    visible.value = false;
    clearTimeout(timer);
  }, 500);
};

</script>
