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
      class="name-data-grid pa-4"
    >
      <!-- Company Name -->
      <div
        v-if="name.companyName"
        class="name-data-item name-data-item--full"
      >
        <div class="text-body-2"><strong>Company:</strong> {{ name.companyName }}</div>
      </div>

      <!-- Nickname -->
      <div
        v-if="name.nickname"
        class="name-data-item"
      >
        <div class="text-body-2"><strong>Nickname:</strong> {{ name.nickname }}</div>
      </div>

      <!-- Maiden Name -->
      <div
        v-if="name.maidenName"
        class="name-data-item"
      >
        <div class="text-body-2"><strong>Maiden Name:</strong> {{ name.maidenName }}</div>
      </div>

      <!-- Date of Birth -->
      <div
        v-if="name.birthDate"
        class="name-data-item"
      >
        <div class="text-body-2">
          <strong>Date of Birth:</strong>
          {{ formatDate(name.birthDate, 'long') }}
        </div>
      </div>

      <!-- Date of Death -->
      <div
        v-if="name.deathDate"
        class="name-data-item"
      >
        <div class="text-body-2">
          <strong>Date of Death:</strong>
          {{ formatDate(name.deathDate, 'long') }}
          <span
            v-if="name.timeOfDeath"
            class="text-caption text-medium-emphasis"
          >
            ({{ name.timeOfDeath }})
          </span>
        </div>
      </div>

      <!-- Age -->
      <div
        v-if="name.age !== null && name.age !== undefined"
        class="name-data-item"
      >
        <div class="text-body-2"><strong>Age:</strong> {{ name.age }}</div>
      </div>

      <!-- SSN -->
      <div
        v-if="name.nationalIdentifier"
        class="name-data-item"
      >
        <div class="text-body-2">
          <strong>SSN:</strong> {{ formatSSN(name.nationalIdentifier) }}
        </div>
      </div>

      <!-- Driver's License -->
      <div
        v-if="name.driversLicense"
        class="name-data-item"
      >
        <div class="text-body-2">
          <strong>Driver's License:</strong>
          {{ name.driversLicense }}
          <span
            v-if="name.driversLicenseState"
            class="text-caption text-medium-emphasis"
          >
            ({{ name.driversLicenseState }})
          </span>
        </div>
      </div>

      <!-- Veteran -->
      <div
        v-if="name.isVeteran"
        class="name-data-item"
      >
        <div class="text-body-2">
          <strong>Veteran:</strong> Yes
          <span
            v-if="name.branchOfService !== undefined && name.branchOfService !== 0"
            class="text-caption text-medium-emphasis"
          >
            ({{ branchOfServiceController.getDescription(name.branchOfService) }})
          </span>
        </div>
      </div>

      <!-- Phones by Type -->
      <div
        v-for="phoneType in availablePhoneTypes"
        :key="phoneType"
        class="name-data-item"
      >
        <div class="text-body-2">
          <strong>{{ phoneTypeController.getDescription(phoneType) }} Phone:</strong>
          {{ getPhoneByType(phoneType)?.number }}
          <v-chip
            v-if="getPhoneByType(phoneType)?.preferred"
            class="ml-1"
            color="primary"
            density="compact"
            size="small"
            variant="tonal"
          >
            Preferred
          </v-chip>
        </div>
      </div>

      <!-- Email -->
      <div
        v-if="name.emailAddresses && name.emailAddresses.length > 0"
        class="name-data-item"
      >
        <div class="text-body-2">
          <strong>Email:</strong>
          {{ name.emailAddresses[0]?.address }}
          <span
            v-if="name.emailAddresses.length > 1"
            class="text-caption text-medium-emphasis"
          >
            (+{{ name.emailAddresses.length - 1 }} more)
          </span>
        </div>
      </div>

      <!-- Address -->
      <div
        v-if="name.addresses && name.addresses.length > 0"
        class="name-data-item name-data-item--full"
      >
        <div class="text-body-2">
          <strong>Address:</strong>
          {{ formatAddress(name.addresses[0]!) }}
        </div>
      </div>
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
  import type { Name, NamePhone } from '@/entities/name'

  import { formatAddress, formatDate, formatSSN } from '@facts/utils'
  import { computed } from 'vue'

  import { branchOfServiceController, phoneTypeController } from '@/entities/name'
  import { PhoneType } from '@/entities/name/model/name'
  import { FCard } from '@/shared/ui'

  const props = defineProps<{
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

  const phoneTypes = [PhoneType.HOME, PhoneType.WORK, PhoneType.MOBILE, PhoneType.FAX]

  const availablePhoneTypes = computed(() => {
    return phoneTypes.filter((type) => getPhoneByType(type) !== undefined)
  })

  function getPhoneByType(type: PhoneType): NamePhone | undefined {
    return props.name?.phones?.find((phone) => phone.type === type)
  }
</script>

<style scoped>
  /* Vuetify doesn't have CSS Grid utilities, so we use minimal custom CSS for auto-fit behavior */
  .name-data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem; /* Could use Vuetify gap utilities, but custom value for consistency */
  }

  .name-data-item {
    min-width: 0; /* Prevents overflow */
  }

  .name-data-item--full {
    grid-column: 1 / -1; /* Spans all columns */
  }

  /* Responsive adjustments using Vuetify breakpoints */
  @media (max-width: 599px) {
    .name-data-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 960px) {
    .name-data-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .name-data-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
  }
</style>
