<template>
  <div>
    <v-row dense>
      <v-col cols="6">
        <FSelect
          v-model="gender"
          clearable
          field="gender"
          label="Gender"
          :options="genderOptions"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="6">
        <FTextField
          v-model="ethnicity"
          field="ethnicity"
          label="Ethnicity"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <FTextField
          v-model="race"
          field="race"
          label="Race"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { Name } from '../model/name'
  import { toRef } from 'vue'
  import { FSelect, FTextField } from '@/shared/ui'
  import { Gender } from '../model/name'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  // Use toRef for direct reactive mutation
  // This works because edit contexts pass cloned models that can be mutated
  const gender = toRef(props.model, 'gender')
  const ethnicity = toRef(props.model, 'ethnicity')
  const race = toRef(props.model, 'race')

  const genderOptions = [
    { value: Gender.UNKNOWN, title: 'Unknown' },
    { value: Gender.MALE, title: 'Male' },
    { value: Gender.FEMALE, title: 'Female' },
    { value: Gender.OTHER, title: 'Other' },
  ]
</script>
