import { EndpointsProvider } from '@/shared/config'
import { AuthService } from '@/shared/lib'
import { useUserContextStore } from '@/shared/lib'

export interface HttpClientConfig {
  baseUrl: string
  tenantId?: string
  token?: string
  timeout?: number
}

/**
 * Get tenant ID from user context
 */
function getTenantId(): string | undefined {
  const userContext = useUserContextStore()
  return userContext.tenantId
}

/**
 * Get auth token from auth service
 */
async function getAuthToken(): Promise<string | undefined> {
  const token = await AuthService.getAccessToken()
  return token ?? undefined
}

/**
 * Get API configuration for BFF
 * Always uses BFF endpoints from ep.json
 */
export async function getApiConfig(): Promise<HttpClientConfig> {
  // Get BFF URL from endpoints (ep.json)
  const endpoints = await EndpointsProvider.getEndpoints()
  const token = await getAuthToken()

  return {
    baseUrl: endpoints.bff + '/api/v1',
    tenantId: getTenantId(),
    token,
    timeout: 30_000,
  }
}
