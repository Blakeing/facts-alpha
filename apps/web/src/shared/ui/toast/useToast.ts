/**
 * shared/ui/toast/useToast.ts
 *
 * Composable for showing toast notifications
 */

import { type ToastOptions, useToastStore } from './toastStore'

export function useToast() {
  const store = useToastStore()

  return {
    /**
     * Show a toast with custom options
     */
    show(options: ToastOptions) {
      store.add(options)
    },

    /**
     * Show a success toast
     */
    success(message: string, timeout?: number) {
      store.add({ message, color: 'success', timeout })
    },

    /**
     * Show an error toast
     */
    error(message: string, timeout?: number) {
      store.add({ message, color: 'error', timeout: timeout ?? 6000 })
    },

    /**
     * Show a warning toast
     */
    warning(message: string, timeout?: number) {
      store.add({ message, color: 'warning', timeout })
    },

    /**
     * Show an info toast
     */
    info(message: string, timeout?: number) {
      store.add({ message, color: 'info', timeout })
    },

    /**
     * Dismiss the current toast
     */
    dismiss() {
      store.dismiss()
    },

    /**
     * Clear all toasts
     */
    clear() {
      store.clear()
    },
  }
}
