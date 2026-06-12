<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.report?.title ?? $t('citizenReports.reports') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ state.report?.title ?? $t('citizenReports.reports') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/reports">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.report" class="space-y-6 max-w-3xl">
                        <!-- Header info -->
                        <div class="flex items-center gap-3">
                            <Badge :type="state.report.status === 'finalized' ? 'active' : 'inactive'">
                                {{ state.report.status === 'finalized'
                                    ? $t('citizenReports.finalized')
                                    : $t('citizenReports.draft') }}
                            </Badge>
                            <span v-if="state.report.agreement_type" class="text-sm text-gray-500">
                                {{ state.report.agreement_type }}
                            </span>
                        </div>

                        <!-- Meta -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div v-if="state.report.citizen">
                                <p class="font-medium text-gray-700">{{ $t('citizenReports.form.citizen') }}</p>
                                <p class="text-gray-900">{{ state.report.citizen.firstname }} {{ state.report.citizen.lastname }}</p>
                            </div>
                            <div v-if="state.report.caseworker">
                                <p class="font-medium text-gray-700">{{ $t('citizenReports.form.caseworker') }}</p>
                                <p class="text-gray-900">{{ state.report.caseworker.firstname }} {{ state.report.caseworker.lastname }}</p>
                            </div>
                            <div v-if="state.report.consultant">
                                <p class="font-medium text-gray-700">{{ $t('citizenReports.form.consultant') }}</p>
                                <p class="text-gray-900">{{ state.report.consultant.firstname }} {{ state.report.consultant.lastname }}</p>
                            </div>
                        </div>

                        <!-- Body -->
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('citizenReports.form.body') }}</p>
                            <div class="prose prose-sm max-w-none rounded-lg border border-gray-200 bg-gray-50 p-4"
                                v-html="state.report.body" />
                        </div>

                        <!-- Public link (finalized only) -->
                        <div v-if="state.report.status === 'finalized' && state.report.access_token"
                            class="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
                            <p class="text-sm font-medium text-green-800">{{ $t('citizenReports.publicLink') }}</p>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 text-xs text-green-700 break-all">
                                    {{ publicUrl }}
                                </code>
                                <FormButton type="button" buttonStyle="action" @click="copyPublicLink">
                                    <Icon name="ph:copy" class="size-4" />
                                    {{ $t('citizenReports.copyLink') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 flex-wrap">
                            <FormButton v-if="state.report.status === 'draft'" type="button" buttonStyle="action"
                                @click="navigateTo(`/reports/${reportUuid}/edit`)">
                                <Icon name="ph:pencil-simple" class="size-4" />
                                {{ $t('citizenReports.table.actions.edit') }}
                            </FormButton>
                            <FormButton v-if="state.report.status === 'draft'" type="button" buttonStyle="primary"
                                @click="state.modal.isFinalizeOpen = true">
                                <Icon name="ph:check-circle" class="size-4" />
                                {{ $t('citizenReports.finalize') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="danger"
                                @click="state.modal.isDeleteOpen = true">
                                <Icon name="ph:trash" class="size-4" />
                                {{ $t('citizenReports.table.actions.delete') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isFinalizeOpen"
                :message="$t('citizenReports.confirmation.finalizeConfirmation') + '?'"
                @close="state.modal.isFinalizeOpen = false"
                @confirm="finalizeReport" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('citizenReports.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteOpen = false"
                @confirm="deleteReport" />
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
const reportUuid = route.params.uuid

const breadcrumbLinks = [
    { name: 'citizenReports.reports', translate: true, href: '/reports' },
    { name: 'citizenReports.reports', translate: true, href: `/reports/${reportUuid}/view-details` },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    report: null as any,
    modal: {
        isFinalizeOpen: false,
        isDeleteOpen: false,
    },
})

const publicUrl = computed(() => {
    if (!state.report?.access_token) return ''
    const base = window.location.origin
    return `${base}/reports/public/${state.report.access_token}`
})

onMounted(() => {
    fetchReport()
})

async function fetchReport() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await citizenReportService.getReport(reportUuid)
        if (response?.data) {
            state.report = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function finalizeReport() {
    state.error = {}
    try {
        const response = await citizenReportService.finalizeReport(reportUuid)
        if (response?.data) {
            state.report = response.data
            successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.finalizedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.modal.isFinalizeOpen = false
}

async function deleteReport() {
    state.error = {}
    try {
        await citizenReportService.deleteReport(reportUuid as string)
        successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.reportSuccessfullyDeleted')}.`)
        navigateTo('/reports')
    } catch (error: any) {
        state.error = error
        state.modal.isDeleteOpen = false
    }
}

function copyPublicLink() {
    navigator.clipboard.writeText(publicUrl.value)
    successAlert(`${t('alert.success')}!`, `${t('citizenReports.copyLink')}.`)
}
</script>
