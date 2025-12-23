<template>
  <FListCard
    v-model:search="list.search.value"
    :busy="editDialog.isBusy.value"
    :columns="columns"
    empty-icon="mdi-map-marker-outline"
    empty-subtitle="Create your first location to get started."
    empty-title="No locations found"
    fill-height
    :items="list.filteredLocations.value"
    :loading="list.isLoading.value"
    search-placeholder="Search by ID, name, city..."
    :searchable="true"
    subtitle="Manage funeral homes and cemetery locations"
    title="Locations"
    @click:row="handleRowClick"
  >
    <template #commands>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="showAdd"
      >
        New Location
      </FButton>
    </template>

    <!-- Type Filter Chips -->
    <template #filters>
      <div class="d-flex ga-2 mb-4">
        <v-chip
          v-for="typeFilter in typeFilters"
          :key="typeFilter.value"
          :color="list.typeFilter.value === typeFilter.value ? typeFilter.color : undefined"
          :variant="list.typeFilter.value === typeFilter.value ? 'flat' : 'outlined'"
          @click="
            list.typeFilter.value =
              list.typeFilter.value === typeFilter.value ? null : typeFilter.value
          "
        >
          {{ typeFilter.label }}
          <span
            v-if="typeFilter.count > 0"
            class="ml-1"
          >
            ({{ typeFilter.count }})
          </span>
        </v-chip>
      </div>
    </template>

    <!-- Custom cell renderers via slots -->
    <template #item.type="{ item }">
      <LocationTypeBadge :type="(item as LocationListing).type" />
    </template>

    <template #item.active="{ item }">
      <v-icon
        :color="(item as LocationListing).active ? 'success' : 'grey'"
        :icon="(item as LocationListing).active ? 'mdi-check-circle' : 'mdi-close-circle'"
        size="small"
      />
    </template>

    <template #empty>
      <FButton
        intent="primary"
        prepend-icon="mdi-plus"
        @click="showAdd"
      >
        Create First Location
      </FButton>
    </template>
  </FListCard>

  <!-- Location Dialog -->
  <LocationDialog
    v-model="editDialog.visible.value"
    :location-id="editDialog.itemId.value"
    @saved="handleSaved"
  />
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import {
    locationApi,
    type LocationListing,
    type LocationType,
    LocationTypeBadge,
    useLocations,
  } from '@/entities/location'
  import { LocationDialog } from '@/features/location-dialog'
  import { FButton, type FColumn, FListCard, useListController, useToast } from '@/shared/ui'

  const toast = useToast()

  // Use the list controller for standardized list/edit workflow
  const { list, editDialog, showAdd, showEdit } = useListController({
    useList: useLocations,
    getItem: locationApi.get,
    queryKey: (id) => ['location', id],
  })

  // Column definitions
  const columns: FColumn<LocationListing>[] = [
    { key: 'identifier', headerName: 'ID', width: 100 },
    { key: 'name', headerName: 'Name' },
    { key: 'city', headerName: 'City', width: 150 },
    { key: 'state', headerName: 'State', width: 80 },
    { key: 'type', headerName: 'Type', width: 120 },
    { key: 'active', headerName: 'Active', width: 80 },
  ]

  const typeFilters = computed(() => [
    {
      value: 'funeral' as LocationType,
      label: 'Funeral',
      color: 'primary',
      count: list.locationsByType.value.funeral.length,
    },
    {
      value: 'cemetery' as LocationType,
      label: 'Cemetery',
      color: 'success',
      count: list.locationsByType.value.cemetery.length,
    },
    {
      value: 'corporate' as LocationType,
      label: 'Corporate',
      color: 'info',
      count: list.locationsByType.value.corporate.length,
    },
  ])

  function handleRowClick(_event: Event, { item }: { item: unknown }) {
    showEdit(item)
  }

  function handleSaved() {
    toast.success('Location saved successfully')
  }
</script>
