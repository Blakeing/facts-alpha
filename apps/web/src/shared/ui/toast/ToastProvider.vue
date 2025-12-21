<template>
  <v-snackbar
    v-model="store.visible"
    :color="store.current?.color"
    location="bottom end"
    :timeout="store.current?.timeout ?? 4000"
    @update:model-value="handleClose"
  >
    {{ store.current?.message }}

    <template #actions>
      <v-btn
        icon="mdi-close"
        size="small"
        variant="text"
        @click="store.dismiss()"
      />
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
  /**
   * ToastProvider - Global toast notification display
   *
   * Add this component once in App.vue to enable toast notifications.
   */
  import { useToastStore } from './toastStore'

  const store = useToastStore()

  function handleClose(value: boolean) {
    if (!value) {
      store.onClose()
    }
  }
</script>
