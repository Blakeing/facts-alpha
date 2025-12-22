/**
 * app/providers/index.ts
 *
 * Vue plugins and global providers
 */

import type { App } from 'vue'

import pinia from '@/app/providers/pinia'
import { setupQuery } from '@/app/providers/query'
import router from '@/app/providers/router'
import vuetify from '@/app/providers/vuetify'

export function registerPlugins(app: App) {
  app.use(vuetify).use(router).use(pinia)
  setupQuery(app)
}
