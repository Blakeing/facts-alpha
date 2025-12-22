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
      <FCard
        subtitle="Intent-based button component"
        title="FButton"
      >
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
          <FButton
            intent="primary"
            prepend-icon="mdi-plus"
            >New Item</FButton
          >
          <FButton
            append-icon="mdi-arrow-right"
            intent="secondary"
            >Continue</FButton
          >
          <FButton
            intent="danger"
            prepend-icon="mdi-delete"
            >Delete</FButton
          >
        </div>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-2 font-weight-medium mb-3">Sizes</h4>
        <div class="d-flex flex-wrap align-center ga-3">
          <FButton
            intent="primary"
            size="x-small"
            >X-Small</FButton
          >
          <FButton
            intent="primary"
            size="small"
            >Small</FButton
          >
          <FButton
            intent="primary"
            size="default"
            >Default</FButton
          >
          <FButton
            intent="primary"
            size="large"
            >Large</FButton
          >
          <FButton
            intent="primary"
            size="x-large"
            >X-Large</FButton
          >
        </div>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-2 font-weight-medium mb-3">States</h4>
        <div class="d-flex flex-wrap ga-3">
          <FButton
            intent="primary"
            loading
            >Loading</FButton
          >
          <FButton
            disabled
            intent="primary"
            >Disabled</FButton
          >
          <FButton
            block
            intent="primary"
            >Block Width</FButton
          >
        </div>
      </FCard>
    </section>

    <!-- Form Inputs Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Form Inputs</h2>

      <div class="d-flex flex-column ga-4">
        <!-- Text Field -->
        <FCard
          subtitle="Text input with validation support"
          title="FTextField"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="textFieldValue"
                label="Standard"
                placeholder="Enter text..."
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                v-model="emailValue"
                label="With Icon"
                placeholder="Enter email..."
                prepend-inner-icon="mdi-email"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="With Icon"
                placeholder="Search..."
                prepend-inner-icon="mdi-magnify"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Password"
                placeholder="Enter password..."
                type="password"
              />
            </v-col>
          </v-row>
        </FCard>

        <!-- Textarea -->
        <FCard
          subtitle="Multiline text input with auto-grow"
          title="FTextarea"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <FTextarea
                v-model="textareaValue"
                label="Standard"
                placeholder="Enter description..."
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
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
        <FCard
          subtitle="Dropdown selection with options array API"
          title="FSelect"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <FSelect
                v-model="selectValue"
                label="Standard"
                :options="selectOptions"
                placeholder="Select an option..."
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
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
        <FCard
          subtitle="Date selection with calendar popup"
          title="FDatePicker"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                v-model="dateValue"
                label="Birth Date"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDatePicker
                v-model="dateValue2"
                label="With Min/Max"
                :max="maxDate"
                :min="minDate"
              />
            </v-col>
          </v-row>
        </FCard>

        <!-- Date Range Picker -->
        <FCard
          subtitle="Select start and end dates for filtering"
          title="FDateRangePicker"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <FDateRangePicker
                v-model="dateRange"
                label="Filter by Date"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FDateRangePicker
                v-model="dateRange2"
                display-format="medium"
                label="Report Period"
              />
            </v-col>
          </v-row>
          <div class="mt-4 text-body-2 text-medium-emphasis">
            Selected range: {{ dateRangeDisplay }}
          </div>
        </FCard>
      </div>
    </section>

    <!-- Selection Controls Section -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Selection Controls</h2>

      <div class="d-flex flex-column ga-4">
        <!-- Checkbox -->
        <FCard
          subtitle="Single and grouped checkboxes"
          title="FCheckbox & FCheckboxGroup"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <h4 class="text-subtitle-2 font-weight-medium mb-3">Single Checkbox</h4>
              <FCheckbox
                v-model="checkboxValue"
                label="I agree to the terms"
              />
              <FCheckbox
                disabled
                label="Disabled"
              />
              <FCheckbox
                disabled
                label="Checked disabled"
                :model-value="true"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
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
        <FCard
          subtitle="Toggle switch for boolean values"
          title="FSwitch"
        >
          <div class="d-flex flex-column ga-2">
            <FSwitch
              v-model="switchValue"
              label="Enable notifications"
            />
            <FSwitch
              disabled
              label="Dark mode (disabled)"
            />
            <FSwitch
              v-model="switchInset"
              inset
              label="Inset variant"
            />
          </div>
        </FCard>

        <!-- Radio Group -->
        <FCard
          subtitle="Radio button group with options array"
          title="FRadioGroup"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <FRadioGroup
                v-model="radioValue"
                label="Select priority"
                :options="radioOptions"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
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

      <FCard
        subtitle="Card component with variant support"
        title="FCard"
      >
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <FCard
              subtitle="Default variant"
              title="Outlined"
              variant="outlined"
            >
              <p class="text-body-2">Card content goes here</p>
              <template #actions>
                <FButton
                  intent="text"
                  size="small"
                  >Action</FButton
                >
              </template>
            </FCard>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FCard
              subtitle="Surface variant background"
              title="Filled"
              variant="filled"
            >
              <p class="text-body-2">Card content goes here</p>
              <template #actions>
                <FButton
                  intent="text"
                  size="small"
                  >Action</FButton
                >
              </template>
            </FCard>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <FCard
              subtitle="With shadow"
              title="Elevated"
              variant="elevated"
            >
              <p class="text-body-2">Card content goes here</p>
              <template #actions>
                <FButton
                  intent="text"
                  size="small"
                  >Action</FButton
                >
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
        <FCard
          subtitle="Modal dialog with preset widths"
          title="FDialog"
        >
          <div class="d-flex flex-wrap ga-3">
            <FButton
              intent="primary"
              @click="dialogSm = true"
              >Small Dialog</FButton
            >
            <FButton
              intent="secondary"
              @click="dialogMd = true"
              >Medium Dialog</FButton
            >
            <FButton
              intent="tonal"
              @click="dialogLg = true"
              >Large Dialog</FButton
            >
          </div>

          <FDialog
            v-model="dialogSm"
            title="Small Dialog"
            width="sm"
          >
            <p>This is a small dialog (400px max width).</p>
            <template #actions>
              <FButton
                intent="text"
                @click="dialogSm = false"
                >Cancel</FButton
              >
              <FButton
                intent="primary"
                @click="dialogSm = false"
                >Confirm</FButton
              >
            </template>
          </FDialog>

          <FDialog
            v-model="dialogMd"
            title="Medium Dialog"
            width="md"
          >
            <p>This is a medium dialog (600px max width).</p>
            <template #actions>
              <FButton
                intent="text"
                @click="dialogMd = false"
                >Cancel</FButton
              >
              <FButton
                intent="primary"
                @click="dialogMd = false"
                >Confirm</FButton
              >
            </template>
          </FDialog>

          <FDialog
            v-model="dialogLg"
            title="Large Dialog"
            width="lg"
          >
            <p>This is a large dialog (800px max width).</p>
            <template #actions>
              <FButton
                intent="text"
                @click="dialogLg = false"
                >Cancel</FButton
              >
              <FButton
                intent="primary"
                @click="dialogLg = false"
                >Confirm</FButton
              >
            </template>
          </FDialog>
        </FCard>

        <!-- Loader -->
        <FCard
          subtitle="Loading indicator overlay - covers parent container"
          title="FLoader"
        >
          <div>
            <p class="text-body-2 text-medium-emphasis mb-3">
              Covers content with a spinner. Parent must have <code>position: relative</code>.
            </p>
            <FButton
              intent="secondary"
              @click="toggleOverlayLoader"
            >
              {{ showOverlayLoader ? 'Hide' : 'Show' }} Loader
            </FButton>
            <div
              class="mt-4 pa-4 rounded"
              style="
                border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
                min-height: 150px;
                position: relative;
              "
            >
              <FLoader v-model="showOverlayLoader" />
              <p class="text-body-2">This content stays visible but is covered by the overlay.</p>
              <p class="text-body-2 mt-2">
                The overlay uses <code>position: relative</code> on the parent.
              </p>
            </div>
          </div>
        </FCard>

        <!-- Data Table -->
        <FCard
          subtitle="Data table with simplified column definitions"
          title="FDataTable"
        >
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
              <FButton
                intent="text"
                size="small"
                >Edit</FButton
              >
            </template>
          </FDataTable>
        </FCard>
      </div>
    </section>

    <!-- Validation Section (vee-validate + Zod) -->
    <section class="mb-8">
      <h2 class="text-h5 font-weight-medium mb-4">Form Validation</h2>

      <FCard
        subtitle="Using vee-validate with Zod schemas for type-safe validation"
        title="Zod Schema Validation"
      >
        <form @submit="onValidationSubmit">
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Name"
                name="name"
                placeholder="Enter your name..."
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Email"
                name="email"
                placeholder="Enter your email..."
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Phone"
                name="phone"
                placeholder="(555) 123-4567"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <FTextField
                label="Age"
                name="age"
                type="number"
              />
            </v-col>
          </v-row>
          <div class="d-flex ga-3 mt-4">
            <FButton
              :disabled="!validationIsValid"
              intent="primary"
              type="submit"
              >Submit</FButton
            >
            <FButton
              intent="text"
              @click="resetValidationForm"
              >Reset</FButton
            >
          </div>
        </form>

        <v-divider class="my-6" />

        <div class="text-body-2">
          <strong>How it works:</strong>
          <ul class="mt-2 pl-4">
            <li>Define a Zod schema with validation rules</li>
            <li>Use <code>useTypedForm</code> composable to create form context</li>
            <li>Add <code>name</code> prop to F* components to auto-bind to form</li>
            <li>Validation errors display automatically on blur</li>
          </ul>
        </div>
      </FCard>
    </section>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { z } from 'zod'
  import {
    FButton,
    FCard,
    FCheckbox,
    FCheckboxGroup,
    FDataTable,
    FDatePicker,
    FDateRangePicker,
    FDialog,
    FLoader,
    FRadioGroup,
    FSelect,
    FSwitch,
    FTextarea,
    FTextField,
    useToast,
    useTypedForm,
  } from '@/shared/ui'

  const toast = useToast()

  // Form Inputs
  const textFieldValue = ref('')
  const emailValue = ref('')
  const textareaValue = ref('')
  const selectValue = ref(null)
  const multiSelectValue = ref([])

  // Date Pickers (use ISO strings for v-date-input)
  const dateValue = ref<string | null>(null)
  const dateValue2 = ref<string | null>(null)
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.setMonth(today.getMonth() + 3)).toISOString().split('T')[0]

  // Date Range Pickers
  const dateRange = ref<Date[]>([])
  const dateRange2 = ref<Date[]>([])
  const dateRangeDisplay = computed(() => {
    if (dateRange.value.length === 0) return 'No dates selected'
    const startDate = dateRange.value.at(0)
    const endDate = dateRange.value.at(-1)
    if (dateRange.value.length === 1 && startDate) {
      return startDate.toLocaleDateString()
    }
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
    }
    return 'No dates selected'
  })

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

  // Loader
  const showOverlayLoader = ref(false)

  function toggleOverlayLoader() {
    showOverlayLoader.value = !showOverlayLoader.value
  }

  // Data Table
  const tableColumns = [
    { key: 'id', headerName: 'ID', width: 80 },
    { key: 'name', headerName: 'Name' },
    { key: 'email', headerName: 'Email' },
    { key: 'status', headerName: 'Status' },
    { key: 'actions', headerName: '', cellStyle: { textAlign: 'right' }, sortable: false },
  ]

  const tableItems = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Inactive' },
  ]

  // =============================================================================
  // Validation Demo with vee-validate + Zod
  // =============================================================================

  // Define a Zod schema for the demo form
  const demoFormSchema = z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z
      .string()
      .regex(/^$|^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone number'),
    age: z.string().refine((val) => !val || (Number(val) >= 18 && Number(val) <= 120), {
      message: 'Age must be between 18 and 120',
    }),
  })

  // Create form with vee-validate + Zod
  const {
    handleSubmit,
    resetForm: resetValidationForm,
    isValid: validationIsValid,
  } = useTypedForm({
    schema: demoFormSchema,
    initialValues: {
      name: '',
      email: '',
      phone: '',
      age: '',
    },
  })

  // Create the submit handler for the form element
  const onValidationSubmit = handleSubmit((values) => {
    toast.success(`Form submitted! Name: ${values.name}, Email: ${values.email}`)
  })
</script>
