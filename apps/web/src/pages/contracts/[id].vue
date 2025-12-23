<template>
  <FLoader v-model="isLoading" />

  <!-- Contract Detail View (always rendered) -->
  <div v-if="contract">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center ga-4">
        <FButton
          intent="ghost"
          prepend-icon="mdi-arrow-left"
          size="small"
          @click="router.push('/contracts')"
        >
          Back to Contracts
        </FButton>
        <div>
          <div class="d-flex align-center ga-2">
            <h1 class="text-h4 font-weight-semibold">
              {{ contract.contractNumber }}
            </h1>
            <ContractStatusBadge :status="contract.status" />
          </div>
          <p class="text-body-2 text-medium-emphasis">
            {{ contract.beneficiary.lastName }}, {{ contract.beneficiary.firstName }} ·
            {{ getContractTypeLabel(contract.type) }}
          </p>
        </div>
      </div>
      <div class="d-flex ga-2">
        <FButton
          intent="primary"
          prepend-icon="mdi-pencil"
          @click="router.push(`/contracts/${contract.id}/edit/general`)"
        >
          Edit Contract
        </FButton>
        <FButton
          intent="ghost"
          prepend-icon="mdi-printer"
        >
          Print
        </FButton>
      </div>
    </div>

    <!-- Completion Status Banner (if draft) -->
    <v-alert
      v-if="contract.status === ContractStatus.DRAFT && missingFields.length > 0"
      class="mb-6"
      color="warning"
      icon="mdi-alert-circle-outline"
      variant="tonal"
    >
      <div class="d-flex align-center justify-space-between">
        <div>
          <strong>Contract Incomplete</strong>
          <div class="text-body-2">Missing: {{ missingFields.join(', ') }}</div>
        </div>
        <FButton
          intent="tonal"
          size="small"
          @click="router.push(`/contracts/${contract.id}/edit/general`)"
        >
          Complete Now
        </FButton>
      </div>
    </v-alert>

    <v-row>
      <!-- People Section -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Purchaser">
          <v-list
            class="bg-transparent"
            density="compact"
          >
            <v-list-item>
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-account"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Name</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ contract.purchaser.firstName }} {{ contract.purchaser.lastName }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="contract.purchaser.phone">
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-phone"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Phone</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ formatPhone(contract.purchaser.phone) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="contract.purchaser.email">
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-email"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Email</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ contract.purchaser.email }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="contract.purchaser.address">
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-map-marker"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis"
                >Address</v-list-item-title
              >
              <v-list-item-subtitle class="text-body-1">
                {{ contract.purchaser.address.street }}<br />
                {{ contract.purchaser.address.city }}, {{ contract.purchaser.address.state }}
                {{ contract.purchaser.address.zip }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </FCard>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Beneficiary">
          <v-list
            class="bg-transparent"
            density="compact"
          >
            <v-list-item>
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-account"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Name</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ contract.beneficiary.firstName }} {{ contract.beneficiary.lastName }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="contract.beneficiary.dateOfDeath">
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-calendar"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis"
                >Date of Death</v-list-item-title
              >
              <v-list-item-subtitle class="text-body-1">
                {{ formatDate(contract.beneficiary.dateOfDeath) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="contract.beneficiary.dateOfBirth">
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-cake-variant"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis"
                >Date of Birth</v-list-item-title
              >
              <v-list-item-subtitle class="text-body-1">
                {{ formatDate(contract.beneficiary.dateOfBirth) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </FCard>
      </v-col>

      <!-- Financial Summary -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Financial Summary">
          <v-table density="compact">
            <tbody>
              <tr>
                <td class="text-medium-emphasis">Subtotal</td>
                <td class="text-end">{{ formatCurrency(contract.subtotal) }}</td>
              </tr>
              <tr v-if="contract.discountTotal > 0">
                <td class="text-medium-emphasis">Discounts</td>
                <td class="text-end text-success">-{{ formatCurrency(contract.discountTotal) }}</td>
              </tr>
              <tr>
                <td class="text-medium-emphasis">Tax</td>
                <td class="text-end">{{ formatCurrency(contract.taxTotal) }}</td>
              </tr>
              <tr class="font-weight-bold">
                <td>Grand Total</td>
                <td class="text-end">{{ formatCurrency(contract.grandTotal) }}</td>
              </tr>
              <tr>
                <td class="text-medium-emphasis">Amount Paid</td>
                <td class="text-end text-success">{{ formatCurrency(contract.amountPaid) }}</td>
              </tr>
              <tr :class="{ 'text-error': contract.balanceDue > 0 }">
                <td class="font-weight-bold">Balance Due</td>
                <td class="text-end font-weight-bold">{{ formatCurrency(contract.balanceDue) }}</td>
              </tr>
            </tbody>
          </v-table>
        </FCard>
      </v-col>

      <!-- Items Summary -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard :title="`Items (${contract.items?.length || 0})`">
          <v-list
            v-if="contract.items && contract.items.length > 0"
            class="bg-transparent"
            density="compact"
          >
            <v-list-item
              v-for="item in contract.items.slice(0, 5)"
              :key="item.id"
            >
              <v-list-item-title>{{ item.description }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.quantity }} × {{ formatCurrency(item.unitPrice) }}
              </v-list-item-subtitle>
              <template #append>
                <span class="text-body-2">{{ formatCurrency(item.total) }}</span>
              </template>
            </v-list-item>
            <v-list-item v-if="contract.items.length > 5">
              <v-list-item-title class="text-primary">
                + {{ contract.items.length - 5 }} more items
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <p
            v-else
            class="text-body-2 text-medium-emphasis pa-4"
          >
            No items added yet
          </p>
          <template #actions>
            <FButton
              intent="text"
              size="small"
              @click="router.push(`/contracts/${contract.id}/edit/items`)"
            >
              View All Items
            </FButton>
          </template>
        </FCard>
      </v-col>

      <!-- Payments Summary -->
      <v-col cols="12">
        <FCard :title="`Payments (${contract.payments?.length || 0})`">
          <v-list
            v-if="contract.payments && contract.payments.length > 0"
            class="bg-transparent"
            density="compact"
          >
            <v-list-item
              v-for="payment in contract.payments"
              :key="payment.id"
            >
              <template #prepend>
                <v-icon
                  class="mr-2"
                  :icon="getPaymentIcon(payment.method)"
                  size="small"
                />
              </template>
              <v-list-item-title>
                {{ formatDate(payment.date) }} - {{ getPaymentMethodLabel(payment.method) }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="payment.reference">
                Ref: {{ payment.reference }}
              </v-list-item-subtitle>
              <template #append>
                <span class="text-body-1 text-success font-weight-medium">
                  {{ formatCurrency(payment.amount) }}
                </span>
              </template>
            </v-list-item>
          </v-list>
          <p
            v-else
            class="text-body-2 text-medium-emphasis pa-4"
          >
            No payments recorded yet
          </p>
          <template #actions>
            <FButton
              intent="text"
              size="small"
              @click="router.push(`/contracts/${contract.id}/edit/payments`)"
            >
              Manage Payments
            </FButton>
          </template>
        </FCard>
      </v-col>

      <!-- Contract Info -->
      <v-col cols="12">
        <FCard title="Contract Information">
          <v-row>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Contract Number</div>
              <div class="text-body-1 font-weight-medium">{{ contract.contractNumber }}</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Contract Type</div>
              <div class="text-body-1">{{ getContractTypeLabel(contract.type) }}</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Contract Date</div>
              <div class="text-body-1">{{ formatDate(contract.date) }}</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Status</div>
              <ContractStatusBadge
                class="mt-1"
                :status="contract.status"
              />
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Created</div>
              <div class="text-body-1">{{ formatDate(contract.createdAt) }}</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Last Updated</div>
              <div class="text-body-1">{{ formatDate(contract.updatedAt) }}</div>
            </v-col>
          </v-row>
        </FCard>
      </v-col>
    </v-row>
  </div>

  <!-- Not Found -->
  <div
    v-else-if="!isLoading"
    class="text-center py-12"
  >
    <v-icon
      color="grey"
      icon="mdi-file-document-alert-outline"
      size="64"
    />
    <h2 class="text-h5 mt-4">Contract Not Found</h2>
    <p class="text-body-1 text-medium-emphasis mt-2">
      The contract you're looking for doesn't exist or has been removed.
    </p>
    <FButton
      class="mt-4"
      intent="primary"
      @click="router.push('/contracts')"
    >
      Back to Contracts
    </FButton>
  </div>

  <!-- Child routes (edit dialog) render here as overlay -->
  <RouterView />
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    contractApi,
    ContractStatus,
    ContractStatusBadge,
    getContractTypeLabel,
  } from '@/entities/contract'
  import { formatCurrency, formatDate, formatPhone } from '@/shared/lib'
  import { FButton, FCard, FLoader } from '@/shared/ui'

  const route = useRoute()
  const router = useRouter()

  const contractId = computed(() => {
    const params = route.params as { id: string }
    return params.id
  })

  // Fetch contract data
  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractApi.get(contractId.value),
    enabled: computed(() => !!contractId.value),
  })

  // Compute missing fields for completion indicator
  const missingFields = computed(() => {
    if (!contract.value) return []
    const missing: string[] = []

    if (!contract.value.purchaser.firstName || !contract.value.purchaser.lastName) {
      missing.push('Purchaser name')
    }
    if (!contract.value.purchaser.phone) {
      missing.push('Purchaser phone')
    }
    if (!contract.value.beneficiary.firstName || !contract.value.beneficiary.lastName) {
      missing.push('Beneficiary name')
    }
    if (!contract.value.items || contract.value.items.length === 0) {
      missing.push('Items')
    }

    return missing
  })

  // Payment method helpers
  const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    check: 'Check',
    credit_card: 'Credit Card',
    insurance: 'Insurance',
    financing: 'Financing',
    other: 'Other',
  }

  const paymentMethodIcons: Record<string, string> = {
    cash: 'mdi-cash',
    check: 'mdi-checkbook',
    credit_card: 'mdi-credit-card',
    insurance: 'mdi-shield-check',
    financing: 'mdi-bank',
    other: 'mdi-cash-multiple',
  }

  function getPaymentMethodLabel(method: string): string {
    return paymentMethodLabels[method] || method
  }

  function getPaymentIcon(method: string): string {
    return paymentMethodIcons[method] || 'mdi-cash'
  }
</script>
