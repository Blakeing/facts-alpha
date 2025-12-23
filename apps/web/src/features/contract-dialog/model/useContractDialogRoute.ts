import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export type ContractTab = 'general' | 'items' | 'payments'

interface UseContractDialogRouteOptions {
  /**
   * Base path for tab routing (e.g., '/contracts/new' or '/contracts/123/edit')
   * Tab will be appended: basePath + '/' + tab
   */
  basePath: string | (() => string)
  /**
   * Path to navigate to when dialog closes
   */
  closePath: string | (() => string)
}

/**
 * Composable for managing contract dialog route-based tab navigation.
 *
 * Handles the common pattern of:
 * - Reading current tab from route params
 * - Updating route when tab changes
 * - Managing dialog open/close state
 *
 * @example
 * ```ts
 * // For new contract: /contracts/new/[[tab]]
 * const { isOpen, currentTab, handleTabChange, handleClosed, handleAfterLeave } =
 *   useContractDialogRoute({
 *     basePath: '/contracts/new',
 *     closePath: '/contracts',
 *   })
 *
 * // For edit contract: /contracts/[id]/edit/[[tab]]
 * const { isOpen, currentTab, handleTabChange, handleClosed, handleAfterLeave } =
 *   useContractDialogRoute({
 *     basePath: () => `/contracts/${contractId.value}/edit`,
 *     closePath: () => `/contracts/${contractId.value}`,
 *   })
 * ```
 */
export function useContractDialogRoute(options: UseContractDialogRouteOptions) {
  const router = useRouter()
  const route = useRoute()

  // Dialog open state
  const isOpen = ref(false)

  // Open dialog when component mounts
  onMounted(() => {
    isOpen.value = true
  })

  // Tab from route param, defaults to 'general'
  const currentTab = computed((): ContractTab => {
    const params = route.params as { tab?: string }
    const tab = params.tab
    if (tab === 'items' || tab === 'payments') return tab
    return 'general'
  })

  // Resolve path option (can be string or getter function)
  const getBasePath = () =>
    typeof options.basePath === 'function' ? options.basePath() : options.basePath

  const getClosePath = () =>
    typeof options.closePath === 'function' ? options.closePath() : options.closePath

  /**
   * Handle tab changes by updating the route.
   * Uses router.replace to avoid adding to history stack.
   */
  function handleTabChange(tab: string) {
    const basePath = getBasePath()
    // Don't include 'general' in URL - it's the default
    const tabPath = tab === 'general' ? '' : tab
    router.replace(`${basePath}/${tabPath}`)
  }

  /**
   * Close the dialog (triggers close animation).
   * Navigation happens in handleAfterLeave when animation completes.
   */
  function handleClosed() {
    isOpen.value = false
  }

  /**
   * Called when dialog close animation completes.
   * Navigates to the close path.
   */
  function handleAfterLeave() {
    router.push(getClosePath())
  }

  return {
    isOpen,
    currentTab,
    handleTabChange,
    handleClosed,
    handleAfterLeave,
  }
}
