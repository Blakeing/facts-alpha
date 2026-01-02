<!-- eslint-disable vue/no-mutating-props -- Working copy pattern: model is mutable -->
<template>
  <div>
    <v-row dense>
      <v-col cols="6">
        <FDatePicker
          v-model="deathDate"
          field="deathDate"
          label="Date of Death"
          :max="maxDate"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="6">
        <FTextField
          v-model="timeOfDeath"
          field="timeOfDeath"
          label="Time of Death"
          placeholder="HH:MM"
          :readonly="readonly"
        />
      </v-col>
    </v-row>
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
  import { computed } from 'vue'
  import { FDatePicker, FTextField } from '@/shared/ui'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  const maxDate = new Date().toISOString().split('T')[0]

  const deathDate = computed({
    get: () => props.model.deathDate,
    set: (value: string | null) => {
      props.model.deathDate = value
      // Set deceased based on whether death date exists
      props.model.deceased = !!value
      // Clear time of death if death date is cleared
      if (!value) {
        props.model.timeOfDeath = null
      }

      // Calculate age if both dates are present
      if (value && props.model.birthDate) {
        const birth = new Date(props.model.birthDate)
        const death = new Date(value)

        if (!Number.isNaN(birth.getTime()) && !Number.isNaN(death.getTime())) {
          let calculatedAge = death.getFullYear() - birth.getFullYear()
          const monthDiff = death.getMonth() - birth.getMonth()

          if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
            calculatedAge--
          }

          props.model.age = calculatedAge
        }
      } else if (!value && props.model.birthDate) {
        // Recalculate age based on current date if death date is cleared
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
    },
  })

  const timeOfDeath = computed({
    get: () => props.model.timeOfDeath,
    set: (value: string | null) => {
      props.model.timeOfDeath = value
    },
  })

  // Use toRef for direct reactive mutation
  // This works because edit contexts pass cloned models that can be mutated
  const weight = computed({
    get: () => props.model.weight,
    set: (value: number | null) => {
      props.model.weight = value
    },
  })

  const condition = computed({
    get: () => props.model.condition,
    set: (value: string | null) => {
      props.model.condition = value
    },
  })
</script>
