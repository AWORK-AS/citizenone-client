<template>
    <div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <ModulesSuperadminCompanyForm formType="create" :error="state.error"
                @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveCompany" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

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
