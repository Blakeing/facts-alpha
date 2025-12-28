<template>
  <div>
    <v-row dense>
      <v-col cols="6">
        <FSelect
          v-model="model.gender"
          field="gender"
          label="Gender"
          :options="genderOptions"
          :readonly="readonly"
          clearable
        />
      </v-col>
      <v-col cols="6">
        <FSelect
          v-model="model.maritalStatus"
          field="maritalStatus"
          label="Marital Status"
          :options="maritalStatusOptions"
          :readonly="readonly"
          clearable
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <FTextField
          v-model="model.ethnicity"
          field="ethnicity"
          label="Ethnicity"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="6">
        <FTextField
          v-model="model.race"
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
import { Gender, MaritalStatus } from '../model/name'
import { FTextField, FSelect } from '@/shared/ui'

defineProps<{
  model: Name
  readonly?: boolean
}>()

const genderOptions = [
  { value: Gender.UNKNOWN, label: 'Unknown' },
  { value: Gender.MALE, label: 'Male' },
  { value: Gender.FEMALE, label: 'Female' },
  { value: Gender.OTHER, label: 'Other' },
]

const maritalStatusOptions = [
  { value: MaritalStatus.UNKNOWN, label: 'Unknown' },
  { value: MaritalStatus.SINGLE, label: 'Single' },
  { value: MaritalStatus.MARRIED, label: 'Married' },
  { value: MaritalStatus.DIVORCED, label: 'Divorced' },
  { value: MaritalStatus.WIDOWED, label: 'Widowed' },
  { value: MaritalStatus.SEPARATED, label: 'Separated' },
]
</script>

