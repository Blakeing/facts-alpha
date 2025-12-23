<template>
  <AppShell>
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </AppShell>
</template>

<script lang="ts" setup>
  import { AppShell } from '@/widgets'
</script>
