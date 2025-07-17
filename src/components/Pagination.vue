<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  length: number
  totalVisible?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change'): void
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val: number) => {
    emit('update:modelValue', val)
    emit('change')
  }
})
</script>

<template>
  <v-row justify="center" class="my-8" v-if="length > 1">
    <v-pagination
      :model-value="internalValue"
      :length="length"
      :total-visible="totalVisible"
    />
  </v-row>
</template>

<style scoped>

</style>
