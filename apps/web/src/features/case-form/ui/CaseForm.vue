<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <!-- Decedent Information -->
    <FCard class="mb-6" title="Decedent Information">
      <v-row>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.decedent.firstName"
            label="First Name"
            :rules="[rules.required]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.decedent.middleName"
            label="Middle Name"
          />
        </v-col>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.decedent.lastName"
            label="Last Name"
            :rules="[rules.required]"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <FDatePicker
            v-model="formData.decedent.dateOfBirth"
            label="Date of Birth"
          />
        </v-col>
        <v-col cols="12" md="4">
          <FDatePicker
            v-model="formData.decedent.dateOfDeath"
            label="Date of Death"
            :rules="[rules.required]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.decedent.placeOfDeath"
            label="Place of Death"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.decedent.ssn"
            label="Social Security Number"
            placeholder="XXX-XX-XXXX"
          />
        </v-col>
        <v-col class="d-flex align-center" cols="12" md="4">
          <FSwitch
            v-model="formData.decedent.veteranStatus"
            color="primary"
            label="Veteran"
          />
        </v-col>
      </v-row>
    </FCard>

    <!-- Next of Kin -->
    <FCard class="mb-6" title="Next of Kin">
      <v-row>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.nextOfKin.firstName"
            label="First Name"
            :rules="[rules.required]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.nextOfKin.lastName"
            label="Last Name"
            :rules="[rules.required]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <FSelect
            v-model="formData.nextOfKin.relationship"
            label="Relationship"
            :options="relationshipOptions"
            :rules="[rules.required]"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <FTextField
            v-model="formData.nextOfKin.phone"
            label="Phone"
            :rules="[rules.required]"
            type="tel"
          />
        </v-col>
        <v-col cols="12" md="6">
          <FTextField
            v-model="formData.nextOfKin.email"
            label="Email"
            type="email"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <FTextField
            v-model="formData.nextOfKin.address.street"
            label="Street Address"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="5">
          <FTextField
            v-model="formData.nextOfKin.address.city"
            label="City"
          />
        </v-col>
        <v-col cols="12" md="3">
          <FSelect
            v-model="formData.nextOfKin.address.state"
            label="State"
            :options="stateOptions"
          />
        </v-col>
        <v-col cols="12" md="4">
          <FTextField
            v-model="formData.nextOfKin.address.zip"
            label="ZIP Code"
          />
        </v-col>
      </v-row>
    </FCard>

    <!-- Services -->
    <FCard class="mb-6" title="Services">
      <FCheckboxGroup
        v-model="formData.services"
        class="mb-4"
        inline
        :options="serviceOptions"
      />

      <FTextarea
        v-model="formData.notes"
        auto-grow
        label="Notes"
        :rows="4"
      />
    </FCard>

    <!-- Case Status -->
    <FCard class="mb-6" title="Case Status">
      <FRadioGroup
        v-model="formData.status"
        inline
        :options="statusOptions"
      />
    </FCard>

    <!-- Actions -->
    <div class="d-flex ga-3 justify-end">
      <FButton intent="secondary" @click="handleCancel">
        Cancel
      </FButton>
      <FButton
        :disabled="!isValid"
        intent="primary"
        :loading="loading"
        type="submit"
      >
        {{ isEditing ? 'Save Changes' : 'Create Case' }}
      </FButton>
    </div>
  </v-form>
</template>

<script lang="ts" setup>
import type { Case } from '@/entities/case'
import {
  FButton,
  FCard,
  FCheckboxGroup,
  FDatePicker,
  FRadioGroup,
  FSelect,
  FSwitch,
  FTextarea,
  FTextField,
} from '@facts/ui'
import { ref } from 'vue'
import { useCaseForm } from '../model/useCaseForm'

const props = defineProps<{
  case?: Case
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: ReturnType<ReturnType<typeof useCaseForm>['toCase']>]
  cancel: []
}>()

const formRef = ref<HTMLFormElement | null>(null)
const { formData, isEditing, isValid, toCase } = useCaseForm(props.case)

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
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
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
].map((abbr) => ({ title: abbr, value: abbr }))

async function handleSubmit() {
  const tenantId = 'default' // TODO: Get from tenant store
  const caseData = toCase(tenantId, props.case?.id)
  emit('submit', caseData)
}

function handleCancel() {
  emit('cancel')
}
</script>

