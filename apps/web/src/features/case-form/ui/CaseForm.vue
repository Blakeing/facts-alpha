<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <!-- Decedent Information -->
    <FCard title="Decedent Information" class="mb-6">
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
        <v-col cols="12" md="4" class="d-flex align-center">
          <FSwitch
            v-model="formData.decedent.veteranStatus"
            label="Veteran"
            color="primary"
          />
        </v-col>
      </v-row>
    </FCard>

    <!-- Next of Kin -->
    <FCard title="Next of Kin" class="mb-6">
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
            :items="relationshipOptions"
            :rules="[rules.required]"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <FTextField
            v-model="formData.nextOfKin.phone"
            label="Phone"
            type="tel"
            :rules="[rules.required]"
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
            :items="stateOptions"
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
    <FCard title="Services" class="mb-6">
      <FCheckboxGroup
        v-model="formData.services"
        :options="serviceOptions"
        inline
        class="mb-4"
      />

      <FTextarea
        v-model="formData.notes"
        label="Notes"
        :rows="4"
        auto-grow
      />
    </FCard>

    <!-- Case Status -->
    <FCard title="Case Status" class="mb-6">
      <FRadioGroup
        v-model="formData.status"
        :options="statusOptions"
        inline
      />
    </FCard>

    <!-- Actions -->
    <div class="d-flex ga-3 justify-end">
      <FButton intent="secondary" @click="handleCancel">
        Cancel
      </FButton>
      <FButton
        intent="primary"
        type="submit"
        :loading="loading"
        :disabled="!isValid"
      >
        {{ isEditing ? 'Save Changes' : 'Create Case' }}
      </FButton>
    </div>
  </v-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  FButton,
  FCard,
  FTextField,
  FTextarea,
  FSelect,
  FDatePicker,
  FSwitch,
  FCheckboxGroup,
  FRadioGroup,
} from '@facts/ui'
import type { Case } from '@/entities/case'
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
]

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
]

async function handleSubmit() {
  const tenantId = 'default' // TODO: Get from tenant store
  const caseData = toCase(tenantId, props.case?.id)
  emit('submit', caseData)
}

function handleCancel() {
  emit('cancel')
}
</script>

