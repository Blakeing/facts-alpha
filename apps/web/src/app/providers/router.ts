/**
 * app/providers/router.ts
 *
 * Vue Router configuration with auto-generated routes and permission guards.
 *
 * Permission checking is aligned with the legacy FACTS application:
 * - Routes can define `meta.permissions` for single requirement
 * - Routes can define `meta.permissionsAny` for multiple options (user needs one)
 * - Admin users bypass all permission checks
 * - Routes without permission meta are accessible to all authenticated users
 */

import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { authService } from '@/shared/lib/auth'
import { useUserContextStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

/**
 * Validate user has required permissions for a route.
 * Returns true if access is allowed, false otherwise.
 */
function validateRoutePermissions(
  userContext: ReturnType<typeof useUserContextStore>,
  meta: typeof router extends { currentRoute: { value: { meta: infer M } } } ? M : never,
): boolean {
  // No permission requirements = allow
  if (!meta.permissions && !meta.permissionsAny) {
    return true
  }

  // Admin bypasses all permission checks
  if (userContext.isAdmin) {
    return true
  }

  // Check single permission requirement
  if (meta.permissions && !userContext.userCanWithRequirement(meta.permissions)) {
    return false
  }

  // Check multiple permission options (need at least one)
  if (
    meta.permissionsAny &&
    meta.permissionsAny.length > 0 &&
    !userContext.userCanWithAnyRequirement(meta.permissionsAny)
  ) {
    return false
  }

  return true
}

/**
 * Flag to track if login redirect is in progress
 * Prevents multiple redirects during navigation
 */
let loginInProgress = false

/**
 * Navigation guard for authentication and permission checking.
 *
 * Flow:
 * 1. Check if route allows anonymous access
 * 2. Check authentication status
 * 3. Initialize user context if authenticated
 * 4. Validate permissions for the route
 */
router.beforeEach(async (to, _from) => {
  const userContext = useUserContextStore()

  // Skip auth check for anonymous routes
  if (to.meta.allowAnonymous) {
    return true
  }

  // Check authentication status
  let isAuthenticated = false
  try {
    isAuthenticated = await authService.isAuthenticated()
  } catch (error) {
    console.warn('[Router Guard] Error checking authentication:', error)
  }

  if (!isAuthenticated) {
    // Prevent multiple login redirects
    if (loginInProgress) {
      console.log('[Router Guard] Login already in progress, waiting...')
      return false
    }

    // Redirect to login, preserving the intended destination
    loginInProgress = true

    try {
      await authService.login(to.fullPath)
    } catch (error) {
      console.error('[Router Guard] Failed to redirect to login:', error)
      loginInProgress = false
      // Show error to user instead of infinite loop
      alert(
        'Unable to connect to authentication server. Please check your network connection and try again.',
      )
    }
    return false
  }

  // Reset login flag on successful auth
  loginInProgress = false

  // Initialize user context if not already done
  if (!userContext.currentUser) {
    try {
      await userContext.initFromAuth()
    } catch (error) {
      console.error('[Router Guard] Failed to initialize user context:', error)
      // If initialization fails, try login again
      try {
        await authService.login(to.fullPath)
      } catch {
        alert('Failed to load user data. Please try logging in again.')
      }
      return false
    }
  }

  // Validate permissions
  const hasPermission = validateRoutePermissions(userContext, to.meta)

  if (!hasPermission) {
    console.warn(
      `[Router Guard] Permission denied for route "${to.path}"`,
      '\nRequired:',
      to.meta.permissions || to.meta.permissionsAny,
      '\nUser admin:',
      userContext.isAdmin,
    )

    // Block access and redirect to home
    alert('You do not have permission to access this resource.')
    return { path: '/' }
  }

  return true
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      // Reload page to fix dynamic import error (Vite workaround)
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
