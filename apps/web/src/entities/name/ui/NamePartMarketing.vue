<!-- eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable -->
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
<!-- eslint-enable vue/no-mutating-props -->

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { watch } from 'vue'

  /**
   * NamePartMarketing - Marketing opt-out field
   *
   * WORKING COPY PATTERN:
   * This component receives a mutable Name object from NamePanel.
   * Direct v-model binding and mutation is intentional.
   */

  const props = defineProps<{
    model: Name // Mutable working copy
    readonly?: boolean
  }>()

  // Auto-check opt-out if person is deceased
  watch(
    () => props.model.deceased,
    (newValue) => {
      if (newValue && !props.model.optOutMarketing) {
        // eslint-disable-next-line vue/no-mutating-props
        props.model.optOutMarketing = true
      }
    },
  )
</script>
