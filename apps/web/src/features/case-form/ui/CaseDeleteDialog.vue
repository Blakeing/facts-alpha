<template>
  <FDialog
    v-model="model"
    persistent
    size="sm"
    title="Delete Case"
  >
    <p class="text-body-1 mb-4">
      Are you sure you want to delete case <strong>{{ caseNumber }}</strong>?
    </p>
    <p class="text-body-2 text-medium-emphasis">
      This action cannot be undone. All data associated with this case will be permanently removed.
    </p>

    <template #actions>
      <FButton intent="secondary" @click="emit('update:modelValue', false)">
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
import { FButton, FDialog } from '@facts/ui'
import { computed } from 'vue'

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

