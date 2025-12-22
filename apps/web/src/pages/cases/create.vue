<template>
  <div>
    <PageHeader
      subtitle="Create a new funeral case"
      title="New Case"
    />
    <CaseForm
      :loading="isSaving"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router'
  import { type CaseFormValues, useCaseForm } from '@/entities/case'
  import { CaseForm } from '@/features/case-form'
  import { PageHeader, useToast } from '@/shared/ui'

  const router = useRouter()
  const toast = useToast()

  const { save, isSaving } = useCaseForm(undefined, {
    onSuccess: (newCase) => {
      toast.success('Case created successfully')
      router.push(`/cases/${newCase.id}`)
    },
    onError: () => {
      toast.error('Failed to create case')
    },
  })

  async function handleSubmit(values: CaseFormValues) {
    await save(values)
  }

  function handleCancel() {
    router.push('/cases')
  }
</script>
