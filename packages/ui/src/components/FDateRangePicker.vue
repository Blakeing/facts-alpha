<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    location="bottom start"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-bind="{ ...activatorProps, ...$attrs }"
        :error-messages="fieldError"
        :model-value="displayValue"
        readonly
      />
    </template>

    <v-date-picker
      v-model="fieldValue"
      multiple="range"
      show-adjacent-months
    >
      <template #actions>
        <v-btn
          text="Clear"
          variant="text"
          @click="handleClear"
        />
        <v-btn
          text="OK"
          variant="text"
          @click="menuOpen = false"
        />
      </template>
    </v-date-picker>
  </v-menu>
</template>

<script lang="ts">
  /**
   * FDateRangePicker - Date range selection with calendar popup
   *
   * Select start and end dates using a calendar interface.
   * Text field props pass through via $attrs.
   *
   * @example
   * // Standalone
   * <FDateRangePicker v-model="dateRange" label="Filter by date" />
   *
   * @example
   * // Form-integrated
   * <FDateRangePicker name="reportPeriod" label="Report period" />
   */
  export type DateRange = Date[] | readonly Date[]

  export interface FDateRangePickerProps {
    /** Field name for vee-validate form binding */
    name?: string
    /** Date range value (array of dates) */
    modelValue?: DateRange
  }
</script>

<script lang="ts" setup>
  import { useField } from 'vee-validate'
  import { computed, ref, toRef } from 'vue'

  const props = withDefaults(defineProps<FDateRangePickerProps>(), {
    name: undefined,
    modelValue: () => [],
  })

  const emit = defineEmits<{ 'update:modelValue': [value: DateRange] }>()

  const menuOpen = ref(false)

  const nameRef = toRef(props, 'name')
  const field = props.name ? useField<DateRange>(nameRef as unknown as string) : null

  const fieldValue = computed({
    get: () => {
      const val = field ? field.value.value : props.modelValue
      return val ?? []
    },
    set: (val) => {
      const range = val as DateRange
      if (field) {
        field.value.value = range
      } else {
        emit('update:modelValue', range)
      }
    },
  })

  const fieldError = computed(() => field?.errorMessage.value)

  // Format the display value
  const displayValue = computed(() => {
    const range = fieldValue.value
    if (!range || !Array.isArray(range) || range.length === 0) {
      return ''
    }

    const formatDate = (date: Date) => {
      if (!(date instanceof Date)) return ''
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const startDate = range[0]
    const endDate = range[range.length - 1]

    if (range.length === 1 && startDate) {
      return formatDate(startDate)
    }

    if (startDate && endDate) {
      return `${formatDate(startDate)} — ${formatDate(endDate)}`
    }

    return ''
  })

  function handleClear() {
    fieldValue.value = []
    menuOpen.value = false
  }
</script>
