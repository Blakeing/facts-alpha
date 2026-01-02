/**
 * machine.test.ts
 *
 * Comprehensive tests for the contract editor state machine
 */

import type { Contract } from '@/entities/contract'
import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'
import { ContractPersonRole, NeedType, SaleStatus, SaleType } from '@/entities/contract'
import { contractEditorMachine } from '../machine'

// Helper to create a mock contract
function createMockContract(overrides?: Partial<Contract>): Contract {
  const now = new Date().toISOString()
  return {
    id: 'contract-123',
    contractNumber: 'C-2024-001',
    locationId: 'loc-1',
    needType: NeedType.AT_NEED,
    isCancelled: false,
    isConditionalSale: false,
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 0,
    amountPaid: 0,
    balanceDue: 0,
    dateCreated: now,
    dateLastModified: now,
    sales: [
      {
        id: 'sale-1',
        contractId: 'contract-123',
        saleNumber: 'S-001',
        saleType: SaleType.CONTRACT,
        saleStatus: SaleStatus.DRAFT,
        saleDate: now,
        items: [],
        subtotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: 0,
        dateCreated: now,
        dateLastModified: now,
      },
    ],
    people: [
      {
        id: 'person-1',
        contractId: 'contract-123',
        nameId: 'name-1',
        roles: ContractPersonRole.PRIMARY_BUYER,
        addedAfterContractExecution: false,
        conversion: null,
        conversionId: null,
        conversionSource: null,
        name: {
          id: 'name-1',
          first: 'John',
          last: 'Doe',
          middle: '',
          prefix: '',
          suffix: '',
          nickname: '',
          companyName: '',
          maidenName: '',
          birthDate: null,
          deathDate: null,
          timeOfDeath: null,
          age: null,
          deceased: false,
          weight: null,
          condition: null,
          nationalIdentifier: '',
          driversLicense: '',
          driversLicenseState: '',
          gender: null,
          maritalStatus: 0,
          ethnicity: null,
          race: null,
          isVeteran: false,
          branchOfService: 0,
          mailingAddressSameAsPhysical: true,
          optOutMarketing: false,
          conversion: null,
          conversionId: null,
          conversionSource: null,
          phones: [],
          addresses: [],
          emailAddresses: [],
          relations: [],
          dateCreated: now,
          dateLastModified: now,
        },
        dateCreated: now,
        dateLastModified: now,
      },
      {
        id: 'person-2',
        contractId: 'contract-123',
        nameId: 'name-2',
        roles: ContractPersonRole.PRIMARY_BENEFICIARY,
        addedAfterContractExecution: false,
        conversion: null,
        conversionId: null,
        conversionSource: null,
        name: {
          id: 'name-2',
          first: 'Jane',
          last: 'Doe',
          middle: '',
          prefix: '',
          suffix: '',
          nickname: '',
          companyName: '',
          maidenName: '',
          birthDate: null,
          deathDate: null,
          timeOfDeath: null,
          age: null,
          deceased: false,
          weight: null,
          condition: null,
          nationalIdentifier: '',
          driversLicense: '',
          driversLicenseState: '',
          gender: null,
          maritalStatus: 0,
          ethnicity: null,
          race: null,
          isVeteran: false,
          branchOfService: 0,
          mailingAddressSameAsPhysical: true,
          optOutMarketing: false,
          conversion: null,
          conversionId: null,
          conversionSource: null,
          phones: [],
          addresses: [],
          emailAddresses: [],
          relations: [],
          dateCreated: now,
          dateLastModified: now,
        },
        dateCreated: now,
        dateLastModified: now,
      },
    ],
    payments: [],
    ...overrides,
  }
}

