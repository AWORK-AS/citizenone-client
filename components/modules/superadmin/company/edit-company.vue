<template>
    <div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <ModulesSuperadminCompanyForm formType="update" :error="state.error"
                :selectedCompany="state.selectedCompany"
                @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateCompany" />
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
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedCompany: null as any,
})

onMounted(() => {
    fetchCompany()
})

async function fetchCompany() {
    state.error = {} as Error
    state.isPageLoading = true
    try {
        const response = await companyService.getCompany(companyUuid)
        if (response?.data) {
            state.selectedCompany = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCompany(formData: Record<string, any>) {
    state.error = {} as Error
    state.isPageLoading = true
    try {
        const response = await companyService.updateCompany(companyUuid, formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.companySuccessfullyUpdated')}.`)
            navigateTo('/superadmin/companies')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
