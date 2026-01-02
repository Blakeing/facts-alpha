<template>
  <FCard :title="displayName || 'New Person'">
    <template #prepend>
      <div class="d-flex gap-1 align-center">
        <v-chip
          v-if="personTypeLabel"
          color="primary"
          size="small"
          variant="tonal"
        >
          {{ personTypeLabel }}
        </v-chip>
        <v-chip
          v-if="isDeceased"
          color="error"
          size="small"
          variant="tonal"
        >
          Deceased
        </v-chip>
      </div>
    </template>
    <template #append>
      <div class="d-flex gap-1">
        <v-tooltip text="Edit Person">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              color="primary"
              :disabled="isReadOnly"
              icon
              size="small"
              variant="text"
              @click="$emit('edit')"
            >
              <v-icon>mdi-pencil-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Remove Person">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-if="canRemove"
              v-bind="tooltipProps"
              color="error"
              icon
              size="small"
              variant="text"
              @click="$emit('remove')"
            >
              <v-icon>mdi-delete-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </template>

    <div
      v-if="name"
      class="pa-4"
    >
      <v-row dense>
        <!-- Company Name -->
        <v-col
          v-if="name.companyName"
          cols="12"
        >
          <div class="text-body-2 mb-1"><strong>Company:</strong> {{ name.companyName }}</div>
        </v-col>

        <!-- Nickname / Maiden Name -->
        <v-col
          v-if="name.nickname || name.maidenName"
          cols="12"
          md="6"
        >
          <div
            v-if="name.nickname"
            class="text-body-2 mb-1"
          >
            <strong>Nickname:</strong> {{ name.nickname }}
          </div>
          <div
            v-if="name.maidenName"
            class="text-body-2 mb-1"
          >
            <strong>Maiden Name:</strong> {{ name.maidenName }}
          </div>
        </v-col>

        <!-- Dates -->
        <v-col
          v-if="name.birthDate || name.deathDate || name.age"
          cols="12"
          md="6"
        >
          <div
            v-if="name.birthDate"
            class="text-body-2 mb-1"
          >
            <strong>Date of Birth:</strong>
            {{ formatDate(name.birthDate, 'long') }}
          </div>
          <div
            v-if="name.deathDate"
            class="text-body-2 mb-1"
          >
            <strong>Date of Death:</strong>
            {{ formatDate(name.deathDate, 'long') }}
            <span
              v-if="name.timeOfDeath"
              class="text-caption text-medium-emphasis"
            >
              ({{ name.timeOfDeath }})
            </span>
          </div>
          <div
            v-if="name.age !== null && name.age !== undefined"
            class="text-body-2 mb-1"
          >
            <strong>Age:</strong> {{ name.age }}
          </div>
        </v-col>

        <!-- Identification -->
        <v-col
          v-if="name.nationalIdentifier || name.driversLicense"
          cols="12"
          md="6"
        >
          <div
            v-if="name.nationalIdentifier"
            class="text-body-2 mb-1"
          >
            <strong>SSN:</strong> {{ formatSSN(name.nationalIdentifier) }}
          </div>
          <div
            v-if="name.driversLicense"
            class="text-body-2 mb-1"
          >
            <strong>Driver's License:</strong>
            {{ name.driversLicense }}
            <span
              v-if="name.driversLicenseState"
              class="text-caption text-medium-emphasis"
            >
              ({{ name.driversLicenseState }})
            </span>
          </div>
        </v-col>

        <!-- Military -->
        <v-col
          v-if="name.isVeteran"
          cols="12"
          md="6"
        >
          <div class="text-body-2 mb-1">
            <strong>Veteran:</strong> Yes
            <span
              v-if="name.branchOfService !== undefined && name.branchOfService !== 0"
              class="text-caption text-medium-emphasis"
            >
              ({{ branchOfServiceController.getDescription(name.branchOfService) }})
            </span>
          </div>
        </v-col>

        <!-- Phone -->
        <v-col
          v-if="name.phones && name.phones.length > 0"
          cols="12"
          md="6"
        >
          <div class="text-body-2 mb-1">
            <strong>Phone:</strong>
            {{ name.phones[0]?.number }}
            <span
              v-if="name.phones.length > 1"
              class="text-caption text-medium-emphasis"
            >
              (+{{ name.phones.length - 1 }} more)
            </span>
          </div>
        </v-col>

        <!-- Email -->
        <v-col
          v-if="name.emailAddresses && name.emailAddresses.length > 0"
          cols="12"
          md="6"
        >
          <div class="text-body-2 mb-1">
            <strong>Email:</strong>
            {{ name.emailAddresses[0]?.address }}
            <span
              v-if="name.emailAddresses.length > 1"
              class="text-caption text-medium-emphasis"
            >
              (+{{ name.emailAddresses.length - 1 }} more)
            </span>
          </div>
        </v-col>

        <!-- Address -->
        <v-col
          v-if="name.addresses && name.addresses.length > 0"
          cols="12"
        >
          <div class="text-body-2">
            <strong>Address:</strong>
            {{ formatAddress(name.addresses[0]!) }}
          </div>
        </v-col>
      </v-row>
    </div>
    <div
      v-else
      class="pa-4 text-body-2 text-medium-emphasis"
    >
      No name information. Click "Edit" to add details.
    </div>
  </FCard>
</template>

<script lang="ts" setup>
  import type { Name } from '@/entities/name'
  import { formatAddress, formatDate, formatSSN } from '@facts/utils'
  import { branchOfServiceController } from '@/entities/name'
  import { FCard } from '@/shared/ui'

  defineProps<{
    name: Name | null | undefined
    displayName?: string
    personTypeLabel?: string
    isDeceased?: boolean
    isReadOnly?: boolean
    canRemove?: boolean
  }>()

  defineEmits<{
    edit: []
    remove: []
  }>()
</script>
