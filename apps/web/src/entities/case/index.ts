/**
 * entities/case/index.ts
 *
 * Case entity - funeral case management
 */

export type { Case, CaseStatus, Decedent, NextOfKin } from './model/case'
export { useCaseStore } from './model/caseStore'
export { default as CaseCard } from './ui/CaseCard.vue'
