<template>
  <ContractDialog
    v-model="isOpen"
    :contract-id="null"
    :initial-tab="initialTab"
    @after-leave="handleAfterLeave"
    @closed="handleClosed"
    @saved="handleSaved"
  />
</template>

<script lang="ts" setup>
  import { useQueryClient } from '@tanstack/vue-query'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { contractApi } from '@/entities/contract'
  import { ContractDialog } from '@/features/contract-dialog'
  import { useToast } from '@/shared/ui'

  const router = useRouter()
  const route = useRoute()
  const toast = useToast()
  const queryClient = useQueryClient()

  const isOpen = ref(false)
  const savedContractId = ref<string | null>(null)

  onMounted(() => {
    isOpen.value = true
  })

  const initialTab = computed(() => {
    const tab = route.query.tab as string
    if (tab === 'items' || tab === 'payments') return tab
    return 'general'
  })

  async function handleSaved(contractId?: string) {
    if (!contractId) return

    toast.success('Contract created successfully')
    savedContractId.value = contractId

    // Ensure detail page data is cached before closing (smooth transition)
    await queryClient.ensureQueryData({
      queryKey: ['contract', contractId],
      queryFn: () => contractApi.get(contractId),
    })

    isOpen.value = false
  }

  function handleClosed() {
    isOpen.value = false
  }

  function handleAfterLeave() {
    if (savedContractId.value) {
      router.push(`/contracts/${savedContractId.value}`)
    } else {
      router.push('/contracts')
    }
  }
</script>
