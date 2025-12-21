<template>
  <v-avatar v-bind="$attrs">
    <v-img
      v-if="image"
      :src="image"
    />
    <v-icon
      v-else-if="icon"
      :icon="icon"
    />
    <span v-else-if="initials">{{ initials }}</span>
    <slot v-else />
  </v-avatar>
</template>

<script lang="ts">
  /**
   * FAvatar - User avatar with fallback support
   *
   * Displays image, icon, initials, or custom content.
   * All v-avatar props pass through via $attrs.
   * @see https://vuetifyjs.com/en/components/avatars/
   *
   * @example
   * // With image
   * <FAvatar image="/avatars/john.jpg" />
   *
   * @example
   * // With initials
   * <FAvatar initials="JD" color="primary" />
   *
   * @example
   * // With icon fallback
   * <FAvatar icon="mdi-account" size="large" />
   */
  export interface FAvatarProps {
    /** Image URL */
    image?: string
    /** Display initials (e.g., "JD" for John Doe) */
    initials?: string
    /** Fallback icon when no image/initials */
    icon?: string
  }
</script>

<script lang="ts" setup>
  withDefaults(defineProps<FAvatarProps>(), {
    image: undefined,
    initials: undefined,
    icon: undefined,
  })
</script>
