<template>
  <v-chip
    :color="statusColor"
    density="comfortable"
    label
    size="small"
    variant="tonal"
  >
    {{ status }}
  </v-chip>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  interface Props {
    /** Status string from BFF (e.g., "Draft", "Executed", "Finalized", "Void") */
    status?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    status: 'Draft'
  })

  // Map status string to display color (matches legacy ContractList.vue)
  const statusColor = computed(() => {
    switch (props.status) {
      case 'Executed':
        return 'success'
      case 'Finalized':
        return 'warning'
      case 'Void':
      case 'Cancelled':
        return 'error'
      case 'Draft':
      default:
        return 'grey'
    }
  })
</script>
