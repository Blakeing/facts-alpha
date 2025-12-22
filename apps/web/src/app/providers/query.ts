/**
 * app/providers/query.ts
 *
 * TanStack Query (Vue Query) configuration for data fetching and caching
 */

import type { App } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before data is considered stale
      gcTime: 10 * 60 * 1000, // 10 minutes before unused data is garbage collected
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // ERP apps typically don't need this
    },
  },
})

export function setupQuery(app: App) {
  app.use(VueQueryPlugin, { queryClient })
}

export { queryClient }
