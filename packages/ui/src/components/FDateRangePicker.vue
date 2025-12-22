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
        @blur="handleBlur"
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
   * @example
   * // With form context
   * <FFormProvider :get-error="getError" :touch="touch" :validate-if-touched="validateIfTouched">
   *   <FDateRangePicker v-model="model.dateRange" field="dateRange" label="Date Range" />
   * </FFormProvider>
   *
   * @example
   * // Standalone
   * <FDateRangePicker v-model="dateRange" label="Filter by date" />
   */
  export type DateRange = Date[] | readonly Date[]

  export interface FDateRangePickerProps {
    /** Field path for auto error/blur via form context */
    field?: string
    /** Date range value (array of dates) */
    modelValue?: DateRange
    /** External error message (manual mode) */
    error?: string
  }
</script>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { useFormContext } from '../composables/useFormContext'

  const props = withDefaults(defineProps<FDateRangePickerProps>(), {
    field: undefined,
    modelValue: () => [],
    error: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: DateRange]
    blur: [event: FocusEvent]
  }>()

  const menuOpen = ref(false)
  const formContext = useFormContext()

  const fieldValue = computed({
    get: () => props.modelValue ?? [],
    set: (val) => emit('update:modelValue', val as DateRange),
  })

  const fieldError = computed(() => {
    if (props.field && formContext) {
      return formContext.getError(props.field)
    }
    return props.error
  })

  // Real-time validation for touched fields
  watch(
    () => props.modelValue,
    () => {
      if (props.field && formContext?.validateIfTouched) {
        formContext.validateIfTouched(props.field)
      }
    },
    { deep: true },
  )

  // Format date for display
  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  // Format the display value
  const displayValue = computed(() => {
    const range = fieldValue.value
    if (!range || !Array.isArray(range) || range.length === 0) {
      return ''
    }

    const startDate = range.at(0)
    const endDate = range.at(-1)

    if (range.length === 1 && startDate) {
      return formatDate(startDate)
    }

    if (startDate && endDate) {
      return `${formatDate(startDate)} — ${formatDate(endDate)}`
    }

    return ''
  })

  function handleBlur(e: FocusEvent) {
    if (props.field && formContext) {
      formContext.touch(props.field)
    }
    emit('blur', e)
  }

  function handleClear() {
    fieldValue.value = []
    menuOpen.value = false
  }
</script>
