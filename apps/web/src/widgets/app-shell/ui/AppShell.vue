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
            <v-list-item-subtitle class="text-caption"> Case Management </v-list-item-subtitle>
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
          :active="isActive(item.to)"
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
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
            :disabled="item.disabled"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
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
      <v-toolbar-title>{{ currentTitle }}</v-toolbar-title>
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
    <v-main scrollable>
      <v-container
        class="pa-6"
        fluid
      >
        <slot />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { navigation, secondaryNavigation } from '../model/navigation'

  const route = useRoute()
  const drawer = ref(true)
  const rail = ref(false)

  function isActive(to: string) {
    return route.path === to || route.path.startsWith(to + '/')
  }

  const currentTitle = computed(() => {
    const allNav = [...navigation, ...secondaryNavigation]
    const current = allNav.find((item) => isActive(item.to))
    return current?.title ?? 'Dashboard'
  })
</script>

<style scoped>
  /* Ensure the layout fills viewport and enables independent scrolling */
  .app-shell {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile */
  }

  /* Main content area scrolls independently */
  :deep(.v-main) {
    overflow-y: auto;
  }

  /* Navigation drawer scrolls if content overflows */
  :deep(.v-navigation-drawer__content) {
    overflow-y: auto;
  }
</style>
