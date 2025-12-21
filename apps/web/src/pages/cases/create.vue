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
import { type Case, useCaseStore } from '@/entities/case'
import { CaseForm } from '@/features/case-form'
import { useToast } from '@/shared/ui'

const router = useRouter()
const caseStore = useCaseStore()
const toast = useToast()

const isSubmitting = ref(false)

async function handleSubmit(caseData: Omit<Case, 'createdAt' | 'updatedAt'>) {
  isSubmitting.value = true

  try {
    const now = new Date().toISOString()
    const newCase: Case = {
      ...caseData,
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

