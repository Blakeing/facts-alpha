<template>
  <div>
    <h1 class="text-h4 font-weight-semibold mb-2">Dashboard</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Welcome to the Funeral Home ERP. Select a module from the sidebar to get started.
    </p>

    <v-row>
      <v-col
        v-for="stat in stats"
        :key="stat.title"
        cols="12"
        md="3"
        sm="6"
      >
        <v-card variant="outlined">
          <v-card-item>
            <v-icon
              color="primary"
              :icon="stat.icon"
              size="32"
            />
            <v-card-title class="mt-2">{{ stat.value }}</v-card-title>
            <v-card-subtitle>{{ stat.title }}</v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  const stats = [
    { title: 'Active Cases', value: '0', icon: 'mdi-folder-open-outline' },
    { title: 'This Week', value: '0', icon: 'mdi-calendar-week' },
    { title: 'Pending Tasks', value: '0', icon: 'mdi-clipboard-check-outline' },
    { title: 'Locations', value: '1', icon: 'mdi-map-marker-outline' },
  ]
</script>
