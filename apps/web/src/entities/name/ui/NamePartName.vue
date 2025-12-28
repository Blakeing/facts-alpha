<template>
  <div>
    <v-row dense>
      <v-col>
        <FTextField
          v-model="prefix"
          field="prefix"
          label="Prefix"
          maxlength="50"
          :readonly="namePartReadonly"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="first"
          field="first"
          label="First"
          maxlength="255"
          :readonly="namePartReadonly"
          :required="isNameRequired"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="middle"
          field="middle"
          label="Middle"
          maxlength="255"
          :readonly="namePartReadonly"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="last"
          field="last"
          label="Last"
          maxlength="255"
          :readonly="namePartReadonly"
          :required="isNameRequired"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="suffix"
          field="suffix"
          label="Suffix"
          maxlength="50"
          :readonly="namePartReadonly"
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
    namePartReadonly?: boolean
    isNameRequired?: boolean
  }>()

  const prefix = toRef(props.model, 'prefix')
  const first = toRef(props.model, 'first')
  const middle = toRef(props.model, 'middle')
  const last = toRef(props.model, 'last')
  const suffix = toRef(props.model, 'suffix')
</script>
