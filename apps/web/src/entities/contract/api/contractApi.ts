/**
 * Contract API client (mock implementation)
 */

import type { Contract, ContractItem, ContractListing, ContractPayment } from '../model/contract'
import type {
  ContractFormValues,
  ContractItemFormValues,
  ContractPaymentFormValues,
} from '../model/contractSchema'
import {
  contractToListing,
  generateId,
  mockContracts,
  mockItems,
  mockPayments,
} from './mockContracts'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory store
let contracts = [...mockContracts]
const items: Record<string, ContractItem[]> = { ...mockItems }
const payments: Record<string, ContractPayment[]> = { ...mockPayments }

export const contractApi = {
  /**
   * Get all contracts (listing format)
   */
  async list(): Promise<ContractListing[]> {
    await delay(300)
    return contracts.map((c) => contractToListing(c))
  },

  /**
   * Get a single contract by ID with full details
   */
  async get(id: string): Promise<Contract | null> {
    await delay(200)
    const contract = contracts.find((c) => c.id === id)
    if (!contract) return null

    return {
      ...contract,
      items: items[id] || [],
      payments: payments[id] || [],
    }
  },

  /**
   * Create a new contract
   */
  async create(data: ContractFormValues): Promise<Contract> {
    await delay(400)

    const now = new Date().toISOString()
    const contractNumber = `AN-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(4, '0')}`

    const newContract: Contract = {
      id: generateId(),
      contractNumber,
      prePrintedContractNumber: data.prePrintedContractNumber,
      type: data.type,
      status: data.status,
      locationId: data.locationId,
      date: data.date,
      signDate: data.signDate,
      purchaser: {
        id: generateId(),
        ...data.purchaser,
      },
      coBuyers: data.coBuyers.map((cb) => ({
        id: generateId(),
        ...cb,
      })),
      beneficiary: {
        id: generateId(),
        ...data.beneficiary,
      },
      salesPersonId: data.salesPersonId,
      notes: data.notes,
      // Initialize financials
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
      createdAt: now,
      updatedAt: now,
    }

    contracts.push(newContract)
    items[newContract.id] = []
    payments[newContract.id] = []

    return { ...newContract, items: [], payments: [] }
  },

  /**
   * Update an existing contract
   */
  async update(id: string, data: Partial<ContractFormValues>): Promise<Contract> {
    await delay(300)

    const index = contracts.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error('Contract not found')
    }

    const existing = contracts[index]!
    const updated: Contract = {
      ...existing,
      type: data.type ?? existing.type,
      status: data.status ?? existing.status,
      locationId: data.locationId ?? existing.locationId,
      date: data.date ?? existing.date,
      signDate: data.signDate ?? existing.signDate,
      prePrintedContractNumber: data.prePrintedContractNumber ?? existing.prePrintedContractNumber,
      purchaser: data.purchaser
        ? { ...existing.purchaser, ...data.purchaser, id: existing.purchaser.id }
        : existing.purchaser,
      beneficiary: data.beneficiary
        ? { ...existing.beneficiary, ...data.beneficiary, id: existing.beneficiary.id }
        : existing.beneficiary,
      coBuyers: data.coBuyers
        ? data.coBuyers.map((cb, i) => ({
            ...cb,
            id: existing.coBuyers[i]?.id ?? generateId(),
          }))
        : existing.coBuyers,
      salesPersonId: data.salesPersonId ?? existing.salesPersonId,
      notes: data.notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
    }

    contracts[index] = updated
    return { ...updated, items: items[id] || [], payments: payments[id] || [] }
  },

  /**
   * Delete a contract (or void it)
   */
  async delete(id: string): Promise<void> {
    await delay(300)
    contracts = contracts.filter((c) => c.id !== id)
    delete items[id]
    delete payments[id]
  },

  // ==========================================================================
  // Contract Items
  // ==========================================================================

  /**
   * Get items for a contract
   */
  async getItems(contractId: string): Promise<ContractItem[]> {
    await delay(150)
    return items[contractId] || []
  },

  /**
   * Add an item to a contract
   */
  async addItem(contractId: string, data: ContractItemFormValues): Promise<ContractItem> {
    await delay(200)

    const total = data.quantity * data.unitPrice - data.discount + data.tax

    const newItem: ContractItem = {
      id: generateId(),
      contractId,
      itemNumber: data.itemNumber,
      description: data.description,
      category: data.category,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discount: data.discount,
      tax: data.tax,
      total,
      notes: data.notes,
    }

    if (!items[contractId]) {
      items[contractId] = []
    }
    items[contractId].push(newItem)

    // Recalculate contract totals
    await recalculateContractTotals(contractId)

    return newItem
  },

  /**
   * Update a contract item
   */
  async updateItem(
    contractId: string,
    itemId: string,
    data: Partial<ContractItemFormValues>,
  ): Promise<ContractItem> {
    await delay(200)

    const contractItems = items[contractId]
    if (!contractItems) throw new Error('Contract not found')

    const index = contractItems.findIndex((i) => i.id === itemId)
    if (index === -1) throw new Error('Item not found')

    const existing = contractItems[index]!
    const quantity = data.quantity ?? existing.quantity
    const unitPrice = data.unitPrice ?? existing.unitPrice
    const discount = data.discount ?? existing.discount
    const tax = data.tax ?? existing.tax
    const total = quantity * unitPrice - discount + tax

    const updated: ContractItem = {
      id: existing.id,
      contractId: existing.contractId,
      itemNumber: data.itemNumber ?? existing.itemNumber,
      description: data.description ?? existing.description,
      category: data.category ?? existing.category,
      quantity,
      unitPrice,
      discount,
      tax,
      total,
      notes: data.notes ?? existing.notes,
    }

    contractItems[index] = updated
    await recalculateContractTotals(contractId)

    return updated
  },

  /**
   * Remove an item from a contract
   */
  async removeItem(contractId: string, itemId: string): Promise<void> {
    await delay(150)

    if (items[contractId]) {
      items[contractId] = items[contractId].filter((i) => i.id !== itemId)
      await recalculateContractTotals(contractId)
    }
  },

  // ==========================================================================
  // Contract Payments
  // ==========================================================================

  /**
   * Get payments for a contract
   */
  async getPayments(contractId: string): Promise<ContractPayment[]> {
    await delay(150)
    return payments[contractId] || []
  },

  /**
   * Add a payment to a contract
   */
  async addPayment(contractId: string, data: ContractPaymentFormValues): Promise<ContractPayment> {
    await delay(200)

    const newPayment: ContractPayment = {
      id: generateId(),
      contractId,
      date: data.date,
      method: data.method,
      amount: data.amount,
      reference: data.reference,
      notes: data.notes,
    }

    if (!payments[contractId]) {
      payments[contractId] = []
    }
    payments[contractId].push(newPayment)

    // Recalculate contract totals
    await recalculateContractTotals(contractId)

    return newPayment
  },

  /**
   * Remove a payment from a contract
   */
  async removePayment(contractId: string, paymentId: string): Promise<void> {
    await delay(150)

    if (payments[contractId]) {
      payments[contractId] = payments[contractId].filter((p) => p.id !== paymentId)
      await recalculateContractTotals(contractId)
    }
  },
}

/**
 * Recalculate contract financial totals
 */
async function recalculateContractTotals(contractId: string): Promise<void> {
  const contract = contracts.find((c) => c.id === contractId)
  if (!contract) return

  const contractItems = items[contractId] || []
  const contractPayments = payments[contractId] || []

  const subtotal = contractItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxTotal = contractItems.reduce((sum, item) => sum + item.tax, 0)
  const discountTotal = contractItems.reduce((sum, item) => sum + item.discount, 0)
  const grandTotal = subtotal - discountTotal + taxTotal
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
