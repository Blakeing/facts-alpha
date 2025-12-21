<template>
  <div v-if="caseItem">
    <PageHeader
      :subtitle="`Editing ${caseItem.caseNumber}`"
      title="Edit Case"
    />

    <CaseForm
      :case="caseItem"
      :loading="isSubmitting"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </div>

  <!-- Not Found -->
  <div
    v-else
    class="text-center py-12"
  >
    <v-icon
      color="grey"
      icon="mdi-folder-question-outline"
      size="64"
    />
    <h2 class="text-h5 mt-4">Case Not Found</h2>
    <p class="text-body-1 text-medium-emphasis mt-2">
      The case you're trying to edit doesn't exist or has been removed.
    </p>
    <FButton
      class="mt-4"
      intent="primary"
      @click="router.push('/cases')"
    >
      Back to Cases
    </FButton>
  </div>
</template>

<script lang="ts" setup>
  import { FButton, PageHeader } from '@facts/ui'
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { type Case, type CaseFormValues, useCaseStore } from '@/entities/case'
  import { CaseForm } from '@/features/case-form'
  import { useToast } from '@/shared/ui'

  const route = useRoute()
  const router = useRouter()
  const caseStore = useCaseStore()
  const toast = useToast()

  const isSubmitting = ref(false)

  const caseItem = computed(() => {
    const id = (route.params as { id?: string }).id
    return caseStore.cases.find((c) => c?.id === id) || null
  })

  function generateId(): string {
    return Math.random().toString(36).slice(2, 15)
  }

  async function handleSubmit(values: CaseFormValues) {
    if (!caseItem.value) return

    isSubmitting.value = true

    try {
      const updates: Partial<Case> = {
        status: values.status,
        decedent: {
          firstName: values.decedent.firstName,
          lastName: values.decedent.lastName,
          middleName: values.decedent.middleName || undefined,
          dateOfBirth: values.decedent.dateOfBirth || undefined,
          dateOfDeath: values.decedent.dateOfDeath,
          placeOfDeath: values.decedent.placeOfDeath || undefined,
          ssn: values.decedent.ssn || undefined,
          veteranStatus: values.decedent.veteranStatus || undefined,
        },
        nextOfKin: {
          firstName: values.nextOfKin.firstName,
          lastName: values.nextOfKin.lastName,
          relationship: values.nextOfKin.relationship,
          phone: values.nextOfKin.phone,
          email: values.nextOfKin.email || undefined,
          address: values.nextOfKin.address.street
            ? {
                street: values.nextOfKin.address.street,
                city: values.nextOfKin.address.city,
                state: values.nextOfKin.address.state,
                zip: values.nextOfKin.address.zip,
              }
            : undefined,
        },
        services: values.services.map((type) => ({
          id: generateId(),
          type,
        })),
        notes: values.notes || undefined,
        updatedAt: new Date().toISOString(),
      }

      caseStore.updateCase(caseItem.value.id, updates)
      toast.success('Case updated successfully')
      router.push(`/cases/${caseItem.value.id}`)
    } catch {
      toast.error('Failed to update case')
    } finally {
      isSubmitting.value = false
    }
  }

  function handleCancel() {
    const id = (route.params as { id?: string }).id
    if (id) {
      router.push(`/cases/${id}`)
    } else {
      router.push('/cases')
    }
  }
</script>
