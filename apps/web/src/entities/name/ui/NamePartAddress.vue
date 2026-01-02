<template>
  <div>
    <v-row dense>
      <v-col cols="12">
        <FTextField
          v-model="address1"
          :field="fieldPrefix ? `${fieldPrefix}.address1` : 'address1'"
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
          :field="fieldPrefix ? `${fieldPrefix}.city` : 'city'"
          label="City"
          maxlength="255"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="3">
        <FSelect
          v-model="state"
          :field="fieldPrefix ? `${fieldPrefix}.state` : 'state'"
          label="State"
          :options="stateOptions"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="3">
        <FTextField
          v-model="postalCode"
          :field="fieldPrefix ? `${fieldPrefix}.postalCode` : 'postalCode'"
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
          :field="fieldPrefix ? `${fieldPrefix}.country` : 'country'"
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
  import { computed, toRef } from 'vue'
  import { FSelect, FTextField } from '@/shared/ui'

  const props = defineProps<{
    model: NameAddress
    readonly?: boolean
    /** Field prefix for validation (e.g., "addresses.0") */
    fieldPrefix?: string
  }>()

  const fieldPrefix = computed(() => props.fieldPrefix)

  // Use toRef for direct reactive mutation
  // This works because edit contexts pass cloned models that can be mutated
  const address1 = toRef(props.model, 'address1')
  const city = toRef(props.model, 'city')
  const state = toRef(props.model, 'state')
  const postalCode = toRef(props.model, 'postalCode')
  const country = toRef(props.model, 'country')

  // Simple US states list - can be enhanced later
  const stateOptions = [
    { value: 'AL', title: 'Alabama' },
    { value: 'AK', title: 'Alaska' },
    { value: 'AZ', title: 'Arizona' },
    { value: 'AR', title: 'Arkansas' },
    { value: 'CA', title: 'California' },
    { value: 'CO', title: 'Colorado' },
    { value: 'CT', title: 'Connecticut' },
    { value: 'DE', title: 'Delaware' },
    { value: 'FL', title: 'Florida' },
    { value: 'GA', title: 'Georgia' },
    { value: 'HI', title: 'Hawaii' },
    { value: 'ID', title: 'Idaho' },
    { value: 'IL', title: 'Illinois' },
    { value: 'IN', title: 'Indiana' },
    { value: 'IA', title: 'Iowa' },
    { value: 'KS', title: 'Kansas' },
    { value: 'KY', title: 'Kentucky' },
    { value: 'LA', title: 'Louisiana' },
    { value: 'ME', title: 'Maine' },
    { value: 'MD', title: 'Maryland' },
    { value: 'MA', title: 'Massachusetts' },
    { value: 'MI', title: 'Michigan' },
    { value: 'MN', title: 'Minnesota' },
    { value: 'MS', title: 'Mississippi' },
    { value: 'MO', title: 'Missouri' },
    { value: 'MT', title: 'Montana' },
    { value: 'NE', title: 'Nebraska' },
    { value: 'NV', title: 'Nevada' },
    { value: 'NH', title: 'New Hampshire' },
    { value: 'NJ', title: 'New Jersey' },
    { value: 'NM', title: 'New Mexico' },
    { value: 'NY', title: 'New York' },
    { value: 'NC', title: 'North Carolina' },
    { value: 'ND', title: 'North Dakota' },
    { value: 'OH', title: 'Ohio' },
    { value: 'OK', title: 'Oklahoma' },
    { value: 'OR', title: 'Oregon' },
    { value: 'PA', title: 'Pennsylvania' },
    { value: 'RI', title: 'Rhode Island' },
    { value: 'SC', title: 'South Carolina' },
    { value: 'SD', title: 'South Dakota' },
    { value: 'TN', title: 'Tennessee' },
    { value: 'TX', title: 'Texas' },
    { value: 'UT', title: 'Utah' },
    { value: 'VT', title: 'Vermont' },
    { value: 'VA', title: 'Virginia' },
    { value: 'WA', title: 'Washington' },
    { value: 'WV', title: 'West Virginia' },
    { value: 'WI', title: 'Wisconsin' },
    { value: 'WY', title: 'Wyoming' },
  ]

  const countryOptions = [
    { value: 'USA', title: 'United States' },
    { value: 'Canada', title: 'Canada' },
  ]
</script>
