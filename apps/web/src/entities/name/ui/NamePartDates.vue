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
          v-model="model.timeOfDeath"
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
          v-model="model.deceased"
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
  import { computed, ref, watch } from 'vue'
  import { FDatePicker, FTextField } from '@/shared/ui'

  const props = defineProps<{
    model: Name
    readonly?: boolean
  }>()

  const maxDate = new Date().toISOString().split('T')[0]

  const birthDate = ref<string | null>(props.model.birthDate)
  const deathDate = ref<string | null>(props.model.deathDate)
  const age = ref<number | null>(props.model.age)

  const shouldDisableAge = computed(() => {
    return !!(birthDate.value && deathDate.value)
  })

  function updateAgeIfBothDatesPresent() {
    if (birthDate.value && deathDate.value) {
      const birth = new Date(birthDate.value)
      const death = new Date(deathDate.value)

      if (isNaN(birth.getTime()) || isNaN(death.getTime())) {
        return
      }

      let calculatedAge = death.getFullYear() - birth.getFullYear()
      const monthDiff = death.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
        calculatedAge--
      }

      age.value = calculatedAge
      props.model.age = calculatedAge
    }
  }

  watch(birthDate, (newVal) => {
    props.model.birthDate = newVal
    updateAgeIfBothDatesPresent()
  })

  watch(deathDate, (newVal) => {
    props.model.deathDate = newVal
    if (props.model.deathDate) {
      props.model.deceased = true
    }
    updateAgeIfBothDatesPresent()
  })

  watch(age, (newVal) => {
    props.model.age = newVal
  })

  watch(
    () => props.model.birthDate,
    (newVal) => {
      birthDate.value = newVal
    },
  )

  watch(
    () => props.model.deathDate,
    (newVal) => {
      deathDate.value = newVal
    },
  )
</script>
