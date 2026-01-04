/**
 * app/providers/nprogress.ts
 *
 * NProgress configuration for navigation feedback
 * Suppressed during initial bootstrap (when AppBootstrapper is showing)
 */

import NProgress from 'nprogress'
import { useBootstrapperStore } from '@/shared/lib'
import router from './router'

import 'nprogress/nprogress.css'

// Configure NProgress
NProgress.configure({
  showSpinner: false, // Disable spinner (we have FLoader for that)
  minimum: 0.1,
  easing: 'ease',
  speed: 300,
})

/**
 * Setup NProgress with Vue Router
 * Shows progress bar during route navigation (but not during initial bootstrap)
 */
export function setupNProgress() {
  router.beforeEach(() => {
    const bootstrapper = useBootstrapperStore()
    // Only show NProgress if bootstrapper is not active
    // (during initial load, AppBootstrapper overlay takes precedence)
    if (!bootstrapper.isBootstrapping) {
      NProgress.start()
    }
  })

  router.afterEach(() => {
    // Always complete NProgress if it was started
    NProgress.done()
  })

  // Inject custom styles to match app theme
  injectStyles()
}

/**
 * Inject custom NProgress styles to match brand colors
 */
function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
    #nprogress .bar {
      background: rgb(var(--v-theme-primary)) !important;
      height: 3px !important;
    }
    #nprogress .peg {
      box-shadow: 0 0 10px rgb(var(--v-theme-primary)), 0 0 5px rgb(var(--v-theme-primary)) !important;
    }
  `
  document.head.append(style)
}

export { default as NProgress } from 'nprogress'
