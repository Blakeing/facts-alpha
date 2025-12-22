/**
 * entities/case/index.ts
 *
 * Case entity - funeral case management
 */

// API client
export { caseApi } from './api'

// Types
export type { Case, CaseService, CaseStatus, Decedent, NextOfKin, ServiceType } from './model/case'
export { getStatusColor, getStatusLabel } from './model/case'

// Zod schemas and form types
export {
  addressSchema,
  caseFormSchema,
  caseStatusSchema,
  caseToFormValues,
  decedentFormSchema,
  formValuesToCase,
  getDefaultCaseFormValues,
  nextOfKinFormSchema,
  serviceTypeSchema,
} from './model/caseSchema'

export type {
  AddressValues,
  CaseFormValues,
  DecedentFormValues,
  NextOfKinFormValues,
} from './model/caseSchema'

// Domain composables
export { useCase } from './model/useCase'
export { useCaseForm } from './model/useCaseForm'
export { CASES_QUERY_KEY, useCases } from './model/useCases'

// UI components
export { default as CaseCard } from './ui/CaseCard.vue'
export { default as CaseStatusBadge } from './ui/CaseStatusBadge.vue'
