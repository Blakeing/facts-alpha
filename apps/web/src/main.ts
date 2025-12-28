/**
 * main.ts
 *
 * Application entry point with authentication bootstrap
 */

import { createApp } from 'vue'
import { registerPlugins } from '@/app/index'
import { EndpointsProvider } from '@/shared/config/endpoints'
import { AuthService } from '@/shared/lib/auth'
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
  try {
    // Step 1: Load endpoints from ep.json
    await EndpointsProvider.getEndpoints()

    // Step 2: Initialize auth service with endpoint URLs
    await AuthService.initialize()

    // Step 3: Check if we're on the callback page (handled by callback.html)
    // If on main app, the router guard will handle auth checks

    // Step 4: Create and mount Vue application
    const app = createApp(App)
    registerPlugins(app)
    app.mount('#app')
  } catch (error) {
    console.error('[Bootstrap] Failed to start application:', error)

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
