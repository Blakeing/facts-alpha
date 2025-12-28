<template>
  <div>
    <v-row dense>
      <v-col cols="12">
        <v-checkbox
          v-model="model.optOutMarketing"
          label="Opt out of Future Marketing"
          :disabled="readonly || model.deceased || model.deathDate != null"
          color="primary"
          density="compact"
          hide-details
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import type { Name } from '../model/name'

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

