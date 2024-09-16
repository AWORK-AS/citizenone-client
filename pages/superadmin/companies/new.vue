<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.newCompany') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.newCompany') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <!-- <ModulesSuperadminCompanyForm formType="create" :selectedCompany="state.formCompany"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveCompany" /> -->
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formCompany: {
        name: '',
        cvr: '',
        website: '',
        is_active: '',
    },
    isPageLoading: false,
})

async function saveCompany(companyDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: companyDetails.name,
            cvr: companyDetails.cvr,
            website: companyDetails.website,
            is_active: companyDetails.is_active,
        }
        const response = await companyService.saveCompany(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.newCompanySuccessfullySaved')}.`)
            navigateTo('/superadmin/companies')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>