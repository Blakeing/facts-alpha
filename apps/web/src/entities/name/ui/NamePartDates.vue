<template>
  <div>
    <v-row dense>
      <v-col cols="6">
        <FDatePicker
          v-model="birthDate"
          field="birthDate"
          label="Date of Birth"
          :max="maxDate"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="6">
        <FTextField
          v-model="age"
          field="age"
          label="Age"
          :readonly="readonly || shouldDisableAge"
          type="number"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <FSwitch
          v-model="deceased"
          color="primary"
          :disabled="readonly"
          field="deceased"
          label="Deceased"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  /* eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable */
  import type { Name } from '../model/name'
  import { computed } from 'vue'
  import { FDatePicker, FSwitch, FTextField } from '@/shared/ui'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  const maxDate = new Date().toISOString().split('T')[0]

  const birthDate = computed({
    get: () => props.model.birthDate,
    set: (value: string | null) => {
      props.model.birthDate = value

      // Calculate age if both dates are present
      if (value && props.model.deathDate) {
        const birth = new Date(value)
        const death = new Date(props.model.deathDate)

        if (!Number.isNaN(birth.getTime()) && !Number.isNaN(death.getTime())) {
          let calculatedAge = death.getFullYear() - birth.getFullYear()
          const monthDiff = death.getMonth() - birth.getMonth()

          if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
            calculatedAge--
          }

          props.model.age = calculatedAge
        }
      } else if (value && !props.model.deathDate) {
        // Recalculate age based on current date if no death date
        const birth = new Date(value)
        const now = new Date()
        if (!Number.isNaN(birth.getTime())) {
          let calculatedAge = now.getFullYear() - birth.getFullYear()
          const monthDiff = now.getMonth() - birth.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
            calculatedAge--
          }
          props.model.age = calculatedAge
        }
      }
    },
  })

  const age = computed({
    get: () => props.model.age,
    set: (value: number | null) => {
      props.model.age = value
    },
  })

  const deceased = computed({
    get: () => props.model.deceased,
    set: (value: boolean) => {
      props.model.deceased = value
      // If deceased is unchecked, clear death date and time of death
      if (!value) {
        props.model.deathDate = null
        props.model.timeOfDeath = null
        // Recalculate age if birth date exists (now that death date is cleared)
        if (props.model.birthDate) {
          const birth = new Date(props.model.birthDate)
          const now = new Date()
          if (!Number.isNaN(birth.getTime())) {
            let calculatedAge = now.getFullYear() - birth.getFullYear()
            const monthDiff = now.getMonth() - birth.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
              calculatedAge--
            }
            props.model.age = calculatedAge
          }
        }
      }
    },
  })

  const shouldDisableAge = computed(() => {
    return !!(props.model.birthDate && props.model.deathDate)
  })
</script>
