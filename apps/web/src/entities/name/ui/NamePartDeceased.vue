<template>
  <div>
    <v-row dense>
      <v-col>
        <FTextField
          v-model="model.weight"
          field="weight"
          label="Weight"
          :readonly="readonly"
          type="number"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="model.condition"
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
  import { FTextField } from '@/shared/ui'

  defineProps<{
    model: Name
    readonly?: boolean
  }>()
</script>
