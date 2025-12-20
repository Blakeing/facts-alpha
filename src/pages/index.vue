<template>
  <v-row class="ga-6">
    <v-col cols="12">
      <v-sheet
        border
        class="pa-6 pa-md-8 d-flex flex-column flex-md-row align-center justify-space-between ga-6"
        color="surface-variant"
        rounded="xl"
      >
        <div class="text-left">
          <div class="text-overline mb-2">Material 3</div>
          <h1 class="text-h4 text-sm-h3 font-weight-semibold mb-3">
            Application shell for the Facts Alpha design system
          </h1>
          <p class="text-body-1 mb-4">
            Adaptive navigation drawer, elevated app bar, and workspace-ready layout grounded in Material Design 3 guidance.
          </p>
          <div class="d-flex ga-3">
            <v-btn color="primary" prepend-icon="mdi-play-circle-outline">
              Start exploring
            </v-btn>
            <v-btn prepend-icon="mdi-compass-outline" variant="text">
              View patterns
            </v-btn>
          </div>
        </div>

        <v-sheet
          border
          class="pa-4 w-100"
          color="surface"
          max-width="360"
          rounded="lg"
        >
          <div class="text-subtitle-1 font-weight-semibold mb-3">
            System readiness
          </div>
          <v-progress-linear
            class="mb-4"
            color="primary"
            height="8"
            :model-value="42"
            rounded
          />
          <v-list
            density="compact"
            lines="one"
            nav
          >
            <v-list-item
              v-for="item in readiness"
              :key="item.title"
              :prepend-icon="item.icon"
              :subtitle="item.subtitle"
              :title="item.title"
            >
              <template #append>
                <v-chip
                  :color="item.statusColor"
                  density="comfortable"
                  size="small"
                  variant="elevated"
                >
                  {{ item.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-sheet>
    </v-col>

    <v-col v-for="card in overview" :key="card.title" cols="12" md="4">
      <v-card
        border
        class="h-100"
        color="primary"
        rounded="xl"
        variant="tonal"
      >
        <v-card-item>
          <v-avatar class="elevation-2" color="surface" size="42">
            <v-icon color="primary" :icon="card.icon" />
          </v-avatar>
          <v-card-title class="mt-3">
            {{ card.title }}
          </v-card-title>
          <v-card-subtitle class="text-body-2">
            {{ card.subtitle }}
          </v-card-subtitle>
        </v-card-item>
        <v-card-text class="pt-0">
          <div class="text-h5 font-weight-semibold mb-1">{{ card.count }}</div>
          <div class="text-caption text-medium-emphasis">{{ card.meta }}</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card
        border
        class="pa-4"
        rounded="xl"
      >
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <div class="text-subtitle-1 font-weight-semibold">Foundations</div>
            <div class="text-body-2 text-medium-emphasis">
              Tokens we will standardize across the product surfaces.
            </div>
          </div>
          <v-chip color="primary" prepend-icon="mdi-palette-swatch" variant="flat">
            M3-aligned
          </v-chip>
        </div>

        <v-row>
          <v-col
            v-for="token in foundations"
            :key="token.title"
            cols="12"
            md="3"
          >
            <v-sheet
              border
              class="pa-4 h-100"
              color="surface-variant"
              rounded="lg"
            >
              <div class="d-flex align-center ga-3 mb-2">
                <v-icon color="primary" :icon="token.icon" />
                <div class="text-subtitle-2 font-weight-medium">
                  {{ token.title }}
                </div>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ token.copy }}
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  const readiness = [
    {
      title: 'Navigation shell',
      subtitle: 'Rail + app bar interactions ready for iteration',
      icon: 'mdi-view-dashboard-outline',
      status: 'beta',
      statusColor: 'secondary',
    },
    {
      title: 'Component tokens',
      subtitle: 'Define roles for typography, color, and elevation',
      icon: 'mdi-format-paint',
      status: 'todo',
      statusColor: 'surface-variant',
    },
    {
      title: 'Documentation',
      subtitle: 'Usage guidance and migration notes',
      icon: 'mdi-notebook-edit-outline',
      status: 'draft',
      statusColor: 'warning',
    },
  ]

  const overview = [
    {
      title: 'Foundations',
      subtitle: 'Color, typography, spacing',
      icon: 'mdi-layers-outline',
      count: '6 token sets',
      meta: 'System-first tokens ready for review',
    },
    {
      title: 'Components',
      subtitle: 'UI primitives',
      icon: 'mdi-view-grid-plus-outline',
      count: '0 published',
      meta: 'Start from nav patterns',
    },
    {
      title: 'Templates',
      subtitle: 'Workflow scaffolds',
      icon: 'mdi-clipboard-flow-outline',
      count: '1 in progress',
      meta: 'Shell layout is live',
    },
  ]

  const foundations = [
    {
      title: 'Color',
      icon: 'mdi-palette-outline',
      copy: 'Use tonal palettes for light/dark with consistent surface roles.',
    },
    {
      title: 'Typography',
      icon: 'mdi-format-text-variant-outline',
      copy: 'Set a readable scale for titles, labels, and body copy.',
    },
    {
      title: 'Spacing',
      icon: 'mdi-border-vertical',
      copy: 'Align to a 4/8 px grid for rhythm and clarity.',
    },
    {
      title: 'Shape & elevation',
      icon: 'mdi-rounded-corner',
      copy: 'Apply M3-rounded corners and layered elevation for depth.',
    },
  ]
</script>
