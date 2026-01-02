/**
 * features/contract-dialog/model/contractEditor/machine.helpers.ts
 *
 * Helper functions for the contract editor machine
 */

import type { ContractDraft, ContractSection } from '@/entities/contract'
import rfdc from 'rfdc'

const clone = rfdc()

/**
 * Deep equality check for drafts
 * Compares two ContractDraft objects by serializing to JSON
 * Excludes meta.updatedAt from comparison as it changes on save
 */
export function draftsEqual(draft1: ContractDraft | null, draft2: ContractDraft | null): boolean {
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

/**
 * Determine which section a field path belongs to
 * @param path - Field path (e.g., 'people.0.name.first', 'sale.items.0.quantity')
 * @returns The section this field belongs to, or null if unknown
 */
export function getSectionFromPath(path: string): ContractSection | null {
  if (path.startsWith('people.')) {
    return 'people'
  }
  if (path.startsWith('sale.items.')) {
    return 'items'
  }
  if (path.startsWith('payments.')) {
    return 'payments'
  }
  if (path.startsWith('locationId') || path.startsWith('needType')) {
    return 'general'
  }
  return null
}
