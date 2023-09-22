<template>
  <div>
    <t-link
      theme="primary"
      @click="editBegin"
      >编辑</t-link
    >

    <t-drawer
      v-model:visible="visible"
      header="标题名称"
      :on-confirm="edit"
      @close="handleClose"
    >
      <t-space
        direction="vertical"
        size="large"
        style="width: 100%"
      >
        <t-space
          direction="vertical"
          :size="0"
          style="width: 100%"
        >
          <span>标签 A</span>
          <t-input />
        </t-space>
        <t-space
          direction="vertical"
          :size="0"
          style="width: 100%"
        >
          <span>标签 B</span>
          <t-input />
        </t-space>
        <t-space
          direction="vertical"
          :size="0"
          style="width: 100%"
        >
          <span>标签 C</span>
          <t-input />
        </t-space>
      </t-space>
    </t-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({ editId: String || Number }); // 为什么这里类型只能用大写，不然会警告?
const emit = defineEmits(['ok']);

const visible = ref(false);

const handleClose = () => {
  visible.value = false;
};

const editBegin = () => {
  visible.value = true;
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
// 确定编辑
const edit = () => {
  visible.value = false;
  emit('edit', 'emit传来喜报:组件通信成功');
  // .then((values) => {
  //   console.log('表格行id', props.editId)

  //   console.log('Received values of form: ', values)
  //   console.log('formState: ', toRaw(formState))
  //   visible.value = false
  //   formRef.value.resetFields()
  //   console.log('reset formState: ', toRaw(formState))

  //   axios({
  //     method: 'POST',
  //     url: '/dish/update',
  //     params: { id: props.editId },
  //     data: values,
  //   }).then((res) => {
  //     console.log(res.data.data)
  //     emit('edit', res.data.data)
  //   })
  // })
  // .catch((info) => {
  //   console.log('Validate Failed:', info)
  // })
  // console.log(res.data.data)
};
</script>
