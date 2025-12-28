<template>
  <FListCard
    v-model:search="list.search.value"
    :busy="editDialog.isBusy.value"
    :columns="columns"
    :edit-enabled="canEdit"
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
    @edit="showEdit"
  >
    <template #commands>
      <FButton
        v-if="canEdit"
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
        v-if="canEdit"
        intent="primary"
        prepend-icon="mdi-plus"
        @click="showAdd"
      >
        Create First Location
      </FButton>
      <p
        v-else
        class="text-medium-emphasis"
      >
        No locations available.
      </p>
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
  import { runEffect } from '@facts/effect'
  import { computed } from 'vue'
  import {
    LocationApi,
    type LocationListing,
    LocationType,
    LocationTypeBadge,
    useLocations,
  } from '@/entities/location'
  import { LocationDialog } from '@/features/location-dialog'
  import { readRequirement, SecurityOptionKeys, usePermissions } from '@/shared/lib'
  import { FButton, type FColumn, FListCard, useListController, useToast } from '@/shared/ui'

  // Route meta for permission-based access control
  definePage({
    meta: {
      title: 'Locations',
      permissions: readRequirement(SecurityOptionKeys.ManageLocations),
    },
  })

  const toast = useToast()

  // Permission checking - editKey requires Edit level
  const { canEdit } = usePermissions({
    editKey: SecurityOptionKeys.ManageLocations,
  })

  // Use the list controller for standardized list/edit workflow
  const { list, editDialog, showAdd, showEdit } = useListController({
    useList: useLocations,
    getItem: (id: string) => runEffect(LocationApi.get(id)),
    queryKey: (id) => ['location', id],
  })

  // Column definitions
  const columns: FColumn<LocationListing>[] = [
    { key: 'identifier', title: 'ID', width: 100 },
    { key: 'name', title: 'Name' },
    { key: 'city', title: 'City', width: 150 },
    { key: 'state', title: 'State', width: 80 },
    { key: 'type', title: 'Type', width: 120 },
    { key: 'active', title: 'Active', width: 80 },
  ]

  const typeFilters = computed(() => [
    {
      value: LocationType.FUNERAL,
      label: 'Funeral',
      color: 'primary',
      count: list.locationsByType.value[LocationType.FUNERAL].length,
    },
    {
      value: LocationType.CEMETERY,
      label: 'Cemetery',
      color: 'success',
      count: list.locationsByType.value[LocationType.CEMETERY].length,
    },
    {
      value: LocationType.CORPORATE,
      label: 'Corporate',
      color: 'info',
      count: list.locationsByType.value[LocationType.CORPORATE].length,
    },
  ])

  function handleSaved() {
    toast.success('Location saved successfully')
  }
</script>
