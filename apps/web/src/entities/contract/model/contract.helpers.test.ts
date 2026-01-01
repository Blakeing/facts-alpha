/**
 * contract.helpers.test.ts
 *
 * Tests for contract helper functions
 * Covers calculation, person lookup, and display utilities
 */

import { describe, it, expect } from 'vitest'
import {
  calculateSaleTotals,
  getCoBuyers,
  getContractPersonDisplayName,
  getPrimaryBeneficiary,
  getPrimaryBuyer,
  getSaleStatusColor,
  SaleStatus,
} from './contract'
import type { ContractPerson, SaleItem } from './contract'
import { ContractPersonRole, NeedType } from './contract'

describe('contract helpers', () => {
  describe('getSaleStatusColor', () => {
    it('returns color for DRAFT status', () => {
      expect(getSaleStatusColor(SaleStatus.DRAFT)).toBeTruthy()
    })

    it('returns color for EXECUTED status', () => {
      expect(getSaleStatusColor(SaleStatus.EXECUTED)).toBeTruthy()
    })

    it('returns color for FINALIZED status', () => {
      expect(getSaleStatusColor(SaleStatus.FINALIZED)).toBeTruthy()
    })

    it('returns color for VOID status', () => {
      expect(getSaleStatusColor(SaleStatus.VOID)).toBeTruthy()
    })

    it('returns fallback color for invalid status', () => {
      expect(getSaleStatusColor(999 as SaleStatus)).toBe('grey')
    })
  })

  describe('getContractPersonDisplayName', () => {
    it('formats full name with first, middle, last', () => {
      const person: ContractPerson = {
        id: 'person-1',
        contractId: 'contract-1',
        roles: ContractPersonRole.PRIMARY_BUYER,
        name: {
          id: 'name-1',
          first: 'John',
          middle: 'Michael',
          last: 'Doe',
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
      }

      expect(getContractPersonDisplayName(person)).toBe('John Michael Doe')
    })

    it('formats name without middle name', () => {
      const person: ContractPerson = {
        id: 'person-1',
        contractId: 'contract-1',
        roles: ContractPersonRole.PRIMARY_BUYER,
        name: {
          id: 'name-1',
          first: 'John',
          middle: '',
          last: 'Doe',
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
      }

      expect(getContractPersonDisplayName(person)).toBe('John Doe')
    })

    it('formats name with only first name', () => {
      const person: ContractPerson = {
        id: 'person-1',
        contractId: 'contract-1',
        roles: ContractPersonRole.PRIMARY_BUYER,
        name: {
          id: 'name-1',
          first: 'John',
          middle: '',
          last: '',
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
      }

      expect(getContractPersonDisplayName(person)).toBe('John')
    })

    it('filters out empty strings', () => {
      const person: ContractPerson = {
        id: 'person-1',
        contractId: 'contract-1',
        roles: ContractPersonRole.PRIMARY_BUYER,
        name: {
          id: 'name-1',
          first: '',
          middle: '',
          last: 'Doe',
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
      }

      expect(getContractPersonDisplayName(person)).toBe('Doe')
    })
  })

  describe('getPrimaryBuyer', () => {
    it('finds person with PRIMARY_BUYER role', () => {
      const people: ContractPerson[] = [
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
        {
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
        },
      ]

      const buyer = getPrimaryBuyer(people)

      expect(buyer).toBeTruthy()
      expect(buyer?.id).toBe('person-1')
      expect(buyer?.name.first).toBe('John')
    })

    it('returns undefined when no primary buyer found', () => {
      const people: ContractPerson[] = [
        {
          id: 'person-1',
          contractId: 'contract-1',
          roles: ContractPersonRole.PRIMARY_BENEFICIARY,
          name: {
            id: 'name-1',
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
        },
      ]

      const buyer = getPrimaryBuyer(people)

      expect(buyer).toBeUndefined()
    })

    it('handles empty array', () => {
      const buyer = getPrimaryBuyer([])

      expect(buyer).toBeUndefined()
    })

    it('finds buyer with combined roles', () => {
      const people: ContractPerson[] = [
        {
          id: 'person-1',
          contractId: 'contract-1',
          roles: ContractPersonRole.PRIMARY_BUYER | ContractPersonRole.CO_BUYER,
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

      const buyer = getPrimaryBuyer(people)

      expect(buyer).toBeTruthy()
      expect(buyer?.id).toBe('person-1')
    })
  })

  describe('getPrimaryBeneficiary', () => {
    it('finds person with PRIMARY_BENEFICIARY role', () => {
      const people: ContractPerson[] = [
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
        {
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
        },
      ]

      const beneficiary = getPrimaryBeneficiary(people)

      expect(beneficiary).toBeTruthy()
      expect(beneficiary?.id).toBe('person-2')
      expect(beneficiary?.name.first).toBe('Jane')
    })

    it('returns undefined when no primary beneficiary found', () => {
      const people: ContractPerson[] = [
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

      const beneficiary = getPrimaryBeneficiary(people)

      expect(beneficiary).toBeUndefined()
    })
  })

  describe('getCoBuyers', () => {
    it('filters people with CO_BUYER role', () => {
      const people: ContractPerson[] = [
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
        {
          id: 'person-2',
          contractId: 'contract-1',
          roles: ContractPersonRole.CO_BUYER,
          name: {
            id: 'name-2',
            first: 'Bob',
            last: 'Smith',
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
        {
          id: 'person-3',
          contractId: 'contract-1',
          roles: ContractPersonRole.CO_BUYER,
          name: {
            id: 'name-3',
            first: 'Alice',
            last: 'Johnson',
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

      const coBuyers = getCoBuyers(people)

      expect(coBuyers).toHaveLength(2)
      expect(coBuyers[0].id).toBe('person-2')
      expect(coBuyers[1].id).toBe('person-3')
    })

    it('returns empty array when no co-buyers', () => {
      const people: ContractPerson[] = [
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

      const coBuyers = getCoBuyers(people)

      expect(coBuyers).toEqual([])
    })
  })

  describe('calculateSaleTotals', () => {
    it('calculates totals for empty items array', () => {
      const totals = calculateSaleTotals([])

      expect(totals.subtotal).toBe(0)
      expect(totals.taxTotal).toBe(0)
      expect(totals.discountTotal).toBe(0)
      expect(totals.grandTotal).toBe(0)
    })

    it('calculates totals for items without taxes or discounts', () => {
      const items: SaleItem[] = [
        {
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'catalog-1',
          description: 'Item 1',
          quantity: 2,
          unitPrice: 100,
          needType: NeedType.AT_NEED,
          salesTax: [],
          discounts: [],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
        {
          id: 'item-2',
          saleId: 'sale-1',
          itemId: 'catalog-2',
          description: 'Item 2',
          quantity: 3,
          unitPrice: 50,
          needType: NeedType.AT_NEED,
          salesTax: [],
          discounts: [],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]

      const totals = calculateSaleTotals(items)

      expect(totals.subtotal).toBe(350) // (2 * 100) + (3 * 50)
      expect(totals.taxTotal).toBe(0)
      expect(totals.discountTotal).toBe(0)
      expect(totals.grandTotal).toBe(350)
    })

    it('excludes cancelled items from calculations', () => {
      const items: SaleItem[] = [
        {
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'catalog-1',
          description: 'Item 1',
          quantity: 2,
          unitPrice: 100,
          needType: NeedType.AT_NEED,
          isCancelled: false,
          salesTax: [],
          discounts: [],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
        {
          id: 'item-2',
          saleId: 'sale-1',
          itemId: 'catalog-2',
          description: 'Item 2',
          quantity: 3,
          unitPrice: 50,
          needType: NeedType.AT_NEED,
          isCancelled: true, // Cancelled
          salesTax: [],
          discounts: [],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]

      const totals = calculateSaleTotals(items)

      expect(totals.subtotal).toBe(200) // Only item-1: 2 * 100
      expect(totals.grandTotal).toBe(200)
    })

    it('calculates totals with taxes', () => {
      const items: SaleItem[] = [
        {
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'catalog-1',
          description: 'Item 1',
          quantity: 1,
          unitPrice: 100,
          needType: NeedType.AT_NEED,
          salesTax: [
            {
              id: 'tax-1',
              saleItemId: 'item-1',
              taxProfileItemId: 'tax-profile-1',
              taxRate: 0.08,
              taxAmount: 8,
            },
            {
              id: 'tax-2',
              saleItemId: 'item-1',
              taxProfileItemId: 'tax-profile-2',
              taxRate: 0.02,
              taxAmount: 2,
            },
          ],
          discounts: [],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]

      const totals = calculateSaleTotals(items)

      expect(totals.subtotal).toBe(100)
      expect(totals.taxTotal).toBe(10) // 8 + 2
      expect(totals.discountTotal).toBe(0)
      expect(totals.grandTotal).toBe(110) // 100 + 10
    })

    it('calculates totals with discounts', () => {
      const items: SaleItem[] = [
        {
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'catalog-1',
          description: 'Item 1',
          quantity: 1,
          unitPrice: 100,
          needType: NeedType.AT_NEED,
          salesTax: [],
          discounts: [
            {
              id: 'discount-1',
              saleItemId: 'item-1',
              description: '10% off',
              amount: 10,
            },
            {
              id: 'discount-2',
              saleItemId: 'item-1',
              description: '$5 off',
              amount: 5,
            },
          ],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]

      const totals = calculateSaleTotals(items)

      expect(totals.subtotal).toBe(100)
      expect(totals.taxTotal).toBe(0)
      expect(totals.discountTotal).toBe(15) // 10 + 5
      expect(totals.grandTotal).toBe(85) // 100 - 15
    })

    it('calculates complex totals with taxes and discounts', () => {
      const items: SaleItem[] = [
        {
          id: 'item-1',
          saleId: 'sale-1',
          itemId: 'catalog-1',
          description: 'Item 1',
          quantity: 2,
          unitPrice: 100,
          needType: NeedType.AT_NEED,
          salesTax: [
            {
              id: 'tax-1',
              saleItemId: 'item-1',
              taxProfileItemId: 'tax-profile-1',
              taxRate: 0.08,
              taxAmount: 16, // 8% of 200
            },
          ],
          discounts: [
            {
              id: 'discount-1',
              saleItemId: 'item-1',
              description: '$10 off',
              amount: 10,
            },
          ],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
        {
          id: 'item-2',
          saleId: 'sale-1',
          itemId: 'catalog-2',
          description: 'Item 2',
          quantity: 1,
          unitPrice: 50,
          needType: NeedType.AT_NEED,
          isCancelled: true, // Should be excluded
          salesTax: [],
          discounts: [],
          dateCreated: new Date().toISOString(),
          dateLastModified: new Date().toISOString(),
          state: 0,
        },
      ]

      const totals = calculateSaleTotals(items)

      expect(totals.subtotal).toBe(200) // 2 * 100 (item-2 excluded)
      expect(totals.taxTotal).toBe(16)
      expect(totals.discountTotal).toBe(10)
      expect(totals.grandTotal).toBe(206) // 200 + 16 - 10
    })
  })
})

