<template>
  <v-layout class="bg-surface">
    <v-navigation-drawer
      v-model="drawer"
      border="sm"
      color="surface"
      elevation="2"
      floating
      :permanent="!isMobile"
      :rail="rail"
      rail-width="80"
      :temporary="isMobile"
      width="280"
    >
      <div class="px-3 py-4 d-flex align-center ga-3">
        <v-avatar color="primary" size="36">
          <span class="text-button text-white">FA</span>
        </v-avatar>
        <div v-if="!rail" class="text-subtitle-1 font-weight-semibold">
          Facts Alpha
        </div>
      </div>

      <v-list
        class="px-2"
        density="compact"
        nav
        rounded="lg"
      >
        <v-list-subheader :inset="rail">
          Workspaces
        </v-list-subheader>

        <v-list-item
          v-for="item in navigation"
          :key="item.title"
          :active="route.path === item.to"
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          rounded="lg"
          :title="item.title"
          :to="item.to"
        />
      </v-list>

      <v-divider class="my-2" />

      <v-list
        class="px-2"
        density="compact"
        nav
        rounded="lg"
      >
        <v-list-subheader :inset="rail">
          System
        </v-list-subheader>

        <v-list-item
          v-for="item in secondaryNav"
          :key="item.title"
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          rounded="lg"
          :title="item.title"
          :to="item.to"
        />
      </v-list>

      <template #append>
        <div class="px-3 pb-4 pt-2">
          <v-sheet
            border
            class="pa-3 d-flex align-center ga-3"
            color="surface-variant"
            rounded="lg"
          >
            <v-avatar color="secondary" size="36">
              <v-icon icon="mdi-lightbulb-on-outline" />
            </v-avatar>
            <div v-if="!rail" class="text-body-2">
              Ship ideas faster with a reusable design system shell.
            </div>
          </v-sheet>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      border="b"
      class="px-2 bg-surface"
      flat
      height="72"
    >
      <v-btn
        icon
        variant="text"
        @click="toggleNav"
      >
        <v-icon :icon="rail ? 'mdi-menu-open' : 'mdi-menu'" />
      </v-btn>

      <v-toolbar-title class="font-weight-semibold text-subtitle-1">
        App shell
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        aria-label="Search"
        icon
        variant="text"
      >
        <v-icon icon="mdi-magnify" />
      </v-btn>
      <v-btn
        aria-label="Notifications"
        icon
        variant="text"
      >
        <v-badge
          bordered
          color="error"
          content="3"
          floating
          offset-x="-2"
          offset-y="-2"
          size="x-small"
        >
          <v-icon icon="mdi-bell-outline" />
        </v-badge>
      </v-btn>
      <v-btn
        aria-label="Help"
        icon
        variant="text"
      >
        <v-icon icon="mdi-help-circle-outline" />
      </v-btn>
      <v-avatar
        class="ms-2"
        color="primary"
        size="36"
      >
        <span class="text-white text-body-2">BI</span>
      </v-avatar>
    </v-app-bar>

    <v-main class="bg-surface app-main">
      <v-container class="py-8 px-6 px-md-10" fluid>
        <router-view />
      </v-container>
      <AppFooter />
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
  import { computed, ref, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'

  const route = useRoute()
  const { smAndDown, mdAndUp } = useDisplay()
  const isMobile = computed(() => smAndDown.value)

  const drawer = ref(true)
  const railPreference = ref(true)
  const rail = computed(() => mdAndUp.value && railPreference.value)

  const navigation = [
    { title: 'Home', icon: 'mdi-compass-outline', to: '/' },
    { title: 'Datasets', icon: 'mdi-database-outline', to: '/datasets', disabled: true },
    { title: 'Playground', icon: 'mdi-flask-outline', to: '/playground', disabled: true },
    { title: 'Components', icon: 'mdi-view-grid-outline', to: '/components', disabled: true },
  ]

  const secondaryNav = [
    { title: 'Notifications', icon: 'mdi-bell-outline', to: '/notifications', disabled: true },
    { title: 'Settings', icon: 'mdi-cog-outline', to: '/settings', disabled: true },
    { title: 'Support', icon: 'mdi-lifebuoy', to: '/support', disabled: true },
  ]

  function toggleNav () {
    if (isMobile.value) {
      drawer.value = !drawer.value
    } else {
      railPreference.value = !railPreference.value
    }
  }

  watchEffect(() => {
    if (isMobile.value) {
      drawer.value = false
      railPreference.value = false
    } else {
      drawer.value = true
    }
  })
</script>

<style scoped>
  .app-main {
    min-height: calc(100vh - 72px);
  }
</style>
