<template>
  <FListCard
    v-model:search="list.search.value"
    :busy="editDialog.isBusy.value"
    :columns="columns"
    empty-icon="mdi-file-document-outline"
    empty-subtitle="Create your first contract to get started."
    empty-title="No contracts found"
    fill-height
    :items="list.filteredContracts.value"
    :loading="list.isLoading.value"
    search-placeholder="Search by contract #, name..."
    :searchable="true"
    subtitle="Manage funeral and cemetery contracts"
    title="Contracts"
    @click:row="handleRowClick"
  >
    <template #commands>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="showAdd"
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
          :color="list.statusFilter.value === status.value ? status.color : undefined"
          :variant="list.statusFilter.value === status.value ? 'flat' : 'outlined'"
          @click="
            list.statusFilter.value = list.statusFilter.value === status.value ? null : status.value
          "
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
        @click="showAdd"
      >
        Create First Contract
      </FButton>
    </template>
  </FListCard>

  <!-- Contract Dialog -->
  <ContractDialog
    v-model="editDialog.visible.value"
    :contract-id="editDialog.itemId.value"
    @saved="handleSaved"
  />
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import {
    contractApi,
    type ContractListing,
    ContractStatus,
    ContractStatusBadge,
    useContracts,
  } from '@/entities/contract'
  import { ContractDialog } from '@/features/contract-dialog'
  import { formatCurrency, formatDate } from '@/shared/lib'
  import { FButton, type FColumn, FListCard, useListController, useToast } from '@/shared/ui'

  const toast = useToast()

  // Use the list controller for standardized list/edit workflow
  // Just pass the fetch function and query key - prefetch is automatic!
  const { list, editDialog, showAdd, showEdit } = useListController({
    useList: useContracts,
    getItem: contractApi.get,
    queryKey: (id) => ['contract', id],
  })

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
      value: ContractStatus.DRAFT,
      label: 'Draft',
      color: 'grey',
      count: list.contractsByStatus.value.draft.length,
    },
    {
      value: ContractStatus.FINALIZED,
      label: 'Finalized',
      color: 'warning',
      count: list.contractsByStatus.value.finalized.length,
    },
    {
      value: ContractStatus.EXECUTED,
      label: 'Executed',
      color: 'success',
      count: list.contractsByStatus.value.executed.length,
    },
    {
      value: ContractStatus.VOID,
      label: 'Void',
      color: 'error',
      count: list.contractsByStatus.value.void.length,
    },
  ])

  function handleRowClick(_event: Event, { item }: { item: unknown }) {
    showEdit(item)
  }

  function handleSaved() {
    toast.success('Contract saved successfully')
  }
</script>
