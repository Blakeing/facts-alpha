import type { DataSource } from '../base/types'
import { getHttpClient } from '../http/client'

/**
 * Factory to create HTTP-based data sources
 * Works with both JSON Server (now) and BFF (future)
 */
export function createHttpDataSource<TListing, TEntity, TForm>(endpoints: {
  list: string | ((locationId?: string) => string)
  detail: (id: string) => string
  create?: string
  update?: (id: string) => string
  delete?: (id: string) => string
}): DataSource<TListing, TEntity, TForm> {
  return {
    async list(locationId?: string) {
      const client = await getHttpClient()
      const url = typeof endpoints.list === 'function' ? endpoints.list(locationId) : endpoints.list

      // Add locationId as query param if provided and not already in the URL
      const finalUrl = locationId && typeof endpoints.list === 'string' ? `${url}?locationId=${locationId}` : url

      const response = await client.get<TListing[]>(finalUrl)
      return response.data
    },

    async get(id: string) {
      const client = await getHttpClient()
      const response = await client.get<TEntity>(endpoints.detail(id))
      return response.data
    },

    async create(data: TForm) {
      const client = await getHttpClient()
      const url = endpoints.create || (typeof endpoints.list === 'string' ? endpoints.list : '/unknown')
      const response = await client.post<TEntity>(url, data)
      return response.data
    },

    async update(id: string, data: Partial<TForm>) {
      const client = await getHttpClient()
      const url = endpoints.update?.(id) || endpoints.detail(id)
      const response = await client.put<TEntity>(url, data)
      return response.data
    },

    async delete(id: string) {
      const client = await getHttpClient()
      const url = endpoints.delete?.(id) || endpoints.detail(id)
      await client.delete(url)
    },
  }
}

