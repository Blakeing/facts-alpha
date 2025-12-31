<template>
  <div>
    <v-row dense>
      <v-col v-if="!hideSSN">
        <FTextField
          v-model="nationalIdentifier"
          field="nationalIdentifier"
          :label="nationalIdLabel"
          placeholder="###-##-####"
          :readonly="readonly"
        />
      </v-col>
      <v-col>
        <FTextField
          v-model="driversLicense"
          field="driversLicense"
          :label="stateIdLabel"
          :readonly="readonly"
        />
      </v-col>
      <v-col>
        <FSelect
          v-model="driversLicenseState"
          field="driversLicenseState"
          label="Issuer"
          :options="stateOptions"
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

  const props = defineProps<{
    model: Name
    hideSSN?: boolean
    readonly?: boolean
  }>()

  // Use toRef for direct reactive mutation
  // This works because edit contexts pass cloned models that can be mutated
  const nationalIdentifier = toRef(props.model, 'nationalIdentifier')
  const driversLicense = toRef(props.model, 'driversLicense')
  const driversLicenseState = toRef(props.model, 'driversLicenseState')

  // Simple US states list
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

  const country = computed(() => {
    const addr = props.model.addresses.find((a) => a.primary)
    return addr?.country || 'USA'
  })

  const nationalIdLabel = computed(() => {
    switch (country.value) {
      case 'US':
      case 'USA': {
        return 'SSN'
      }
      case 'Canada': {
        return 'SIN'
      }
      default: {
        return 'National ID Number'
      }
    }
  })

  const stateIdLabel = computed(() => {
    switch (country.value) {
      case 'US':
      case 'USA': {
        return 'State ID Number'
      }
      case 'Canada': {
        return 'Provincial ID Number'
      }
      default: {
        return 'Local ID Number'
      }
    }
  })
</script>
