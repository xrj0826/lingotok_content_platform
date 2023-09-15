<template>
  <div>
    <t-row justify="center">
      <t-col :span="6">
        <t-card :class="modelValue === options[0].value ? 'card-active' : ''" style="width: 150px"
          :title="options[0].label" :bordered="false" hover-shadow class="card-choose" @click="() => {
              emits('update:modelValue', options[0].value);
            }
            ">
          <template #actions>
            <t-radio :checked="modelValue === options[0].value"></t-radio>
          </template>
        </t-card>
      </t-col>
      <t-col :span="6">
        <t-card :class="modelValue === options[1].value ? 'card-active' : ''" style="width: 150px; margin-left: 15px"
          :title="options[1].label" :bordered="false" hover-shadow class="card-choose" @click="() => {
              emits('update:modelValue', options[1].value);
            }
            ">
          <template #actions>
            <t-radio :checked="modelValue === options[1].value"></t-radio>
          </template> </t-card></t-col>
    </t-row>
  </div>
</template>
<script lang="tsx">
export default {
  name: 'WSwitch',
};
</script>
<script setup lang="tsx">
defineProps<{
  options: [
    {
      label: string;
      value: string | number;
    },
    {
      label: string;
      value: string | number;
    },
  ];
  modelValue: string | number;
}>();
const emits = defineEmits(['update:modelValue']);
</script>

<style lang="less" scoped>
.card-choose {
  border: 1px solid rgb(245, 245, 247);
}

.card-active {
  border: 1px solid rgb(84, 111, 255);
}
</style>
