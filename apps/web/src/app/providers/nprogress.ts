/**
 * app/providers/nprogress.ts
 *
 * NProgress configuration for navigation feedback
 */

import NProgress from 'nprogress'
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
 * Shows progress bar during route navigation
 */
export function setupNProgress() {
  router.beforeEach(() => {
    NProgress.start()
  })

  router.afterEach(() => {
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
