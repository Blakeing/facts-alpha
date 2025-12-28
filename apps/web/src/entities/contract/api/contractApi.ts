/**
 * Contract API client (HTTP-based with transformations)
 *
 * This API implements transformation logic to convert between:
 * - Form data (nested: primaryBuyer, coBuyers, etc.)
 * - JSON Server structure (flat: separate collections for contracts, people, sales, etc.)
 *
 * In production, this transformation logic happens in the BFF.
 * For testing with JSON Server, we implement it client-side.
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
  ContractPersonRole,
  ContractResponse,
  ContractSessionSaveModel,
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
import { type ApiError, NotFoundError, toApiError } from '@facts/effect'
import { Effect } from 'effect'
import { apiUrls, getHttpClient } from '@/shared/api'
import { NeedType, SaleStatus, SaleType } from '../model/contract'
import {
  contractToListing,
  formPersonToPerson,
  generateContractNumber,
  generateId,
} from './transformations'

// =============================================================================
// CRUD Operations (with transformations)
// =============================================================================

export const ContractApi = {
  /**
   * List all contracts for a location
   * BFF endpoint: GET /api/v1/contracts/listing/{locationId}?fromDate={date}&toDate={date}&needType={AN|PN}
   * Returns ContractListing[] with all necessary data already included
   */
  list: (
    locationId: string,
    options?: {
      fromDate?: string
      toDate?: string
      needType?: NeedType
    },
  ): Effect.Effect<ContractListing[], ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())

      // BFF returns ContractListing[] directly (no need to join separate collections)
      const response = yield* Effect.tryPromise({
        try: () =>
          client.get<ContractListing[]>(
            apiUrls.contracts.listing(locationId, {
              fromDate: options?.fromDate,
              toDate: options?.toDate,
              needType: options?.needType,
            }),
          ),
        catch: (error: unknown) => toApiError(error, 'contract'),
      })

      return response.data
    }),

  /**
   * Get a single contract with all related data
   * BFF endpoint: GET /api/v1/contracts/{id}
   * Returns wrapper object with contract inside .contract property
   * NOTE: Contract.people[].name is nested Name object from BFF (no transformation needed!)
   */
  get: (id: string): Effect.Effect<Contract, ApiError | NotFoundError> =>
    Effect.gen(function* () {
      // Validate ID to prevent "undefined" being passed to URL
      if (!id || id === 'undefined') {
        return yield* Effect.fail(new NotFoundError({ resource: 'contract', id: id ?? 'missing' }))
      }

      const client = yield* Effect.promise(() => getHttpClient())

      // BFF returns wrapper: { contract: {...}, executeContract: bool, ... }
      const response = yield* Effect.tryPromise({
        try: () => client.get<ContractResponse>(apiUrls.contracts.detail(id)),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })

      if (!response.data?.contract) {
        return yield* Effect.fail(new NotFoundError({ resource: 'contract', id }))
      }

      console.log('[ContractApi.get] Raw response:', response.data)
      console.log('[ContractApi.get] Contract:', response.data.contract)
      console.log('[ContractApi.get] Contract people:', response.data.contract.people)

      // Return contract as-is - BFF data structure matches our types exactly!
      // No transformation needed: person.name is already the nested Name object
      return response.data.contract
    }),

  /**
   * Create a new contract (with related data)
   */
  create: (data: ContractFormValues): Effect.Effect<Contract, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const now = new Date().toISOString()

      // Build contract payload
      const contractPayload: Omit<Contract, 'people' | 'sales' | 'payments'> = {
        id: generateId('contract'),
        locationId: data.locationId,
        contractNumber: generateContractNumber(data.locationId),
        needType: data.needType,
        status: SaleStatus.DRAFT,
        dateCreated: now,
        dateLastModified: now,
      }

      // 1. Create contract
      const contractRes = yield* Effect.tryPromise({
        try: () => client.post<Contract>(apiUrls.contracts.create, contractPayload),
        catch: (error: unknown) => toApiError(error, 'contract'),
      })

      const contract = contractRes.data

      // 2. Create primary buyer if provided
      if (data.primaryBuyer) {
        const person = formPersonToPerson(data.primaryBuyer, contract.id, 'primary_buyer')
        yield* Effect.tryPromise({
          try: () =>
            client.post<ContractPerson>(apiUrls.contracts.people.create(contract.id), person),
          catch: (error: unknown) => toApiError(error, 'person'),
        })
      }

      // 3. Create primary beneficiary if provided (for preneed)
      if (data.primaryBeneficiary) {
        const person = formPersonToPerson(
          data.primaryBeneficiary,
          contract.id,
          'primary_beneficiary',
        )
        yield* Effect.tryPromise({
          try: () =>
            client.post<ContractPerson>(apiUrls.contracts.people.create(contract.id), person),
          catch: (error: unknown) => toApiError(error, 'person'),
        })
      }

      // 4. Create initial sale
      const salePayload: Omit<Sale, 'items'> = {
        id: generateId('sale'),
        contractId: contract.id,
        saleType: SaleType.CONTRACT,
        saleStatus: SaleStatus.DRAFT,
        dateCreated: now,
        dateLastModified: now,
      }

      yield* Effect.tryPromise({
        try: () => client.post<Sale>(apiUrls.contracts.sales.create(contract.id), salePayload),
        catch: (error: unknown) => toApiError(error, 'sale'),
      })

      // Return the full contract (will be refetched by the form)
      return contract
    }),

  /**
   * Update a contract (basic fields only)
   */
  update: (id: string, data: Partial<ContractFormValues>): Effect.Effect<Contract, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const now = new Date().toISOString()

      // Get existing contract to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () => client.get<Contract>(apiUrls.contracts.detail(id)),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })

      const existing = existingRes.data

      // Build update payload (merge with existing)
      const contractPayload: Contract = {
        ...existing,
        ...data,
        dateLastModified: now,
      }

      const response = yield* Effect.tryPromise({
        try: () => client.put<Contract>(apiUrls.contracts.update(id), contractPayload),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })

      return response.data
    }),

  /**
   * Delete a contract (and all related data)
   */
  delete: (id: string): Effect.Effect<void, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())

      // Fetch related data first
      const [salesRes, peopleRes, paymentsRes] = yield* Effect.all(
        [
          Effect.tryPromise({
            try: () => client.get<Sale[]>(`/sales?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'sale'),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractPerson[]>(`/people?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'person'),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractPayment[]>(`/payments?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'payment'),
          }),
        ],
        { concurrency: 'unbounded' },
      )

      // Delete related entities first
      const sales = salesRes.data
      const people = peopleRes.data
      const payments = paymentsRes.data

      // Delete items for each sale
      for (const sale of sales) {
        const itemsRes = yield* Effect.tryPromise({
          try: () => client.get<SaleItem[]>(`/items?saleId=${sale.id}`),
          catch: (error: unknown) => toApiError(error, 'saleItem'),
        })
        const items = itemsRes.data
        for (const item of items) {
          yield* Effect.tryPromise({
            try: () => client.delete(`/items/${item.id}`),
            catch: (error: unknown) => toApiError(error, 'saleItem', item.id),
          })
        }
      }

      // Delete sales
      for (const sale of sales) {
        yield* Effect.tryPromise({
          try: () => client.delete(`/sales/${sale.id}`),
          catch: (error: unknown) => toApiError(error, 'sale', sale.id),
        })
      }

      // Delete people
      for (const person of people) {
        yield* Effect.tryPromise({
          try: () => client.delete(`/people/${person.id}`),
          catch: (error: unknown) => toApiError(error, 'person', person.id),
        })
      }

      // Delete payments
      for (const payment of payments) {
        yield* Effect.tryPromise({
          try: () => client.delete(`/payments/${payment.id}`),
          catch: (error: unknown) => toApiError(error, 'payment', payment.id),
        })
      }

      // Finally, delete the contract
      yield* Effect.tryPromise({
        try: () => client.delete(apiUrls.contracts.delete(id)),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })
    }),

  /**
   * Save contract draft (BFF endpoint)
   * POST /api/v1/contracts/save/draft
   * Accepts complete nested ContractSessionSaveModel payload
   * Returns updated Contract with all related data
   */
  saveDraft: (model: ContractSessionSaveModel): Effect.Effect<Contract, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const response = yield* Effect.tryPromise({
        try: () => client.post<Contract>(apiUrls.contracts.saveDraft, model),
        catch: (error: unknown) => toApiError(error, 'contract'),
      })
      return response.data
    }),

  // =============================================================================
  // Sales Operations
  // =============================================================================

  getSales: (contractId: string): Effect.Effect<Sale[], ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const response = yield* Effect.tryPromise({
        try: () => client.get<Sale[]>(apiUrls.contracts.sales.list(contractId)),
        catch: (error: unknown) => toApiError(error, 'sale'),
      })
      return response.data
    }),

  addSale: (contractId: string, data: SaleFormValues): Effect.Effect<Sale, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      // Ensure contractId is in the payload for JSON Server
      const payload = { ...data, contractId }
      const response = yield* Effect.tryPromise({
        try: () => client.post<Sale>(apiUrls.contracts.sales.create(contractId), payload),
        catch: (error: unknown) => toApiError(error, 'sale'),
      })
      return response.data
    }),

  updateSale: (
    contractId: string,
    saleId: string,
    data: Partial<SaleFormValues>,
  ): Effect.Effect<Sale, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      // Fetch existing sale to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () => client.get<Sale>(apiUrls.contracts.sales.detail(contractId, saleId)),
        catch: (error: unknown) => toApiError(error, 'sale', saleId),
      })

      const existing = existingRes.data
      const payload: Sale = { ...existing, ...data }
      const response = yield* Effect.tryPromise({
        try: () => client.put<Sale>(apiUrls.contracts.sales.update(contractId, saleId), payload),
        catch: (error: unknown) => toApiError(error, 'sale', saleId),
      })

      return response.data
    }),

  deleteSale: (contractId: string, saleId: string): Effect.Effect<void, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      yield* Effect.tryPromise({
        try: () => client.delete(apiUrls.contracts.sales.delete(contractId, saleId)),
        catch: (error: unknown) => toApiError(error, 'sale', saleId),
      })
    }),

  // Sale Items
  addSaleItem: (
    contractId: string,
    saleId: string,
    data: SaleItemFormValues,
  ): Effect.Effect<SaleItem, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      // Include saleId in body for JSON Server (it needs it to create the relationship)
      const payload = { ...data, saleId }
      const response = yield* Effect.tryPromise({
        try: () => client.post<SaleItem>(apiUrls.sales.items.create(saleId), payload),
        catch: (error: unknown) => toApiError(error, 'saleItem'),
      })
      return response.data
    }),

  updateSaleItem: (
    contractId: string,
    saleId: string,
    itemId: string,
    data: Partial<SaleItemFormValues>,
  ): Effect.Effect<SaleItem, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      // Fetch existing item to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () => client.get<SaleItem>(apiUrls.sales.items.detail(saleId, itemId)),
        catch: (error: unknown) => toApiError(error, 'saleItem', itemId),
      })

      const existing = existingRes.data
      const payload: SaleItem = { ...existing, ...data }
      const response = yield* Effect.tryPromise({
        try: () => client.put<SaleItem>(apiUrls.sales.items.update(saleId, itemId), payload),
        catch: (error: unknown) => toApiError(error, 'saleItem', itemId),
      })

      return response.data
    }),

  deleteSaleItem: (
    contractId: string,
    saleId: string,
    itemId: string,
  ): Effect.Effect<void, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      yield* Effect.tryPromise({
        try: () => client.delete(apiUrls.sales.items.delete(saleId, itemId)),
        catch: (error: unknown) => toApiError(error, 'saleItem', itemId),
      })
    }),

  // Payments
  getPayments: (contractId: string): Effect.Effect<ContractPayment[], ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const response = yield* Effect.tryPromise({
        try: () => client.get<ContractPayment[]>(apiUrls.contracts.payments.list(contractId)),
        catch: (error: unknown) => toApiError(error, 'payment'),
      })
      return response.data
    }),

  addPayment: (
    contractId: string,
    data: ContractPaymentFormValues,
  ): Effect.Effect<ContractPayment, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      // Include contractId in body for JSON Server (it needs it to create the relationship)
      const payload = { ...data, contractId }
      const response = yield* Effect.tryPromise({
        try: () =>
          client.post<ContractPayment>(apiUrls.contracts.payments.create(contractId), payload),
        catch: (error: unknown) => toApiError(error, 'payment'),
      })
      return response.data
    }),

  updatePayment: (
    contractId: string,
    paymentId: string,
    data: Partial<ContractPaymentFormValues>,
  ): Effect.Effect<ContractPayment, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      // Fetch existing payment to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () =>
          client.get<ContractPayment>(apiUrls.contracts.payments.detail(contractId, paymentId)),
        catch: (error: unknown) => toApiError(error, 'payment', paymentId),
      })

      const existing = existingRes.data
      const payload: ContractPayment = { ...existing, ...data }
      const response = yield* Effect.tryPromise({
        try: () =>
          client.put<ContractPayment>(
            apiUrls.contracts.payments.update(contractId, paymentId),
            payload,
          ),
        catch: (error: unknown) => toApiError(error, 'payment', paymentId),
      })

      return response.data
    }),

  deletePayment: (contractId: string, paymentId: string): Effect.Effect<void, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      yield* Effect.tryPromise({
        try: () => client.delete(apiUrls.contracts.payments.delete(contractId, paymentId)),
        catch: (error: unknown) => toApiError(error, 'payment', paymentId),
      })
    }),

  // People
  getPeople: (contractId: string): Effect.Effect<ContractPerson[], ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const response = yield* Effect.tryPromise({
        try: () => client.get<ContractPerson[]>(apiUrls.contracts.people.list(contractId)),
        catch: (error: unknown) => toApiError(error, 'person'),
      })
      return response.data
    }),

  addPerson: (
    contractId: string,
    data: ContractPersonFormValues,
    role: ContractPersonRole,
  ): Effect.Effect<ContractPerson, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const person = formPersonToPerson(data, contractId, role)
      const response = yield* Effect.tryPromise({
        try: () => client.post<ContractPerson>(apiUrls.contracts.people.create(contractId), person),
        catch: (error: unknown) => toApiError(error, 'person'),
      })
      return response.data
    }),

  updatePerson: (
    contractId: string,
    personId: string,
    data: Partial<ContractPersonFormValues>,
  ): Effect.Effect<ContractPerson, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      // Fetch existing person to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () =>
          client.get<ContractPerson>(apiUrls.contracts.people.detail(contractId, personId)),
        catch: (error: unknown) => toApiError(error, 'person', personId),
      })

      const existing = existingRes.data
      const payload: ContractPerson = { ...existing, ...data }
      const response = yield* Effect.tryPromise({
        try: () =>
          client.put<ContractPerson>(
            apiUrls.contracts.people.update(contractId, personId),
            payload,
          ),
        catch: (error: unknown) => toApiError(error, 'person', personId),
      })

      return response.data
    }),

  deletePerson: (contractId: string, personId: string): Effect.Effect<void, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      yield* Effect.tryPromise({
        try: () => client.delete(apiUrls.contracts.people.delete(contractId, personId)),
        catch: (error: unknown) => toApiError(error, 'person', personId),
      })
    }),

  // Financing
  getFinancing: (contractId: string): Effect.Effect<ContractFinancing | null, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const response = yield* Effect.tryPromise({
        try: () => client.get<ContractFinancing | null>(`/financing?contractId=${contractId}`),
        catch: (error: unknown) => toApiError(error, 'financing'),
      })
      const financing = response.data
      return Array.isArray(financing) && financing.length > 0 ? financing[0] : null
    }),

  saveFinancing: (
    contractId: string,
    data: ContractFinancingFormValues,
  ): Effect.Effect<ContractFinancing, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      const payload = { ...data, contractId }
      const response = yield* Effect.tryPromise({
        try: () => client.put<ContractFinancing>(`/financing/${contractId}`, payload),
        catch: (error: unknown) => toApiError(error, 'financing'),
      })
      return response.data
    }),

  deleteFinancing: (contractId: string): Effect.Effect<void, ApiError> =>
    Effect.gen(function* () {
      const client = yield* Effect.promise(() => getHttpClient())
      yield* Effect.tryPromise({
        try: () => client.delete(`/financing/${contractId}`),
        catch: (error: unknown) => toApiError(error, 'financing'),
      })
    }),
}
