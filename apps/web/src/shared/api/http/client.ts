import type { HttpClientConfig } from './config'
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { AuthService, useUserContextStore } from '@/shared/lib'
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
    },
  })

  // Request interceptor for adding auth headers dynamically
  client.interceptors.request.use(
    async (reqConfig: InternalAxiosRequestConfig) => {
      // Get fresh token and tenant ID on each request
      const token = await AuthService.getAccessToken()
      const userContext = useUserContextStore()
      const tenantId = userContext.tenantId

      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`
      }

      if (tenantId) {
        reqConfig.headers['Tenant-Id'] = tenantId
      }

      return reqConfig
    },
    (error) => {
      throw error
    },
  )

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response?.status === 401) {
        console.warn('[HttpClient] 401 Unauthorized - redirecting to login')
        // Import authService dynamically to avoid circular dependency
        const { authService } = await import('@/shared/lib/auth')
        await authService.login(window.location.pathname)
      }

      // TODO: Add global error handling/toasts here
      throw error
    },
  )

  return client
}

/**
 * Singleton instance (lazy initialized)
 * Resets when environment changes (hot reload)
 */
let httpClient: AxiosInstance | null = null

export async function getHttpClient(): Promise<AxiosInstance> {
  if (!httpClient) {
    const config = await getApiConfig()
    httpClient = createHttpClient(config)
  }
  return httpClient
}

/**
 * Reset the HTTP client (useful for testing or re-initialization)
 */
export function resetHttpClient(): void {
  httpClient = null
}
