<template>
  <FListCard
    v-model:search="search"
    :columns="columns"
    empty-icon="mdi-file-document-outline"
    empty-subtitle="Create your first contract to get started."
    empty-title="No contracts found"
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

    <template #item.contractNumber="{ item }">
      <span class="font-weight-medium">{{ item.contractNumber }}</span>
      <div
        v-if="item.prePrintedContractNumber"
        class="text-caption text-medium-emphasis"
      >
        {{ item.prePrintedContractNumber }}
      </div>
    </template>

    <template #item.status="{ item }">
      <ContractStatusBadge :status="item.status" />
    </template>

    <template #item.date="{ item }">
      {{ formatDate(item.date) }}
    </template>

    <template #item.grandTotal="{ item }">
      {{ formatCurrency(item.grandTotal) }}
    </template>

    <template #item.balanceDue="{ item }">
      <span :class="{ 'text-error': item.balanceDue > 0 }">
        {{ formatCurrency(item.balanceDue) }}
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
  import { computed, ref } from 'vue'
  import {
    type ContractListing,
    type ContractStatus,
    ContractStatusBadge,
    useContracts,
  } from '@/entities/contract'
  import { ContractDialog } from '@/features/contract-dialog'
  import { formatCurrency, formatDate } from '@/shared/lib'
  import { FButton, type FColumn, FListCard, useToast } from '@/shared/ui'

  const toast = useToast()
  const { isLoading, filteredContracts, contractsByStatus, search, statusFilter } = useContracts()

  // Dialog state
  const dialogVisible = ref(false)
  const selectedContractId = ref<string | null>(null)

  const columns: FColumn[] = [
    { key: 'contractNumber', title: 'Contract #', sortable: true, width: 160 },
    { key: 'date', title: 'Date', sortable: true, width: 120 },
    { key: 'purchaserName', title: 'Purchaser', sortable: true },
    { key: 'beneficiaryName', title: 'Beneficiary', sortable: true },
    { key: 'status', title: 'Status', sortable: true, width: 120 },
    { key: 'grandTotal', title: 'Total', sortable: true, width: 120, align: 'end' },
    { key: 'balanceDue', title: 'Balance', sortable: true, width: 120, align: 'end' },
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

  function openContract(_event: Event, { item }: { item: unknown }) {
    const contract = item as ContractListing
    selectedContractId.value = contract.id
    dialogVisible.value = true
  }

  function createContract() {
    selectedContractId.value = null
    dialogVisible.value = true
  }

  function handleSaved() {
    toast.success('Contract saved successfully')
  }
</script>
