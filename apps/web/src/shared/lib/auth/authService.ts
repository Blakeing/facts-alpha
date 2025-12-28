/**
 * Authentication Service
 *
 * OIDC authentication using oidc-client-ts library.
 * Aligned with legacy Facts app authentication patterns.
 *
 * Configuration:
 * - Client ID: factsapp2
 * - Response Type: code (Authorization Code Flow with PKCE)
 * - Scopes: openid profile Facts offline_access
 */

import { Log, type User, UserManager, WebStorageStateStore } from 'oidc-client-ts'
import { EndpointsProvider } from '@/shared/config/endpoints'

const host = `${window.location.protocol}//${window.location.host}/`

/**
 * Check if running in local development
 */
const isLocalDev =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

/**
 * Build OIDC settings matching legacy Facts app configuration.
 * For local development, includes explicit metadata to bypass CORS issues
 * when fetching .well-known/openid-configuration
 */
function buildSettings(authority: string) {
  const baseSettings = {
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    authority,
    client_id: 'factsapp2',
    redirect_uri: host + 'callback.html',
    // automaticSilentRenew: true,
    // silent_redirect_uri: host + 'silent-renew.html',
    response_type: 'code',
    scope: 'openid profile Facts offline_access',
    post_logout_redirect_uri: host,
  }

  // For local development, provide explicit metadata to bypass CORS issues
  // The Identity Server may not allow CORS from localhost
  if (isLocalDev) {
    return {
      ...baseSettings,
      // Skip metadata fetch by providing endpoints directly
      metadata: {
        issuer: authority,
        authorization_endpoint: `${authority}/connect/authorize`,
        token_endpoint: `${authority}/connect/token`,
        userinfo_endpoint: `${authority}/connect/userinfo`,
        end_session_endpoint: `${authority}/connect/endsession`,
        jwks_uri: `${authority}/.well-known/openid-configuration/jwks`,
      },
    }
  }

  return baseSettings
}

// Disable OIDC logging (set to NONE to reduce console noise)
Log.setLevel(Log.NONE)

export class AuthService {
  private static instance: UserManager | null = null

  /**
   * Get access token for API calls (static method)
   */
  public static async getAccessToken(): Promise<string | null> {
    const user = await AuthService.instance?.getUser()
    return user?.access_token ?? null
  }

  /**
   * Initialize the UserManager with endpoint settings from ep.json
   */
  public static async initialize(): Promise<void> {
    if (AuthService.instance) return

    // Get the Identity Server URL from endpoints
    const eps = await EndpointsProvider.getEndpoints()

    const settings = buildSettings(eps.ids)
    AuthService.instance = new UserManager(settings)
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser()
    return !!user && !user.expired
  }

  /**
   * Get the current user from storage
   */
  public async getUser(): Promise<User | null> {
    await AuthService.initialize()
    return (await AuthService.instance?.getUser()) ?? null
  }

  /**
   * Initiate login flow
   * @param returnUrl - URL to return to after login
   */
  public async login(returnUrl?: string): Promise<void> {
    if (await this.isAuthenticated()) {
      return
    }

    await AuthService.instance?.signinRedirect({ state: returnUrl })
  }

  /**
   * Handle login callback (called from callback.html)
   */
  public async handleCallback(): Promise<User | undefined> {
    await AuthService.initialize()
    return await AuthService.instance?.signinRedirectCallback()
  }

  /**
   * Initiate logout flow
   */
  public async logout(): Promise<void> {
    if (!(await this.isAuthenticated())) {
      return
    }

    await AuthService.instance?.signoutRedirect()
  }

  /**
   * Get user profile from token
   */
  public async getUserProfile(): Promise<User['profile'] | null> {
    const user = await this.getUser()
    return user?.profile ?? null
  }
}

// Create singleton instance
export const authService = new AuthService()
