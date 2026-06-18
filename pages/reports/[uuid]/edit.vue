<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizenReports.editReport') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizenReports.editReport') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/reports">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserReportForm v-if="state.report" formType="edit"
                        :selectedReport="state.report"
                        :error="state.formError" @submitForm="updateReport" />
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
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const reportUuid = route.params.uuid

const breadcrumbLinks = [
    { name: 'citizenReports.reports', translate: true, href: '/reports' },
    { name: 'citizenReports.editReport', translate: true, href: `/reports/${reportUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    formError: {} as Error,
    isPageLoading: false,
    report: null as any,
})

onMounted(() => {
    fetchReport()
})

async function fetchReport() {
    state.isPageLoading = true
    try {
        const response = await citizenReportService.getReport(reportUuid)
        if (response?.data) {
            if (response.data.status === 'finalized') {
                errorAlert(`${t('alert.error')}!`, `${t('citizenReports.alert.cannotEditFinalized')}.`)
                navigateTo(`/reports/${reportUuid}/view-details`)
                return
            }
            state.report = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateReport(formData: any) {
    state.formError = {}
    state.isPageLoading = true
    try {
        const response = await citizenReportService.updateReport(reportUuid, formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.reportSuccessfullyUpdated')}.`)
            navigateTo(`/reports/${reportUuid}/view-details`)
        }
    } catch (error: any) {
        state.formError = error
    }
    state.isPageLoading = false
}
</script>
