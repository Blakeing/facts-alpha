/**
 * contract.draft.test.ts
 *
 * Tests for contract draft utilities
 * Covers draft creation, patching, value retrieval, and conversion
 */

import { describe, it, expect } from 'vitest'
import {
  applyPatch,
  createDraftFromServer,
  createNewContractDraft,
  draftToContract,
  getValueByPath,
  resetDraft,
  type ContractDraft,
} from '../contract.draft'
import type { Contract, ContractPayment, ContractPerson, Sale, SaleItem } from '../contract'
import { ContractPersonRole, NeedType, PaymentMethod, SaleStatus, SaleType } from '../contract'

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
        roles: ContractPersonRole.PRIMARY_BUYER,
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
        },
        dateCreated: now,
        dateLastModified: now,
        state: 0,
      },
    ],
    payments: [],
    ...overrides,
  }
}

describe('contract.draft', () => {
  describe('createNewContractDraft', () => {
    it('creates a new draft with default values', () => {
      const draft = createNewContractDraft()

      expect(draft.id).toBe('new')
      expect(draft.contractNumber).toBe('')
      expect(draft.locationId).toBe('')
      expect(draft.needType).toBe(NeedType.AT_NEED)
      expect(draft.people).toEqual([])
      expect(draft.sale.items).toEqual([])
      expect(draft.payments).toEqual([])
      expect(draft.meta.status).toBe(SaleStatus.DRAFT)
      expect(draft.meta.isCancelled).toBe(false)
    })

    it('creates draft with provided locationId', () => {
      const draft = createNewContractDraft('loc-123')

      expect(draft.locationId).toBe('loc-123')
    })

    it('creates draft with temp sale id', () => {
      const draft = createNewContractDraft()

      expect(draft.sale.id).toBe('temp-sale-id')
    })

    it('creates draft with timestamps', () => {
      const before = new Date().toISOString()
      const draft = createNewContractDraft()
      const after = new Date().toISOString()

      expect(draft.meta.createdAt).toBeTruthy()
      expect(draft.meta.updatedAt).toBeTruthy()
      expect(draft.meta.createdAt >= before).toBe(true)
      expect(draft.meta.createdAt <= after).toBe(true)
    })
  })

  describe('createDraftFromServer', () => {
    it('creates draft from complete contract', () => {
      const contract = createMockContract()
      const draft = createDraftFromServer(contract)

      expect(draft.id).toBe(contract.id)
      expect(draft.contractNumber).toBe(contract.contractNumber)
      expect(draft.locationId).toBe(contract.locationId)
      expect(draft.needType).toBe(contract.needType)
      expect(draft.people).toHaveLength(1)
      expect(draft.people[0].name.first).toBe('John')
    })

    it('extracts primary sale (CONTRACT type)', () => {
      const contract = createMockContract({
        sales: [
          {
            id: 'sale-1',
            contractId: 'contract-123',
            saleType: SaleType.CONTRACT,
            saleStatus: SaleStatus.DRAFT,
            saleDate: '2024-01-01T00:00:00Z',
            items: [
              {
                id: 'item-1',
                saleId: 'sale-1',
                itemId: 'catalog-1',
                description: 'Test Item',
                quantity: 1,
                unitPrice: 100,
                needType: NeedType.AT_NEED,
                dateCreated: new Date().toISOString(),
                dateLastModified: new Date().toISOString(),
                state: 0,
              },
            ],
            subtotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: 0,
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            state: 0,
          },
        ],
      })

      const draft = createDraftFromServer(contract)

      expect(draft.sale.id).toBe('sale-1')
      expect(draft.sale.items).toHaveLength(1)
      expect(draft.sale.items[0].description).toBe('Test Item')
    })

    it('handles contract with no primary sale', () => {
      const contract = createMockContract({
        sales: [
          {
            id: 'sale-1',
            contractId: 'contract-123',
            saleType: SaleType.CONTRACT_ADJUSTMENT, // Not CONTRACT type
            saleStatus: SaleStatus.DRAFT,
            saleDate: '2024-01-01T00:00:00Z',
            items: [],
            subtotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: 0,
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            state: 0,
          },
        ],
      })

      const draft = createDraftFromServer(contract)

      expect(draft.sale.id).toBe('temp-sale-id')
      expect(draft.sale.items).toEqual([])
    })

    it('handles contract with no sales array', () => {
      const contract = createMockContract({
        sales: undefined,
      })

      const draft = createDraftFromServer(contract)

      expect(draft.sale.id).toBe('temp-sale-id')
      expect(draft.sale.items).toEqual([])
      expect(draft.meta.status).toBe(SaleStatus.DRAFT)
    })

    it('handles contract with no people', () => {
      const contract = createMockContract({
        people: [],
      })

      const draft = createDraftFromServer(contract)

      expect(draft.people).toEqual([])
    })

    it('converts saleDate to date-only format', () => {
      const contract = createMockContract({
        sales: [
          {
            id: 'sale-1',
            contractId: 'contract-123',
            saleType: SaleType.CONTRACT,
            saleStatus: SaleStatus.DRAFT,
            saleDate: '2024-01-01T12:34:56Z',
            items: [],
            subtotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: 0,
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            state: 0,
          },
        ],
      })

      const draft = createDraftFromServer(contract)

      expect(draft.sale.saleDate).toBe('2024-01-01')
    })

    it('preserves optional fields', () => {
      const contract = createMockContract({
        prePrintedContractNumber: 'PP-123',
        dateExecuted: '2024-01-01',
        dateSigned: '2024-01-02',
      })

      const draft = createDraftFromServer(contract)

      expect(draft.prePrintedContractNumber).toBe('PP-123')
      expect(draft.meta.dateExecuted).toBe('2024-01-01')
      expect(draft.meta.dateSigned).toBe('2024-01-02')
    })

    it('deep clones people array', () => {
      const contract = createMockContract()
      const draft = createDraftFromServer(contract)

      // Modify the draft
      draft.people[0].name.first = 'Jane'

      // Original contract should be unchanged
      expect(contract.people[0].name.first).toBe('John')
    })

    it('deep clones sale items', () => {
      const contract = createMockContract({
        sales: [
          {
            id: 'sale-1',
            contractId: 'contract-123',
            saleType: SaleType.CONTRACT,
            saleStatus: SaleStatus.DRAFT,
            saleDate: '2024-01-01',
            items: [
              {
                id: 'item-1',
                saleId: 'sale-1',
                itemId: 'catalog-1',
                description: 'Original',
                quantity: 1,
                unitPrice: 100,
                needType: NeedType.AT_NEED,
                dateCreated: new Date().toISOString(),
                dateLastModified: new Date().toISOString(),
                state: 0,
              },
            ],
            subtotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: 0,
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            state: 0,
          },
        ],
      })

      const draft = createDraftFromServer(contract)
      draft.sale.items[0].description = 'Modified'

      expect(contract.sales[0].items[0].description).toBe('Original')
    })
  })

  describe('resetDraft', () => {
    it('resets draft to match server contract', () => {
      const contract = createMockContract()
      const draft = createDraftFromServer(contract)

      // Modify the draft
      draft.needType = NeedType.PRE_NEED
      draft.locationId = 'modified'

      // Reset
      const reset = resetDraft(contract)

      expect(reset.needType).toBe(NeedType.AT_NEED)
      expect(reset.locationId).toBe('loc-1')
    })
  })

  describe('applyPatch', () => {
    let draft: ContractDraft

    beforeEach(() => {
      draft = createNewContractDraft('loc-1')
      draft.people = [
        {
          id: 'person-1',
          contractId: 'contract-1',
          roles: ContractPersonRole.PRIMARY_BUYER,
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
          },
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]
      draft.sale.items = [
        {
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'catalog-1',
          description: 'Item 1',
          quantity: 1,
          unitPrice: 100,
          needType: NeedType.AT_NEED,
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]
    })

    it('updates simple top-level field', () => {
      const updated = applyPatch(draft, 'needType', NeedType.PRE_NEED)

      expect(updated.needType).toBe(NeedType.PRE_NEED)
      expect(updated.locationId).toBe(draft.locationId) // Unchanged
    })

    it('updates nested field', () => {
      const updated = applyPatch(draft, 'people.0.name.first', 'Jane')

      expect(updated.people[0].name.first).toBe('Jane')
      expect(updated.people[0].name.last).toBe('Doe') // Unchanged
      expect(updated.people[0].id).toBe('person-1') // Unchanged
    })

    it('updates array element field', () => {
      const updated = applyPatch(draft, 'sale.items.0.quantity', 5)

      expect(updated.sale.items[0].quantity).toBe(5)
      expect(updated.sale.items[0].description).toBe('Item 1') // Unchanged
    })

    it('updates deeply nested field', () => {
      const updated = applyPatch(draft, 'people.0.name.last', 'Smith')

      expect(updated.people[0].name.last).toBe('Smith')
      expect(updated.people[0].name.first).toBe('John') // Unchanged
    })

    it('creates new nested object if it does not exist', () => {
      const updated = applyPatch(draft, 'meta.customField', 'value')

      expect((updated.meta as any).customField).toBe('value')
    })

    it('handles empty path string', () => {
      const updated = applyPatch(draft, '', 'value')

      expect(updated).toEqual(draft)
    })

    it('updates updatedAt timestamp', () => {
      const before = new Date().toISOString()
      const updated = applyPatch(draft, 'needType', NeedType.PRE_NEED)
      const after = new Date().toISOString()

      expect(updated.meta.updatedAt).toBeTruthy()
      expect(updated.meta.updatedAt >= before).toBe(true)
      expect(updated.meta.updatedAt <= after).toBe(true)
      expect(updated.meta.createdAt).toBe(draft.meta.createdAt) // Unchanged
    })

    it('returns new draft instance (immutability)', () => {
      const updated = applyPatch(draft, 'needType', NeedType.PRE_NEED)

      expect(updated).not.toBe(draft)
      expect(draft.needType).toBe(NeedType.AT_NEED) // Original unchanged
    })

    it('handles array index in middle of path', () => {
      draft.people.push({
        id: 'person-2',
        contractId: 'contract-1',
        roles: ContractPersonRole.PRIMARY_BENEFICIARY,
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
        },
        dateCreated: new Date().toISOString(),
        dateLastModified: new Date().toISOString(),
        state: 0,
      })

      const updated = applyPatch(draft, 'people.1.name.first', 'Janet')

      expect(updated.people[1].name.first).toBe('Janet')
      expect(updated.people[0].name.first).toBe('John') // Unchanged
    })
  })

  describe('getValueByPath', () => {
    let draft: ContractDraft

    beforeEach(() => {
      draft = createNewContractDraft('loc-1')
      draft.needType = NeedType.PRE_NEED
      draft.people = [
        {
          id: 'person-1',
          contractId: 'contract-1',
          roles: ContractPersonRole.PRIMARY_BUYER,
          name: {
            id: 'name-1',
            first: 'John',
            last: 'Doe',
            middle: 'M',
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
          },
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]
      draft.sale.items = [
        {
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'catalog-1',
          description: 'Item 1',
          quantity: 2,
          unitPrice: 100,
          needType: NeedType.AT_NEED,
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]
    })

    it('gets simple top-level field', () => {
      expect(getValueByPath(draft, 'needType')).toBe(NeedType.PRE_NEED)
      expect(getValueByPath(draft, 'locationId')).toBe('loc-1')
    })

    it('gets nested field', () => {
      expect(getValueByPath(draft, 'people.0.name.first')).toBe('John')
      expect(getValueByPath(draft, 'people.0.name.last')).toBe('Doe')
      expect(getValueByPath(draft, 'people.0.name.middle')).toBe('M')
    })

    it('gets array element', () => {
      expect(getValueByPath(draft, 'sale.items.0')).toEqual(draft.sale.items[0])
      expect(getValueByPath(draft, 'sale.items.0.description')).toBe('Item 1')
      expect(getValueByPath(draft, 'sale.items.0.quantity')).toBe(2)
    })

    it('returns undefined for invalid path', () => {
      expect(getValueByPath(draft, 'nonexistent')).toBeUndefined()
      expect(getValueByPath(draft, 'people.999')).toBeUndefined()
      expect(getValueByPath(draft, 'people.0.name.invalid')).toBeUndefined()
    })

    it('returns undefined for null intermediate value', () => {
      draft.people[0].name.middle = null as any
      expect(getValueByPath(draft, 'people.0.name.middle.invalid')).toBeUndefined()
    })

    it('handles empty path', () => {
      // Empty path splits to [''] which doesn't match any property
      expect(getValueByPath(draft, '')).toBeUndefined()
    })

    it('handles array index out of bounds', () => {
      expect(getValueByPath(draft, 'people.5')).toBeUndefined()
      expect(getValueByPath(draft, 'sale.items.10')).toBeUndefined()
    })

    it('gets deeply nested value', () => {
      expect(getValueByPath(draft, 'people.0.name.first')).toBe('John')
    })
  })

  describe('draftToContract', () => {
    it('converts new draft to contract (id: "new")', () => {
      const draft = createNewContractDraft('loc-1')
      draft.needType = NeedType.PRE_NEED
      draft.contractNumber = 'C-001'

      const contract = draftToContract(draft)

      expect(contract.id).toBeUndefined() // New contracts have no ID
      expect(contract.contractNumber).toBe('C-001')
      expect(contract.locationId).toBe('loc-1')
      expect(contract.needType).toBe(NeedType.PRE_NEED)
    })

    it('converts existing draft to contract', () => {
      const draft = createNewContractDraft('loc-1')
      draft.id = 'contract-123'
      draft.contractNumber = 'C-123'

      const contract = draftToContract(draft)

      expect(contract.id).toBe('contract-123')
      expect(contract.contractNumber).toBe('C-123')
    })

    it('converts temp sale id to undefined', () => {
      const draft = createNewContractDraft('loc-1')
      draft.sale.id = 'temp-sale-id'

      const contract = draftToContract(draft)

      expect(contract.sales?.[0]?.id).toBeUndefined()
    })

    it('preserves real sale id', () => {
      const draft = createNewContractDraft('loc-1')
      draft.sale.id = 'sale-123'

      const contract = draftToContract(draft)

      expect(contract.sales?.[0]?.id).toBe('sale-123')
    })

    it('includes all required contract fields', () => {
      const draft = createNewContractDraft('loc-1')
      draft.id = 'contract-123'
      draft.prePrintedContractNumber = 'PP-123'
      draft.meta.dateExecuted = '2024-01-01'
      draft.meta.dateSigned = '2024-01-02'
      draft.meta.isCancelled = true

      const contract = draftToContract(draft)

      expect(contract.prePrintedContractNumber).toBe('PP-123')
      expect(contract.dateExecuted).toBe('2024-01-01')
      expect(contract.dateSigned).toBe('2024-01-02')
      expect(contract.isCancelled).toBe(true)
    })

    it('includes people array', () => {
      const draft = createNewContractDraft('loc-1')
      draft.people = [
        {
          id: 'person-1',
          contractId: 'contract-1',
          roles: ContractPersonRole.PRIMARY_BUYER,
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
          },
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]

      const contract = draftToContract(draft)

      expect(contract.people).toHaveLength(1)
      expect(contract.people?.[0]?.name.first).toBe('John')
    })

    it('includes payments array', () => {
      const draft = createNewContractDraft('loc-1')
      draft.payments = [
        {
          id: 'payment-1',
          contractId: 'contract-1',
          date: '2024-01-01',
          method: PaymentMethod.CASH,
          amount: 100,
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]

      const contract = draftToContract(draft)

      expect(contract.payments).toHaveLength(1)
      expect(contract.payments?.[0]?.amount).toBe(100)
    })

    it('sets sale type to CONTRACT', () => {
      const draft = createNewContractDraft('loc-1')
      const contract = draftToContract(draft)

      expect(contract.sales?.[0]?.saleType).toBe(SaleType.CONTRACT)
    })

    it('sets sale status from draft meta', () => {
      const draft = createNewContractDraft('loc-1')
      draft.meta.status = SaleStatus.EXECUTED

      const contract = draftToContract(draft)

      expect(contract.sales?.[0]?.saleStatus).toBe(SaleStatus.EXECUTED)
    })

    it('sets totals to zero (calculated by backend)', () => {
      const draft = createNewContractDraft('loc-1')
      const contract = draftToContract(draft)

      expect(contract.subtotal).toBe(0)
      expect(contract.taxTotal).toBe(0)
      expect(contract.discountTotal).toBe(0)
      expect(contract.grandTotal).toBe(0)
      expect(contract.amountPaid).toBe(0)
      expect(contract.balanceDue).toBe(0)
      expect(contract.sales?.[0]?.subtotal).toBe(0)
      expect(contract.sales?.[0]?.taxTotal).toBe(0)
      expect(contract.sales?.[0]?.discountTotal).toBe(0)
      expect(contract.sales?.[0]?.grandTotal).toBe(0)
    })
  })
})
