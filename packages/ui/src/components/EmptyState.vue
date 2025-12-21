<template>
  <v-card
    :class="['text-center', 'pa-8', props.class]"
    flat
    variant="outlined"
  >
    <v-icon
      :color="iconColor"
      :icon="icon"
      size="64"
    />
    <v-card-title class="text-h5 mt-4">
      {{ title }}
    </v-card-title>
    <v-card-subtitle
      v-if="subtitle"
      class="text-body-1"
    >
      {{ subtitle }}
    </v-card-subtitle>
    <v-card-actions
      v-if="$slots.actions"
      class="justify-center mt-4"
    >
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  export interface EmptyStateProps {
    title: string
    subtitle?: string
    icon?: string
    iconColor?: string
    class?: string
  }

  const props = withDefaults(defineProps<EmptyStateProps>(), {
    icon: 'mdi-inbox-outline',
    iconColor: 'grey',
    subtitle: undefined,
    class: undefined,
  })
</script>
