<template>
  <FRoutePage
    :error="error"
    @retry="reload"
  >
    <FListCard
      :busy="isBusy"
      :columns="columns"
      edit-enabled
      empty-icon="mdi-file-document-outline"
      empty-subtitle="Create your first contract to get started."
      empty-title="No contracts found"
      :items="filteredContracts"
      :items-per-page="10"
      :loading="isLoading"
      pagination
      :searchable="false"
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

      <!-- Filters -->
      <template #filters>
        <div class="mb-4">
          <!-- Search field (custom - not using FListCard's built-in search to avoid double filtering) -->
          <v-text-field
            v-model="search"
            class="mb-3"
            clearable
            density="compact"
            hide-details
            label="Search"
            prepend-inner-icon="mdi-magnify"
            style="max-width: 400px"
            variant="outlined"
          />

          <!-- NeedType Filter Chips -->
          <div class="d-flex ga-2 mb-3">
            <v-chip
              v-for="needType in needTypeFilters"
              :key="needType.label"
              :color="needTypeFilter === needType.value ? 'primary' : undefined"
              variant="tonal"
              @click="needTypeFilter = needTypeFilter === needType.value ? null : needType.value"
            >
              {{ needType.label }}
            </v-chip>
          </div>

          <!-- Status Filter Chips -->
          <div class="d-flex ga-2">
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
        </div>
      </template>

      <!-- Custom cell renderers via slots -->
      <template #item.status="{ item }">
        <ContractStatusBadge :status="(item as ContractListing).status" />
      </template>

      <!-- Purchaser with co-buyers (aligned with legacy) -->
      <template #item.primaryBuyerName="{ item }">
        <div>
          {{ (item as ContractListing).primaryBuyerName || (item as ContractListing).purchaser }}
          <div
            v-if="
              (item as ContractListing).cobuyers && (item as ContractListing).cobuyers!.length > 0
            "
            class="text-caption text-medium-emphasis"
          >
            <div
              v-for="cobuyer in (item as ContractListing).cobuyers"
              :key="cobuyer"
            >
              {{ cobuyer }}
            </div>
          </div>
        </div>
      </template>

      <!-- Beneficiary (support both field names) -->
      <template #item.primaryBeneficiaryName="{ item }">
        {{
          (item as ContractListing).primaryBeneficiaryName ||
          (item as ContractListing).beneficiary ||
          ''
        }}
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
  </FRoutePage>
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
    NeedType,
    useContracts,
  } from '@/entities/contract'
  import { formatDate, readRequirement, SecurityOptionKeys, useSuspenseReady } from '@/shared/lib'
  import { FButton, type FColumn, FListCard, FRoutePage } from '@/shared/ui'

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
  const {
    search,
    statusFilter,
    needTypeFilter,
    filteredContracts,
    contractsByStatus,
    isLoading,
    error,
    reload,
  } = useContracts()

  // Parent awaits with ref - works because refs are reactive across async boundary
  // FRoutePage can't do this because suspended components don't receive prop updates
  await useSuspenseReady(isLoading)

  // Busy state for prefetching
  const isBusy = ref(false)

  // Column definitions (aligned with legacy app)
  const columns: FColumn<ContractListing>[] = [
    { key: 'contractNumber', title: 'Contract #', width: 160 },
    {
      key: 'date',
      title: 'Date',
      width: 120,
      valueFormatter: (params) => {
        const date = params.value as string | undefined
        return date ? formatDate(date) : ''
      },
      valueGetter: (params) => {
        const item = params.data as ContractListing
        return item.date || item.dateSigned || item.dateExecuted || ''
      },
    },
    { key: 'primaryBuyerName', title: 'Purchaser' },
    { key: 'primaryBeneficiaryName', title: 'Beneficiary' },
    { key: 'status', title: 'Status', width: 120 },
  ]

  const needTypeFilters = computed(() => [
    {
      value: NeedType.AT_NEED,
      label: 'At-Need Funeral',
    },
    {
      value: NeedType.PRE_NEED,
      label: 'Pre-Need Funeral',
    },
    {
      value: null,
      label: 'Cemetery',
    },
  ])

  const statusFilters = computed(() => [
    {
      value: 'Draft' as const,
      label: 'Draft',
      color: 'grey',
      count: contractsByStatus.value.Draft?.length ?? 0,
    },
    {
      value: 'Finalized' as const,
      label: 'Finalized',
      color: 'warning',
      count: contractsByStatus.value.Finalized?.length ?? 0,
    },
    {
      value: 'Executed' as const,
      label: 'Executed',
      color: 'success',
      count: contractsByStatus.value.Executed?.length ?? 0,
    },
    {
      value: 'Void' as const,
      label: 'Void',
      color: 'error',
      count: contractsByStatus.value.Void?.length ?? 0,
    },
  ])

  // Navigation handlers
  function handleAdd() {
    router.push('/contracts/new')
  }

  async function handleView(item: ContractListing) {
    // Guard against missing ID
    if (!item.id) {
      console.error('Contract listing has no ID:', item)
      return
    }

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
