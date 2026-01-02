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
            <ContractStatusBadge :status="primarySaleStatusString" />
          </div>
          <p class="text-body-2 text-medium-emphasis">
            {{ getLastFirstName(primaryBeneficiary?.name) || 'Unknown' }} ·
            {{ needTypeController.getDescription(contract.needType) }}
          </p>
        </div>
      </div>
      <div class="d-flex ga-2">
        <FButton
          intent="primary"
          prepend-icon="mdi-pencil"
          @click="router.push(`/contracts/${contractId}/edit/general`)"
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
      v-if="primarySaleStatus === SaleStatus.DRAFT && missingFields.length > 0"
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
          @click="router.push(`/contracts/${contractId}/edit/general`)"
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
        <FCard title="Primary Buyer">
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
                {{ getFullName(primaryBuyer?.name) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="getPrimaryPhoneNumber(primaryBuyer?.name)">
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-phone"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Phone</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ formatPhone(getPrimaryPhoneNumber(primaryBuyer?.name)) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="getPrimaryEmailAddress(primaryBuyer?.name)">
              <template #prepend>
                <v-icon
                  class="mr-2"
                  icon="mdi-email"
                  size="small"
                />
              </template>
              <v-list-item-title class="text-body-2 text-medium-emphasis">Email</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ getPrimaryEmailAddress(primaryBuyer?.name) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="getPrimaryAddress(primaryBuyer?.name)">
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
                {{ formatAddressSingleLine(getPrimaryAddress(primaryBuyer?.name)) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </FCard>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Primary Beneficiary">
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
                {{ getFullName(primaryBeneficiary?.name) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="primaryBeneficiary?.name?.deathDate">
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
                {{ formatDate(primaryBeneficiary.name.deathDate) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="primaryBeneficiary?.name?.birthDate">
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
                {{ formatDate(primaryBeneficiary.name.birthDate) }}
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
        <FCard :title="`Items (${allItems.length})`">
          <v-list
            v-if="allItems.length > 0"
            class="bg-transparent"
            density="compact"
          >
            <v-list-item
              v-for="item in allItems.slice(0, 5)"
              :key="item.id"
            >
              <v-list-item-title>{{ item.description }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.quantity }} × {{ formatCurrency(item.unitPrice) }}
              </v-list-item-subtitle>
              <template #append>
                <span class="text-body-2">
                  {{ formatCurrency(item.quantity * item.unitPrice) }}
                </span>
              </template>
            </v-list-item>
            <v-list-item v-if="allItems.length > 5">
              <v-list-item-title class="text-primary">
                + {{ allItems.length - 5 }} more items
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
              @click="router.push(`/contracts/${contractId}/edit/items`)"
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
                {{ formatDate(payment.date) }} -
                {{ paymentMethodController.getDescription(payment.method) }}
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
              @click="router.push(`/contracts/${contractId}/edit/payments`)"
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
              <div class="text-body-2 text-medium-emphasis">Need Type</div>
              <div class="text-body-1">
                {{ needTypeController.getDescription(contract.needType) }}
              </div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Date Signed</div>
              <div class="text-body-1">{{ formatDate(contract.dateSigned) }}</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Status</div>
              <ContractStatusBadge
                class="mt-1"
                :status="primarySaleStatusString"
              />
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Created</div>
              <div class="text-body-1">{{ formatDate(contract.dateCreated) }}</div>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">Last Updated</div>
              <div class="text-body-1">{{ formatDate(contract.dateLastModified) }}</div>
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
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    ContractStatusBadge,
    getPrimaryBeneficiary,
    getPrimaryBuyer,
    type PaymentMethod,
    SaleStatus,
    SaleType,
    useContract,
  } from '@/entities/contract'
  import {
    needTypeController,
    paymentMethodController,
    saleStatusController,
  } from '@/entities/contract'
  import {
    formatAddressSingleLine,
    getFullName,
    getLastFirstName,
    getPrimaryAddress,
    getPrimaryEmailAddress,
    getPrimaryPhoneNumber,
  } from '@/entities/name'
  import { formatCurrency, formatDate, formatPhone } from '@/shared/lib'
  import { readRequirement, SecurityOptionKeys } from '@/shared/lib'
  import { FButton, FCard, FLoader } from '@/shared/ui'

  // Route meta for permission-based access control
  definePage({
    meta: {
      title: 'Contract Detail',
      permissions: readRequirement(SecurityOptionKeys.ProcessContracts),
    },
  })

  const route = useRoute()
  const router = useRouter()

  const contractId = computed(() => {
    const params = route.params as { id: string }
    return params.id
  })

  // Fetch contract data using Effect-based composable
  const { contract, isLoading } = useContract(contractId)

  // Get people from contract
  const primaryBuyer = computed(() => {
    if (!contract.value?.people) return null
    return getPrimaryBuyer(contract.value.people)
  })

  const primaryBeneficiary = computed(() => {
    if (!contract.value?.people) return null
    return getPrimaryBeneficiary(contract.value.people)
  })

  // Get primary sale status (as enum for logic)
  const primarySaleStatus = computed(() => {
    if (!contract.value?.sales) return SaleStatus.DRAFT
    const primarySale = contract.value.sales.find((s) => s.saleType === SaleType.CONTRACT)
    return primarySale?.saleStatus ?? SaleStatus.DRAFT
  })

  // Get primary sale status as string (for display)
  const primarySaleStatusString = computed(() => {
    return saleStatusController.getDescription(primarySaleStatus.value)
  })

  // Get all items from all sales
  const allItems = computed(() => {
    if (!contract.value?.sales) return []
    return contract.value.sales.flatMap((sale) => sale.items ?? [])
  })

  // Compute missing fields for completion indicator
  const missingFields = computed(() => {
    if (!contract.value) return []
    const missing: string[] = []

    const buyerName = primaryBuyer.value?.name
    if (!buyerName?.first || !buyerName?.last) {
      missing.push('Buyer name')
    }
    if (!getPrimaryPhoneNumber(buyerName)) {
      missing.push('Buyer phone')
    }

    const beneficiaryName = primaryBeneficiary.value?.name
    if (!beneficiaryName?.first || !beneficiaryName?.last) {
      missing.push('Beneficiary name')
    }
    if (allItems.value.length === 0) {
      missing.push('Items')
    }

    return missing
  })

  // Payment method icon mapping
  const paymentMethodIcons: Record<PaymentMethod, string> = {
    cash: 'mdi-cash',
    check: 'mdi-checkbook',
    credit_card: 'mdi-credit-card',
    ach: 'mdi-bank-transfer',
    insurance: 'mdi-shield-check',
    financing: 'mdi-bank',
    other: 'mdi-cash-multiple',
  }

  function getPaymentIcon(method: PaymentMethod): string {
    return paymentMethodIcons[method] || 'mdi-cash'
  }
</script>