describe('contractEditorMachine', () => {
  describe('Initial state', () => {
    it('starts in loading state', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      expect(actor.getSnapshot().value).toBe('loading')
    })

    it('initializes context with correct defaults', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const snapshot = actor.getSnapshot()
      expect(snapshot.context.contractId).toBe('123')
      expect(snapshot.context.server).toBeNull()
      expect(snapshot.context.draft).toBeNull()
      expect(snapshot.context.initialDraft).toBeNull()
      expect(snapshot.context.activeTab).toBe('general')
      expect(snapshot.context.dirty).toBe(false)
      expect(snapshot.context.touchedFields.size).toBe(0)
      expect(snapshot.context.validity).toEqual({
        general: true,
        people: true,
        items: true,
        payments: true,
        review: true,
      })
    })
  })

  describe('Loading flow', () => {
    it('transitions to ready.idle on LOAD_SUCCESS', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })

      expect(actor.getSnapshot().value).toEqual({ ready: 'idle' })
    })

    it('assigns draft from server contract on LOAD_SUCCESS', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })

      const snapshot = actor.getSnapshot()
      expect(snapshot.context.server).toEqual(mockContract)
      expect(snapshot.context.draft).toBeTruthy()
      expect(snapshot.context.initialDraft).toBeTruthy()
      expect(snapshot.context.dirty).toBe(false)
      expect(snapshot.context.touchedFields.size).toBe(0)
    })

    it('transitions to error state on LOAD_ERROR', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      actor.send({ type: 'LOAD_ERROR', message: 'Failed to load contract' })

      expect(actor.getSnapshot().value).toBe('error')
      expect(actor.getSnapshot().context.lastError).toBe('Failed to load contract')
    })
  })

  describe('New contract creation', () => {
    it('transitions to ready on CREATE_NEW', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: 'new' },
      })
      actor.start()

      actor.send({ type: 'CREATE_NEW' })

      expect(actor.getSnapshot().value).toEqual({ ready: 'idle' })
    })

    it('creates fresh draft with correct initial state', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: 'new' },
      })
      actor.start()

      actor.send({ type: 'CREATE_NEW', locationId: 'loc-1' })

      const snapshot = actor.getSnapshot()
      expect(snapshot.context.draft).toBeTruthy()
      expect(snapshot.context.draft?.locationId).toBe('loc-1')
      expect(snapshot.context.draft?.id).toBe('new')
      expect(snapshot.context.initialDraft).toBeTruthy()
      expect(snapshot.context.dirty).toBe(false)
      expect(snapshot.context.server).toBeNull()
    })
  })

  describe('Field updates', () => {
    it('transitions to editing state on UPDATE_FIELD', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'UPDATE_FIELD', path: 'needType', value: NeedType.PRE_NEED })

      expect(actor.getSnapshot().value).toEqual({ ready: 'editing' })
    })

    it('applies field patches correctly', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'UPDATE_FIELD', path: 'needType', value: NeedType.PRE_NEED })

      const snapshot = actor.getSnapshot()
      expect(snapshot.context.draft?.needType).toBe(NeedType.PRE_NEED)
    })

    it('tracks dirty state correctly', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })

      // Initially not dirty
      expect(actor.getSnapshot().context.dirty).toBe(false)

      // Update field - should become dirty
      actor.send({ type: 'UPDATE_FIELD', path: 'needType', value: NeedType.PRE_NEED })
      expect(actor.getSnapshot().context.dirty).toBe(true)

      // Reset - should not be dirty
      actor.send({ type: 'RESET_DRAFT' })
      expect(actor.getSnapshot().context.dirty).toBe(false)
    })
  })

  describe('Touched fields tracking', () => {
    it('marks fields as touched on TOUCH_FIELD', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      // Transition to editing state first (TOUCH_FIELD only works in editing state)
      actor.send({ type: 'UPDATE_FIELD', path: 'needType', value: NeedType.PRE_NEED })
      actor.send({ type: 'TOUCH_FIELD', path: 'needType' })

      const snapshot = actor.getSnapshot()
      expect(snapshot.context.touchedFields.has('needType')).toBe(true)
    })

    it('validates only touched fields on UPDATE_FIELD', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })

      // Transition to editing state first
      actor.send({ type: 'UPDATE_FIELD', path: 'needType', value: NeedType.PRE_NEED })

      // Touch field first
      actor.send({ type: 'TOUCH_FIELD', path: 'locationId' })

      // Update to invalid value - should validate
      actor.send({ type: 'UPDATE_FIELD', path: 'locationId', value: '' })

      const snapshot = actor.getSnapshot()
      // Should have validation errors for locationId
      expect(snapshot.context.errorsByPath['locationId']).toBeTruthy()
    })
  })

  describe('Section validation', () => {
    it('validates specific section on VALIDATE_SECTION', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })

      // Create invalid draft (missing locationId)
      actor.send({ type: 'UPDATE_FIELD', path: 'locationId', value: '' })
      actor.send({ type: 'VALIDATE_SECTION', section: 'general' })

      const snapshot = actor.getSnapshot()
      expect(snapshot.context.validity.general).toBe(false)
      expect(snapshot.context.errorsByPath['locationId']).toBeTruthy()
    })

    it('validates all sections on VALIDATE_ALL', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'VALIDATE_ALL' })

      const snapshot = actor.getSnapshot()
      // Should have validity for all sections
      expect(snapshot.context.validity.general).toBeDefined()
      expect(snapshot.context.validity.people).toBeDefined()
      expect(snapshot.context.validity.items).toBeDefined()
      expect(snapshot.context.validity.payments).toBeDefined()
      expect(snapshot.context.validity.review).toBeDefined()
    })
  })

  describe('Save workflow', () => {
    it('transitions to saving state on SAVE', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'SAVE' })

      expect(actor.getSnapshot().value).toEqual({ ready: 'saving' })
    })

    it('validates all sections before saving', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })

      // Make invalid change
      actor.send({ type: 'UPDATE_FIELD', path: 'locationId', value: '' })
      actor.send({ type: 'SAVE' })

      const snapshot = actor.getSnapshot()
      // Should have run validation
      expect(snapshot.context.validity).toBeDefined()
    })

    it('transitions to idle on SAVE_SUCCESS', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'SAVE' })
      actor.send({ type: 'SAVE_SUCCESS', contract: mockContract })

      expect(actor.getSnapshot().value).toEqual({ ready: 'idle' })
      expect(actor.getSnapshot().context.dirty).toBe(false)
    })

    it('transitions to error state on SAVE_ERROR', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'SAVE' })
      actor.send({ type: 'SAVE_ERROR', message: 'Save failed' })

      expect(actor.getSnapshot().value).toEqual({ ready: 'error' })
      expect(actor.getSnapshot().context.lastError).toBe('Save failed')
    })
  })

  describe('Draft reset', () => {
    it('resets draft to initial state on RESET_DRAFT', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })

      // Make changes
      actor.send({ type: 'UPDATE_FIELD', path: 'needType', value: NeedType.PRE_NEED })
      expect(actor.getSnapshot().context.dirty).toBe(true)

      // Reset
      actor.send({ type: 'RESET_DRAFT' })

      const snapshot = actor.getSnapshot()
      expect(snapshot.context.dirty).toBe(false)
      expect(snapshot.context.errorsByPath).toEqual({})
      expect(snapshot.context.touchedFields.size).toBe(0)
    })

    it('transitions from editing to idle on RESET_DRAFT', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'UPDATE_FIELD', path: 'needType', value: NeedType.PRE_NEED })
      expect(actor.getSnapshot().value).toEqual({ ready: 'editing' })

      actor.send({ type: 'RESET_DRAFT' })
      expect(actor.getSnapshot().value).toEqual({ ready: 'idle' })
    })
  })

  describe('Tab navigation', () => {
    it('updates activeTab on SET_TAB', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'SET_TAB', tab: 'people' })

      expect(actor.getSnapshot().context.activeTab).toBe('people')
    })

    it('validates section when changing tabs', () => {
      const actor = createActor(contractEditorMachine, {
        input: { contractId: '123' },
      })
      actor.start()

      const mockContract = createMockContract()
      actor.send({ type: 'LOAD_SUCCESS', contract: mockContract })
      actor.send({ type: 'SET_TAB', tab: 'people' })

      // Should have run validation for people section
      const snapshot = actor.getSnapshot()
      expect(snapshot.context.validity.people).toBeDefined()
    })
  })
})
