/**
 * entities/contract/model/contract.draft.ts
 *
 * Draft utilities for creating and managing editable copies of contracts
 * Adapts the immutable draft pattern from demo to alpha's complex structure
 */

import type { Contract, ContractPayment, ContractPerson, Sale, SaleItem } from './contract'
import rfdc from 'rfdc'
import { toRaw } from 'vue'
import { NeedType, SaleStatus, SaleType } from './contract'

const clone = rfdc()

/**
 * ContractDraft - Editable representation of a contract
 * This is the working model used during editing sessions
 * Separate from the API Contract type for cleaner edit semantics
 */
export interface ContractDraft {
  // Core identifiers
  id: string
  contractNumber: string
  locationId: string

  // Type classification
  needType: NeedType
  prePrintedContractNumber?: string

  // People
  people: ContractPerson[]

  // Primary sale (contract sale)
  sale: {
    id: string
    saleDate?: string
    items: SaleItem[]
  }

  // Payments
  payments: ContractPayment[]

  // Metadata for tracking
  meta: {
    status: SaleStatus
    dateExecuted?: string
    dateSigned?: string
    isCancelled: boolean
    createdAt: string
    updatedAt: string
  }
}

/**
 * Create a new empty contract draft
 */
export function createNewContractDraft(locationId = ''): ContractDraft {
  const now = new Date().toISOString()

  return {
    id: 'new',
    contractNumber: '',
    locationId,
    needType: NeedType.AT_NEED,
    people: [],
    sale: {
      id: 'temp-sale-id',
      saleDate: new Date().toISOString().split('T')[0],
      items: [],
    },
    payments: [],
    meta: {
      status: SaleStatus.DRAFT,
      isCancelled: false,
      createdAt: now,
      updatedAt: now,
    },
  }
}

/**
 * Create a draft from server contract
 * Transforms the complex API Contract structure into editable draft
 */
export function createDraftFromServer(serverContract: Contract): ContractDraft {
  // Get primary sale (CONTRACT type)
  const primarySale = serverContract.sales?.find((s) => s.saleType === SaleType.CONTRACT)

  const draft: ContractDraft = {
    id: serverContract.id,
    contractNumber: serverContract.contractNumber,
    locationId: serverContract.locationId,
    needType: serverContract.needType,
    prePrintedContractNumber: serverContract.prePrintedContractNumber,

    // Deep clone people array to make it mutable
    people: clone(serverContract.people ?? []),

    // Extract primary sale data
    sale: {
      id: primarySale?.id ?? 'temp-sale-id',
      saleDate: primarySale?.saleDate?.split('T')[0], // Convert to date-only
      items: clone(primarySale?.items ?? []),
    },

    // Deep clone payments
    payments: clone(serverContract.payments ?? []),

    // Extract metadata
    meta: {
      status: primarySale?.saleStatus ?? SaleStatus.DRAFT,
      dateExecuted: serverContract.dateExecuted,
      dateSigned: serverContract.dateSigned,
      isCancelled: serverContract.isCancelled,
      createdAt: serverContract.dateCreated,
      updatedAt: serverContract.dateLastModified,
    },
  }

  return draft
}

/**
 * Reset draft to match server contract
 */
export function resetDraft(serverContract: Contract): ContractDraft {
  return createDraftFromServer(serverContract)
}

/**
 * Apply a patch to a draft using a dot-notation path
 * Returns a new immutable draft with the change applied
 *
 * Examples:
 * - applyPatch(draft, 'needType', NeedType.PRE_NEED)
 * - applyPatch(draft, 'people.0.name.first', 'John')
 * - applyPatch(draft, 'sale.items.0.quantity', 5)
 */
export function applyPatch<T = unknown>(
  draft: ContractDraft,
  path: string,
  value: T,
): ContractDraft {
  // Return unchanged if path is empty or whitespace
  if (!path || path.trim() === '') {
    return draft
  }

  const parts = path.split('.')
  const result = clone(toRaw(draft)) as ContractDraft

  if (parts.length === 0) {
    return result
  }

  // Navigate to parent object
  let current: any = result
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (!key) {
      continue
    }

    // Handle array indices
    const arrayIndex = Number.parseInt(key, 10)
    if (Number.isNaN(arrayIndex)) {
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}
      }
      current = current[key]
    } else {
      current = current[arrayIndex]
    }
  }

  // Set the value
  const lastKey = parts.at(-1)
  if (lastKey) {
    const arrayIndex = Number.parseInt(lastKey, 10)
    current[Number.isNaN(arrayIndex) ? lastKey : arrayIndex] = value
  }

  // Update timestamp
  result.meta.updatedAt = new Date().toISOString()

  return result
}

/**
 * Get a value from draft using dot-notation path
 */
export function getValueByPath(draft: ContractDraft, path: string): unknown {
  const parts = path.split('.')
  let current: any = draft

  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }

    // Handle array indices
    const arrayIndex = Number.parseInt(part, 10)
    current = Number.isNaN(arrayIndex) ? current[part] : current[arrayIndex]
  }

  return current
}

/**
 * Convert draft back to Contract for API save
 * Reconstructs the full API Contract structure
 */
export function draftToContract(draft: ContractDraft): Partial<Contract> {
  // Build the primary sale
  const primarySale: Partial<Sale> = {
    id: draft.sale.id === 'temp-sale-id' ? undefined : draft.sale.id,
    contractId: draft.id === 'new' ? undefined : draft.id,
    saleDate: draft.sale.saleDate,
    saleType: SaleType.CONTRACT,
    saleStatus: draft.meta.status,
    items: draft.sale.items,
    // Totals will be calculated by backend
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 0,
  }

  // Build the contract
  const contract: Partial<Contract> = {
    id: draft.id === 'new' ? undefined : draft.id,
    contractNumber: draft.contractNumber,
    prePrintedContractNumber: draft.prePrintedContractNumber,
    locationId: draft.locationId,
    needType: draft.needType,
    dateExecuted: draft.meta.dateExecuted,
    dateSigned: draft.meta.dateSigned,
    isCancelled: draft.meta.isCancelled,

    // Related entities
    sales: [primarySale as Sale],
    people: draft.people,
    payments: draft.payments,

    // Totals will be calculated by backend
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 0,
    amountPaid: 0,
    balanceDue: 0,
  }

  return contract
}
