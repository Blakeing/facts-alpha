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
  import { getSaleStatusColor, getSaleStatusLabel, type SaleStatus } from '../model/contract'

  interface Props {
    status: SaleStatus
  }

  const props = defineProps<Props>()

  const statusLabel = computed(() => getSaleStatusLabel(props.status))
  const statusColor = computed(() => getSaleStatusColor(props.status))
</script>
