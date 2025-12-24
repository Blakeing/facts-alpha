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
  if (meta.permissions) {
    if (!userContext.userCanWithRequirement(meta.permissions)) {
      return false
    }
  }

  // Check multiple permission options (need at least one)
  if (meta.permissionsAny && meta.permissionsAny.length > 0) {
    if (!userContext.userCanWithAnyRequirement(meta.permissionsAny)) {
      return false
    }
  }

  return true
}

/**
 * Navigation guard for permission checking.
 *
 * Currently operates in "soft" mode during development:
 * - Logs permission failures to console
 * - Does not block navigation (allows testing)
 *
 * TODO: When auth is integrated, switch to "hard" mode:
 * - Redirect unauthenticated users to login
 * - Block and redirect unauthorized users
 */
router.beforeEach((to, _from) => {
  const userContext = useUserContextStore()

  // Skip permission check for anonymous routes
  if (to.meta.allowAnonymous) {
    return true
  }

  // TODO: When auth is integrated, check authentication here
  // if (!userContext.isAuthenticated) {
  //   return { name: 'login', query: { redirect: to.fullPath } }
  // }

  // Validate permissions
  const hasPermission = validateRoutePermissions(userContext, to.meta)

  if (!hasPermission) {
    // Development mode: log and allow (for testing)
    console.warn(
      `[Router Guard] Permission denied for route "${to.path}"`,
      '\nRequired:',
      to.meta.permissions || to.meta.permissionsAny,
      '\nUser admin:',
      userContext.isAdmin,
      '\nUser permissions:',
      userContext.userPermissions,
    )

    // TODO: When auth is integrated, uncomment to enforce:
    // alert('You do not have permission to access this resource.')
    // return { path: '/' }
  }

  return true
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
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
