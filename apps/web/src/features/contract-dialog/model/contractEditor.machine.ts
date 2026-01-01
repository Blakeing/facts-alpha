/**
 * features/contract-dialog/model/contractEditor.machine.ts
 *
 * XState machine for contract editor workflow
 * Manages the editing lifecycle: loading → ready → editing → saving → success/error
 */

import type { Contract, ContractDraft, ContractSection } from '@/entities/contract'
import rfdc from 'rfdc'
import { assign, setup } from 'xstate'
import {
  applyPatch,
  createDraftFromServer,
  createNewContractDraft,
  resetDraft,
  ValidationMode,
  validateAllSections,
  validateSection,
} from '@/entities/contract'

const clone = rfdc()

export interface ContractEditorContext {
  contractId: string
  server: Contract | null // Loaded server contract
  draft: ContractDraft | null // Working draft
  initialDraft: ContractDraft | null // Snapshot of initial state for dirty tracking
  activeTab: ContractSection
  dirty: boolean
  validity: Record<ContractSection, boolean>
  errorsByPath: Record<string, string>
  lastError?: string
  touchedFields: Set<string> // Track which fields have been touched/interacted with
}

export type ContractEditorEvent =
  | { type: 'LOAD_SUCCESS'; contract: Contract }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'CREATE_NEW'; locationId?: string }
  | { type: 'SET_TAB'; tab: ContractSection }
  | { type: 'UPDATE_FIELD'; path: string; value: unknown }
  | { type: 'TOUCH_FIELD'; path: string }
  | { type: 'VALIDATE_SECTION'; section: ContractSection }
  | { type: 'VALIDATE_ALL' }
  | { type: 'SAVE' }
  | { type: 'SAVE_SUCCESS'; contract: Contract }
  | { type: 'SAVE_ERROR'; message: string }
  | { type: 'RESET_DRAFT' }

/**
 * Deep equality check for drafts
 * Compares two ContractDraft objects by serializing to JSON
 */
function draftsEqual(draft1: ContractDraft | null, draft2: ContractDraft | null): boolean {
  if (draft1 === null && draft2 === null) {
    return true
  }
  if (draft1 === null || draft2 === null) {
    return false
  }
  // Normalize and compare JSON strings
  // Exclude meta.updatedAt from comparison as it changes on save
  const normalizeForComparison = (draft: ContractDraft) => {
    const normalized = clone(draft)
    // Remove updatedAt from comparison
    if (normalized.meta) {
      normalized.meta.updatedAt = ''
    }
    return JSON.stringify(normalized)
  }
  return normalizeForComparison(draft1) === normalizeForComparison(draft2)
}

