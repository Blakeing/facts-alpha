<template>
  <FListCard
    v-model:search="search"
    :busy="isLoadingContract"
    :columns="columns"
    empty-icon="mdi-file-document-outline"
    empty-subtitle="Create your first contract to get started."
    empty-title="No contracts found"
    fill-height
    :items="displayedContracts"
    :loading="isLoading"
    search-placeholder="Search by contract #, name..."
    :searchable="true"
    subtitle="Manage funeral and cemetery contracts"
    title="Contracts"
    @click:row="openContract"
  >
    <template #commands>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="createContract"
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
          :variant="statusFilter === status.value ? 'flat' : 'outlined'"
          @click="statusFilter = statusFilter === status.value ? null : status.value"
        >
          {{ status.label }}
          <span
            v-if="status.count > 0"
            class="ml-1"
          >
            ({{ status.count }})
          </span>
        </v-chip>
      </div>
    </template>

    <!-- Custom cell renderers via slots -->
    <template #item.status="{ item }">
      <ContractStatusBadge :status="(item as ContractListing).status" />
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
        @click="createContract"
      >
        Create First Contract
      </FButton>
    </template>
  </FListCard>

  <!-- Contract Dialog -->
  <ContractDialog
    v-model="dialogVisible"
    :contract-id="selectedContractId"
    @saved="handleSaved"
  />
</template>

<script lang="ts" setup>
  import { useQueryClient } from '@tanstack/vue-query'
  import { computed, ref } from 'vue'
  import {
    contractApi,
    type ContractListing,
    type ContractStatus,
    ContractStatusBadge,
    useContracts,
  } from '@/entities/contract'
  import { ContractDialog } from '@/features/contract-dialog'
  import { formatCurrency, formatDate } from '@/shared/lib'
  import { FButton, type FColumn, FListCard, useToast } from '@/shared/ui'

  const toast = useToast()
  const queryClient = useQueryClient()
  const { isLoading, filteredContracts, contractsByStatus, search, statusFilter } = useContracts()

  // Dialog state
  const dialogVisible = ref(false)
  const selectedContractId = ref<string | null>(null)
  const isLoadingContract = ref(false)

  // Column definitions using AG Grid's ColDef API (with `key` shorthand)
  const columns: FColumn<ContractListing>[] = [
    { key: 'contractNumber', headerName: 'Contract #', width: 160 },
    {
      key: 'date',
      headerName: 'Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value as string),
    },
    { key: 'purchaserName', headerName: 'Purchaser' },
    { key: 'beneficiaryName', headerName: 'Beneficiary' },
    { key: 'status', headerName: 'Status', width: 120 },
    {
      key: 'grandTotal',
      headerName: 'Total',
      width: 120,
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => formatCurrency(params.value as number),
    },
    { key: 'balanceDue', headerName: 'Balance', width: 120, cellStyle: { textAlign: 'right' } },
  ]

  const statusFilters = computed(() => [
    {
      value: 'draft' as ContractStatus,
      label: 'Draft',
      color: 'grey',
      count: contractsByStatus.value.draft.length,
    },
    {
      value: 'finalized' as ContractStatus,
      label: 'Finalized',
      color: 'warning',
      count: contractsByStatus.value.finalized.length,
    },
    {
      value: 'executed' as ContractStatus,
      label: 'Executed',
      color: 'success',
      count: contractsByStatus.value.executed.length,
    },
    {
      value: 'void' as ContractStatus,
      label: 'Void',
      color: 'error',
      count: contractsByStatus.value.void.length,
    },
  ])

  // Apply status filter
  const displayedContracts = computed(() => filteredContracts.value)

  async function openContract(_event: Event, { item }: { item: unknown }) {
    const contract = item as ContractListing

    try {
      isLoadingContract.value = true

      // Prefetch the contract data before opening dialog
      await queryClient.fetchQuery({
        queryKey: ['contract', contract.id],
        queryFn: () => contractApi.get(contract.id),
      })

      selectedContractId.value = contract.id
      dialogVisible.value = true
    } catch {
      toast.error('Failed to load contract')
    } finally {
      isLoadingContract.value = false
    }
  }

  function createContract() {
    selectedContractId.value = null
    dialogVisible.value = true
  }

  function handleSaved() {
    toast.success('Contract saved successfully')
  }
</script>
