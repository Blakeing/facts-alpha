<template>
  <FForm
    :initial-values="initialValues"
    :schema="caseFormSchema"
    @submit="handleSubmit"
  >
    <template #default="{ isDirty, isSubmitting, isValid }">
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
              label="First Name"
              name="decedent.firstName"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FTextField
              label="Middle Name"
              name="decedent.middleName"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FTextField
              label="Last Name"
              name="decedent.lastName"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <FDatePicker
              label="Date of Birth"
              name="decedent.dateOfBirth"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FDatePicker
              label="Date of Death"
              name="decedent.dateOfDeath"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FTextField
              label="Place of Death"
              name="decedent.placeOfDeath"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <FTextField
              label="Social Security Number"
              name="decedent.ssn"
              placeholder="XXX-XX-XXXX"
            />
          </v-col>
          <v-col
            class="d-flex align-center"
            cols="12"
            md="4"
          >
            <FSwitch
              color="primary"
              label="Veteran"
              name="decedent.veteranStatus"
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
              label="First Name"
              name="nextOfKin.firstName"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FTextField
              label="Last Name"
              name="nextOfKin.lastName"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FSelect
              label="Relationship"
              name="nextOfKin.relationship"
              :options="relationshipOptions"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <FTextField
              label="Phone"
              name="nextOfKin.phone"
              type="tel"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <FTextField
              label="Email"
              name="nextOfKin.email"
              type="email"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <FTextField
              label="Street Address"
              name="nextOfKin.address.street"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="5"
          >
            <FTextField
              label="City"
              name="nextOfKin.address.city"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <FSelect
              label="State"
              name="nextOfKin.address.state"
              :options="stateOptions"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FTextField
              label="ZIP Code"
              name="nextOfKin.address.zip"
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
          class="mb-4"
          inline
          name="services"
          :options="serviceOptions"
        />

        <FTextarea
          auto-grow
          label="Notes"
          name="notes"
          :rows="4"
        />
      </FCard>

      <!-- Case Status -->
      <FCard
        class="mb-6"
        title="Case Status"
      >
        <FRadioGroup
          inline
          name="status"
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
          :disabled="!isValid || isSubmitting"
          intent="primary"
          :loading="loading || isSubmitting"
          type="submit"
        >
          {{ isEditing ? 'Save Changes' : 'Create Case' }}
        </FButton>
      </div>

      <!-- Debug: Show dirty state -->
      <div
        v-if="isDirty"
        class="text-caption text-medium-emphasis mt-4"
      >
        * You have unsaved changes
      </div>
    </template>
  </FForm>
</template>

<script lang="ts" setup>
  import type { Case, CaseFormValues } from '@/entities/case'
  import {
    FButton,
    FCard,
    FCheckboxGroup,
    FDatePicker,
    FForm,
    FRadioGroup,
    FSelect,
    FSwitch,
    FTextarea,
    FTextField,
  } from '@facts/ui'
  import { computed } from 'vue'
  import {
    caseFormSchema,
    caseToFormValues,
    getDefaultCaseFormValues,
  } from '@/entities/case'

  const props = defineProps<{
    case?: Case
    loading?: boolean
  }>()

  const emit = defineEmits<{
    submit: [data: CaseFormValues]
    cancel: []
  }>()

  // Compute initial values from case prop or defaults
  const initialValues = computed(() =>
    props.case ? caseToFormValues(props.case) : getDefaultCaseFormValues(),
  )

  const isEditing = computed(() => !!props.case)

  // Handle form submission (FForm emits Record<string, unknown>, we know it's CaseFormValues)
  function handleSubmit(values: Record<string, unknown>) {
    emit('submit', values as CaseFormValues)
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
