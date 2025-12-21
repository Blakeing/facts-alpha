<template>
  <div v-if="caseItem">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center ga-4">
        <FButton
          intent="ghost"
          size="small"
          prepend-icon="mdi-arrow-left"
          @click="router.push('/cases')"
        >
          Back to Cases
        </FButton>
        <div>
          <div class="d-flex align-center ga-2">
            <h1 class="text-h4 font-weight-semibold">
              {{ caseItem.caseNumber }}
            </h1>
            <CaseStatusBadge :status="caseItem.status" />
          </div>
          <p class="text-body-2 text-medium-emphasis">
            {{ caseItem.decedent.lastName }}, {{ caseItem.decedent.firstName }}
            {{ caseItem.decedent.middleName }}
          </p>
        </div>
      </div>
      <div class="d-flex ga-2">
        <FButton
          intent="secondary"
          prepend-icon="mdi-pencil"
          @click="router.push(`/cases/${caseItem.id}/edit`)"
        >
          Edit
        </FButton>
        <FButton
          v-if="caseItem.status !== 'archived'"
          intent="ghost"
          prepend-icon="mdi-archive"
          @click="handleArchive"
        >
          Archive
        </FButton>
        <FButton
          intent="ghost"
          prepend-icon="mdi-delete"
          @click="showDeleteDialog = true"
        >
          Delete
        </FButton>
      </div>
    </div>

    <v-row>
      <!-- Decedent Information -->
      <v-col cols="12" md="6">
        <FCard title="Decedent Information">
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-account" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Full Name</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ caseItem.decedent.firstName }}
                {{ caseItem.decedent.middleName }}
                {{ caseItem.decedent.lastName }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="caseItem.decedent.dateOfBirth">
              <template #prepend>
                <v-icon icon="mdi-cake-variant" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Date of Birth</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ formatDate(caseItem.decedent.dateOfBirth) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-calendar" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Date of Death</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ formatDate(caseItem.decedent.dateOfDeath) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="caseItem.decedent.placeOfDeath">
              <template #prepend>
                <v-icon icon="mdi-map-marker" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Place of Death</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ caseItem.decedent.placeOfDeath }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="caseItem.decedent.veteranStatus">
              <template #prepend>
                <v-icon icon="mdi-shield-star" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Veteran Status</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                <v-chip color="primary" size="small" label>Veteran</v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </FCard>
      </v-col>

      <!-- Next of Kin -->
      <v-col cols="12" md="6">
        <FCard title="Next of Kin">
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-account" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Name</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ caseItem.nextOfKin.firstName }} {{ caseItem.nextOfKin.lastName }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-account-heart" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Relationship</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ caseItem.nextOfKin.relationship }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-phone" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Phone</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ formatPhone(caseItem.nextOfKin.phone) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="caseItem.nextOfKin.email">
              <template #prepend>
                <v-icon icon="mdi-email" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Email</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ caseItem.nextOfKin.email }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="caseItem.nextOfKin.address">
              <template #prepend>
                <v-icon icon="mdi-home" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Address</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ caseItem.nextOfKin.address.street }}<br>
                {{ caseItem.nextOfKin.address.city }}, {{ caseItem.nextOfKin.address.state }} {{ caseItem.nextOfKin.address.zip }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </FCard>
      </v-col>

      <!-- Services -->
      <v-col cols="12" md="6">
        <FCard title="Services">
          <div v-if="caseItem.services.length > 0" class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="service in caseItem.services"
              :key="service.id"
              color="primary"
              variant="tonal"
              label
            >
              {{ getServiceLabel(service.type) }}
            </v-chip>
          </div>
          <p v-else class="text-body-2 text-medium-emphasis">
            No services selected
          </p>
        </FCard>
      </v-col>

      <!-- Notes -->
      <v-col cols="12" md="6">
        <FCard title="Notes">
          <p v-if="caseItem.notes" class="text-body-1">
            {{ caseItem.notes }}
          </p>
          <p v-else class="text-body-2 text-medium-emphasis">
            No notes added
          </p>
        </FCard>
      </v-col>

      <!-- Case Info -->
      <v-col cols="12">
        <FCard title="Case Information">
          <v-row>
            <v-col cols="12" md="3">
              <div class="text-body-2 text-medium-emphasis">Case Number</div>
              <div class="text-body-1 font-weight-medium">{{ caseItem.caseNumber }}</div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-body-2 text-medium-emphasis">Status</div>
              <CaseStatusBadge :status="caseItem.status" class="mt-1" />
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-body-2 text-medium-emphasis">Created</div>
              <div class="text-body-1">{{ formatDate(caseItem.createdAt) }}</div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-body-2 text-medium-emphasis">Last Updated</div>
              <div class="text-body-1">{{ formatDate(caseItem.updatedAt) }}</div>
            </v-col>
          </v-row>
        </FCard>
      </v-col>
    </v-row>

    <!-- Delete Dialog -->
    <CaseDeleteDialog
      v-model="showDeleteDialog"
      :case-number="caseItem.caseNumber"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>

  <!-- Not Found -->
  <div v-else class="text-center py-12">
    <v-icon icon="mdi-folder-question-outline" size="64" color="grey" />
    <h2 class="text-h5 mt-4">Case Not Found</h2>
    <p class="text-body-1 text-medium-emphasis mt-2">
      The case you're looking for doesn't exist or has been removed.
    </p>
    <FButton
      intent="primary"
      class="mt-4"
      @click="router.push('/cases')"
    >
      Back to Cases
    </FButton>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FButton, FCard } from '@facts/ui'
import { formatDate, formatPhone } from '@facts/utils'
import { useCaseStore, CaseStatusBadge, type ServiceType } from '@/entities/case'
import { CaseDeleteDialog } from '@/features/case-form'

const route = useRoute()
const router = useRouter()
const caseStore = useCaseStore()

const showDeleteDialog = ref(false)
const isDeleting = ref(false)

const caseItem = computed(() => {
  const id = route.params.id as string
  return caseStore.cases.find((c) => c.id === id) || null
})

const serviceLabels: Record<ServiceType, string> = {
  visitation: 'Visitation',
  funeral: 'Funeral Service',
  graveside: 'Graveside Service',
  cremation: 'Cremation',
  memorial: 'Memorial Service',
  transport: 'Transport',
}

function getServiceLabel(type: ServiceType): string {
  return serviceLabels[type] || type
}

function handleArchive() {
  if (caseItem.value) {
    caseStore.updateCase(caseItem.value.id, { status: 'archived' })
  }
}

async function handleDelete() {
  if (!caseItem.value) return

  isDeleting.value = true
  try {
    caseStore.removeCase(caseItem.value.id)
    router.push('/cases')
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
  }
}
</script>

