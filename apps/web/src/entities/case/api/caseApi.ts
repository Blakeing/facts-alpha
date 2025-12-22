/**
 * entities/case/api/caseApi.ts
 *
 * Case API client - currently uses mock data, will be replaced with real API calls
 */

import type { Case } from '../model/case'
import type { CaseFormValues } from '../model/caseSchema'
import { formValuesToCase } from '../model/caseSchema'
import { mockCases } from '../model/mockData'

// Simulate network delay for realistic behavior
const MOCK_DELAY = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// In-memory store for mock data (allows mutations during development)
let cases = [...mockCases]

/**
 * Case API client
 *
 * TODO: Replace mock implementations with real HTTP calls when backend is ready
 */
export const caseApi = {
  /**
   * Get all cases
   */
  async list(): Promise<Case[]> {
    await delay(MOCK_DELAY)
    return [...cases]
  },

  /**
   * Get a single case by ID
   */
  async get(id: string): Promise<Case> {
    await delay(MOCK_DELAY)
    const caseItem = cases.find((c) => c.id === id)
    if (!caseItem) {
      throw new Error(`Case not found: ${id}`)
    }
    return { ...caseItem }
  },

  /**
   * Create a new case
   */
  async create(data: CaseFormValues): Promise<Case> {
    await delay(MOCK_DELAY)
    const newCase = formValuesToCase(data)
    cases.push(newCase)
    return { ...newCase }
  },

  /**
   * Update an existing case
   */
  async update(id: string, data: CaseFormValues): Promise<Case> {
    await delay(MOCK_DELAY)
    const index = cases.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error(`Case not found: ${id}`)
    }
    const existingCase = cases[index]
    const updatedCase = formValuesToCase(data, existingCase)
    cases[index] = updatedCase
    return { ...updatedCase }
  },

  /**
   * Delete a case
   */
  async delete(id: string): Promise<void> {
    await delay(MOCK_DELAY)
    const index = cases.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error(`Case not found: ${id}`)
    }
    cases.splice(index, 1)
  },

  /**
   * Reset mock data (for testing)
   */
  _resetMockData(): void {
    cases = [...mockCases]
  },
}
