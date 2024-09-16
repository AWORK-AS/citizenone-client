<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.editCompany') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.editCompany') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <!-- <ModulesSuperadminCompanyForm formType="update" :selectedCompany="state.formCompany"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateCompany" /> -->
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
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const state = reactive({
    error: {} as Error,
    formCompany: {
        name: '',
        cvr: '',
        website: '',
        is_active: '',
    } as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchCompany()
})

async function fetchCompany() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await companyService.getCompany(companyUuid)
        if (response) {
            state.formCompany = {
                name: response?.data?.name ?? '',
                cvr: response?.data?.cvr ?? '',
                website: response?.data?.website ?? '',
                is_active: response?.data?.is_active ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCompany(companyDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: companyDetails.name,
            cvr: companyDetails.cvr,
            website: companyDetails.website,
            is_active: companyDetails.is_active,
        }
        const response = await companyService.updateCompany(companyUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.companySuccessfullyUpdated')}.`)
            navigateTo('/superadmin/companies')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>