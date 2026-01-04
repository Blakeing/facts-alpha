/**
 * Suspense helper composables
 *
 * Simplifies making route components async for Vue Suspense integration.
 * These composables delay component rendering until data is loaded,
 * ensuring the app bootstrapper shows until all route data is ready.
 *
 * ## Usage Pattern
 *
 * ### Basic: Single Query
 * ```vue
 * <script lang="ts" setup>
 *   import { useSuspenseReady } from '@/shared/lib'
 *   import { useMyQuery } from '@/entities/my-entity'
 *
 *   const route = useRoute()
 *   const id = computed(() => route.params.id as string)
 *
 *   // Fetch data
 *   const { data, isLoading, error } = useMyQuery(id)
 *
 *   // Wait for data to load before Suspense resolves
 *   // This keeps the bootstrapper visible until data is ready
 *   await useSuspenseReady(isLoading, () => !!(data.value || error.value))
 *
 *   // Component renders only after data is loaded or error occurs
 * </script>
 * ```
 *
 * ### Multiple Queries
 * ```vue
 * <script lang="ts" setup>
 *   import { useSuspenseReadyAll } from '@/shared/lib'
 *
 *   const { data1, isLoading: loading1 } = useQuery1()
 *   const { data2, isLoading: loading2 } = useQuery2()
 *
 *   // Wait for ALL queries to complete
 *   await useSuspenseReadyAll(loading1, loading2)
 * </script>
 * ```
 *
 * ### With Custom Ready Condition
 * ```vue
 * <script lang="ts" setup>
 *   const { data, isLoading } = useMyQuery()
 *
 *   // Wait until loading is false AND data has specific properties
 *   await useSuspenseReady(isLoading, () => {
 *     return !!(data.value?.id && data.value?.name)
 *   })
 * </script>
 * ```
 *
 * ## Important Notes
 *
 * 1. **Only use in route components** - These are meant for top-level route components
 *    that need to wait for data before rendering.
 *
 * 2. **Always include error in ready condition** - If you only check for data,
 *    Suspense will hang forever if there's an error. Use: `() => !!(data.value || error.value)`
 *
 * 3. **Use `useSuspenseReadyAll` for multiple queries** - Don't await multiple
 *    `useSuspenseReady` calls sequentially, use `useSuspenseReadyAll` instead.
 *
 * 4. **Component must be async** - The component's `<script setup>` must use `await`,
 *    which makes it async and compatible with Vue's `<Suspense>`.
 */

import type { Ref } from 'vue'
import { watch } from 'vue'

/**
 * Wait for a loading state to complete before Suspense resolves.
 * Returns a Promise that resolves when loading is false and condition is met.
 *
 * @param isLoading - Ref indicating loading state
 * @param readyCondition - Optional function that returns true when data is ready
 */
export function useSuspenseReady(
  isLoading: Ref<boolean>,
  readyCondition?: () => boolean,
): Promise<void> {
  return new Promise<void>((resolve) => {
    // Check if already ready
    const isReady = () => !isLoading.value && (readyCondition?.() ?? true)

    if (isReady()) {
      resolve()
      return
    }

    // Watch for loading to complete
    const stop = watch(
      isLoading,
      () => {
        if (isReady()) {
          stop()
          resolve()
        }
      },
      { immediate: true },
    )
  })
}

/**
 * Wait for multiple loading states to complete.
 * Useful when a component depends on multiple queries.
 *
 * @param loadingStates - Array of loading refs to wait for
 */
export function useSuspenseReadyAll(...loadingStates: Ref<boolean>[]): Promise<void> {
  return new Promise<void>((resolve) => {
    const allReady = () => loadingStates.every((l) => !l.value)

    if (allReady()) {
      resolve()
      return
    }

    const stop = watch(
      loadingStates,
      () => {
        if (allReady()) {
          stop()
          resolve()
        }
      },
      { immediate: true },
    )
  })
}
