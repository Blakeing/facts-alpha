/**
 * contract.schema.test.ts
 *
 * Tests for contract schema default value functions
 */

import { describe, it, expect } from 'vitest'
import {
  getDefaultAddress,
  getDefaultContractPerson,
  getDefaultSaleItem,
  getDefaultSale,
  getDefaultFinancing,
  getDefaultPayment,
  getDefaultContractFormValues,
} from '../contract.schema'
import {
  ContractPersonRole,
  NeedType,
  SaleType,
  SaleStatus,
  FinancingStatus,
  LateFeeType,
  PaymentMethod,
  AtNeedType,
} from '../contract'
import { MaritalStatus } from '@/entities/name'

describe('contract.schema default functions', () => {
  describe('getDefaultAddress', () => {
    it('returns address with empty strings and USA as country', () => {
      const address = getDefaultAddress()
      expect(address).toEqual({
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        county: '',
        country: 'USA',
      })
    })

    it('returns a new object each time', () => {
      const addr1 = getDefaultAddress()
      const addr2 = getDefaultAddress()
      expect(addr1).not.toBe(addr2)
      expect(addr1).toEqual(addr2)
    })
  })

  describe('getDefaultContractPerson', () => {
    it('returns person with default values and role flags', () => {
      const person = getDefaultContractPerson(ContractPersonRole.PRIMARY_BUYER)
      expect(person.id).toBe('')
      expect(person.contractId).toBe('')
      expect(person.nameId).toBe('')
      expect(person.roles).toBe(ContractPersonRole.PRIMARY_BUYER)
      expect(person.addedAfterContractExecution).toBe(false)
      expect(person.name.maritalStatus).toBe(MaritalStatus.UNKNOWN)
      expect(person.name.deceased).toBe(false)
      expect(person.name.isVeteran).toBe(false)
      expect(person.name.mailingAddressSameAsPhysical).toBe(true)
      expect(person.name.optOutMarketing).toBe(false)
    })

    it('uses provided role flags', () => {
      const roles = ContractPersonRole.PRIMARY_BUYER | ContractPersonRole.CO_BUYER
      const person = getDefaultContractPerson(roles)
      expect(person.roles).toBe(roles)
    })

    it('defaults to 0 if no role flags provided', () => {
      const person = getDefaultContractPerson()
      expect(person.roles).toBe(0)
    })

    it('has empty name fields', () => {
      const person = getDefaultContractPerson()
      expect(person.name.first).toBe('')
      expect(person.name.last).toBe('')
      expect(person.name.middle).toBe('')
      expect(person.name.prefix).toBe('')
      expect(person.name.suffix).toBe('')
    })

    it('has empty arrays for phones, addresses, emailAddresses, relations', () => {
      const person = getDefaultContractPerson()
      expect(person.name.phones).toEqual([])
      expect(person.name.addresses).toEqual([])
      expect(person.name.emailAddresses).toEqual([])
      expect(person.name.relations).toEqual([])
    })

    it('returns a new object each time', () => {
      const person1 = getDefaultContractPerson()
      const person2 = getDefaultContractPerson()
      expect(person1).not.toBe(person2)
      expect(person1.name).not.toBe(person2.name)
    })
  })

  describe('getDefaultSaleItem', () => {
    it('returns sale item with default values', () => {
      const item = getDefaultSaleItem()
      expect(item.id).toBe('')
      expect(item.saleId).toBe('')
      expect(item.itemId).toBe('')
      expect(item.description).toBe('')
      expect(item.needType).toBe(NeedType.AT_NEED)
      expect(item.quantity).toBe(1)
      expect(item.unitPrice).toBe(0)
      expect(item.bookPrice).toBe(0)
      expect(item.cost).toBe(0)
      expect(item.bookCost).toBe(0)
      expect(item.salesTaxEnabled).toBe(true)
      expect(item.isCancelled).toBe(false)
      expect(item.ordinal).toBe(0)
      expect(item.salesTax).toEqual([])
      expect(item.discounts).toEqual([])
      expect(item.trust).toEqual([])
    })

    it('uses provided needType', () => {
      const item = getDefaultSaleItem(NeedType.PRE_NEED)
      expect(item.needType).toBe(NeedType.PRE_NEED)
    })

    it('defaults to AT_NEED if no needType provided', () => {
      const item = getDefaultSaleItem()
      expect(item.needType).toBe(NeedType.AT_NEED)
    })

    it('returns a new object each time', () => {
      const item1 = getDefaultSaleItem()
      const item2 = getDefaultSaleItem()
      expect(item1).not.toBe(item2)
    })
  })

  describe('getDefaultSale', () => {
    it('returns sale with default values', () => {
      const sale = getDefaultSale()
      expect(sale.id).toBe('')
      expect(sale.contractId).toBe('')
      expect(sale.saleNumber).toBe('')
      expect(sale.saleType).toBe(SaleType.CONTRACT)
      expect(sale.saleStatus).toBe(SaleStatus.DRAFT)
      expect(sale.memo).toBe('')
      expect(sale.items).toEqual([])
      expect(sale.saleDate).toMatch(/^\d{4}-\d{2}-\d{2}$/) // ISO date format
    })

    it('uses provided contractId', () => {
      const sale = getDefaultSale('contract-123')
      expect(sale.contractId).toBe('contract-123')
    })

    it('defaults to empty string if no contractId provided', () => {
      const sale = getDefaultSale()
      expect(sale.contractId).toBe('')
    })

    it("has today's date in ISO format", () => {
      const sale = getDefaultSale()
      const today = new Date().toISOString().split('T')[0]
      expect(sale.saleDate).toBe(today)
    })

    it('returns a new object each time', () => {
      const sale1 = getDefaultSale()
      const sale2 = getDefaultSale()
      expect(sale1).not.toBe(sale2)
    })
  })

  describe('getDefaultFinancing', () => {
    it('returns financing with default values', () => {
      const financing = getDefaultFinancing()
      expect(financing.id).toBe('')
      expect(financing.contractId).toBe('')
      expect(financing.isFinanced).toBe(false)
      expect(financing.downPayment).toBe(0)
      expect(financing.otherCredits).toBe(0)
      expect(financing.paymentsPerYear).toBe(12)
      expect(financing.useManualPaymentAmount).toBe(false)
      expect(financing.useManualFinanceCharges).toBe(false)
      expect(financing.status).toBe(FinancingStatus.PENDING)
      expect(financing.receivesCouponBook).toBe(false)
      expect(financing.receivesStatement).toBe(true)
      expect(financing.lateFeeType).toBe(LateFeeType.NONE)
    })

    it('returns a new object each time', () => {
      const financing1 = getDefaultFinancing()
      const financing2 = getDefaultFinancing()
      expect(financing1).not.toBe(financing2)
    })
  })

  describe('getDefaultPayment', () => {
    it('returns payment with default values', () => {
      const payment = getDefaultPayment()
      expect(payment.id).toBe('')
      expect(payment.contractId).toBe('')
      expect(payment.method).toBe(PaymentMethod.CASH)
      expect(payment.amount).toBe(0)
      expect(payment.reference).toBe('')
      expect(payment.checkNumber).toBe('')
      expect(payment.notes).toBe('')
      expect(payment.date).toMatch(/^\d{4}-\d{2}-\d{2}$/) // ISO date format
    })

    it("has today's date in ISO format", () => {
      const payment = getDefaultPayment()
      const today = new Date().toISOString().split('T')[0]
      expect(payment.date).toBe(today)
    })

    it('returns a new object each time', () => {
      const payment1 = getDefaultPayment()
      const payment2 = getDefaultPayment()
      expect(payment1).not.toBe(payment2)
    })
  })

  describe('getDefaultContractFormValues', () => {
    it('returns contract form values with provided locationId', () => {
      const form = getDefaultContractFormValues('location-123')
      expect(form.locationId).toBe('location-123')
    })

    it('has default values for all fields', () => {
      const form = getDefaultContractFormValues('location-123')
      expect(form.locationId).toBe('location-123')
      expect(form.prePrintedContractNumber).toBe('')
      expect(form.needType).toBe(NeedType.AT_NEED)
      expect(form.atNeedType).toBe(AtNeedType.WALK_IN)
      expect(form.salesPersonId).toBe('')
      expect(form.marketingAgentId).toBe('')
      expect(form.dateSigned).toBe('')
      expect(form.isConditionalSale).toBe(false)
    })

    it('has default primary buyer and beneficiary', () => {
      const form = getDefaultContractFormValues('location-123')
      expect(form.primaryBuyer).toBeDefined()
      expect(form.primaryBuyer.roles).toBe(ContractPersonRole.PRIMARY_BUYER)
      expect(form.primaryBeneficiary).toBeDefined()
      expect(form.primaryBeneficiary.roles).toBe(ContractPersonRole.PRIMARY_BENEFICIARY)
    })

    it('has empty arrays for coBuyers, additionalBeneficiaries, fundingDetails', () => {
      const form = getDefaultContractFormValues('location-123')
      expect(form.coBuyers).toEqual([])
      expect(form.additionalBeneficiaries).toEqual([])
      expect(form.fundingDetails).toEqual([])
    })

    it('has default financing', () => {
      const form = getDefaultContractFormValues('location-123')
      expect(form.financing).toBeDefined()
      expect(form.financing.isFinanced).toBe(false)
    })

    it('returns a new object each time', () => {
      const form1 = getDefaultContractFormValues('location-123')
      const form2 = getDefaultContractFormValues('location-123')
      expect(form1).not.toBe(form2)
    })
  })
})
