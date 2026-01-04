/**
 * main.ts
 *
 * Application entry point with authentication bootstrap
 */

import { createApp } from 'vue'
import { registerPlugins } from '@/app/index'
import { EndpointsProvider } from '@/shared/config'
import { AuthService, useBootstrapperStore } from '@/shared/lib'
import App from './App.vue'

import 'unfonts.css'

/**
 * Bootstrap the application:
 * 1. Load endpoint configuration (ep.json)
 * 2. Initialize authentication service
 * 3. Check for OIDC callback
 * 4. Mount Vue application
 */
async function bootstrap() {
  // Create app first so we can access Pinia store
  const app = createApp(App)
  registerPlugins(app)
  app.mount('#app')

  // Get bootstrapper store to track loading state
  const bootstrapper = useBootstrapperStore()

  try {
    // Step 1: Load endpoints from ep.json
    bootstrapper.setLoadingEndpoints(true)
    try {
      await EndpointsProvider.getEndpoints()
    } finally {
      bootstrapper.setLoadingEndpoints(false)
    }

    // Step 2: Initialize auth service with endpoint URLs
    bootstrapper.setInitializingAuth(true)
    try {
      await AuthService.initialize()
    } finally {
      bootstrapper.setInitializingAuth(false)
    }

    // Router guard will handle auth checks and navigation
  } catch (error) {
    console.error('[Bootstrap] Failed to start application:', error)

    // Reset bootstrapper state
    const bootstrapper = useBootstrapperStore()
    bootstrapper.reset()

    // Show error to user
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
        <div style="text-align: center;">
          <h1 style="color: #d32f2f;">Failed to Start Application</h1>
          <p>Unable to load configuration. Please refresh the page or contact support.</p>
          <pre style="background: #f5f5f5; padding: 10px; margin-top: 20px; text-align: left;">${error}</pre>
        </div>
      </div>
    `
  }
}

// Start the bootstrap process
bootstrap()
