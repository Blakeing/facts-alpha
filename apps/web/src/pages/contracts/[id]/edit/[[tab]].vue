<template>
  <ContractEditorProvider :contract-id="contractId">
    <ContractDialog
      v-model="isOpen"
      :initial-tab="currentTab"
      @after-leave="handleAfterLeave"
      @closed="handleClosed"
      @saved="handleSaved"
      @tab-change="handleTabChange"
    />
  </ContractEditorProvider>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { ContractDialog, useContractDialogRoute } from '@/features/contract-dialog'
  import { editRequirement, SecurityOptionKeys } from '@/shared/lib'
  import { useToast } from '@/shared/ui'
  import { ContractEditorProvider } from '@/widgets/contract-editor'

  // Route meta - editing contracts requires edit permission
  definePage({
    meta: {
      title: 'Edit Contract',
      permissions: editRequirement(SecurityOptionKeys.ProcessContracts),
    },
  })

  const route = useRoute()
  const toast = useToast()

  // Get contract ID from route params
  const contractId = computed(() => {
    const params = route.params as { id?: string }
    return params.id ?? ''
  })

  // Note: No Suspense needed here because:
  // 1. ContractEditorProvider uses FLoader for its loading state
  // 2. FLoader automatically suppresses during bootstrap
  // 3. This avoids creating duplicate XState machines

  const { isOpen, currentTab, handleTabChange, handleClosed, handleAfterLeave } =
    useContractDialogRoute({
      basePath: () => `/contracts/${contractId.value}/edit`,
      closePath: () => `/contracts/${contractId.value}`,
    })

  function handleSaved(_contractId?: string) {
    toast.success('Contract saved successfully')
  }
</script>
