import type { HttpClientConfig } from './config'
import axios, { type AxiosInstance } from 'axios'
import { getApiConfig } from './config'

/**
 * Create configured HTTP client
 * Pattern from legacy: app.client with Tenant-Id and Authorization headers
 */
export function createHttpClient(config: HttpClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout || 10_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(config.tenantId && { 'Tenant-Id': config.tenantId }),
      ...(config.token && { Authorization: `Bearer ${config.token}` }),
    },
  })

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // TODO: Add refresh token logic here when auth is implemented
      // TODO: Add global error handling/toasts here
      return Promise.reject(error)
    },
  )

  return client
}

/**
 * Singleton instance (lazy initialized)
 * Resets when environment changes (hot reload)
 */
let httpClient: AxiosInstance | null = null

export function getHttpClient(): AxiosInstance {
  if (!httpClient) {
    httpClient = createHttpClient(getApiConfig())
  }
  return httpClient
}

/**
 * Reset the HTTP client (useful for testing or re-initialization)
 */
export function resetHttpClient(): void {
  httpClient = null
}
