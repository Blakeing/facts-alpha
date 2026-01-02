<!--
  LocationSelector Component - Toolbar location dropdown

  Displays the current location and allows switching between available locations.
  Used in the AppShell toolbar for global location context.
-->
<template>
  <v-menu
    close-on-content-click
    location="bottom start"
    offset="4"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        append-icon="mdi-chevron-down"
        class="location-selector-btn"
        :loading="userContext.locationsLoading"
        :prepend-icon="locationIcon"
        :text="displayName"
      />
    </template>

    <v-list
      density="compact"
      min-width="280"
    >
      <v-list-subheader>Select Location</v-list-subheader>

      <v-list-item
        v-for="location in userContext.selectableLocations"
        :key="location.id"
        :active="location.id === userContext.currentLocationId"
        :append-icon="location.id === userContext.currentLocationId ? 'mdi-check' : undefined"
        append-icon-color="primary"
        :prepend-icon="getLocationIcon(location.type)"
        :prepend-icon-color="getLocationTypeColor(location.type)"
        :subtitle="location.identifier"
        :title="location.name"
        @click="handleSelect(location.id)"
      />

      <v-list-item
        v-if="userContext.selectableLocations.length === 0"
        disabled
        title="No locations available"
      />
    </v-list>
  </v-menu>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { getLocationTypeColor, LocationType } from '@/entities/location'
  import { useUserContextStore } from '@/shared/lib'

  const userContext = useUserContextStore()

  const displayName = computed(() => {
    if (userContext.locationsLoading) return 'Loading...'
    if (!userContext.currentLocation) return 'No Location'
    return userContext.currentLocation.name
  })

  const locationIcon = computed(() => {
    if (!userContext.currentLocation) return 'mdi-map-marker-outline'
    return getLocationIcon(userContext.currentLocation.type)
  })

  function getLocationIcon(type: LocationType): string {
    switch (type) {
      case LocationType.FUNERAL: {
        return 'mdi-home-city'
      }
      case LocationType.CEMETERY: {
        return 'mdi-grave-stone'
      }
      case LocationType.CORPORATE: {
        return 'mdi-office-building'
      }
      default: {
        return 'mdi-map-marker'
      }
    }
  }

  function handleSelect(locationId: string) {
    userContext.switchLocation(locationId)
  }
</script>
