/**
 * Contract API client (mock implementation)
 *
 * Aligned with backend BFF endpoints:
 * - GET /api/v1/contracts/listing/{locationId}
 * - GET /api/v1/contracts/{id}
 * - POST /api/v1/contracts/save/draft
 * - POST /api/v1/contracts/save/adjustment
 *
 * @see docs/data-models.md for field mapping details
 * @see docs/api-integration.md for endpoint details
 */

import type {
  Contract,
  ContractFinancing,
  ContractListing,
  ContractPayment,
  ContractPerson,
  Sale,
  SaleItem,
} from '../model/contract'
import type {
  ContractFinancingFormValues,
  ContractFormValues,
  ContractPaymentFormValues,
  ContractPersonFormValues,
  SaleFormValues,
  SaleItemFormValues,
} from '../model/contractSchema'
import { calculateSaleTotals, ContractPersonRole, NeedType, SaleStatus } from '../model/contract'
import {
  contractToListing,
  generateId,
  mockContracts,
  mockFinancing,
  mockPayments,
  mockPeople,
  mockSales,
} from './mockContracts'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory stores
let contracts = [...mockContracts]
const sales: Record<string, Sale[]> = { ...mockSales }
const people: Record<string, ContractPerson[]> = { ...mockPeople }
const financing: Record<string, ContractFinancing | undefined> = { ...mockFinancing }
const payments: Record<string, ContractPayment[]> = { ...mockPayments }

// =============================================================================
// Contract CRUD
// =============================================================================

