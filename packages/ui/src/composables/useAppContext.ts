/**
 * App Context - Shared state between app shell and UI components
 *
 * Provides a clean pattern for UI components to access app-level state
 * without tight coupling. Components can work standalone but gain
 * enhanced behavior when app context is provided.
 *
 * @example App.vue setup:
 * ```ts
 * import { provideAppContext, createAppContext } from '@facts/ui'
 *
 * const appContext = createAppContext()
 * provideAppContext(appContext)
 *
 * // When first route renders, call:
 * appContext.markFirstRouteComplete()
 * ```
 *
 * @example Component usage (automatic via inject):
 * ```ts
 * // FLoader automatically suppresses during bootstrap
 * // FFullScreenDialog automatically skips transition on first route
 * ```
 */

import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/**
 * App context state provided by the app shell
 */
export interface AppContext {
  /** Whether the app is currently bootstrapping (loading endpoints, auth, etc.) */
  isBootstrapping: ComputedRef<boolean>
  /** Whether this is the first route render after bootstrap (mutable, not reactive) */
  isFirstRoute: boolean
  /** Mark the first route as complete - call after initial render */
  markFirstRouteComplete: () => void
}

/** Injection key for app context */
export const APP_CONTEXT_KEY: InjectionKey<AppContext> = Symbol('app-context')

/**
 * Create app context state
 * @param isBootstrapping - Computed ref indicating if app is bootstrapping
 */
export function createAppContext(isBootstrapping: ComputedRef<boolean>): AppContext {
  // Use a plain boolean for isFirstRoute - no reactivity needed
  // Components capture the value at setup time
  let isFirstRoute = true

  // Pre-create the function to avoid closure recreation
  const markFirstRouteComplete = () => {
    // Use requestAnimationFrame to ensure components have captured the value
    requestAnimationFrame(() => {
      isFirstRoute = false
    })
  }

  const context: AppContext = {
    isBootstrapping,
    get isFirstRoute() {
      return isFirstRoute
    },
    markFirstRouteComplete,
  }

  return context
}

/**
 * Provide app context to child components
 */
export function provideAppContext(context: AppContext): void {
  provide(APP_CONTEXT_KEY, context)
}

/**
 * Inject app context (for internal use by UI components)
 * Returns undefined if not provided - components should handle gracefully
 */
export function useAppContext(): AppContext | undefined {
  return inject(APP_CONTEXT_KEY, undefined)
}
