<template>
  <ContractDialog
    v-model="isOpen"
    :contract-id="contractId"
    :initial-tab="currentTab"
    @after-leave="handleAfterLeave"
    @closed="handleClosed"
    @saved="handleSaved"
    @tab-change="handleTabChange"
  />
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { ContractDialog, useContractDialogRoute } from '@/features/contract-dialog'
  import { useToast } from '@/shared/ui'

  const route = useRoute()
  const toast = useToast()

  // Get contract ID from route params
  const contractId = computed(() => {
    const params = route.params as { id?: string }
    return params.id ?? ''
  })

  const { isOpen, currentTab, handleTabChange, handleClosed, handleAfterLeave } =
    useContractDialogRoute({
      basePath: () => `/contracts/${contractId.value}/edit`,
      closePath: () => `/contracts/${contractId.value}`,
    })

  function handleSaved(_contractId?: string) {
    toast.success('Contract saved successfully')
  }
</script>
