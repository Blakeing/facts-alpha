<template>
  <FListCard
    v-model:search="search"
    :busy="isBusy"
    :columns="columns"
    edit-enabled
    empty-icon="mdi-file-document-outline"
    empty-subtitle="Create your first contract to get started."
    empty-title="No contracts found"
    fill-height
    :items="filteredContracts"
    :loading="isLoading"
    search-placeholder="Search by contract #, name..."
    :searchable="true"
    subtitle="Manage funeral and cemetery contracts"
    title="Contracts"
    @edit="handleView"
  >
    <template #commands>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="handleAdd"
      >
        New Contract
      </FButton>
    </template>

    <!-- Status Filter Chips -->
    <template #filters>
      <div class="d-flex ga-2 mb-4">
        <v-chip
          v-for="status in statusFilters"
          :key="status.value"
          :color="statusFilter === status.value ? status.color : undefined"
          variant="tonal"
          @click="statusFilter = statusFilter === status.value ? null : status.value"
        >
          {{ status.label }}
          <template
            v-if="status.count > 0"
            #append
          >
            <span class="ml-1"> ({{ status.count }}) </span>
          </template>
        </v-chip>
      </div>
    </template>

    <!-- Custom cell renderers via slots -->
    <template #item.saleStatus="{ item }">
      <ContractStatusBadge :status="(item as ContractListing).saleStatus" />
    </template>

    <template #item.balanceDue="{ item }">
      <span :class="{ 'text-error': (item as ContractListing).balanceDue > 0 }">
        {{ formatCurrency((item as ContractListing).balanceDue) }}
      </span>
    </template>

    <template #empty>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="handleAdd"
      >
        Create First Contract
      </FButton>
    </template>
  </FListCard>
</template>

<script lang="ts" setup>
  import { runEffectQuery } from '@facts/effect'
  import { useQueryClient } from '@tanstack/vue-query'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    ContractApi,
    type ContractListing,
    ContractStatusBadge,
    SaleStatus,
    useContracts,
  } from '@/entities/contract'
  import { formatCurrency, formatDate } from '@/shared/lib'
  import { readRequirement, SecurityOptionKeys } from '@/shared/lib/security'
  import { FButton, type FColumn, FListCard } from '@/shared/ui'

  // Route meta for permission-based access control
  definePage({
    meta: {
      title: 'Contracts',
      permissions: readRequirement(SecurityOptionKeys.ProcessContracts),
    },
  })

  const router = useRouter()
  const queryClient = useQueryClient()

  // Contract list data
  const { search, statusFilter, filteredContracts, contractsByStatus, isLoading } = useContracts()

  // Busy state for prefetching
  const isBusy = ref(false)

  // Column definitions
  const columns: FColumn<ContractListing>[] = [
    { key: 'contractNumber', title: 'Contract #', width: 160 },
    {
      key: 'dateSigned',
      title: 'Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value as string),
    },
    { key: 'primaryBuyerName', title: 'Buyer' },
    { key: 'primaryBeneficiaryName', title: 'Beneficiary' },
    { key: 'saleStatus', title: 'Status', width: 120 },
    {
      key: 'grandTotal',
      title: 'Total',
      width: 120,
      align: 'end',
      valueFormatter: (params) => formatCurrency(params.value as number),
    },
    { key: 'balanceDue', title: 'Balance', width: 120, align: 'end' },
  ]

  const statusFilters = computed(() => [
    {
      value: SaleStatus.DRAFT,
      label: 'Draft',
      color: 'grey',
      count: contractsByStatus.value.draft.length,
    },
    {
      value: SaleStatus.FINALIZED,
      label: 'Finalized',
      color: 'warning',
      count: contractsByStatus.value.finalized.length,
    },
    {
      value: SaleStatus.EXECUTED,
      label: 'Executed',
      color: 'success',
      count: contractsByStatus.value.executed.length,
    },
    {
      value: SaleStatus.VOID,
      label: 'Void',
      color: 'error',
      count: contractsByStatus.value.void.length,
    },
  ])

  // Navigation handlers
  function handleAdd() {
    router.push('/contracts/new')
  }

  async function handleView(item: ContractListing) {
    // Prefetch the contract data before navigating to detail page
    try {
      isBusy.value = true
      await queryClient.fetchQuery({
        queryKey: ['contract', item.id],
        queryFn: runEffectQuery(ContractApi.get(item.id)),
      })
    } catch {
      // Prefetch failed, but we can still navigate
      // The detail page will handle loading/error states
    } finally {
      isBusy.value = false
    }

    // Navigate to detail page (not edit)
    router.push(`/contracts/${item.id}`)
  }
</script>
