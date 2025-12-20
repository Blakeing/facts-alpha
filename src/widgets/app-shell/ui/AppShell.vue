<template>
  <v-layout>
    <v-navigation-drawer v-model="drawer">
      <v-list-item
        class="pa-4"
        :prepend-avatar="undefined"
      >
        <template #prepend>
          <v-avatar
            color="primary"
            size="40"
          >
            <span class="text-button text-white">FH</span>
          </v-avatar>
        </template>
        <v-list-item-title class="text-subtitle-1 font-weight-semibold">
          Funeral Home ERP
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption"> Case Management </v-list-item-subtitle>
      </v-list-item>

      <v-divider />

      <v-list
        density="compact"
        nav
      >
        <v-list-item
          v-for="item in navigation"
          :key="item.title"
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :value="item.title"
        />
      </v-list>

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

    <v-app-bar flat>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
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
      <v-menu>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
          >
            <v-avatar
              color="primary"
              size="32"
            >
              <span class="text-caption text-white">U</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Profile"
          />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sign out"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container
        class="py-6"
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

  const currentTitle = computed(() => {
    const allNav = [...navigation, ...secondaryNavigation]
    const current = allNav.find((item) => item.to === route.path)
    return current?.title ?? 'Dashboard'
  })
</script>
