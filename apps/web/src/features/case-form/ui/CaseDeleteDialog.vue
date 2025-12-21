<template>
  <FDialog
    v-model="model"
    title="Delete Case"
    size="sm"
    persistent
  >
    <p class="text-body-1 mb-4">
      Are you sure you want to delete case <strong>{{ caseNumber }}</strong>?
    </p>
    <p class="text-body-2 text-medium-emphasis">
      This action cannot be undone. All data associated with this case will be permanently removed.
    </p>

    <template #actions="{ close }">
      <FButton intent="secondary" @click="close">
        Cancel
      </FButton>
      <FButton
        intent="danger"
        :loading="loading"
        @click="handleConfirm"
      >
        Delete Case
      </FButton>
    </template>
  </FDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { FDialog, FButton } from '@facts/ui'

const props = defineProps<{
  modelValue: boolean
  caseNumber: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function handleConfirm() {
  emit('confirm')
}
</script>

