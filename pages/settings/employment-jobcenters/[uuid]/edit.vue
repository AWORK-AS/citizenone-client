<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('employment.jobcenters.editJobcenter') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('employment.jobcenters.editJobcenter') }}</template>
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-jobcenters">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentJobcenterForm formType="update"
                        :selectedJobcenter="state.formJobcenter" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateJobcenter" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentJobcenterService } from '@/components/api/user/EmploymentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const jobcenterUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    { name: 'employment.jobcenters.jobcenters', translate: true, href: '/settings/employment-jobcenters' },
    { name: 'employment.jobcenters.editJobcenter', translate: true, href: `/settings/employment-jobcenters/${jobcenterUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    formJobcenter: { name: '', municipality: '', email: '', phone: '', contact_person: '', sort_order: 0, is_active: true },
    isPageLoading: false,
})

onMounted(() => { fetchJobcenter() })

async function fetchJobcenter() {
    state.isPageLoading = true
    try {
        const response = await employmentJobcenterService.getJobcenter(jobcenterUuid)
        if (response) {
            state.formJobcenter = {
                name: response?.data?.name ?? '',
                municipality: response?.data?.municipality ?? '',
                email: response?.data?.email ?? '',
                phone: response?.data?.phone ?? '',
                contact_person: response?.data?.contact_person ?? '',
                sort_order: response?.data?.sort_order ?? 0,
                is_active: response?.data?.is_active ?? true,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateJobcenter(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentJobcenterService.updateJobcenter(jobcenterUuid, details)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.jobcenters.form.alert.jobcenterSuccessfullyUpdated')}.`)
            navigateTo('/settings/employment-jobcenters')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
