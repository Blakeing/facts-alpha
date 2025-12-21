/**
 * @facts/ui
 *
 * Shared UI components and design tokens for the Facts Alpha design system
 */

// =============================================================================
// Design Tokens
// =============================================================================
export * from './tokens'

// =============================================================================
// Composables
// =============================================================================
export { useTokens } from './composables'
export { useFieldBinding, useFieldBindings, useTypedForm, useTypedFieldArray } from './composables'
export type {
  FieldBinding,
  FieldBindingOptions,
  TypedFormOptions,
  TypedFormReturn,
  TypedFieldArrayReturn,
} from './composables'

// =============================================================================
// Components
// =============================================================================

// Buttons
export { default as FButton } from './components/FButton.vue'
export type { FButtonProps, ButtonIntent } from './components/FButton.vue'

// Form Controls - Text Inputs
export { default as FTextField } from './components/FTextField.vue'
export type { FTextFieldProps } from './components/FTextField.vue'

export { default as FTextarea } from './components/FTextarea.vue'
export type { FTextareaProps } from './components/FTextarea.vue'

// Form Controls - Selection
export { default as FSelect } from './components/FSelect.vue'
export type { FSelectProps, SelectOption } from './components/FSelect.vue'

export { default as FCheckbox } from './components/FCheckbox.vue'
export type { FCheckboxProps } from './components/FCheckbox.vue'

export { default as FCheckboxGroup } from './components/FCheckboxGroup.vue'
export type { FCheckboxGroupProps, CheckboxOption } from './components/FCheckboxGroup.vue'

export { default as FSwitch } from './components/FSwitch.vue'
export type { FSwitchProps } from './components/FSwitch.vue'

export { default as FRadioGroup } from './components/FRadioGroup.vue'
export type { FRadioGroupProps, RadioOption } from './components/FRadioGroup.vue'

// Form Controls - Date/Time
export { default as FDatePicker } from './components/FDatePicker.vue'
export type { FDatePickerProps } from './components/FDatePicker.vue'

export { default as FDateRangePicker } from './components/FDateRangePicker.vue'
export type { FDateRangePickerProps, DateRange } from './components/FDateRangePicker.vue'

// Form Containers
export { default as FForm, FORM_CONTEXT_KEY } from './components/FForm.vue'
export type { FFormProps, FFormSlotProps } from './components/FForm.vue'

export { default as FFieldArray } from './components/FFieldArray.vue'
export type { FFieldArrayProps, FFieldArraySlotProps } from './components/FFieldArray.vue'

// Containers
export { default as FCard } from './components/FCard.vue'
export type { FCardProps, CardVariant } from './components/FCard.vue'

export { default as FDialog } from './components/FDialog.vue'
export type { FDialogProps, DialogWidth } from './components/FDialog.vue'

// Navigation & Menus
export { default as FBreadcrumbs } from './components/FBreadcrumbs.vue'
export type { FBreadcrumbsProps, BreadcrumbItem } from './components/FBreadcrumbs.vue'

export { default as FMenu } from './components/FMenu.vue'
export type { FMenuProps, MenuItem } from './components/FMenu.vue'

// Feedback & Display
export { default as FChip } from './components/FChip.vue'

export { default as FAvatar } from './components/FAvatar.vue'
export type { FAvatarProps } from './components/FAvatar.vue'

export { default as FTooltip } from './components/FTooltip.vue'

// Data Display
export { default as FDataTable } from './components/FDataTable.vue'
export type { FDataTableProps, FColumn } from './components/FDataTable.vue'

// Composite Components
export { default as EmptyState } from './components/EmptyState.vue'
export type { EmptyStateProps } from './components/EmptyState.vue'

export { default as PageHeader } from './components/PageHeader.vue'
export type { PageHeaderProps } from './components/PageHeader.vue'
