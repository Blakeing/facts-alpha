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
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ContractDialog } from '@/features/contract-dialog'
  import { useToast } from '@/shared/ui'

  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  // Dialog is open when this route component is mounted
  const isOpen = ref(false)

  // Open dialog when component mounts
  onMounted(() => {
    isOpen.value = true
  })

  // Get contract ID from route params
  const contractId = computed(() => {
    const params = route.params as { id?: string; tab?: string }
    return params.id ?? ''
  })

  // Tab from route param, defaults to 'general'
  const currentTab = computed((): 'general' | 'items' | 'payments' => {
    const params = route.params as { id?: string; tab?: string }
    const tab = params.tab
    if (tab === 'items' || tab === 'payments') return tab
    return 'general'
  })

  // Handle tab changes by updating the route
  function handleTabChange(tab: string) {
    router.replace(`/contracts/${contractId.value}/edit/${tab}`)
  }

  function handleSaved(_contractId?: string) {
    // ContractId is optional - we already know it from the route
    toast.success('Contract saved successfully')
  }

  function handleClosed() {
    // Set isOpen to false - this triggers the close animation
    // Navigation happens in handleAfterLeave when animation completes
    isOpen.value = false
  }

  function handleAfterLeave() {
    // Called when dialog close animation completes - now safe to navigate
    router.push(`/contracts/${contractId.value}`)
  }
</script>
