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
      :items="filteredCases"
      :loading="caseStore.isLoading"
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
  import type { Case, CaseStatus } from '@/entities/case/model/case'
  import { FButton, type FColumn, FDataTable, FTextField, PageHeader } from '@facts/ui'
  import { formatDate } from '@facts/utils'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCaseStore } from '@/entities/case'
  import CaseStatusBadge from '@/entities/case/ui/CaseStatusBadge.vue'

  const router = useRouter()
  const caseStore = useCaseStore()

  const search = ref('')
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
      count: caseStore.casesByStatus.pending.length,
    },
    {
      value: 'active' as CaseStatus,
      label: 'Active',
      color: 'primary',
      count: caseStore.casesByStatus.active.length,
    },
    {
      value: 'in_progress' as CaseStatus,
      label: 'In Progress',
      color: 'info',
      count: caseStore.casesByStatus.in_progress.length,
    },
    {
      value: 'completed' as CaseStatus,
      label: 'Completed',
      color: 'success',
      count: caseStore.casesByStatus.completed.length,
    },
    {
      value: 'archived' as CaseStatus,
      label: 'Archived',
      color: 'grey',
      count: caseStore.casesByStatus.archived.length,
    },
  ])

  const filteredCases = computed(() => {
    let result = caseStore.cases

    // Filter by status
    if (selectedStatus.value) {
      result = result.filter((c) => c.status === selectedStatus.value)
    }

    // Filter by search
    if (search.value) {
      const searchLower = search.value.toLowerCase()
      result = result.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(searchLower) ||
          c.decedent.firstName.toLowerCase().includes(searchLower) ||
          c.decedent.lastName.toLowerCase().includes(searchLower) ||
          c.nextOfKin.firstName.toLowerCase().includes(searchLower) ||
          c.nextOfKin.lastName.toLowerCase().includes(searchLower),
      )
    }

    return result
  })

  function handleRowClick(_event: Event, { item }: { item: Case }) {
    router.push(`/cases/${item.id}`)
  }
</script>
