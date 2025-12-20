/**
 * shared/api/httpClient.ts
 *
 * HTTP client wrapper with tenant-aware headers
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

interface HttpClient {
  get: <T>(url: string, options?: RequestOptions) => Promise<T>
  post: <T>(url: string, body?: unknown, options?: RequestOptions) => Promise<T>
  put: <T>(url: string, body?: unknown, options?: RequestOptions) => Promise<T>
  patch: <T>(url: string, body?: unknown, options?: RequestOptions) => Promise<T>
  delete: <T>(url: string, options?: RequestOptions) => Promise<T>
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value)
    }
  }
  return url.toString()
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...init } = options

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export const httpClient: HttpClient = {
  get: (url, options) => request('GET', url, undefined, options),
  post: (url, body, options) => request('POST', url, body, options),
  put: (url, body, options) => request('PUT', url, body, options),
  patch: (url, body, options) => request('PATCH', url, body, options),
  delete: (url, options) => request('DELETE', url, undefined, options),
}
