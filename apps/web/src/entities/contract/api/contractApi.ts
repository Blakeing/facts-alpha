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
import { SaleType } from '../model/contract'
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
   * List all contracts with joined people/sales data
   */
  list: (): Effect.Effect<ContractListing[], ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()

      // Fetch all collections in parallel
      const [contractsRes, peopleRes, salesRes] = yield* Effect.all(
        [
          Effect.tryPromise({
            try: () => client.get<Contract[]>(apiUrls.contracts.listing),
            catch: (error: unknown) => toApiError(error, 'contract'),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractPerson[]>('/people'),
            catch: (error: unknown) => toApiError(error, 'person'),
          }),
          Effect.tryPromise({
            try: () => client.get<Sale[]>('/sales'),
            catch: (error: unknown) => toApiError(error, 'sale'),
          }),
        ],
        { concurrency: 'unbounded' },
      )

      // Transform each contract to listing with joined data
      return contractsRes.data.map((c) => contractToListing(c, peopleRes.data, salesRes.data))
    }),

  /**
   * Get a single contract with all related data
   */
  get: (id: string): Effect.Effect<Contract, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()

      // Fetch contract and related data in parallel
      const [contractRes, peopleRes, salesRes, financingRes, paymentsRes] = yield* Effect.all(
        [
          Effect.tryPromise({
            try: () => client.get<Contract>(apiUrls.contracts.detail(id)),
            catch: (error: unknown) => toApiError(error, 'contract', id),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractPerson[]>(`/people?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'person'),
          }),
          Effect.tryPromise({
            try: () => client.get<Sale[]>(apiUrls.contracts.sales.list(id)),
            catch: (error: unknown) => toApiError(error, 'sale'),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractFinancing[]>(`/financing?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'financing'),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractPayment[]>(`/payments?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'payment'),
          }),
        ],
        { concurrency: 'unbounded' },
      )

      const contract = contractRes.data
      if (!contract) {
        return yield* Effect.fail(new NotFoundError({ resource: 'contract', id }))
      }

      // Fetch sale items for each sale
      const sales = salesRes.data

      for (const sale of sales) {
        const itemsRes = yield* Effect.tryPromise({
          try: () => client.get<SaleItem[]>(`/saleItems?saleId=${sale.id}`),
          catch: (error: unknown) => toApiError(error, 'saleItem'),
        })
        sale.items = itemsRes.data
      }

      // Return contract with all related data
      return {
        ...contract,
        people: peopleRes.data,
        sales,
        financing: financingRes.data[0] || undefined,
        payments: paymentsRes.data,
      }
    }),

  /**
   * Create a new contract with people and financing
   * Transforms nested form data into separate collection records
   */
  create: (data: ContractFormValues): Effect.Effect<Contract, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      const now = new Date().toISOString()
      const contractId = generateId()

      // 1. Build flat contract payload (no nested people)
      const contractPayload = {
        id: contractId,
        contractNumber: generateContractNumber(data.needType),
        prePrintedContractNumber: data.prePrintedContractNumber || '',
        locationId: data.locationId,
        needType: data.needType,
        contractTypeId: data.contractTypeId,
        contractSaleTypeId: data.contractSaleTypeId,
        leadSourceId: data.leadSourceId,
        atNeedType: data.atNeedType,
        preNeedFundingType: data.preNeedFundingType,
        salesPersonId: data.salesPersonId,
        marketingAgentId: data.marketingAgentId,
        dateExecuted: data.dateSigned,
        dateSigned: data.dateSigned,
        isCancelled: false,
        isConditionalSale: data.isConditionalSale,
        notes: data.notes,
        // Initialize totals to 0 (will be calculated when items are added)
        subtotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: 0,
        amountPaid: 0,
        balanceDue: 0,
        createdAt: now,
        updatedAt: now,
      }

      // 2. POST contract
      yield* Effect.tryPromise({
        try: () => client.post(apiUrls.contracts.saveDraft, contractPayload),
        catch: (error: unknown) => toApiError(error, 'contract'),
      })

      // 3. Create people records
      const peoplePayloads = [
        formPersonToPerson(data.primaryBuyer, contractId, [
          'primary_buyer',
        ] as ContractPersonRole[]),
        ...data.coBuyers.map((p) =>
          formPersonToPerson(p, contractId, ['co_buyer'] as ContractPersonRole[]),
        ),
        formPersonToPerson(data.primaryBeneficiary, contractId, [
          'primary_beneficiary',
        ] as ContractPersonRole[]),
        ...data.additionalBeneficiaries.map((p) =>
          formPersonToPerson(p, contractId, ['additional_beneficiary'] as ContractPersonRole[]),
        ),
      ]

      for (const person of peoplePayloads) {
        yield* Effect.tryPromise({
          try: () => client.post('/people', person),
          catch: (error: unknown) => toApiError(error, 'person'),
        })
      }

      // 4. Create an initial draft sale (required for items/payments)
      const saleId = generateId()
      const saleNumber = `S-${contractPayload.contractNumber.split('-')[1]}-${contractPayload.contractNumber.split('-')[2]}`
      yield* Effect.tryPromise({
        try: () =>
          client.post('/sales', {
            id: saleId,
            contractId,
            saleNumber,
            saleDate: data.dateSigned || now,
            saleType: SaleType.CONTRACT,
            saleStatus: 'draft',
            accountingPeriod: new Date(now).toISOString().split('T')[0],
            memo: '',
            subtotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: 0,
            createdAt: now,
            updatedAt: now,
          }),
        catch: (error: unknown) => toApiError(error, 'sale'),
      })

      // 5. Create financing if provided
      if (data.financing?.isFinanced) {
        yield* Effect.tryPromise({
          try: () =>
            client.post('/financing', {
              id: generateId(),
              contractId,
              ...data.financing,
              createdAt: now,
              updatedAt: now,
            }),
          catch: (error: unknown) => toApiError(error, 'financing'),
        })
      }

      // 6. Re-fetch complete contract with all joins
      return yield* ContractApi.get(contractId)
    }),

  /**
   * Update an existing contract
   */
  update: (id: string, data: Partial<ContractFormValues>): Effect.Effect<Contract, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      const now = new Date().toISOString()

      // Fetch existing contract to merge with updates
      const existingContractRes = yield* Effect.tryPromise({
        try: () => client.get<Contract>(apiUrls.contracts.detail(id)),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })

      const existingContract = existingContractRes.data
      if (!existingContract) {
        return yield* Effect.fail(new NotFoundError({ resource: 'contract', id }))
      }

      // Merge updates with existing data
      // JSON Server PUT replaces entire resource, so we must include ALL contract-level fields
      // Exclude nested arrays (sales, people, payments) - they're managed separately
      const {
        sales: _sales,
        people: _people,
        payments: _payments,
        financing: _financing,
        fundingDetails: _fundingDetails,
        ...contractFields
      } = existingContract

      const updatePayload: Omit<
        Contract,
        'sales' | 'people' | 'payments' | 'financing' | 'fundingDetails'
      > = {
        ...contractFields,
        // Update locationId and needType (always provided)
        locationId: data.locationId ?? existingContract.locationId,
        needType: data.needType ?? existingContract.needType,
        // Update optional fields only if explicitly provided (not empty string for string fields)
        ...(data.prePrintedContractNumber !== undefined &&
          data.prePrintedContractNumber !== '' && {
            prePrintedContractNumber: data.prePrintedContractNumber,
          }),
        ...(data.contractTypeId !== undefined && { contractTypeId: data.contractTypeId }),
        ...(data.contractSaleTypeId !== undefined && {
          contractSaleTypeId: data.contractSaleTypeId,
        }),
        ...(data.leadSourceId !== undefined && { leadSourceId: data.leadSourceId }),
        ...(data.atNeedType !== undefined && { atNeedType: data.atNeedType }),
        ...(data.preNeedFundingType !== undefined && {
          preNeedFundingType: data.preNeedFundingType,
        }),
        ...(data.salesPersonId !== undefined && { salesPersonId: data.salesPersonId }),
        ...(data.marketingAgentId !== undefined && { marketingAgentId: data.marketingAgentId }),
        ...(data.dateSigned !== undefined && { dateSigned: data.dateSigned }),
        ...(data.isConditionalSale !== undefined && {
          isConditionalSale: data.isConditionalSale,
        }),
        ...(data.notes !== undefined && data.notes !== '' && { notes: data.notes }),
        updatedAt: now,
      }

      // Update contract with complete payload
      yield* Effect.tryPromise({
        try: () => client.put(apiUrls.contracts.detail(id), updatePayload),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })

      // TODO: Handle people updates if provided
      // For now, people updates are handled separately via addPerson/updatePerson/removePerson

      // Re-fetch complete contract
      return yield* ContractApi.get(id)
    }),

  /**
   * Delete a contract and all related data
   */
  delete: (id: string): Effect.Effect<void, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()

      // 1. Fetch related data
      const [peopleRes, salesRes, paymentsRes, financingRes] = yield* Effect.all(
        [
          Effect.tryPromise({
            try: () => client.get<ContractPerson[]>(`/people?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'person'),
          }),
          Effect.tryPromise({
            try: () => client.get<Sale[]>(`/sales?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'sale'),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractPayment[]>(`/payments?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'payment'),
          }),
          Effect.tryPromise({
            try: () => client.get<ContractFinancing[]>(`/financing?contractId=${id}`),
            catch: (error: unknown) => toApiError(error, 'financing'),
          }),
        ],
        { concurrency: 'unbounded' },
      )

      // 2. Delete all people
      for (const person of peopleRes.data) {
        yield* Effect.tryPromise({
          try: () => client.delete(`/people/${person.id}`),
          catch: (error: unknown) => toApiError(error, 'person', person.id),
        })
      }

      // 3. Delete all sales and their items
      for (const sale of salesRes.data) {
        const itemsRes = yield* Effect.tryPromise({
          try: () => client.get<SaleItem[]>(`/saleItems?saleId=${sale.id}`),
          catch: (error: unknown) => toApiError(error, 'saleItem'),
        })

        for (const item of itemsRes.data) {
          yield* Effect.tryPromise({
            try: () => client.delete(`/saleItems/${item.id}`),
            catch: (error: unknown) => toApiError(error, 'saleItem', item.id),
          })
        }

        yield* Effect.tryPromise({
          try: () => client.delete(`/sales/${sale.id}`),
          catch: (error: unknown) => toApiError(error, 'sale', sale.id),
        })
      }

      // 4. Delete all payments
      for (const payment of paymentsRes.data) {
        yield* Effect.tryPromise({
          try: () => client.delete(`/payments/${payment.id}`),
          catch: (error: unknown) => toApiError(error, 'payment', payment.id),
        })
      }

      // 5. Delete financing
      for (const financing of financingRes.data) {
        yield* Effect.tryPromise({
          try: () => client.delete(`/financing/${financing.id}`),
          catch: (error: unknown) => toApiError(error, 'financing', financing.id),
        })
      }

      // 6. Finally, delete the contract itself
      yield* Effect.tryPromise({
        try: () => client.delete(apiUrls.contracts.detail(id)),
        catch: (error: unknown) => toApiError(error, 'contract', id),
      })
    }),

  // ===========================================================================
  // Domain-Specific Methods (Sales, Items, Payments, People, Financing)
  // ===========================================================================

  // Sales
  getSales: (contractId: string): Effect.Effect<Sale[], ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        const response = await client.get<Sale[]>(apiUrls.contracts.sales.list(contractId))
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'sale'),
    }),

  addSale: (contractId: string, data: SaleFormValues): Effect.Effect<Sale, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        // Ensure contractId is in the payload for JSON Server
        const payload = { ...data, contractId }
        const response = await client.post<Sale>(
          apiUrls.contracts.sales.create(contractId),
          payload,
        )
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'sale'),
    }),

  updateSale: (
    contractId: string,
    saleId: string,
    data: Partial<SaleFormValues>,
  ): Effect.Effect<Sale, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      // Fetch existing sale to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () => client.get<Sale>(apiUrls.contracts.sales.detail(contractId, saleId)),
        catch: (error: unknown) => toApiError(error, 'sale', saleId),
      })
      const existing = existingRes.data
      const mergedData = {
        ...existing,
        ...data,
        id: saleId, // Ensure ID is preserved
        contractId, // Ensure contractId is preserved
        updatedAt: new Date().toISOString(),
      }
      const response = yield* Effect.tryPromise({
        try: () => client.put<Sale>(apiUrls.contracts.sales.update(contractId, saleId), mergedData),
        catch: (error: unknown) => toApiError(error, 'sale', saleId),
      })
      return response.data
    }),

  removeSale: (contractId: string, saleId: string): Effect.Effect<void, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        await client.delete(apiUrls.contracts.sales.delete(contractId, saleId))
      },
      catch: (error: unknown) => toApiError(error, 'sale', saleId),
    }),

  // Sale Items
  addSaleItem: (
    contractId: string,
    saleId: string,
    data: SaleItemFormValues,
  ): Effect.Effect<SaleItem, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        // Include saleId in body for JSON Server (it needs it to create the relationship)
        const payload = { ...data, saleId }
        const response = await client.post<SaleItem>(apiUrls.sales.items.create(saleId), payload)
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'saleItem'),
    }),

  updateSaleItem: (
    contractId: string,
    saleId: string,
    itemId: string,
    data: Partial<SaleItemFormValues>,
  ): Effect.Effect<SaleItem, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      // Fetch existing item to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () => client.get<SaleItem>(apiUrls.sales.items.detail(saleId, itemId)),
        catch: (error: unknown) => toApiError(error, 'saleItem', itemId),
      })
      const existing = existingRes.data
      const mergedData = {
        ...existing,
        ...data,
        id: itemId, // Ensure ID is preserved
        saleId, // Ensure saleId is preserved
        updatedAt: new Date().toISOString(),
      }
      const response = yield* Effect.tryPromise({
        try: () => client.put<SaleItem>(apiUrls.sales.items.update(saleId, itemId), mergedData),
        catch: (error: unknown) => toApiError(error, 'saleItem', itemId),
      })
      return response.data
    }),

  removeSaleItem: (
    contractId: string,
    saleId: string,
    itemId: string,
  ): Effect.Effect<void, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        await client.delete(apiUrls.sales.items.delete(saleId, itemId))
      },
      catch: (error: unknown) => toApiError(error, 'saleItem', itemId),
    }),

  // Payments
  getPayments: (contractId: string): Effect.Effect<ContractPayment[], ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        const response = await client.get<ContractPayment[]>(
          apiUrls.contracts.payments.list(contractId),
        )
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'payment'),
    }),

  addPayment: (
    contractId: string,
    data: ContractPaymentFormValues,
  ): Effect.Effect<ContractPayment, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        // Include contractId in body for JSON Server (it needs it to create the relationship)
        const payload = { ...data, contractId }
        const response = await client.post<ContractPayment>(
          apiUrls.contracts.payments.create(contractId),
          payload,
        )
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'payment'),
    }),

  updatePayment: (
    contractId: string,
    paymentId: string,
    data: Partial<ContractPaymentFormValues>,
  ): Effect.Effect<ContractPayment, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      // Fetch existing payment to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () =>
          client.get<ContractPayment>(apiUrls.contracts.payments.detail(contractId, paymentId)),
        catch: (error: unknown) => toApiError(error, 'payment', paymentId),
      })
      const existing = existingRes.data
      const mergedData = {
        ...existing,
        ...data,
        id: paymentId, // Ensure ID is preserved
        contractId, // Ensure contractId is preserved
        updatedAt: new Date().toISOString(),
      }
      const response = yield* Effect.tryPromise({
        try: () =>
          client.put<ContractPayment>(
            apiUrls.contracts.payments.update(contractId, paymentId),
            mergedData,
          ),
        catch: (error: unknown) => toApiError(error, 'payment', paymentId),
      })
      return response.data
    }),

  removePayment: (contractId: string, paymentId: string): Effect.Effect<void, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        await client.delete(apiUrls.contracts.payments.delete(contractId, paymentId))
      },
      catch: (error: unknown) => toApiError(error, 'payment', paymentId),
    }),

  // People
  getPeople: (contractId: string): Effect.Effect<ContractPerson[], ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        const response = await client.get<ContractPerson[]>(
          apiUrls.contracts.people.list(contractId),
        )
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'person'),
    }),

  addPerson: (
    contractId: string,
    data: ContractPersonFormValues,
  ): Effect.Effect<ContractPerson, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        const response = await client.post<ContractPerson>(
          apiUrls.contracts.people.create(contractId),
          data,
        )
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'person'),
    }),

  updatePerson: (
    contractId: string,
    personId: string,
    data: Partial<ContractPersonFormValues>,
  ): Effect.Effect<ContractPerson, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      // Fetch existing person to merge (JSON Server PUT replaces entire resource)
      const existingRes = yield* Effect.tryPromise({
        try: () =>
          client.get<ContractPerson>(apiUrls.contracts.people.detail(contractId, personId)),
        catch: (error: unknown) => toApiError(error, 'person', personId),
      })
      const existing = existingRes.data
      const mergedData = {
        ...existing,
        ...data,
        id: personId, // Ensure ID is preserved
        contractId, // Ensure contractId is preserved
        updatedAt: new Date().toISOString(),
      }
      const response = yield* Effect.tryPromise({
        try: () =>
          client.put<ContractPerson>(
            apiUrls.contracts.people.update(contractId, personId),
            mergedData,
          ),
        catch: (error: unknown) => toApiError(error, 'person', personId),
      })
      return response.data
    }),

  removePerson: (contractId: string, personId: string): Effect.Effect<void, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        await client.delete(apiUrls.contracts.people.delete(contractId, personId))
      },
      catch: (error: unknown) => toApiError(error, 'person', personId),
    }),

  // Financing
  getFinancing: (contractId: string): Effect.Effect<ContractFinancing, ApiError> =>
    Effect.gen(function* () {
      const client = getHttpClient()
      const response = yield* Effect.tryPromise({
        try: () => client.get<ContractFinancing[]>(apiUrls.contracts.financing.get(contractId)),
        catch: (error: unknown) => toApiError(error, 'financing', contractId),
      })

      // JSON Server returns an array for filtered queries, get first item
      const financing = Array.isArray(response.data) ? response.data[0] : response.data
      if (!financing) {
        return yield* Effect.fail(new NotFoundError({ resource: 'financing', id: contractId }))
      }
      return financing
    }),

  updateFinancing: (
    contractId: string,
    data: Partial<ContractFinancingFormValues>,
  ): Effect.Effect<ContractFinancing, ApiError> =>
    Effect.tryPromise({
      try: async () => {
        const client = getHttpClient()
        const response = await client.put<ContractFinancing>(
          apiUrls.contracts.financing.update(contractId),
          data,
        )
        return response.data
      },
      catch: (error: unknown) => toApiError(error, 'financing', contractId),
    }),
}
