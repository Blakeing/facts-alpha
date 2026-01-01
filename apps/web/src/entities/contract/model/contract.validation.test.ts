/**
 * contract.validation.test.ts
 *
 * Tests for contract validation schemas
 */

import type { ContractDraft } from './contract.draft'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ContractPersonRole, NeedType, PaymentMethod, SaleStatus } from './contract'
import { createNewContractDraft } from './contract.draft'
import {
  type ContractSection,
  ValidationMode,
  validateAllSections,
  validateSection,
  zodErrorsToPathMap,
} from './contract.validation'

// Helper to create a valid draft
function createValidDraft(overrides?: Partial<ContractDraft>): ContractDraft {
  const draft = createNewContractDraft('loc-1')
  return {
    ...draft,
    needType: NeedType.AT_NEED,
    locationId: 'loc-1',
    people: [
      {
        id: 'person-1',
        contractId: draft.id,
        roles: ContractPersonRole.PRIMARY_BUYER,
        name: {
          first: 'John',
          last: 'Doe',
        },
        dateCreated: new Date().toISOString(),
        dateLastModified: new Date().toISOString(),
        state: 0,
      },
      {
        id: 'person-2',
        contractId: draft.id,
        roles: ContractPersonRole.PRIMARY_BENEFICIARY,
        name: {
          first: 'Jane',
          last: 'Doe',
        },
        dateCreated: new Date().toISOString(),
        dateLastModified: new Date().toISOString(),
        state: 0,
      },
    ],
    sale: {
      ...draft.sale,
      items: [
        {
          id: 'item-1',
          saleId: draft.sale.id,
          itemId: 'item-catalog-1', // Required by schema
          itemType: 1,
          description: 'Test Item',
          needType: NeedType.AT_NEED, // Required by schema
          quantity: 1,
          unitPrice: 100,
          subtotal: 100,
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ],
    },
    ...overrides,
  }
}

describe('contract.validation', () => {
  describe('validateSection', () => {
    describe('General section', () => {
      it('validates valid general section', () => {
        const draft = createValidDraft()
        const result = validateSection(draft, 'general')

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual({})
      })

      it('rejects missing locationId', () => {
        const draft = createValidDraft({ locationId: '' })
        const result = validateSection(draft, 'general')

        expect(result.valid).toBe(false)
        expect(result.errors['locationId']).toBeTruthy()
      })

      it('validates needType is present', () => {
        const draft = createValidDraft()
        const result = validateSection(draft, 'general')

        expect(result.valid).toBe(true)
      })
    })

    describe('People section', () => {
      it('validates valid people section', () => {
        const draft = createValidDraft()
        const result = validateSection(draft, 'people')

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual({})
      })

      it('rejects empty people array', () => {
        const draft = createValidDraft({ people: [] })
        const result = validateSection(draft, 'people', ValidationMode.EXECUTE)

        expect(result.valid).toBe(false)
        expect(result.errors).toBeTruthy()
      })

      it('rejects less than 2 people', () => {
        const draft = createValidDraft({
          people: [
            {
              id: 'person-1',
              contractId: 'contract-1',
              roles: ContractPersonRole.PRIMARY_BUYER,
              name: { first: 'John', last: 'Doe' },
              dateCreated: new Date().toISOString(),
              dateLastModified: new Date().toISOString(),
              state: 0,
            },
          ],
        })
        const result = validateSection(draft, 'people', ValidationMode.EXECUTE)

        expect(result.valid).toBe(false)
        expect(Object.keys(result.errors).length).toBeGreaterThan(0)
      })

      it('rejects missing primary buyer', () => {
        const draft = createValidDraft({
          people: [
            {
              id: 'person-1',
              contractId: 'contract-1',
              roles: ContractPersonRole.PERSON,
              name: { first: 'John', last: 'Doe' },
              dateCreated: new Date().toISOString(),
              dateLastModified: new Date().toISOString(),
              state: 0,
            },
            {
              id: 'person-2',
              contractId: 'contract-1',
              roles: ContractPersonRole.PRIMARY_BENEFICIARY,
              name: { first: 'Jane', last: 'Doe' },
              dateCreated: new Date().toISOString(),
              dateLastModified: new Date().toISOString(),
              state: 0,
            },
          ],
        })
        const result = validateSection(draft, 'people', ValidationMode.EXECUTE)

        expect(result.valid).toBe(false)
        expect(Object.values(result.errors).some((msg) => msg.includes('primary buyer'))).toBe(true)
      })

      it('rejects missing primary beneficiary', () => {
        const draft = createValidDraft({
          people: [
            {
              id: 'person-1',
              contractId: 'contract-1',
              roles: ContractPersonRole.PRIMARY_BUYER,
              name: { first: 'John', last: 'Doe' },
              dateCreated: new Date().toISOString(),
              dateLastModified: new Date().toISOString(),
              state: 0,
            },
            {
              id: 'person-2',
              contractId: 'contract-1',
              roles: ContractPersonRole.PERSON,
              name: { first: 'Jane', last: 'Doe' },
              dateCreated: new Date().toISOString(),
              dateLastModified: new Date().toISOString(),
              state: 0,
            },
          ],
        })
        const result = validateSection(draft, 'people', ValidationMode.EXECUTE)

        expect(result.valid).toBe(false)
        expect(
          Object.values(result.errors).some((msg) => msg.includes('primary beneficiary')),
        ).toBe(true)
      })
    })

    describe('Items section', () => {
      it('validates valid items section', () => {
        const draft = createValidDraft()
        const result = validateSection(draft, 'items')

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual({})
      })

      it('rejects empty items array', () => {
        const draft = createValidDraft({
          sale: {
            id: 'sale-1',
            items: [],
          },
        })
        const result = validateSection(draft, 'items', ValidationMode.EXECUTE)

        expect(result.valid).toBe(false)
        expect(result.errors).toBeTruthy()
      })

      it('rejects missing sale.items', () => {
        const draft = createValidDraft()
        delete (draft as any).sale
        const result = validateSection(draft, 'items')

        expect(result.valid).toBe(false)
        expect(result.errors).toBeTruthy()
      })
    })

    describe('Payments section', () => {
      it('validates valid payments section (empty is valid)', () => {
        const draft = createValidDraft({ payments: [] })
        const result = validateSection(draft, 'payments')

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual({})
      })

      it('validates payments section with payments', () => {
        const draft = createValidDraft({
          payments: [
            {
              id: 'payment-1',
              contractId: 'contract-1',
              amount: 100,
              method: PaymentMethod.CASH, // Use correct field name and enum value
              date: new Date().toISOString().split('T')[0], // Use correct field name and format
              dateCreated: new Date().toISOString(),
              dateLastModified: new Date().toISOString(),
              state: 0,
            },
          ],
        })
        const result = validateSection(draft, 'payments')

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual({})
      })
    })

    describe('Review section', () => {
      it('validates complete valid draft', () => {
        const draft = createValidDraft()
        const result = validateSection(draft, 'review')

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual({})
      })

      it('rejects incomplete draft', () => {
        const draft = createValidDraft({
          locationId: '', // Missing required field
        })
        const result = validateSection(draft, 'review')

        expect(result.valid).toBe(false)
        expect(result.errors).toBeTruthy()
      })

      it('validates all required sections together', () => {
        const draft = createValidDraft({
          people: [], // Missing people
        })
        // Review section in draft mode only checks locationId, not people
        // So this should pass in draft mode
        const result = validateSection(draft, 'review', ValidationMode.DRAFT)
        expect(result.valid).toBe(true)

        // But should fail in execute mode
        const resultStrict = validateSection(draft, 'review', ValidationMode.EXECUTE)
        expect(resultStrict.valid).toBe(false)
        expect(Object.keys(resultStrict.errors).length).toBeGreaterThan(0)
      })
    })
  })

  describe('validateAllSections', () => {
    it('validates all sections for valid draft', () => {
      const draft = createValidDraft()
      const result = validateAllSections(draft)

      expect(result.validity.general).toBe(true)
      expect(result.validity.people).toBe(true)
      expect(result.validity.items).toBe(true)
      expect(result.validity.payments).toBe(true)
      expect(result.validity.review).toBe(true)
      expect(Object.keys(result.errorsByPath).length).toBe(0)
    })

    it('identifies invalid sections', () => {
      const draft = createValidDraft({
        locationId: '', // Invalid general
        people: [], // Invalid people (only in execute mode)
      })
      const result = validateAllSections(draft, ValidationMode.EXECUTE)

      expect(result.validity.general).toBe(false)
      expect(result.validity.people).toBe(false)
      expect(result.validity.review).toBe(false)
      expect(Object.keys(result.errorsByPath).length).toBeGreaterThan(0)
    })

    it('aggregates errors from all sections', () => {
      const draft = createValidDraft({
        locationId: '', // Error in general
        people: [], // Error in people (only in execute mode)
        sale: {
          id: 'sale-1',
          items: [], // Error in items (only in execute mode)
        },
      })
      const result = validateAllSections(draft, ValidationMode.EXECUTE)

      // Should have errors from multiple sections
      expect(result.errorsByPath['locationId']).toBeTruthy()
      expect(Object.keys(result.errorsByPath).length).toBeGreaterThan(1)
    })

    it('returns validity for all sections', () => {
      const draft = createValidDraft()
      const result = validateAllSections(draft)

      const sections: ContractSection[] = ['general', 'people', 'items', 'payments', 'review']
      for (const section of sections) {
        expect(result.validity[section]).toBeDefined()
        expect(typeof result.validity[section]).toBe('boolean')
      }
    })
  })

  describe('zodErrorsToPathMap', () => {
    it('converts Zod errors to path map', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name required'),
        age: z.number().min(18, 'Must be 18+'),
      })

      const result = schema.safeParse({ name: '', age: 16 })
      if (!result.success) {
        const errors = zodErrorsToPathMap(result.error)

        expect(errors['name']).toBe('Name required')
        expect(errors['age']).toBe('Must be 18+')
      }
    })

    it('handles nested paths', () => {
      const schema = z.object({
        person: z.object({
          name: z.string().min(1, 'Name required'),
        }),
      })

      const result = schema.safeParse({ person: { name: '' } })
      if (!result.success) {
        const errors = zodErrorsToPathMap(result.error)

        expect(errors['person.name']).toBe('Name required')
      }
    })

    it('handles array paths', () => {
      const schema = z.object({
        items: z.array(
          z.object({
            name: z.string().min(1, 'Name required'),
          }),
        ),
      })

      const result = schema.safeParse({ items: [{ name: '' }] })
      if (!result.success) {
        const errors = zodErrorsToPathMap(result.error)

        expect(errors['items.0.name']).toBe('Name required')
      }
    })
  })
})
