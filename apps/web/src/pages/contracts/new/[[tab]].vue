<template>
  <ContractDialog
    v-model="isOpen"
    :contract-id="null"
    :initial-tab="currentTab"
    @after-leave="handleAfterLeave"
    @closed="handleClosed"
    @saved="handleSaved"
    @tab-change="handleTabChange"
  />
</template>

<script lang="ts" setup>
  import { runEffectQuery } from '@facts/effect'
  import { useQueryClient } from '@tanstack/vue-query'
  import { ref } from 'vue'
  import { ContractApi } from '@/entities/contract/api'
  import { ContractDialog, useContractDialogRoute } from '@/features/contract-dialog'
  import { editRequirement, SecurityOptionKeys } from '@/shared/lib/security'
  import { useToast } from '@/shared/ui'

  // Route meta - creating contracts requires edit permission
  definePage({
    meta: {
      title: 'New Contract',
      permissions: editRequirement(SecurityOptionKeys.ProcessContracts),
    },
  })

  const toast = useToast()
  const queryClient = useQueryClient()

  const savedContractId = ref<string | null>(null)

  const { isOpen, currentTab, handleTabChange, handleClosed, handleAfterLeave } =
    useContractDialogRoute({
      basePath: '/contracts/new',
      closePath: () =>
        savedContractId.value ? `/contracts/${savedContractId.value}` : '/contracts',
    })

  async function handleSaved(contractId?: string) {
    if (!contractId) return

    toast.success('Contract created successfully')
    savedContractId.value = contractId

    // Ensure detail page data is cached before closing (smooth transition)
    await queryClient.ensureQueryData({
      queryKey: ['contract', contractId],
      queryFn: runEffectQuery(ContractApi.get(contractId)),
    })

    isOpen.value = false
  }
</script>
