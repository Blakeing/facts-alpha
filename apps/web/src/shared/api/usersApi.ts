/**
 * Users API
 *
 * API client for user-related operations including permissions
 * Aligned with legacy Facts app endpoints
 */

import type { UserEffectivePermissions } from '@/shared/lib'
import { getHttpClient } from './http/client'
import { apiUrls } from './urls'

export interface UserSettingsModel {
  timeout?: number
  lastLocationId: string
}

export class UsersApi {
  /**
   * Get the current user's effective permissions
   * Legacy endpoint: GET /api/v1/usereffectivepermissions
   */
  async getUserPermissions(): Promise<UserEffectivePermissions> {
    const client = await getHttpClient()
    const response = await client.get<UserEffectivePermissions>(
      apiUrls.users.userEffectivePermissions,
    )
    return response.data
  }

  /**
   * Get user session settings
   * Legacy endpoint: GET /api/v1/usersession
   */
  async getUserSettings(): Promise<UserSettingsModel> {
    const client = await getHttpClient()
    const response = await client.get<UserSettingsModel>(apiUrls.users.userSession)
    return response.data
  }
}

export const usersApi = new UsersApi()
