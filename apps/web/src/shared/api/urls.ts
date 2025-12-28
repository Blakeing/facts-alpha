/**
 * Centralized API URL definitions
 * Matches BFF endpoint structure for easy migration
 *
 * Pattern from legacy: url.V1.locations.listing
 */
export const apiUrls = {
  locations: {
    listing: '/locations',
    detail: (id: string) => `/locations/${id}`,
    settings: (id: string) => `/locations/${id}/settings`,
  },

  contracts: {
    /**
     * Get contract listing for a location
     * Legacy endpoint: contracts/listing/{locationId}?fromDate={date}&toDate={date}&needType={AN|PN}
     */
    listing: (
      locationId: string,
      options?: {
        fromDate?: string
        toDate?: string
        needType?: number // NeedType enum value
      },
    ) => {
      const params = new URLSearchParams()
      if (options?.fromDate) params.append('fromDate', options.fromDate)
      if (options?.toDate) params.append('toDate', options.toDate)
      if (options?.needType !== undefined) params.append('needType', String(options.needType))
      const query = params.toString()
      return `/contracts/listing/${locationId}${query ? '?' + query : ''}`
    },
    detail: (id: string) => `/contracts/${id}`,
    create: '/contracts',
    update: (id: string) => `/contracts/${id}`,
    delete: (id: string) => `/contracts/${id}`,
    saveDraft: '/contracts/save/draft',
    saveAdjustment: '/contracts/save/adjustment',

    sales: {
      list: (contractId: string) => `/contracts/${contractId}/sales`,
      detail: (contractId: string, saleId: string) => `/contracts/${contractId}/sales/${saleId}`,
      create: (contractId: string) => `/contracts/${contractId}/sales`,
      update: (contractId: string, saleId: string) => `/contracts/${contractId}/sales/${saleId}`,
      delete: (contractId: string, saleId: string) => `/contracts/${contractId}/sales/${saleId}`,
    },

    people: {
      list: (contractId: string) => `/contracts/${contractId}/people`,
      detail: (contractId: string, personId: string) =>
        `/contracts/${contractId}/people/${personId}`,
      create: (contractId: string) => `/contracts/${contractId}/people`,
      update: (contractId: string, personId: string) =>
        `/contracts/${contractId}/people/${personId}`,
      delete: (contractId: string, personId: string) =>
        `/contracts/${contractId}/people/${personId}`,
    },

    payments: {
      list: (contractId: string) => `/contracts/${contractId}/payments`,
      detail: (contractId: string, paymentId: string) =>
        `/contracts/${contractId}/payments/${paymentId}`,
      create: (contractId: string) => `/contracts/${contractId}/payments`,
      update: (contractId: string, paymentId: string) =>
        `/contracts/${contractId}/payments/${paymentId}`,
      delete: (contractId: string, paymentId: string) =>
        `/contracts/${contractId}/payments/${paymentId}`,
    },

    financing: {
      get: (contractId: string) => `/contracts/${contractId}/financing`,
      update: (contractId: string) => `/contracts/${contractId}/financing`,
    },
  },

  sales: {
    items: {
      list: (saleId: string) => `/sales/${saleId}/items`,
      detail: (saleId: string, itemId: string) => `/sales/${saleId}/items/${itemId}`,
      create: (saleId: string) => `/sales/${saleId}/items`,
      update: (saleId: string, itemId: string) => `/sales/${saleId}/items/${itemId}`,
      delete: (saleId: string, itemId: string) => `/sales/${saleId}/items/${itemId}`,
    },
  },

  users: {
    /**
     * Get user effective permissions
     * Legacy endpoint: /usereffectivepermissions
     */
    userEffectivePermissions: '/usereffectivepermissions',
    /**
     * Get user session settings
     * Legacy endpoint: /usersession
     */
    userSession: '/usersession',
    /**
     * Post user session variable
     * Legacy endpoint: /usersession?key={key}&value={value}
     */
    postUserSessionVariable: (key: string, value: string) =>
      `/usersession?key=${key}&value=${value}`,
  },

  /**
   * Next ID generation endpoints
   * Legacy endpoints: /nextid, /nextids/{count}
   */
  nextId: '/nextid',
  nextIds: (count: number) => `/nextids/${count}`,
} as const

export type ApiUrls = typeof apiUrls
