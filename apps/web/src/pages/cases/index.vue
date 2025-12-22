<template>
  <FListCard
    v-model:search="search"
    :columns="columns"
    empty-icon="mdi-folder-open-outline"
    empty-subtitle="Create your first case to get started."
    empty-title="No cases found"
    fill-height
    :items="displayedCases"
    :loading="isLoading"
    :page-size="10"
    pagination
    search-placeholder="Search by name, case number..."
    :searchable="true"
    subtitle="Manage funeral cases and services"
    title="Cases"
    @click:row="handleRowClick"
  >
    <template #commands>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="router.push('/cases/create')"
      >
        New Case
      </FButton>
    </template>

    <!-- Status Filter Chips -->
    <template #filters>
      <div class="d-flex ga-2 mb-4">
        <v-chip
          v-for="status in statusFilters"
          :key="status.value"
          :color="selectedStatus === status.value ? status.color : undefined"
          :variant="selectedStatus === status.value ? 'flat' : 'outlined'"
          @click="selectedStatus = selectedStatus === status.value ? null : status.value"
        >
          {{ status.label }}
          <span
            v-if="status.count > 0"
            class="ml-1"
            >({{ status.count }})</span
          >
        </v-chip>
      </div>
    </template>

    <!-- Custom cell renderers via slots -->
    <template #item.status="{ item }">
      <CaseStatusBadge :status="(item as Case).status" />
    </template>

    <template #empty>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="router.push('/cases/create')"
      >
        Create First Case
      </FButton>
    </template>
  </FListCard>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { type Case, type CaseStatus, CaseStatusBadge, useCases } from '@/entities/case'
  import { formatDate } from '@/shared/lib'
  import { FButton, type FColumn, FListCard } from '@/shared/ui'

  const router = useRouter()
  const { isLoading, casesByStatus, filteredCases, search } = useCases()

  const selectedStatus = ref<CaseStatus | null>(null)

  // Column definitions using AG Grid's ColDef API (with `key` shorthand)
  const columns: FColumn<Case>[] = [
    { key: 'caseNumber', headerName: 'Case #', width: 120 },
    {
      key: 'decedentName',
      headerName: 'Decedent',
      valueGetter: (params) =>
        `${params.data?.decedent.lastName}, ${params.data?.decedent.firstName}`,
    },
    { key: 'status', headerName: 'Status', width: 140 },
    {
      key: 'dateOfDeath',
      headerName: 'Date of Death',
      width: 140,
      valueGetter: (params) => params.data?.decedent.dateOfDeath,
      valueFormatter: (params) => formatDate(params.value as string),
    },
    {
      key: 'nextOfKin',
      headerName: 'Next of Kin',
      valueGetter: (params) =>
        `${params.data?.nextOfKin.firstName} ${params.data?.nextOfKin.lastName} (${params.data?.nextOfKin.relationship})`,
    },
  ]

  const statusFilters = computed(() => [
    {
      value: 'pending' as CaseStatus,
      label: 'Pending',
      color: 'warning',
      count: casesByStatus.value.pending.length,
    },
    {
      value: 'active' as CaseStatus,
      label: 'Active',
      color: 'primary',
      count: casesByStatus.value.active.length,
    },
    {
      value: 'in_progress' as CaseStatus,
      label: 'In Progress',
      color: 'info',
      count: casesByStatus.value.in_progress.length,
    },
    {
      value: 'completed' as CaseStatus,
      label: 'Completed',
      color: 'success',
      count: casesByStatus.value.completed.length,
    },
    {
      value: 'archived' as CaseStatus,
      label: 'Archived',
      color: 'grey',
      count: casesByStatus.value.archived.length,
    },
  ])

  // Apply status filter on top of search filter
  const displayedCases = computed(() => {
    if (!selectedStatus.value) return filteredCases.value
    return filteredCases.value.filter((c: Case) => c.status === selectedStatus.value)
  })

  function handleRowClick(_event: Event, { item }: { item: unknown }) {
    const caseItem = item as Case
    router.push(`/cases/${caseItem.id}`)
  }
</script>
