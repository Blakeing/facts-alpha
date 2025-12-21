/**
 * entities/case/index.ts
 *
 * Case entity - funeral case management
 */

export type { Case, CaseService, CaseStatus, Decedent, NextOfKin, ServiceType } from './model/case'
export { getStatusColor, getStatusLabel } from './model/case'
export { useCaseStore } from './model/caseStore'
export { default as CaseCard } from './ui/CaseCard.vue'
export { default as CaseStatusBadge } from './ui/CaseStatusBadge.vue'
