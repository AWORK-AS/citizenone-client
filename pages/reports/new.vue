<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizenReports.newReport') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizenReports.newReport') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/reports">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserReportForm formType="create" :citizenUuid="citizenUuid"
                        :error="state.error" @submitForm="saveReport" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenReportService } from '@/components/api/user/CitizenReportService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const citizenUuid = computed(() => route.query.citizen_uuid as string | undefined)

const breadcrumbLinks = [
    { name: 'citizenReports.reports', translate: true, href: '/reports' },
    { name: 'citizenReports.newReport', translate: true, href: '/reports/new' },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

async function saveReport(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenReportService.saveReport(formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.reportSuccessfullySaved')}.`)
            navigateTo(`/reports/${response.data.uuid}/view-details`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
