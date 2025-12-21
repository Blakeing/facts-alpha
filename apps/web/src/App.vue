<template>
  <v-app>
    <router-view />
    <ToastProvider />
  </v-app>
</template>

<script lang="ts" setup>
  import { ToastProvider } from '@/shared/ui'
</script>
