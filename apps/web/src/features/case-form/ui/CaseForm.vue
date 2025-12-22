<template>
  <div class="case-form">
    <!-- Validation errors summary -->
    <FFormErrors
      class="mb-6"
      :errors="errors"
    />

    <!-- Decedent Information -->
    <FCard
      class="mb-6"
      title="Decedent Information"
    >
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.decedent.firstName"
            :error="getError('decedent.firstName')"
            label="First Name"
            @blur="touch('decedent.firstName')"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.decedent.middleName"
            :error="getError('decedent.middleName')"
            label="Middle Name"
            @blur="touch('decedent.middleName')"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.decedent.lastName"
            :error="getError('decedent.lastName')"
            label="Last Name"
            @blur="touch('decedent.lastName')"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <FDatePicker
            v-model="model.decedent.dateOfBirth"
            :error="getError('decedent.dateOfBirth')"
            label="Date of Birth"
            @blur="touch('decedent.dateOfBirth')"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FDatePicker
            v-model="model.decedent.dateOfDeath"
            :error="getError('decedent.dateOfDeath')"
            label="Date of Death"
            @blur="touch('decedent.dateOfDeath')"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.decedent.placeOfDeath"
            :error="getError('decedent.placeOfDeath')"
            label="Place of Death"
            @blur="touch('decedent.placeOfDeath')"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.decedent.ssn"
            :error="getError('decedent.ssn')"
            label="Social Security Number"
            placeholder="XXX-XX-XXXX"
            @blur="touch('decedent.ssn')"
          />
        </v-col>
        <v-col
          class="d-flex align-center"
          cols="12"
          md="4"
        >
          <FSwitch
            v-model="model.decedent.veteranStatus"
            color="primary"
            :error="getError('decedent.veteranStatus')"
            label="Veteran"
          />
        </v-col>
      </v-row>
    </FCard>

    <!-- Next of Kin -->
    <FCard
      class="mb-6"
      title="Next of Kin"
    >
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.nextOfKin.firstName"
            :error="getError('nextOfKin.firstName')"
            label="First Name"
            @blur="touch('nextOfKin.firstName')"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.nextOfKin.lastName"
            :error="getError('nextOfKin.lastName')"
            label="Last Name"
            @blur="touch('nextOfKin.lastName')"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FSelect
            v-model="model.nextOfKin.relationship"
            :error="getError('nextOfKin.relationship')"
            label="Relationship"
            :options="relationshipOptions"
            @blur="touch('nextOfKin.relationship')"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <FTextField
            v-model="model.nextOfKin.phone"
            :error="getError('nextOfKin.phone')"
            label="Phone"
            type="tel"
            @blur="touch('nextOfKin.phone')"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <FTextField
            v-model="model.nextOfKin.email"
            :error="getError('nextOfKin.email')"
            label="Email"
            type="email"
            @blur="touch('nextOfKin.email')"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <FTextField
            v-model="model.nextOfKin.address.street"
            :error="getError('nextOfKin.address.street')"
            label="Street Address"
            @blur="touch('nextOfKin.address.street')"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="5"
        >
          <FTextField
            v-model="model.nextOfKin.address.city"
            :error="getError('nextOfKin.address.city')"
            label="City"
            @blur="touch('nextOfKin.address.city')"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <FSelect
            v-model="model.nextOfKin.address.state"
            :error="getError('nextOfKin.address.state')"
            label="State"
            :options="stateOptions"
            @blur="touch('nextOfKin.address.state')"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <FTextField
            v-model="model.nextOfKin.address.zip"
            :error="getError('nextOfKin.address.zip')"
            label="ZIP Code"
            @blur="touch('nextOfKin.address.zip')"
          />
        </v-col>
      </v-row>
    </FCard>

    <!-- Services -->
    <FCard
      class="mb-6"
      title="Services"
    >
      <FCheckboxGroup
        v-model="model.services"
        class="mb-4"
        :error="getError('services')"
        inline
        :options="serviceOptions"
      />

      <FTextarea
        v-model="model.notes"
        auto-grow
        :error="getError('notes')"
        label="Notes"
        :rows="4"
        @blur="touch('notes')"
      />
    </FCard>

    <!-- Case Status -->
    <FCard
      class="mb-6"
      title="Case Status"
    >
      <FRadioGroup
        v-model="model.status"
        :error="getError('status')"
        inline
        :options="statusOptions"
      />
    </FCard>

    <!-- Actions -->
    <div class="d-flex ga-3 justify-end">
      <FButton
        intent="secondary"
        @click="handleCancel"
      >
        Cancel
      </FButton>
      <FButton
        :disabled="!isValid"
        intent="primary"
        :loading="loading || isSubmitting"
        @click="handleSubmit"
      >
        {{ isEditing ? 'Save Changes' : 'Create Case' }}
      </FButton>
    </div>

    <!-- Debug: Show dirty state -->
    <div
      v-if="hasChanges()"
      class="text-caption text-medium-emphasis mt-4"
    >
      * You have unsaved changes
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import {
    type Case,
    caseFormSchema,
    type CaseFormValues,
    caseToFormValues,
    getDefaultCaseFormValues,
  } from '@/entities/case'
  import {
    FButton,
    FCard,
    FCheckboxGroup,
    FDatePicker,
    FFormErrors,
    FRadioGroup,
    FSelect,
    FSwitch,
    FTextarea,
    FTextField,
    useDirtyForm,
    useFormModel,
  } from '@/shared/ui'

  const props = defineProps<{
    case?: Case
    loading?: boolean
  }>()

  const emit = defineEmits<{
    submit: [data: CaseFormValues]
    cancel: []
  }>()

  const isSubmitting = ref(false)

  // Compute initial values from case prop or defaults
  const initialValues = computed(() =>
    props.case ? caseToFormValues(props.case) : getDefaultCaseFormValues(),
  )

  const isEditing = computed(() => !!props.case)

  // Live model form state
  const { model, errors, isValid, validate, getError, touch, reset } = useFormModel(
    caseFormSchema,
    () => initialValues.value,
  )

  // Track dirty state
  const { hasChanges, takeSnapshot } = useDirtyForm(() => model.value)

  // Reset form when case prop changes
  watch(
    () => props.case,
    () => {
      reset(initialValues.value)
      setTimeout(() => takeSnapshot(), 0)
    },
    { immediate: true },
  )

  async function handleSubmit() {
    // Validate all fields
    const result = validate()
    if (!result.valid) {
      return
    }

    isSubmitting.value = true
    try {
      emit('submit', model.value as CaseFormValues)
      takeSnapshot() // Reset dirty state after submit
    } finally {
      isSubmitting.value = false
    }
  }

  function handleCancel() {
    emit('cancel')
  }

  // Select options
  const relationshipOptions = [
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Grandchild',
    'Grandparent',
    'Other Family',
    'Friend',
    'Legal Representative',
    'Other',
  ].map((item) => ({ title: item, value: item }))

  const serviceOptions = [
    { value: 'visitation', label: 'Visitation' },
    { value: 'funeral', label: 'Funeral Service' },
    { value: 'graveside', label: 'Graveside Service' },
    { value: 'cremation', label: 'Cremation' },
    { value: 'memorial', label: 'Memorial Service' },
    { value: 'transport', label: 'Transport' },
  ]

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  const stateOptions = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ].map((abbr) => ({ title: abbr, value: abbr }))
</script>

<style scoped>
  .case-form {
    max-width: 1000px;
    margin: 0 auto;
  }
</style>
