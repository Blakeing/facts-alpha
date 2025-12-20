<template>
  <v-card
    class="h-100"
    variant="outlined"
  >
    <v-card-item>
      <template #prepend>
        <v-avatar
          :color="statusColor"
          size="40"
        >
          <v-icon icon="mdi-folder-outline" />
        </v-avatar>
      </template>

      <v-card-title>
        {{ caseData.decedent.lastName }}, {{ caseData.decedent.firstName }}
      </v-card-title>

      <v-card-subtitle> Case #{{ caseData.caseNumber }} </v-card-subtitle>

      <template #append>
        <v-chip
          :color="statusColor"
          size="small"
          variant="tonal"
        >
          {{ statusLabel }}
        </v-chip>
      </template>
    </v-card-item>

    <v-card-text>
      <div class="d-flex flex-column ga-1 text-body-2">
        <div class="d-flex align-center ga-2">
          <v-icon
            icon="mdi-calendar"
            size="small"
          />
          <span>{{ formattedDateOfDeath }}</span>
        </div>
        <div class="d-flex align-center ga-2">
          <v-icon
            icon="mdi-account"
            size="small"
          />
          <span
            >{{ caseData.nextOfKin.firstName }} {{ caseData.nextOfKin.lastName }} ({{
              caseData.nextOfKin.relationship
            }})</span
          >
        </div>
        <div
          v-if="caseData.nextOfKin.phone"
          class="d-flex align-center ga-2"
        >
          <v-icon
            icon="mdi-phone"
            size="small"
          />
          <span>{{ caseData.nextOfKin.phone }}</span>
        </div>
      </div>
    </v-card-text>

    <v-card-actions v-if="showActions">
      <v-btn
        color="primary"
        size="small"
        variant="text"
        @click="$emit('view', caseData)"
      >
        View Details
      </v-btn>
      <v-spacer />
      <v-btn
        icon="mdi-dots-vertical"
        size="small"
        variant="text"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Case } from '../model/case'
  import { computed } from 'vue'
  import { formatDate } from '@/shared/lib/formatters'
  import { getStatusColor, getStatusLabel } from '../model/case'

  const props = withDefaults(
    defineProps<{
      caseData: Case
      showActions?: boolean
    }>(),
    {
      showActions: true,
    },
  )

  defineEmits<{
    view: [caseData: Case]
  }>()

  const statusColor = computed(() => getStatusColor(props.caseData.status))
  const statusLabel = computed(() => getStatusLabel(props.caseData.status))

  const formattedDateOfDeath = computed(() => formatDate(props.caseData.decedent.dateOfDeath))
</script>
