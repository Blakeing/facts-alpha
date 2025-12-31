<template>
  <div>
    <v-row dense>
      <v-col>
        <FTextField
          v-model="weight"
          field="weight"
          label="Weight"
          :readonly="readonly"
          type="number"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="condition"
          field="condition"
          label="Condition"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { toRef } from 'vue'
  import { FTextField } from '@/shared/ui'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  // Use toRef for direct reactive mutation
  // This works because edit contexts pass cloned models that can be mutated
  const weight = toRef(props.model, 'weight')
  const condition = toRef(props.model, 'condition')
</script>
