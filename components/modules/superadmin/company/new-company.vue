<template>
    <LoadingSpinner :isActive="state.isPageLoading">

        <Alert type="danger" :text="state.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <form @submit.prevent="handleSubmit" class="space-y-5">

            <ModulesSuperadminCompanyForm ref="formRef" :serverErrors="state.error?.errors" />

            <!-- Action buttons -->
            <div class="flex items-center justify-end gap-3 pb-6">
                <button type="button" @click="navigateTo('/superadmin/companies')"
                    class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                    {{ $t('cancel') }}
                </button>
                <button type="submit"
                    class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                    style="background:#205E77" :disabled="state.isPageLoading">
                    <span v-if="state.isPageLoading" class="flex items-center gap-2">
                        <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                        {{ $t('superadmin.companies.form.creating') }}
                    </span>
                    <span v-else>
                        {{ $t('superadmin.companies.saveCompany') }}
                    </span>
                </button>
            </div>

        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const formRef = ref()

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
})

async function handleSubmit() {
    const isValid = await formRef.value?.validate()
    if (isValid) {
        await saveCompany(formRef.value.getFormData())
    }
}

async function saveCompany(formData: Record<string, any>) {
    state.error = {} as Error
    state.isPageLoading = true
    try {
        const response = await companyService.saveCompany(formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.newCompanySuccessfullySaved')}.`)
            navigateTo('/superadmin/companies')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
