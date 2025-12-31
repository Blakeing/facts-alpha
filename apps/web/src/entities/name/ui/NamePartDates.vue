<template>
  <div>
    <v-row dense>
      <v-col cols="5">
        <FDatePicker
          v-model="birthDate"
          field="birthDate"
          label="Date of Birth"
          :max="maxDate"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="5">
        <FDatePicker
          v-model="deathDate"
          field="deathDate"
          label="Date of Death"
          :max="maxDate"
          :readonly="readonly"
        />
      </v-col>
      <v-col cols="2">
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
      <v-col cols="5">
        <FTextField
          v-model="timeOfDeath"
          field="timeOfDeath"
          label="Time of Death"
          placeholder="HH:MM"
          :readonly="readonly"
        />
      </v-col>
      <v-col
        class="d-flex align-center"
        cols="3"
      >
        <v-checkbox
          v-model="deceased"
          color="primary"
          density="compact"
          :disabled="readonly"
          hide-details
          label="Deceased"
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

  const birthDate = computed({
    get: () => props.model.birthDate,
    set: (value: string | null) => {
      props.model.birthDate = value

      // Calculate age if both dates are present
      if (value && props.model.deathDate) {
        const birth = new Date(value)
        const death = new Date(props.model.deathDate)

        if (!isNaN(birth.getTime()) && !isNaN(death.getTime())) {
          let calculatedAge = death.getFullYear() - birth.getFullYear()
          const monthDiff = death.getMonth() - birth.getMonth()

          if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
            calculatedAge--
          }

          props.model.age = calculatedAge
        }
      }
    },
  })

  const deathDate = computed({
    get: () => props.model.deathDate,
    set: (value: string | null) => {
      props.model.deathDate = value
      props.model.deceased = !!value

      // Calculate age if both dates are present
      if (value && props.model.birthDate) {
        const birth = new Date(props.model.birthDate)
        const death = new Date(value)

        if (!isNaN(birth.getTime()) && !isNaN(death.getTime())) {
          let calculatedAge = death.getFullYear() - birth.getFullYear()
          const monthDiff = death.getMonth() - birth.getMonth()

          if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
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

  const timeOfDeath = computed({
    get: () => props.model.timeOfDeath,
    set: (value: string) => {
      props.model.timeOfDeath = value
    },
  })

  const deceased = computed({
    get: () => props.model.deceased,
    set: (value: boolean) => {
      props.model.deceased = value
    },
  })

  const shouldDisableAge = computed(() => {
    return !!(props.model.birthDate && props.model.deathDate)
  })
</script>
