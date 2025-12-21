<template>
  <v-chip
    :color="color"
    :variant="variant"
    size="small"
    label
  >
    {{ label }}
  </v-chip>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { getStatusColor, getStatusLabel, type CaseStatus } from '../model/case'

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

