<template>
  <div>
    <PageHeader
      subtitle="Create a new funeral case"
      title="New Case"
    />

    <CaseForm
      :loading="isSubmitting"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
  import { PageHeader } from '@facts/ui'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { type Case, type CaseFormValues, useCaseStore } from '@/entities/case'
  import { CaseForm } from '@/features/case-form'
  import { useToast } from '@/shared/ui'

  const router = useRouter()
  const caseStore = useCaseStore()
  const toast = useToast()

  const isSubmitting = ref(false)

  function generateId(): string {
    return Math.random().toString(36).slice(2, 15)
  }

  function generateCaseNumber(): string {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10_000)
      .toString()
      .padStart(4, '0')
    return `${year}-${random}`
  }

  async function handleSubmit(values: CaseFormValues) {
    isSubmitting.value = true

    try {
      const now = new Date().toISOString()
      const newCase: Case = {
        id: generateId(),
        caseNumber: generateCaseNumber(),
        tenantId: 'default', // TODO: Get from tenant store
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
        createdAt: now,
        updatedAt: now,
      }

      caseStore.addCase(newCase)
      toast.success('Case created successfully')
      router.push(`/cases/${newCase.id}`)
    } catch {
      toast.error('Failed to create case')
    } finally {
      isSubmitting.value = false
    }
  }

  function handleCancel() {
    router.push('/cases')
  }
</script>
