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
        const params = {
            address: formData.address,
            cvr: formData.cvr,
            email: formData.email,
            facility_type_uuid: formData.facility_type_uuid || undefined,
            firstname: formData.firstname,
            industry_uuid: formData.industry_uuid,
            is_active: formData.is_active,
            lastname: formData.lastname,
            name: formData.name,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            phone: formData.phone,
            send_welcome_email: formData.send_welcome_email,
            website: formData.website,
        } as any
        const response = await companyService.saveCompany(params)
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
