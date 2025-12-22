<template>
  <v-chip
    :color="statusColor"
    density="comfortable"
    label
    size="small"
    variant="tonal"
  >
    {{ statusLabel }}
  </v-chip>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import {
    type ContractStatus,
    getContractStatusColor,
    getContractStatusLabel,
  } from '../model/contract'

  interface Props {
    status: ContractStatus
  }

  const props = defineProps<Props>()

  const statusLabel = computed(() => getContractStatusLabel(props.status))
  const statusColor = computed(() => getContractStatusColor(props.status))
</script>
