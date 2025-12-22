<template>
  <div>
    <PageHeader
      subtitle="Manage funeral cases and services"
      title="Cases"
    >
      <template #actions>
        <FButton
          intent="primary"
          prepend-icon="mdi-plus"
          @click="router.push('/cases/create')"
        >
          New Case
        </FButton>
      </template>
    </PageHeader>

    <!-- Status Filter Chips -->
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

    <!-- Search -->
    <FTextField
      v-model="search"
      class="mb-4"
      clearable
      placeholder="Search by name, case number..."
      prepend-inner-icon="mdi-magnify"
      style="max-width: 400px"
    />

    <!-- Data Table -->
    <FDataTable
      :columns="columns"
      empty-icon="mdi-folder-open-outline"
      empty-subtitle="Create your first case to get started."
      empty-title="No cases found"
      :items="displayedCases"
      :loading="isLoading"
      @click:row="handleRowClick"
    >
      <template #item.decedentName="{ item }">
        <span class="font-weight-medium">
          {{ item.decedent.lastName }}, {{ item.decedent.firstName }}
        </span>
      </template>

      <template #item.status="{ item }">
        <CaseStatusBadge :status="item.status" />
      </template>

      <template #item.dateOfDeath="{ item }">
        {{ formatDate(item.decedent.dateOfDeath) }}
      </template>

      <template #item.nextOfKin="{ item }">
        {{ item.nextOfKin.firstName }} {{ item.nextOfKin.lastName }}
        <span class="text-medium-emphasis">({{ item.nextOfKin.relationship }})</span>
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
    </FDataTable>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { type Case, type CaseStatus, CaseStatusBadge, useCases } from '@/entities/case'
  import { formatDate } from '@/shared/lib'
  import { FButton, type FColumn, FDataTable, FTextField, PageHeader } from '@/shared/ui'

  const router = useRouter()
  const { cases, isLoading, casesByStatus, filteredCases, search } = useCases()

  const selectedStatus = ref<CaseStatus | null>(null)

  const columns: FColumn[] = [
    { key: 'caseNumber', title: 'Case #', sortable: true, width: 120 },
    { key: 'decedentName', title: 'Decedent', sortable: true },
    { key: 'status', title: 'Status', sortable: true, width: 140 },
    { key: 'dateOfDeath', title: 'Date of Death', sortable: true, width: 140 },
    { key: 'nextOfKin', title: 'Next of Kin' },
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

  function handleRowClick(_event: Event, { item }: { item: Case }) {
    router.push(`/cases/${item.id}`)
  }
</script>
