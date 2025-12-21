/**
 * shared/ui/toast/toastStore.ts
 *
 * Pinia store for global toast notification state
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ToastColor = 'success' | 'error' | 'warning' | 'info' | 'primary'

export interface Toast {
  id: number
  message: string
  color: ToastColor
  timeout: number
}

export interface ToastOptions {
  message: string
  color?: ToastColor
  timeout?: number
}

let toastId = 0

export const useToastStore = defineStore('toast', () => {
  const queue = ref<Toast[]>([])
  const visible = ref(false)

  const current = computed(() => queue.value[0] ?? null)

  function add(options: ToastOptions) {
    const toast: Toast = {
      id: ++toastId,
      message: options.message,
      color: options.color ?? 'info',
      timeout: options.timeout ?? 4000,
    }
    queue.value.push(toast)

    // Show immediately if not already showing
    if (!visible.value) {
      visible.value = true
    }
  }

  function dismiss() {
    visible.value = false
  }

  function onClose() {
    // Remove current toast and show next if available
    queue.value.shift()
    if (queue.value.length > 0) {
      // Small delay before showing next toast
      setTimeout(() => {
        visible.value = true
      }, 150)
    }
  }

  function clear() {
    queue.value = []
    visible.value = false
  }

  return {
    queue,
    visible,
    current,
    add,
    dismiss,
    onClose,
    clear,
  }
})
