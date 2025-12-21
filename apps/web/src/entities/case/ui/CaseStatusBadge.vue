<template>
  <v-chip
    :color="color"
    label
    size="small"
    :variant="variant"
  >
    {{ label }}
  </v-chip>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { type CaseStatus, getStatusColor, getStatusLabel } from '../model/case'

export interface CaseStatusBadgeProps {
  status: CaseStatus
  variant?: 'flat' | 'outlined' | 'text' | 'tonal'
}

const props = withDefaults(defineProps<CaseStatusBadgeProps>(), {
  variant: 'tonal',
})

const color = computed(() => getStatusColor(props.status))
const label = computed(() => getStatusLabel(props.status))
</script>

