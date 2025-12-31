<template>
  <div>
    <v-row dense>
      <v-col cols="12">
        <FTextField
          v-model="address1"
          field="address1"
          label="Address"
          maxlength="255"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <FTextField
          v-model="city"
          field="city"
          label="City"
          maxlength="255"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="3">
        <FSelect
          v-model="state"
          field="state"
          label="State"
          :options="stateOptions"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="3">
        <FTextField
          v-model="postalCode"
          field="postalCode"
          label="Postal Code"
          maxlength="10"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <FSelect
          v-model="country"
          field="country"
          label="Country"
          :options="countryOptions"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { NameAddress } from '../model/name'
  import { toRef } from 'vue'
  import { FSelect, FTextField } from '@/shared/ui'

  const props = defineProps<{
    model: NameAddress
    readonly?: boolean
  }>()

  // Use toRef for direct reactive mutation
  // This works because edit contexts pass cloned models that can be mutated
  const address1 = toRef(props.model, 'address1')
  const city = toRef(props.model, 'city')
  const state = toRef(props.model, 'state')
  const postalCode = toRef(props.model, 'postalCode')
  const country = toRef(props.model, 'country')

  // Simple US states list - can be enhanced later
  const stateOptions = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ]

  const countryOptions = [
    { value: 'USA', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
  ]
</script>
