/**
 * features/contract-dialog/model/contractEditor/machine.logic.ts
 *
 * Pure logic functions for machine actions - separated from XState's assign()
 * so they can be properly typed when used inline in setup()
 */

import type { ContractEditorContext } from './machine.types'
import type { Contract, ContractDraft, ContractSection } from '@/entities/contract'
import rfdc from 'rfdc'
import {
  applyPatch,
  createDraftFromServer,
  createNewContractDraft,
  resetDraft,
  validateAllSections,
  validateSection,
  ValidationMode,
} from '@/entities/contract'
import { draftsEqual, getSectionFromPath } from './machine.helpers'

const clone = rfdc()

/**
 * Process LOAD_SUCCESS event - create draft from server contract
 */
export function processLoadSuccess(context: ContractEditorContext, contract: Contract) {
  const newDraft = createDraftFromServer(contract)
  const newInitialDraft = clone(newDraft)
  return {
    server: contract,
    draft: newDraft,
    initialDraft: newInitialDraft,
    dirty: false,
    errorsByPath: {} as Record<string, string>,
    lastError: undefined as string | undefined,
    touchedFields: new Set<string>(),
  }
}

/**
 * Process CREATE_NEW event - create new draft
 */
export function processCreateNew(locationId?: string) {
  const newDraft = createNewContractDraft(locationId)
  return {
    draft: newDraft,
    initialDraft: clone(newDraft),
    server: null as Contract | null,
    dirty: false,
    errorsByPath: {} as Record<string, string>,
    lastError: undefined as string | undefined,
    touchedFields: new Set<string>(),
  }
}

/**
 * Process UPDATE_FIELD event - update draft field
 */
export function processUpdateField(
  context: ContractEditorContext,
  path: string,
  value: unknown,
): Partial<ContractEditorContext> {
  if (!context.draft) {
    return {}
  }

  const updatedDraft = applyPatch(context.draft, path, value)
  const isDirty = !draftsEqual(updatedDraft, context.initialDraft)

  return {
    draft: updatedDraft,
    dirty: isDirty,
  }
}

/**
 * Process UPDATE_FIELD with validation for touched fields
 */
export function processUpdateFieldAndValidate(
  context: ContractEditorContext,
  path: string,
  value: unknown,
): Partial<ContractEditorContext> {
  if (!context.draft) {
    return {}
  }

  const updatedDraft = applyPatch(context.draft, path, value)

  // If field is not touched, just update it
  if (!context.touchedFields.has(path)) {
    const isDirty = !draftsEqual(updatedDraft, context.initialDraft)
    return {
      draft: updatedDraft,
      dirty: isDirty,
    }
  }

  // Field is touched, so validate on change
  const section = getSectionFromPath(path)

  if (section) {
    const validationMode = ValidationMode.DRAFT
    const { valid } = validateSection(updatedDraft, section, validationMode)
    const reviewValidation = validateSection(updatedDraft, 'review', validationMode)

    // Update validity
    const updatedValidity = {
      ...context.validity,
      [section]: valid,
      review: reviewValidation.valid,
    }

    // Update errors
    const updatedErrors = { ...context.errorsByPath }
    // Remove errors from this section
    for (const key of Object.keys(updatedErrors)) {
      if (
        (section === 'people' && key.startsWith('people.')) ||
        (section === 'items' && key.startsWith('sale.items.')) ||
        (section === 'payments' && key.startsWith('payments.')) ||
        (section === 'general' && (key.startsWith('locationId') || key.startsWith('needType')))
      ) {
        delete updatedErrors[key]
      }
    }
    // Add current validation errors
    for (const [errorPath, message] of Object.entries(reviewValidation.errors)) {
      updatedErrors[errorPath] = message
    }

    const isDirty = !draftsEqual(updatedDraft, context.initialDraft)

    return {
      draft: updatedDraft,
      dirty: isDirty,
      validity: updatedValidity,
      errorsByPath: updatedErrors,
    }
  }

  const isDirty = !draftsEqual(updatedDraft, context.initialDraft)
  return {
    draft: updatedDraft,
    dirty: isDirty,
  }
}

/**
 * Process TOUCH_FIELD event
 */
export function processTouchField(touchedFields: Set<string>, path: string): Set<string> {
  return new Set([...touchedFields, path])
}

/**
 * Process VALIDATE_SECTION event
 */
export function processValidateSection(
  draft: ContractDraft | null,
  section: ContractSection,
  currentValidity: Record<ContractSection, boolean>,
  currentErrors: Record<string, string>,
): { validity: Record<ContractSection, boolean>; errorsByPath: Record<string, string> } {
  if (!draft) {
    return { validity: currentValidity, errorsByPath: currentErrors }
  }

  const validationMode = ValidationMode.DRAFT
  const { valid, errors } = validateSection(draft, section, validationMode)

  const updatedValidity = {
    ...currentValidity,
    [section]: valid,
  }

  const updatedErrors = { ...currentErrors }
  for (const [path, message] of Object.entries(errors)) {
    updatedErrors[path] = message
  }

  return { validity: updatedValidity, errorsByPath: updatedErrors }
}

/**
 * Process VALIDATE_ALL event
 */
export function processValidateAll(
  draft: ContractDraft | null,
  currentTouchedFields: Set<string>,
): {
  validity: Record<ContractSection, boolean>
  errorsByPath: Record<string, string>
  touchedFields: Set<string>
} {
  if (!draft) {
    return {
      validity: {
        general: true,
        people: true,
        items: true,
        payments: true,
        review: true,
      },
      errorsByPath: {},
      touchedFields: currentTouchedFields,
    }
  }

  const validationMode = ValidationMode.DRAFT
  const { validity, errorsByPath } = validateAllSections(draft, validationMode)

  // Mark all error paths as touched
  const allErrorPaths = new Set<string>(Object.keys(errorsByPath))
  const updatedTouchedFields = new Set([...currentTouchedFields, ...allErrorPaths])

  return { validity, errorsByPath, touchedFields: updatedTouchedFields }
}

/**
 * Process RESET_DRAFT event
 */
export function processResetDraft(
  server: Contract | null,
  initialDraft: ContractDraft | null,
  currentDraft: ContractDraft | null,
): ContractDraft | null {
  if (server) {
    return resetDraft(server)
  }
  if (initialDraft) {
    return clone(initialDraft)
  }
  return currentDraft
}