export const contractEditorMachine = setup({
  types: {
    context: {} as ContractEditorContext,
    events: {} as ContractEditorEvent,
    input: {} as { contractId: string; locationId?: string },
  },
  actions: {
    assignDraftFromServer: assign(({ event, context }) => {
      if ('contract' in event && event.contract) {
        // Create draft from server contract
        const newDraft = createDraftFromServer(event.contract)
        // Store snapshot as initial draft
        const newInitialDraft = clone(newDraft)
        return {
          server: event.contract,
          draft: newDraft,
          initialDraft: newInitialDraft,
          dirty: false, // Draft matches initial draft after load/save
          errorsByPath: {},
          lastError: undefined,
          touchedFields: new Set<string>(),
        }
      }
      // No contract in event, return current context
      return {
        server: context.server,
        draft: context.draft,
        initialDraft: context.initialDraft,
        dirty: !draftsEqual(context.draft, context.initialDraft),
        errorsByPath: {},
        lastError: undefined,
        touchedFields: new Set<string>(),
      }
    }),

    updateField: assign(({ context, event }) => {
      // First, update the draft
      let updatedDraft = context.draft
      if (context.draft && 'path' in event && 'value' in event) {
        updatedDraft = applyPatch(context.draft, event.path, event.value)
      }

      // Compare updated draft with initial draft
      const isDirty = !draftsEqual(updatedDraft, context.initialDraft)

      return {
        draft: updatedDraft,
        dirty: isDirty,
      }
    }),

    updateFieldAndValidate: assign(({ context, event }) => {
      // First, update the draft
      let updatedDraft = context.draft
      if (context.draft && 'path' in event && 'value' in event) {
        updatedDraft = applyPatch(context.draft, event.path, event.value)
      }

      // If field hasn't been touched, just update the field (don't validate yet)
      if (!('path' in event) || !updatedDraft) {
        const isDirty = !draftsEqual(updatedDraft, context.initialDraft)
        return {
          draft: updatedDraft,
          dirty: isDirty,
        }
      }

      const path = event.path
      // If field is not touched, just update it (validation will happen on blur or save)
      if (!context.touchedFields.has(path)) {
        const isDirty = !draftsEqual(updatedDraft, context.initialDraft)
        return {
          draft: updatedDraft,
          dirty: isDirty,
        }
      }

      // Field is touched, so validate on change

      // Determine which section this field belongs to
      let section: ContractSection | null = null

      if (path.startsWith('people.')) {
        section = 'people'
      } else if (path.startsWith('sale.items.')) {
        section = 'items'
      } else if (path.startsWith('payments.')) {
        section = 'payments'
      } else if (path.startsWith('locationId') || path.startsWith('needType')) {
        section = 'general'
      }

      if (section) {
        // Use DRAFT mode for validation (lenient - only location and sale date required)
        const validationMode: ValidationMode = ValidationMode.DRAFT
        // Validate using the updated draft
        const { valid } = validateSection(updatedDraft, section, validationMode)

        // Also validate review section since it depends on all sections
        // Review validation is the source of truth for all errors
        const reviewValidation = validateSection(updatedDraft, 'review', validationMode)

        // Update validity
        const updatedValidity = {
          ...context.validity,
          [section]: valid,
          review: reviewValidation.valid,
        }

        // Update errors - clear all errors from this section, then rebuild from current validation
        const updatedErrors = { ...context.errorsByPath }
        // Remove all errors that belong to this section
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
        // Rebuild errors from current validation state
        // Use review errors as source of truth (comprehensive validation, uses original paths)
        for (const [errorPath, message] of Object.entries(reviewValidation.errors)) {
          updatedErrors[errorPath] = message
        }

        // Compare with initial draft to determine dirty state
        const isDirty = !draftsEqual(updatedDraft, context.initialDraft)

        return {
          draft: updatedDraft,
          dirty: isDirty,
          validity: updatedValidity,
          errorsByPath: updatedErrors,
        }
      }

      // Compare with initial draft to determine dirty state
      const isDirty = !draftsEqual(updatedDraft, context.initialDraft)
      return {
        draft: updatedDraft,
        dirty: isDirty,
      }
    }),

    touchField: assign({
      touchedFields: ({ context, event }) => {
        if (!('path' in event)) {
          return context.touchedFields
        }
        return new Set([...context.touchedFields, event.path])
      },
    }),

    validateSection: assign({
      validity: ({ context, event }) => {
        if (!context.draft || !('section' in event)) {
          return context.validity
        }

        // Use DRAFT mode for validation (lenient - only location and sale date required)
        const validationMode: ValidationMode = ValidationMode.DRAFT
        const { valid } = validateSection(context.draft, event.section, validationMode)
        return {
          ...context.validity,
          [event.section]: valid,
        }
      },
      errorsByPath: ({ context, event }) => {
        if (!context.draft || !('section' in event)) {
          return context.errorsByPath
        }

        // Use DRAFT mode for validation
        const validationMode: ValidationMode = ValidationMode.DRAFT
        const { errors } = validateSection(context.draft, event.section, validationMode)
        // Merge new errors, but keep errors from other sections
        const merged = { ...context.errorsByPath }
        for (const [path, message] of Object.entries(errors)) {
          merged[path] = message
        }
        return merged
      },
    }),

    validateAll: assign({
      validity: ({ context }) => {
        if (!context.draft) {
          return context.validity
        }

        // Use DRAFT mode for validation (lenient - only location and sale date required)
        const validationMode: ValidationMode = ValidationMode.DRAFT
        const { validity } = validateAllSections(context.draft, validationMode)
        return validity
      },
      errorsByPath: ({ context }) => {
        if (!context.draft) {
          return context.errorsByPath
        }

        // Use DRAFT mode for validation
        const validationMode: ValidationMode = ValidationMode.DRAFT
        const { errorsByPath } = validateAllSections(context.draft, validationMode)
        return errorsByPath
      },
      touchedFields: ({ context }) => {
        if (!context.draft) {
          return context.touchedFields
        }
        // When validating all, mark all error paths as touched so errors display
        const validationMode: ValidationMode = ValidationMode.DRAFT
        const { errorsByPath } = validateAllSections(context.draft, validationMode)
        const allErrorPaths = new Set<string>(Object.keys(errorsByPath))

        // Merge with existing touched fields
        return new Set([...context.touchedFields, ...allErrorPaths])
      },
    }),

    clearErrors: assign({
      errorsByPath: () => ({}),
      lastError: () => undefined,
    }),

    setTab: assign({
      activeTab: ({ event }) => ('tab' in event ? event.tab : 'general'),
    }),

    setError: assign({
      lastError: ({ event }) => ('message' in event ? event.message : undefined),
    }),

    resetDraft: assign({
      draft: ({ context }) => {
        if (context.server) {
          return resetDraft(context.server)
        }
        // For new contracts, reset to initial draft
        if (context.initialDraft) {
          return clone(context.initialDraft)
        }
        return context.draft
      },
      dirty: () => false,
      errorsByPath: () => ({}),
      lastError: () => undefined,
      touchedFields: () => new Set<string>(),
    }),

    createNewDraft: assign(({ event }) => {
      // Store snapshot of new contract initial state
      const locationId = 'locationId' in event ? event.locationId : undefined
      const newDraft = createNewContractDraft(locationId)
      return {
        draft: newDraft,
        initialDraft: clone(newDraft),
        server: null,
        dirty: false,
        errorsByPath: {},
        lastError: undefined,
        touchedFields: new Set<string>(),
      }
    }),
  },
}).createMachine({
  id: 'contractEditor',
  initial: 'loading',
  context: ({ input }) => ({
    contractId: input.contractId || '',
    server: null,
    draft: null,
    initialDraft: null,
    activeTab: 'general' as ContractSection,
    dirty: false,
    validity: {
      general: true,
      people: true,
      items: true,
      payments: true,
      review: true,
    },
    errorsByPath: {},
    lastError: undefined,
    touchedFields: new Set<string>(),
  }),
  states: {
    loading: {
      on: {
        LOAD_SUCCESS: {
          target: 'ready',
          actions: 'assignDraftFromServer',
        },
        LOAD_ERROR: {
          target: 'error',
          actions: 'setError',
        },
        CREATE_NEW: {
          target: 'ready',
          actions: 'createNewDraft',
        },
      },
    },
    ready: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            UPDATE_FIELD: {
              target: 'editing',
              actions: 'updateField',
            },
            SET_TAB: {
              actions: ['setTab', 'validateSection'],
            },
            VALIDATE_SECTION: {
              actions: 'validateSection',
            },
            VALIDATE_ALL: {
              actions: 'validateAll',
            },
            SAVE: {
              target: 'saving',
              actions: 'validateAll',
            },
            RESET_DRAFT: {
              actions: 'resetDraft',
            },
          },
        },
        editing: {
          on: {
            UPDATE_FIELD: [
              {
                guard: ({ context, event }) => {
                  if (!('path' in event)) {
                    return false
                  }
                  return context.touchedFields.has(event.path)
                },
                actions: 'updateFieldAndValidate',
              },
              {
                actions: 'updateField',
              },
            ],
            TOUCH_FIELD: {
              actions: 'touchField',
            },
            SET_TAB: {
              target: 'editing',
              actions: ['setTab', 'validateSection'],
            },
            VALIDATE_SECTION: {
              actions: 'validateSection',
            },
            VALIDATE_ALL: {
              actions: 'validateAll',
            },
            SAVE: {
              target: 'saving',
              actions: 'validateAll',
            },
            RESET_DRAFT: {
              target: 'idle',
              actions: 'resetDraft',
            },
          },
        },
        saving: {
          on: {
            SAVE_SUCCESS: {
              target: 'idle',
              actions: 'assignDraftFromServer',
            },
            SAVE_ERROR: {
              target: 'error',
              actions: 'setError',
            },
          },
        },
        error: {
          on: {
            UPDATE_FIELD: {
              target: 'editing',
              actions: 'updateField',
            },
            SAVE: {
              target: 'saving',
              actions: ['clearErrors', 'validateAll'],
            },
            RESET_DRAFT: {
              target: 'idle',
              actions: 'resetDraft',
            },
          },
        },
      },
    },
    error: {
      on: {
        LOAD_SUCCESS: {
          target: 'ready',
          actions: 'assignDraftFromServer',
        },
      },
    },
  },
})