export const contractApi = {
  /**
   * Get all contracts for a location (listing format)
   * Backend: GET /api/v1/contracts/listing/{locationId}
   */
  async list(locationId?: string): Promise<ContractListing[]> {
    await delay(300)
    const filtered = locationId ? contracts.filter((c) => c.locationId === locationId) : contracts
    return filtered.map((c) =>
      contractToListing({
        ...c,
        people: people[c.id] ?? [],
        sales: sales[c.id] ?? [],
      }),
    )
  },

  /**
   * Get a single contract by ID with full details
   * Backend: GET /api/v1/contracts/{id}
   */
  async get(id: string): Promise<Contract | null> {
    await delay(200)
    const contract = contracts.find((c) => c.id === id)
    if (!contract) return null

    return {
      ...contract,
      sales: sales[id] ?? [],
      people: people[id] ?? [],
      financing: financing[id],
      payments: payments[id] ?? [],
    }
  },

  /**
   * Create a new contract (draft)
   * Backend: POST /api/v1/contracts/save/draft
   */
  async create(data: ContractFormValues): Promise<Contract> {
    await delay(400)

    const now = new Date().toISOString()
    const contractId = generateId()
    const contractNumber = `${data.needType === NeedType.PRE_NEED ? 'PN' : 'AN'}-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(4, '0')}`

    // Create people from form data
    const contractPeople: ContractPerson[] = []

    // Primary buyer
    const buyerPerson = formToPerson(data.primaryBuyer, contractId, [
      ContractPersonRole.PRIMARY_BUYER,
    ])
    contractPeople.push(buyerPerson)

    // Co-buyers
    for (const cb of data.coBuyers) {
      contractPeople.push(formToPerson(cb, contractId, [ContractPersonRole.CO_BUYER]))
    }

    // Primary beneficiary
    const beneficiaryPerson = formToPerson(data.primaryBeneficiary, contractId, [
      ContractPersonRole.PRIMARY_BENEFICIARY,
    ])
    contractPeople.push(beneficiaryPerson)

    // Additional beneficiaries
    for (const ab of data.additionalBeneficiaries ?? []) {
      contractPeople.push(formToPerson(ab, contractId, [ContractPersonRole.ADDITIONAL_BENEFICIARY]))
    }

    // Create financing if provided
    let contractFinancing: ContractFinancing | undefined
    if (data.financing) {
      contractFinancing = formToFinancing(data.financing, contractId)
    }

    const newContract: Contract = {
      id: contractId,
      contractNumber,
      prePrintedContractNumber: data.prePrintedContractNumber || undefined,
      locationId: data.locationId,
      needType: data.needType,
      contractTypeId: data.contractTypeId,
      contractSaleTypeId: data.contractSaleTypeId,
      leadSourceId: data.leadSourceId,
      atNeedType: data.atNeedType,
      preNeedFundingType: data.preNeedFundingType,
      salesPersonId: data.salesPersonId,
      marketingAgentId: data.marketingAgentId,
      dateSigned: data.dateSigned || undefined,
      isCancelled: false,
      isConditionalSale: data.isConditionalSale,
      // Initialize totals
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    }

    // Store in memory
    contracts.push(newContract)
    people[contractId] = contractPeople
    sales[contractId] = []
    payments[contractId] = []
    if (contractFinancing) {
      financing[contractId] = contractFinancing
    }

    return {
      ...newContract,
      sales: [],
      people: contractPeople,
      financing: contractFinancing,
      payments: [],
    }
  },

  /**
   * Update an existing contract
   * Backend: PUT /api/v1/contracts/{id}
   */
  async update(id: string, data: Partial<ContractFormValues>): Promise<Contract> {
    await delay(300)

    const index = contracts.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error('Contract not found')
    }

    const existing = contracts[index]!
    const now = new Date().toISOString()

    // Update people if provided
    if (
      data.primaryBuyer ||
      data.coBuyers ||
      data.primaryBeneficiary ||
      data.additionalBeneficiaries
    ) {
      const contractPeople: ContractPerson[] = []

      if (data.primaryBuyer) {
        contractPeople.push(formToPerson(data.primaryBuyer, id, [ContractPersonRole.PRIMARY_BUYER]))
      }

      for (const cb of data.coBuyers ?? []) {
        contractPeople.push(formToPerson(cb, id, [ContractPersonRole.CO_BUYER]))
      }

      if (data.primaryBeneficiary) {
        contractPeople.push(
          formToPerson(data.primaryBeneficiary, id, [ContractPersonRole.PRIMARY_BENEFICIARY]),
        )
      }

      for (const ab of data.additionalBeneficiaries ?? []) {
        contractPeople.push(formToPerson(ab, id, [ContractPersonRole.ADDITIONAL_BENEFICIARY]))
      }

      people[id] = contractPeople
    }

    // Update financing if provided
    if (data.financing !== undefined) {
      financing[id] = data.financing ? formToFinancing(data.financing, id) : undefined
    }

    const updated: Contract = {
      ...existing,
      prePrintedContractNumber: data.prePrintedContractNumber ?? existing.prePrintedContractNumber,
      locationId: data.locationId ?? existing.locationId,
      needType: data.needType ?? existing.needType,
      contractTypeId: data.contractTypeId ?? existing.contractTypeId,
      contractSaleTypeId: data.contractSaleTypeId ?? existing.contractSaleTypeId,
      leadSourceId: data.leadSourceId ?? existing.leadSourceId,
      atNeedType: data.atNeedType ?? existing.atNeedType,
      preNeedFundingType: data.preNeedFundingType ?? existing.preNeedFundingType,
      salesPersonId: data.salesPersonId ?? existing.salesPersonId,
      marketingAgentId: data.marketingAgentId ?? existing.marketingAgentId,
      dateSigned: data.dateSigned ?? existing.dateSigned,
      isConditionalSale: data.isConditionalSale ?? existing.isConditionalSale,
      notes: data.notes ?? existing.notes,
      updatedAt: now,
    }

    contracts[index] = updated

    return {
      ...updated,
      sales: sales[id] ?? [],
      people: people[id] ?? [],
      financing: financing[id],
      payments: payments[id] ?? [],
    }
  },

  /**
   * Delete/void a contract
   */
  async delete(id: string): Promise<void> {
    await delay(300)
    const index = contracts.findIndex((c) => c.id === id)
    if (index !== -1) {
      contracts[index] = { ...contracts[index]!, isCancelled: true }
    }
  },

  // ===========================================================================
  // Sales
  // ===========================================================================

  /**
   * Get sales for a contract
   */
  async getSales(contractId: string): Promise<Sale[]> {
    await delay(150)
    return sales[contractId] ?? []
  },

  /**
   * Add a sale to a contract
   */
  async addSale(contractId: string, data: SaleFormValues): Promise<Sale> {
    await delay(200)

    const now = new Date().toISOString()
    const saleId = generateId()
    const saleNumber = `S-${new Date().getFullYear()}-${String(Object.keys(sales).reduce((acc, k) => acc + (sales[k]?.length ?? 0), 0) + 1).padStart(4, '0')}`

    const saleItems: SaleItem[] = data.items.map((item, idx) => formToSaleItem(item, saleId, idx))
    const totals = calculateSaleTotals(saleItems)

    const newSale: Sale = {
      id: saleId,
      contractId,
      saleNumber,
      saleDate: data.saleDate,
      saleType: data.saleType,
      saleStatus: data.saleStatus,
      saleAdjustmentType: data.saleAdjustmentType,
      accountingPeriod: data.accountingPeriod,
      memo: data.memo,
      ...totals,
      items: saleItems,
      createdAt: now,
      updatedAt: now,
    }

    if (!sales[contractId]) {
      sales[contractId] = []
    }
    sales[contractId].push(newSale)

    await recalculateContractTotals(contractId)

    return newSale
  },

  /**
   * Update a sale
   */
  async updateSale(
    contractId: string,
    saleId: string,
    data: Partial<SaleFormValues>,
  ): Promise<Sale> {
    await delay(200)

    const contractSales = sales[contractId]
    if (!contractSales) throw new Error('Contract not found')

    const index = contractSales.findIndex((s) => s.id === saleId)
    if (index === -1) throw new Error('Sale not found')

    const existing = contractSales[index]!
    const now = new Date().toISOString()

    let saleItems = existing.items
    if (data.items) {
      saleItems = data.items.map((item, idx) => formToSaleItem(item, saleId, idx))
    }

    const totals = calculateSaleTotals(saleItems)

    const updated: Sale = {
      ...existing,
      saleDate: data.saleDate ?? existing.saleDate,
      saleStatus: data.saleStatus ?? existing.saleStatus,
      accountingPeriod: data.accountingPeriod ?? existing.accountingPeriod,
      memo: data.memo ?? existing.memo,
      ...totals,
      items: saleItems,
      updatedAt: now,
    }

    contractSales[index] = updated
    await recalculateContractTotals(contractId)

    return updated
  },

  /**
   * Remove a sale
   */
  async removeSale(contractId: string, saleId: string): Promise<void> {
    await delay(150)
    if (sales[contractId]) {
      sales[contractId] = sales[contractId].filter((s) => s.id !== saleId)
      await recalculateContractTotals(contractId)
    }
  },

  // ===========================================================================
  // Sale Items
  // ===========================================================================

  /**
   * Add an item to a sale
   */
  async addSaleItem(
    contractId: string,
    saleId: string,
    data: SaleItemFormValues,
  ): Promise<SaleItem> {
    await delay(200)

    const contractSales = sales[contractId]
    if (!contractSales) throw new Error('Contract not found')

    const saleIndex = contractSales.findIndex((s) => s.id === saleId)
    if (saleIndex === -1) throw new Error('Sale not found')

    const sale = contractSales[saleIndex]!
    const ordinal = sale.items.length

    const newItem = formToSaleItem(data, saleId, ordinal)
    sale.items.push(newItem)

    // Recalculate sale totals
    const totals = calculateSaleTotals(sale.items)
    Object.assign(sale, totals)
    sale.updatedAt = new Date().toISOString()

    await recalculateContractTotals(contractId)

    return newItem
  },

  /**
   * Update a sale item
   */
  async updateSaleItem(
    contractId: string,
    saleId: string,
    itemId: string,
    data: Partial<SaleItemFormValues>,
  ): Promise<SaleItem> {
    await delay(200)

    const contractSales = sales[contractId]
    if (!contractSales) throw new Error('Contract not found')

    const sale = contractSales.find((s) => s.id === saleId)
    if (!sale) throw new Error('Sale not found')

    const itemIndex = sale.items.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) throw new Error('Item not found')

    const existing = sale.items[itemIndex]!
    const now = new Date().toISOString()

    const updated: SaleItem = {
      ...existing,
      itemId: data.itemId ?? existing.itemId,
      description: data.description ?? existing.description,
      needType: data.needType ?? existing.needType,
      quantity: data.quantity ?? existing.quantity,
      unitPrice: data.unitPrice ?? existing.unitPrice,
      bookPrice: data.bookPrice ?? existing.bookPrice,
      cost: data.cost ?? existing.cost,
      bookCost: data.bookCost ?? existing.bookCost,
      salesTaxEnabled: data.salesTaxEnabled ?? existing.salesTaxEnabled,
      serialNumber: data.serialNumber ?? existing.serialNumber,
      isCancelled: data.isCancelled ?? existing.isCancelled,
      ordinal: data.ordinal ?? existing.ordinal,
      updatedAt: now,
    }

    sale.items[itemIndex] = updated

    // Recalculate sale totals
    const totals = calculateSaleTotals(sale.items)
    Object.assign(sale, totals)
    sale.updatedAt = now

    await recalculateContractTotals(contractId)

    return updated
  },

  /**
   * Remove a sale item
   */
  async removeSaleItem(contractId: string, saleId: string, itemId: string): Promise<void> {
    await delay(150)

    const contractSales = sales[contractId]
    if (!contractSales) return

    const sale = contractSales.find((s) => s.id === saleId)
    if (!sale) return

    sale.items = sale.items.filter((i) => i.id !== itemId)

    // Recalculate totals
    const totals = calculateSaleTotals(sale.items)
    Object.assign(sale, totals)
    sale.updatedAt = new Date().toISOString()

    await recalculateContractTotals(contractId)
  },

  // ===========================================================================
  // Payments
  // ===========================================================================

  /**
   * Get payments for a contract
   */
  async getPayments(contractId: string): Promise<ContractPayment[]> {
    await delay(150)
    return payments[contractId] ?? []
  },

  /**
   * Add a payment
   */
  async addPayment(contractId: string, data: ContractPaymentFormValues): Promise<ContractPayment> {
    await delay(200)

    const now = new Date().toISOString()

    const newPayment: ContractPayment = {
      id: generateId(),
      contractId,
      saleId: data.saleId,
      date: data.date,
      method: data.method,
      amount: data.amount,
      reference: data.reference,
      checkNumber: data.checkNumber,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    }

    if (!payments[contractId]) {
      payments[contractId] = []
    }
    payments[contractId].push(newPayment)

    await recalculateContractTotals(contractId)

    return newPayment
  },

  /**
   * Remove a payment
   */
  async removePayment(contractId: string, paymentId: string): Promise<void> {
    await delay(150)

    if (payments[contractId]) {
      payments[contractId] = payments[contractId].filter((p) => p.id !== paymentId)
      await recalculateContractTotals(contractId)
    }
  },

  // ===========================================================================
  // People
  // ===========================================================================

  /**
   * Get people for a contract
   */
  async getPeople(contractId: string): Promise<ContractPerson[]> {
    await delay(150)
    return people[contractId] ?? []
  },

  /**
   * Add a person to a contract
   */
  async addPerson(contractId: string, data: ContractPersonFormValues): Promise<ContractPerson> {
    await delay(200)

    const newPerson = formToPerson(data, contractId, data.roles)

    if (!people[contractId]) {
      people[contractId] = []
    }
    people[contractId].push(newPerson)

    return newPerson
  },

  /**
   * Update a person
   */
  async updatePerson(
    contractId: string,
    personId: string,
    data: Partial<ContractPersonFormValues>,
  ): Promise<ContractPerson> {
    await delay(200)

    const contractPeople = people[contractId]
    if (!contractPeople) throw new Error('Contract not found')

    const index = contractPeople.findIndex((p) => p.id === personId)
    if (index === -1) throw new Error('Person not found')

    const existing = contractPeople[index]!
    const now = new Date().toISOString()

    const updated: ContractPerson = {
      ...existing,
      roles: data.roles ?? existing.roles,
      firstName: data.firstName ?? existing.firstName,
      middleName: data.middleName ?? existing.middleName,
      lastName: data.lastName ?? existing.lastName,
      prefix: data.prefix ?? existing.prefix,
      suffix: data.suffix ?? existing.suffix,
      nickname: data.nickname ?? existing.nickname,
      companyName: data.companyName ?? existing.companyName,
      phone: data.phone ?? existing.phone,
      email: data.email ?? existing.email,
      address: data.address ?? existing.address,
      dateOfBirth: data.dateOfBirth ?? existing.dateOfBirth,
      dateOfDeath: data.dateOfDeath ?? existing.dateOfDeath,
      updatedAt: now,
    }

    contractPeople[index] = updated
    return updated
  },

  /**
   * Remove a person
   */
  async removePerson(contractId: string, personId: string): Promise<void> {
    await delay(150)
    if (people[contractId]) {
      people[contractId] = people[contractId].filter((p) => p.id !== personId)
    }
  },
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert form values to ContractPerson
 */
