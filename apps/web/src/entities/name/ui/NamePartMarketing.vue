<template>
  <div>
    <v-row dense>
      <v-col cols="12">
        <v-checkbox
          v-model="model.optOutMarketing"
          color="primary"
          density="compact"
          :disabled="readonly || model.deceased || model.deathDate != null"
          hide-details
          label="Opt out of Future Marketing"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { watch } from 'vue'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  watch(
    () => props.model.deceased,
    (newValue) => {
      if (newValue) {
        props.model.optOutMarketing = true
      }
    },
  )
</script>
