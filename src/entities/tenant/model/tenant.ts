/**
 * entities/tenant/model/tenant.ts
 *
 * Tenant type definitions
 */

export interface Tenant {
  id: string
  name: string
  slug: string
  address?: TenantAddress
  phone?: string
  email?: string
  settings: TenantSettings
  createdAt: string
  updatedAt: string
}

export interface TenantAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface TenantSettings {
  timezone: string
  dateFormat: string
  currency: string
}

export function createDefaultTenant(): Partial<Tenant> {
  return {
    settings: {
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
  }
}
