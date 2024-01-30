<template>
  <div>
    <!-- 客服管理 -->
    <!-- <add @add="AddFinsh"></add> -->

    <!-- <t-card>
      <t-space style="margin: 0 20px 20px 0">
        <t-popconfirm content="确认删除吗" :on-confirm="handleMoreDelete">
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
        <t-select-input
          placeholder="根据姓名搜素"
          allow-input
          clearable
          style="width: 300px"
          @input-change="onInputChange"
        >
          <template #suffixIcon><search-icon /></template>
        </t-select-input>
      </t-space>
      <t-table :row-key="index" :data="data" :columns="columns" table-layout="fixed" :bordered="true" size="small"
        :pagination="pagination" cell-empty-content="-" resizable :loading="isLoading" :hover="true"
        :show-sort-column-bg-color="true" right-fixed-column="1" :selected-row-keys="selectedRowKeys"
        @row-click="handleRowClick" @select-change="onSelectChange" @filter-change="onFilterChange" @change="onChange">
        自定义表头，title值为插槽名称 
        <template #title-slot-name>
          <div style="display: flex; justify-content: center">
            <UserCircleIcon style="margin-right: 8px" />申请人
          </div>
        </template>
      </t-table></t-card> -->
    <div>
      <t-button @click="visible = true">密码修改</t-button>
    </div>

    <t-dialog width="500px" theme="info" header="密码修改" @close="closeVisible()" :visible.sync="visible" @confirm=""
      :footer="false">
      <div style="display: flex;padding: 20px;padding-bottom: 0px;">
        <div style="width: 130px;">
          请输入原密码
        </div>
        <t-input v-model="password">
        </t-input>
      </div>
      <div v-if="visiblePassword" style="color: #cc2f2f;margin-top: 10px;margin-left: 120px;">*原密码不能为空</div>
      <div style="display: flex;padding: 20px;padding-bottom: 0px;">
        <div style="width: 130px;">
          请输入新密码
        </div>
        <t-input v-model="newPassword">
        </t-input>
      </div>
      <div v-if="visibleNew" style="color: #cc2f2f;margin-top: 10px;margin-left: 120px;">*新密码不能为空</div>
      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <t-button @click="edit">修改确认</t-button>
      </div>

    </t-dialog>
  </div>
</template>

<script setup lang="tsx">
import { editPassword } from '@/api/user/passport';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';


const closeVisible = () => {
  visible.value = false
}

const password = ref("")
const newPassword = ref("")
const visible = ref(false)

const edit = () => {
  if (password.value == "" && newPassword.value == "") {
    visiblePassword.value = true
    visibleNew.value = true
    return
  }
  if (password.value == "") {
    visiblePassword.value = true
    return
  }
  if (newPassword.value == "") {
    visiblePassword.value = true
    return
  }
  const params = {
    password: password.value,
    newPassword: newPassword.value
  }
  editPassword(params).then((res) => {
    if (res.code == 20016) {
      MessagePlugin.error('旧密码错误')
    }
    if (res.code == 20001) {
      MessagePlugin.success('修改成功')
      visible.value = false
      password.value = ""
      newPassword.value = ""
    }
  })
}
const visiblePassword = ref(false)
const visibleNew = ref(false)

watch(password, (newValue, oldValue) => {
  if (password.value != "") {
    visiblePassword.value = false
  }
});

watch(newPassword, (newValue, oldValue) => {
  if (newPassword.value != "") {
    visiblePassword.value = false
  }
});
</script>

<style lang="less" scoped></style>
