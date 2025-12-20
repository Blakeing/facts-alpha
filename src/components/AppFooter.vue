<template>
  <v-footer
    app
    class="px-6"
    color="transparent"
    height="64"
  >
    <div class="d-flex align-center justify-space-between w-100">
      <div class="text-body-2 text-medium-emphasis">
        © {{ new Date().getFullYear() }} Facts Alpha — Material 3 shell preview
      </div>
      <div class="d-flex ga-3">
        <v-chip
          color="primary"
          prepend-icon="mdi-palette-swatch"
          size="small"
          variant="tonal"
        >
          Design system
        </v-chip>
        <v-chip
          prepend-icon="mdi-help-circle-outline"
          size="small"
          variant="text"
        >
          Need help?
        </v-chip>
      </div>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  //
</script>
