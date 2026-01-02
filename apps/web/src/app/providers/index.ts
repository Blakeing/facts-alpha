/**
 * app/providers/index.ts
 *
 * Vue plugins and global providers
 */

import type { App } from 'vue'
import { vMaska } from 'maska/vue'
import { setupNProgress } from '@/app/providers/nprogress'
import pinia from '@/app/providers/pinia'
import { setupQuery } from '@/app/providers/query'
import router from '@/app/providers/router'
import vuetify from '@/app/providers/vuetify'

export function registerPlugins(app: App) {
  app.use(vuetify).use(router).use(pinia)
  app.directive('maska', vMaska)
  setupQuery(app)
  setupNProgress()
}
