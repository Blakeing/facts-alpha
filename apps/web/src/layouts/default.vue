<template>
  <AppShell>
    <router-view v-slot="{ Component }">
      <!--
        KeepAlive caches page components to avoid AG Grid re-initialization flash.

        Trade-offs to watch for:
        - Stale data: TanStack Query handles via staleTime (5 min)
        - Stuck UI state: Use onActivated() to reset if needed
        - Memory: Limited to 10 most recent pages

        If issues arise, consider :include whitelist for specific pages.
      -->
      <KeepAlive :max="10">
        <component :is="Component" />
      </KeepAlive>
    </router-view>
  </AppShell>
</template>

<script lang="ts" setup>
  import { AppShell } from '@/widgets'
</script>
