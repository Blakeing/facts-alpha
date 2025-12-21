<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Design System</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Component library built on Vuetify with simplified APIs
        </p>
      </div>
    </div>

    <!-- Buttons Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Buttons</h2>
      <FCard subtitle="Intent-based button component" title="FButton">
        <div class="d-flex flex-wrap ga-3 mb-4">
          <FButton intent="primary">Primary</FButton>
          <FButton intent="secondary">Secondary</FButton>
          <FButton intent="tonal">Tonal</FButton>
          <FButton intent="danger">Danger</FButton>
          <FButton intent="ghost">Ghost</FButton>
          <FButton intent="text">Text</FButton>
        </div>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-2 font-weight-medium mb-3">With Icons</h4>
        <div class="d-flex flex-wrap ga-3 mb-4">
          <FButton intent="primary" prepend-icon="mdi-plus">New Item</FButton>
          <FButton append-icon="mdi-arrow-right" intent="secondary">Continue</FButton>
          <FButton intent="danger" prepend-icon="mdi-delete">Delete</FButton>
        </div>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-2 font-weight-medium mb-3">Sizes</h4>
        <div class="d-flex flex-wrap align-center ga-3">
          <FButton intent="primary" size="x-small">X-Small</FButton>
          <FButton intent="primary" size="small">Small</FButton>
          <FButton intent="primary" size="default">Default</FButton>
          <FButton intent="primary" size="large">Large</FButton>
          <FButton intent="primary" size="x-large">X-Large</FButton>
        </div>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-2 font-weight-medium mb-3">States</h4>
        <div class="d-flex flex-wrap ga-3">
          <FButton intent="primary" loading>Loading</FButton>
          <FButton disabled intent="primary">Disabled</FButton>
          <FButton block intent="primary">Block Width</FButton>
        </div>
      </FCard>
    </section>

    <!-- Form Inputs Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Form Inputs</h2>

      <div class="d-flex flex-column ga-4">
        <!-- Text Field -->
        <FCard subtitle="Text input with validation support" title="FTextField">
          <v-row>
            <v-col cols="12" md="6">
              <FTextField
                v-model="textFieldValue"
                label="Standard"
                placeholder="Enter text..."
              />
            </v-col>
            <v-col cols="12" md="6">
              <FTextField
                v-model="emailValue"
                label="With Validation"
                placeholder="Enter email..."
                :rules="[required, email]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <FTextField
                label="With Icon"
                placeholder="Search..."
                prepend-inner-icon="mdi-magnify"
              />
            </v-col>
            <v-col cols="12" md="6">
              <FTextField
                label="Password"
                placeholder="Enter password..."
                type="password"
              />
            </v-col>
          </v-row>
        </FCard>

        <!-- Textarea -->
        <FCard subtitle="Multiline text input with auto-grow" title="FTextarea">
          <v-row>
            <v-col cols="12" md="6">
              <FTextarea
                v-model="textareaValue"
                label="Standard"
                placeholder="Enter description..."
              />
            </v-col>
            <v-col cols="12" md="6">
              <FTextarea
                :auto-grow="false"
                label="Fixed Rows"
                placeholder="Fixed height..."
                :rows="4"
              />
            </v-col>
          </v-row>
        </FCard>

        <!-- Select -->
        <FCard subtitle="Dropdown selection with options array API" title="FSelect">
          <v-row>
            <v-col cols="12" md="6">
              <FSelect
                v-model="selectValue"
                label="Standard"
                :options="selectOptions"
                placeholder="Select an option..."
              />
            </v-col>
            <v-col cols="12" md="6">
              <FSelect
                v-model="multiSelectValue"
                chips
                label="Multiple"
                multiple
                :options="selectOptions"
                placeholder="Select multiple..."
              />
            </v-col>
          </v-row>
        </FCard>

        <!-- Date Picker -->
        <FCard subtitle="Date selection input" title="FDatePicker">
          <v-row>
            <v-col cols="12" md="6">
              <FDatePicker
                v-model="dateValue"
                label="Date"
              />
            </v-col>
            <v-col cols="12" md="6">
              <FDatePicker
                label="With Validation"
                :rules="[required, pastDate]"
              />
            </v-col>
          </v-row>
        </FCard>
      </div>
    </section>

    <!-- Selection Controls Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Selection Controls</h2>

      <div class="d-flex flex-column ga-4">
        <!-- Checkbox -->
        <FCard subtitle="Single and grouped checkboxes" title="FCheckbox & FCheckboxGroup">
          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 font-weight-medium mb-3">Single Checkbox</h4>
              <FCheckbox v-model="checkboxValue" label="I agree to the terms" />
              <FCheckbox disabled label="Disabled" />
              <FCheckbox disabled label="Checked disabled" :model-value="true" />
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 font-weight-medium mb-3">Checkbox Group</h4>
              <FCheckboxGroup
                v-model="checkboxGroupValue"
                label="Select features"
                :options="checkboxOptions"
              />
            </v-col>
          </v-row>
        </FCard>

        <!-- Switch -->
        <FCard subtitle="Toggle switch for boolean values" title="FSwitch">
          <div class="d-flex flex-column ga-2">
            <FSwitch v-model="switchValue" label="Enable notifications" />
            <FSwitch disabled label="Dark mode (disabled)" />
            <FSwitch v-model="switchInset" inset label="Inset variant" />
          </div>
        </FCard>

        <!-- Radio Group -->
        <FCard subtitle="Radio button group with options array" title="FRadioGroup">
          <v-row>
            <v-col cols="12" md="6">
              <FRadioGroup
                v-model="radioValue"
                label="Select priority"
                :options="radioOptions"
              />
            </v-col>
            <v-col cols="12" md="6">
              <FRadioGroup
                v-model="radioInlineValue"
                inline
                label="Inline layout"
                :options="radioOptions"
              />
            </v-col>
          </v-row>
        </FCard>
      </div>
    </section>

    <!-- Layout Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Layout</h2>

      <FCard subtitle="Card component with variant support" title="FCard">
        <v-row>
          <v-col cols="12" md="4">
            <FCard
              subtitle="Default variant"
              title="Outlined"
              variant="outlined"
            >
              <p class="text-body-2">Card content goes here</p>
              <template #actions>
                <FButton intent="text" size="small">Action</FButton>
              </template>
            </FCard>
          </v-col>
          <v-col cols="12" md="4">
            <FCard
              subtitle="Surface variant background"
              title="Filled"
              variant="filled"
            >
              <p class="text-body-2">Card content goes here</p>
              <template #actions>
                <FButton intent="text" size="small">Action</FButton>
              </template>
            </FCard>
          </v-col>
          <v-col cols="12" md="4">
            <FCard
              subtitle="With shadow"
              title="Elevated"
              variant="elevated"
            >
              <p class="text-body-2">Card content goes here</p>
              <template #actions>
                <FButton intent="text" size="small">Action</FButton>
              </template>
            </FCard>
          </v-col>
        </v-row>
      </FCard>
    </section>

    <!-- Feedback Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Feedback</h2>

      <div class="d-flex flex-column ga-4">
        <!-- Dialog -->
        <FCard subtitle="Modal dialog with preset widths" title="FDialog">
          <div class="d-flex flex-wrap ga-3">
            <FButton intent="primary" @click="dialogSm = true">Small Dialog</FButton>
            <FButton intent="secondary" @click="dialogMd = true">Medium Dialog</FButton>
            <FButton intent="tonal" @click="dialogLg = true">Large Dialog</FButton>
          </div>

          <FDialog v-model="dialogSm" title="Small Dialog" width="sm">
            <p>This is a small dialog (400px max width).</p>
            <template #actions>
              <FButton intent="text" @click="dialogSm = false">Cancel</FButton>
              <FButton intent="primary" @click="dialogSm = false">Confirm</FButton>
            </template>
          </FDialog>

          <FDialog v-model="dialogMd" title="Medium Dialog" width="md">
            <p>This is a medium dialog (600px max width).</p>
            <template #actions>
              <FButton intent="text" @click="dialogMd = false">Cancel</FButton>
              <FButton intent="primary" @click="dialogMd = false">Confirm</FButton>
            </template>
          </FDialog>

          <FDialog v-model="dialogLg" title="Large Dialog" width="lg">
            <p>This is a large dialog (800px max width).</p>
            <template #actions>
              <FButton intent="text" @click="dialogLg = false">Cancel</FButton>
              <FButton intent="primary" @click="dialogLg = false">Confirm</FButton>
            </template>
          </FDialog>
        </FCard>

        <!-- Data Table -->
        <FCard subtitle="Data table with simplified column definitions" title="FDataTable">
          <FDataTable
            :columns="tableColumns"
            :items="tableItems"
            :items-per-page="5"
          >
            <template #item.status="{ item }">
              <v-chip
                :color="item.status === 'Active' ? 'success' : 'default'"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>
            <template #item.actions>
              <FButton intent="text" size="small">Edit</FButton>
            </template>
          </FDataTable>
        </FCard>
      </div>
    </section>

    <!-- Validation Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Validation</h2>

      <FCard subtitle="Using @facts/utils validators" title="Form Validation">
        <v-form ref="validationForm" @submit.prevent="handleValidationSubmit">
          <v-row>
            <v-col cols="12" md="6">
              <FTextField
                v-model="validationName"
                label="Name"
                :rules="[required, minLength(2), maxLength(50)]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <FTextField
                v-model="validationEmail"
                label="Email"
                :rules="[required, email]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <FTextField
                v-model="validationPhone"
                label="Phone"
                :rules="[phone]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <FTextField
                v-model="validationAge"
                label="Age"
                :rules="[required, min(18), max(120)]"
                type="number"
              />
            </v-col>
          </v-row>
          <div class="d-flex ga-3 mt-4">
            <FButton intent="primary" type="submit">Validate</FButton>
            <FButton intent="text" @click="resetValidation">Reset</FButton>
          </div>
        </v-form>
      </FCard>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {
  FButton,
  FCard,
  FCheckbox,
  FCheckboxGroup,
  FDataTable,
  FDatePicker,
  FDialog,
  FRadioGroup,
  FSelect,
  FSwitch,
  FTextarea,
  FTextField,
} from '@facts/ui'
import {
  email,
  max,
  maxLength,
  min,
  minLength,
  pastDate,
  phone,
  required,
} from '@facts/utils'
import { ref } from 'vue'

