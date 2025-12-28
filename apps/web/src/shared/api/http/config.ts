export type ApiType = 'mock' | 'json-server' | 'bff'

export interface HttpClientConfig {
  baseUrl: string
  tenantId?: string
  token?: string
  timeout?: number
}

/**
 * Get tenant ID from user context
 * TODO: Wire this to actual auth state when implemented
 */
function getTenantId(): string | undefined {
  // For now, return undefined - will be wired to Pinia userContext later
  return undefined
}

/**
 * Get auth token from auth service
 * TODO: Wire this to actual auth state when implemented
 */
function getAuthToken(): string | undefined {
  // For now, return undefined - will be wired to auth service later
  return undefined
}

export function getApiConfig(): HttpClientConfig {
  const apiType = (import.meta.env.VITE_API_TYPE || 'json-server') as ApiType

  switch (apiType) {
    case 'json-server': {
      return {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
        timeout: 10_000,
      }
    }
    case 'bff': {
      return {
        baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
        tenantId: getTenantId(),
        token: getAuthToken(),
        timeout: 30_000,
      }
    }
    default: {
      // Mock mode - no longer supported, fallback to JSON Server
      return {
        baseUrl: 'http://localhost:3001/api/v1',
        timeout: 10_000,
      }
    }
  }
}

