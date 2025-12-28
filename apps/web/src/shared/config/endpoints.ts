/**
 * Endpoint Configuration Provider
 *
 * Loads endpoint URLs from ep.json at runtime, allowing environment switching
 * without rebuilding the application.
 *
 * Pattern aligned with legacy Facts app EndpointsProvider.
 */

import axios, { type AxiosInstance } from 'axios'

export interface EndpointSettings {
  /** BFF (Backend for Frontend) base URL */
  bff: string
  /** SignalR hub URL for real-time updates */
  signalr: string
  /** Identity Server URL for OIDC authentication */
  ids: string
  /** Reports service URL */
  reports: string
  /** PSPDFKit license key */
  pspdfkit?: string
  /** Google Places API key */
  googlePlacesApiKey?: string
}

export class EndpointsProvider {
  private static settings: EndpointSettings | null = null

  /**
   * Get endpoint settings from ep.json.
   * Results are cached after first fetch.
   */
  static async getEndpoints(): Promise<EndpointSettings> {
    if (EndpointsProvider.settings) {
      return EndpointsProvider.settings
    }

    const client = EndpointsProvider.getAxiosInstance(15_000)
    const request = await client.get<EndpointSettings>('ep.json')

    if (request.status !== 200) {
      throw new Error('Unable to retrieve endpoint addresses')
    }

    if (!request.data) {
      throw new Error('Unable to retrieve endpoint addresses')
    }

    EndpointsProvider.settings = request.data

    // Validate required endpoints
    if (
      !EndpointsProvider.settings.bff ||
      !EndpointsProvider.settings.ids ||
      !EndpointsProvider.settings.signalr ||
      !EndpointsProvider.settings.reports
    ) {
      throw new Error('Expected endpoint addresses were not found in ep.json')
    }

    return EndpointsProvider.settings
  }

  /**
   * Reset cached settings (useful for testing)
   */
  static reset(): void {
    EndpointsProvider.settings = null
  }

  /**
   * Create an axios instance for fetching ep.json from the public directory
   */
  private static getAxiosInstance(timeout: number): AxiosInstance {
    let url = ''

    url =
      window.location.origin ??
      window.location.protocol +
        '//' +
        window.location.hostname +
        (window.location.port ? ':' + window.location.port : '')

    return axios.create({
      baseURL: url,
      withCredentials: false,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout,
    })
  }
}