// Form Inputs
const textFieldValue = ref('')
const emailValue = ref('')
const textareaValue = ref('')
const selectValue = ref(null)
const multiSelectValue = ref([])
const dateValue = ref(null)

const selectOptions = [
  { title: 'Option 1', value: 'opt1' },
  { title: 'Option 2', value: 'opt2' },
  { title: 'Option 3', value: 'opt3' },
]

// Selection Controls
const checkboxValue = ref(false)
const checkboxGroupValue = ref<string[]>([])
const checkboxOptions = [
  { label: 'Feature A', value: 'a' },
  { label: 'Feature B', value: 'b' },
  { label: 'Feature C', value: 'c' },
]

const switchValue = ref(false)
const switchInset = ref(false)

const radioValue = ref('medium')
const radioInlineValue = ref('medium')
const radioOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

// Dialogs
const dialogSm = ref(false)
const dialogMd = ref(false)
const dialogLg = ref(false)

// Data Table
const tableColumns = [
  { key: 'id', title: 'ID', width: '80px' },
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'Email' },
  { key: 'status', title: 'Status' },
  { key: 'actions', title: '', align: 'end' as const, sortable: false },
]

const tableItems = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Inactive' },
]

// Validation Demo
const validationForm = ref()
const validationName = ref('')
const validationEmail = ref('')
const validationPhone = ref('')
const validationAge = ref('')

async function handleValidationSubmit() {
  const { valid } = await validationForm.value.validate()
  if (valid) {
    alert('Form is valid!')
  }
}

function resetValidation() {
  validationForm.value.reset()
}
</script>

