/**
 * features/contract-dialog/model/contractEditor/machine.ts
 *
 * XState machine for contract editor workflow
 * Manages the editing lifecycle: loading → ready → editing → saving → success/error
 *
 * Actions are defined inline in setup() for proper TypeScript inference
 * @see https://stately.ai/docs/typescript
 */

import type {
  ContractEditorContext,
  ContractEditorEvent,
  ContractEditorInput,
} from './machine.types'
import type { ContractPermissions, ContractSection } from '@/entities/contract'
import { assign, setup } from 'xstate'
import {
  processCreateNew,
  processLoadSuccess,
  processResetDraft,
  processTouchField,
  processUpdateField,
  processUpdateFieldAndValidate,
  processValidateAll,
  processValidateSection,
} from './machine.logic'

export const contractEditorMachine = setup({
  types: {
    context: {} as ContractEditorContext,
    events: {} as ContractEditorEvent,
    input: {} as ContractEditorInput,
  },
  actions: {
    // Load/Save actions
    assignDraftFromServer: assign(({ event, context }) => {
      if (event.type === 'LOAD_SUCCESS' || event.type === 'SAVE_SUCCESS') {
        return processLoadSuccess(context, event.session)
      }
      return {}
    }),

    createNewDraft: assign(({ event }) => {
      if (event.type === 'CREATE_NEW') {
        return processCreateNew(event.locationId)
      }
      return {}
    }),

    // Field updates
    updateField: assign(({ context, event }) => {
      if (event.type === 'UPDATE_FIELD') {
        return processUpdateField(context, event.path, event.value)
      }
      return {}
    }),

    updateFieldAndValidate: assign(({ context, event }) => {
      if (event.type === 'UPDATE_FIELD') {
        return processUpdateFieldAndValidate(context, event.path, event.value)
      }
      return {}
    }),

    touchField: assign(({ context, event }) => {
      if (event.type === 'TOUCH_FIELD') {
        return { touchedFields: processTouchField(context.touchedFields, event.path) }
      }
      return {}
    }),

    // Validation
    validateSection: assign(({ context, event }) => {
      if (event.type === 'VALIDATE_SECTION' || event.type === 'SET_TAB') {
        const section = event.type === 'VALIDATE_SECTION' ? event.section : context.activeTab
        return processValidateSection(
          context.draft,
          section,
          context.validity,
          context.errorsByPath,
        )
      }
      return {}
    }),

    validateAll: assign(({ context }) => {
      return processValidateAll(context.draft, context.touchedFields)
    }),

    // Tab navigation
    setTab: assign(({ event }) => {
      if (event.type === 'SET_TAB') {
        return { activeTab: event.tab }
      }
      return {}
    }),

    // Error handling
    setError: assign(({ event }) => {
      if (event.type === 'LOAD_ERROR' || event.type === 'SAVE_ERROR') {
        return { lastError: event.message }
      }
      return {}
    }),

    clearErrors: assign(() => ({
      errorsByPath: {} as Record<string, string>,
      lastError: undefined,
    })),

    // Reset
    resetDraft: assign(({ context }) => ({
      draft: processResetDraft(context.server, context.initialDraft, context.draft),
      dirty: false,
      errorsByPath: {} as Record<string, string>,
      lastError: undefined,
      touchedFields: new Set<string>(),
    })),
  },
}).createMachine({
  id: 'contractEditor',
  initial: 'loading',
  context: ({ input }) => ({
    contractId: input.contractId || '',
    server: null,
    draft: null,
    initialDraft: null,
    permissions: {
      canExecute: true,
      canFinalize: true,
      canVoid: false,
    } as ContractPermissions,
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