function formToPerson(
  data: ContractPersonFormValues,
  contractId: string,
  roles: ContractPersonRole[],
): ContractPerson {
  const now = new Date().toISOString()
  return {
    id: data.id || generateId(),
    contractId,
    nameId: data.nameId || generateId(),
    roles,
    addedAfterContractExecution: data.addedAfterContractExecution ?? false,
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    prefix: data.prefix,
    suffix: data.suffix,
    nickname: data.nickname,
    companyName: data.companyName,
    phone: data.phone,
    email: data.email,
    address: data.address,
    dateOfBirth: data.dateOfBirth,
    dateOfDeath: data.dateOfDeath,
    nationalIdentifier: data.nationalIdentifier,
    driversLicense: data.driversLicense,
    driversLicenseState: data.driversLicenseState,
    isVeteran: data.isVeteran,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Convert form values to SaleItem
 */
function formToSaleItem(data: SaleItemFormValues, saleId: string, ordinal: number): SaleItem {
  const now = new Date().toISOString()
  return {
    id: data.id || generateId(),
    saleId,
    itemId: data.itemId,
    description: data.description,
    needType: data.needType,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    bookPrice: data.bookPrice ?? 0,
    cost: data.cost ?? 0,
    bookCost: data.bookCost ?? 0,
    salesTaxEnabled: data.salesTaxEnabled ?? true,
    serialNumber: data.serialNumber,
    isCancelled: data.isCancelled ?? false,
    ordinal,
    sku: data.sku,
    itemDescription: data.itemDescription,
    itemType: data.itemType,
    salesTax:
      data.salesTax?.map((t) => ({
        id: t.id || generateId(),
        saleItemId: data.id || '',
        taxProfileItemId: t.taxProfileItemId,
        taxRate: t.taxRate,
        taxAmount: t.taxAmount,
      })) ?? [],
    discounts:
      data.discounts?.map((d) => ({
        id: d.id || generateId(),
        saleItemId: data.id || '',
        discountTypeId: d.discountTypeId,
        description: d.description,
        amount: d.amount,
        percentage: d.percentage,
      })) ?? [],
    trust:
      data.trust?.map((t) => ({
        id: t.id || generateId(),
        saleItemId: data.id || '',
        trustFundType: t.trustFundType,
        amount: t.amount,
      })) ?? [],
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Convert form values to ContractFinancing
 */
function formToFinancing(data: ContractFinancingFormValues, contractId: string): ContractFinancing {
  const now = new Date().toISOString()
  return {
    id: data.id || generateId(),
    contractId,
    isFinanced: data.isFinanced,
    downPayment: data.downPayment,
    otherCredits: data.otherCredits ?? 0,
    interestRate: data.interestRate,
    term: data.term,
    paymentsPerYear: data.paymentsPerYear,
    firstPaymentDate: data.firstPaymentDate,
    paymentAmount: data.paymentAmount,
    useManualPaymentAmount: data.useManualPaymentAmount,
    calculatedPaymentAmount: undefined,
    totalFinanceCharges: data.totalFinanceCharges,
    useManualFinanceCharges: data.useManualFinanceCharges,
    calculatedTotalFinanceCharges: undefined,
    finalPaymentAmount: undefined,
    interestRebateDays: 0,
    status: data.status,
    receivesCouponBook: data.receivesCouponBook,
    receivesStatement: data.receivesStatement,
    lateFeeType: data.lateFeeType,
    lateFeeAmount: data.lateFeeAmount,
    lateFeeMax: data.lateFeeMax,
    lateFeeGracePeriod: data.lateFeeGracePeriod,
    imputedInterestRate: undefined,
    totalImputedInterest: undefined,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Recalculate contract financial totals from sales and payments
 */
async function recalculateContractTotals(contractId: string): Promise<void> {
  const contract = contracts.find((c) => c.id === contractId)
  if (!contract) return

  const contractSales = sales[contractId] ?? []
  const contractPayments = payments[contractId] ?? []

  // Sum all active sales
  let subtotal = 0
  let taxTotal = 0
  let discountTotal = 0

  for (const sale of contractSales) {
    if (sale.saleStatus !== SaleStatus.VOID) {
      subtotal += sale.subtotal
      taxTotal += sale.taxTotal
      discountTotal += sale.discountTotal
    }
  }

  const grandTotal = subtotal + taxTotal - discountTotal
  const amountPaid = contractPayments.reduce((sum, p) => sum + p.amount, 0)
  const balanceDue = grandTotal - amountPaid

  contract.subtotal = subtotal
  contract.taxTotal = taxTotal
  contract.discountTotal = discountTotal
  contract.grandTotal = grandTotal
  contract.amountPaid = amountPaid
  contract.balanceDue = balanceDue
  contract.updatedAt = new Date().toISOString()
}
