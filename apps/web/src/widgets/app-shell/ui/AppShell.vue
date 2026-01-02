<!--
  AppShell Component - Main Application Layout

  @see https://vuetifyjs.com/en/components/navigation-drawers/
  @see https://vuetifyjs.com/en/components/app-bars/
-->
<template>
  <v-layout class="app-shell">
    <!-- Navigation Drawer with Rail Support -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="$vuetify.display.lgAndUp"
      :rail="rail"
      :temporary="!$vuetify.display.lgAndUp"
      @click="rail = false"
    >
      <!-- Brand Header -->
      <v-list nav>
        <v-list-item>
          <template v-if="!rail">
            <v-list-item-title class="text-subtitle-2 font-weight-bold">
              Funeral Home ERP
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption"> Contract Management </v-list-item-subtitle>
          </template>
        </v-list-item>
      </v-list>

      <v-divider />

      <!-- Primary Navigation -->
      <v-list
        density="compact"
        nav
      >
        <v-list-item
          v-for="item in navigation"
          :key="item.title"
          :active="!item.disabled && isActive(item.to)"
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.disabled ? undefined : item.to"
          :value="item.title"
        />
      </v-list>

      <!-- Bottom Section -->
      <template #append>
        <v-divider />
        <v-list
          density="compact"
          nav
        >
          <v-list-item
            v-for="item in secondaryNavigation"
            :key="item.title"
            :active="!item.disabled && isActive(item.to)"
            :disabled="item.disabled"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.disabled ? undefined : item.to"
            :value="item.title"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar flat>
      <v-app-bar-nav-icon
        v-if="!$vuetify.display.lgAndUp"
        @click="drawer = !drawer"
      />
      <v-btn
        v-if="$vuetify.display.lgAndUp"
        :icon="rail ? 'mdi-menu' : 'mdi-chevron-left'"
        variant="text"
        @click="rail = !rail"
      />
      <LocationSelector class="ml-4" />
      <v-spacer />
      <v-btn
        icon="mdi-magnify"
        variant="text"
      />
      <v-btn
        icon="mdi-bell-outline"
        variant="text"
      />
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="ml-2"
            icon
            variant="text"
          >
            <v-avatar
              color="primary"
              size="32"
            >
              <span class="text-on-primary">U</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list
          density="compact"
          min-width="200"
        >
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Profile"
          />
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Settings"
          />
          <v-divider class="my-1" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sign out"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="app-shell__main">
      <div class="app-shell__content">
        <slot />
      </div>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useUserContextStore } from '@/shared/lib'
  import { navigation, secondaryNavigation } from '../model/navigation'
  import LocationSelector from './LocationSelector.vue'

  const route = useRoute()
  const userContext = useUserContextStore()
  const drawer = ref(true)
  const rail = ref(false)

  function isActive(to: string) {
    return route.path === to || route.path.startsWith(to + '/')
  }

  // Load locations if not already loaded (auth initialization handles this, but ensure it's done)
  onMounted(async () => {
    // Locations are loaded during initFromAuth(), but ensure they're loaded if auth is already complete
    if (userContext.isAuthenticated && !userContext.locationsLoaded) {
      await userContext.loadLocations()
    }
  })
</script>

<style scoped>
  /* Ensure the layout fills viewport */
  .app-shell {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile */
  }

  /*
   * Main content area uses CSS Grid for reliable height distribution.
   * Grid handles nested height propagation better than flexbox.
   */
  .app-shell__main {
    display: grid;
    grid-template-rows: 1fr;
    overflow: hidden;
  }

  .app-shell__content {
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    padding: 24px;
    overflow-y: auto;
  }

  /*
   * Fill-height mode: child fills entire content area
   * The grid layout ensures height propagates through nested elements
   */
  .app-shell__content > :deep(.fill-height) {
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
  }

  /* Navigation drawer scrolls if content overflows */
  :deep(.v-navigation-drawer__content) {
    overflow-y: auto;
  }
</style>
