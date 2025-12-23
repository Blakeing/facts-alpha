<template>
  <v-chip
    :color="typeColor"
    density="comfortable"
    label
    size="small"
    variant="tonal"
  >
    {{ typeLabel }}
  </v-chip>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { getLocationTypeColor, getLocationTypeLabel, type LocationType } from '../model/location'

  interface Props {
    type: LocationType
  }

  const props = defineProps<Props>()

  const typeLabel = computed(() => getLocationTypeLabel(props.type))
  const typeColor = computed(() => getLocationTypeColor(props.type))
</script>
