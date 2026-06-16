<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.reports') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('citizens.citizens') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.reports') }}</template>

            <div class="space-y-8">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <!-- Reports table -->
                <LoadingSpinner :isActive="state.isTableLoading">
                    <div class="space-y-3">
                        <div class="flex justify-end items-center">
                            <FormButton buttonStyle="action"
                                @click="navigateTo(`/reports/new?citizen_uuid=${citizenUuid}`)">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizenReports.newReport') }}
                            </FormButton>
                        </div>
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.reports"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.reports?.data?.length === 0))">
                                    <tr v-for="(report, index) in state.reports?.data" :key="index">
                                        <td width="35%">
                                            <span>{{ report?.title }}</span>
                                        </td>
                                        <td width="20%">
                                            <span>{{ report?.case_type?.name ?? '-' }}</span>
                                        </td>
                                        <td width="15%">
                                            <Badge :type="report?.status === 'finalized' ? 'active' : 'inactive'" class="w-fit">
                                                {{ report?.status === 'finalized'
                                                    ? $t('citizenReports.finalized')
                                                    : $t('citizenReports.draft') }}
                                            </Badge>
                                        </td>
                                        <td width="30%">
                                            <div class="flex items-end justify-end gap-2">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="openViewModal(report)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                    {{ $t('citizenReports.table.actions.view') }}
                                                </FormButton>
                                                <FormButton v-if="report?.status === 'draft'" type="button"
                                                    buttonStyle="action" @click="openEditModal(report)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                    {{ $t('citizenReports.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton v-if="report?.status === 'draft'" type="button"
                                                    buttonStyle="primary" @click="openFinalizeConfirmation(report)">
                                                    <Icon name="ph:check-circle" class="size-4" />
                                                    {{ $t('citizenReports.finalize') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="openDeleteConfirmation(report)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                    {{ $t('citizenReports.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.reports" @previous="previous" @next="next" />
                    </div>
                </LoadingSpinner>

                <!-- Requirements checklist -->
                <div class="border-t border-gray-200 pt-6">
                    <ModulesUserReportRequirementsList :citizenUuid="citizenUuid" />
                </div>
            </div>

            <!-- View Modal -->
            <Modal size="xl" :title="state.viewReport?.title ?? $t('citizenReports.reports')"
                :show="state.modal.isViewOpen" @close="state.modal.isViewOpen = false">
                <template #modal-body>
                    <div v-if="state.viewReport" class="space-y-5 p-1">
                        <Alert type="danger" :text="state.modalError?.message"
                            v-if="state.modalError?.message && state.modalError.message.length > 0" />

                        <div class="flex items-center gap-3">
                            <Badge :type="state.viewReport.status === 'finalized' ? 'active' : 'inactive'" class="w-fit">
                                {{ state.viewReport.status === 'finalized'
                                    ? $t('citizenReports.finalized')
                                    : $t('citizenReports.draft') }}
                            </Badge>
                            <span v-if="state.viewReport.case_type?.name" class="text-sm text-gray-500">
                                {{ state.viewReport.case_type.name }}
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div v-if="state.viewReport.caseworker">
                                <p class="font-medium text-gray-700">{{ $t('citizenReports.form.caseworker') }}</p>
                                <p class="text-gray-900">{{ state.viewReport.caseworker.firstname }} {{ state.viewReport.caseworker.lastname }}</p>
                            </div>
                            <div v-if="state.viewReport.consultant">
                                <p class="font-medium text-gray-700">{{ $t('citizenReports.form.consultant') }}</p>
                                <p class="text-gray-900">{{ state.viewReport.consultant.firstname }} {{ state.viewReport.consultant.lastname }}</p>
                            </div>
                        </div>

                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('citizenReports.form.body') }}</p>
                            <div class="prose prose-sm max-w-none rounded-lg border border-gray-200 bg-gray-50 p-4"
                                v-html="state.viewReport.body" />
                        </div>

                        <div v-if="state.viewReport.status === 'finalized' && state.viewReport.access_token"
                            class="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
                            <p class="text-sm font-medium text-green-800">{{ $t('citizenReports.publicLink') }}</p>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 text-xs text-green-700 break-all">{{ publicUrl }}</code>
                                <FormButton type="button" buttonStyle="action" @click="copyPublicLink">
                                    <Icon name="ph:copy" class="size-4" />
                                    {{ $t('citizenReports.copyLink') }}
                                </FormButton>
                            </div>
                        </div>

                        <div class="flex gap-3 flex-wrap pt-2 border-t border-gray-100">
                            <FormButton v-if="state.viewReport.status === 'draft'" type="button" buttonStyle="action"
                                @click="switchToEdit">
                                <Icon name="ph:pencil-simple" class="size-4" />
                                {{ $t('citizenReports.table.actions.edit') }}
                            </FormButton>
                            <FormButton v-if="state.viewReport.status === 'draft'" type="button" buttonStyle="primary"
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
                </template>
            </Modal>

            <!-- Edit Modal -->
            <Modal size="xl" :title="$t('citizenReports.editReport')"
                :show="state.modal.isEditOpen" @close="state.modal.isEditOpen = false">
                <template #modal-body>
                    <div class="p-1">
                        <Alert type="danger" :text="state.formError?.message"
                            v-if="state.formError?.message && state.formError.message.length > 0" />
                        <LoadingSpinner :isActive="state.isFormLoading">
                            <ModulesUserReportForm v-if="state.editReport" formType="edit"
                                :selectedReport="state.editReport"
                                :error="state.formError" @submitForm="updateReport" />
                        </LoadingSpinner>
                    </div>
                </template>
            </Modal>

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

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const route = useRoute()
const citizenUuid = route?.params?.uuid as string
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'citizens.tabs.reports', translate: true, href: `/citizens/${citizenUuid}/reports` },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizenReports.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'citizenReports.table.agreementType', isTranslateName: true, sorter: false, key: 'case_type_uuid' },
        { name: 'citizenReports.table.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: '' },
    ],
    error: {} as Error,
    modalError: {} as Error,
    formError: {} as Error,
    isTableLoading: false,
    isFormLoading: false,
    modal: {
        isViewOpen: false,
        isEditOpen: false,
        isFinalizeOpen: false,
        isDeleteOpen: false,
    },
    reports: [] as any,
    selectedReport: null as any,
    viewReport: null as any,
    editReport: null as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
})

const publicUrl = computed(() => {
    if (!state.viewReport?.access_token) return ''
    return `${window.location.origin}/reports/public/${state.viewReport.access_token}`
})

onMounted(() => {
    fetchReports()
})

async function fetchReports() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenReportService.getReportsByCitizen(citizenUuid, {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        })
        if (response) {
            state.reports = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function openViewModal(report: any) {
    state.modalError = {}
    state.viewReport = null
    state.modal.isViewOpen = true
    try {
        const response = await citizenReportService.getReport(report.uuid)
        if (response?.data) {
            state.viewReport = response.data
        }
    } catch (error: any) {
        state.modalError = error
    }
}

async function openEditModal(report: any) {
    state.formError = {}
    state.editReport = null
    state.modal.isEditOpen = true
    state.isFormLoading = true
    try {
        const response = await citizenReportService.getReport(report.uuid)
        if (response?.data) {
            state.editReport = response.data
        }
    } catch (error: any) {
        state.formError = error
    }
    state.isFormLoading = false
}

function switchToEdit() {
    state.modal.isViewOpen = false
    openEditModal(state.viewReport)
}

async function updateReport(formData: any) {
    state.formError = {}
    state.isFormLoading = true
    try {
        const response = await citizenReportService.updateReport(state.editReport.uuid, formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.reportSuccessfullyUpdated')}.`)
            state.modal.isEditOpen = false
            fetchReports()
        }
    } catch (error: any) {
        state.formError = error
    }
    state.isFormLoading = false
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchReports()
}

function previous() {
    currentTablePage--
    fetchReports()
}

function next() {
    currentTablePage++
    fetchReports()
}

function openFinalizeConfirmation(report: any) {
    state.selectedReport = report
    state.modal.isFinalizeOpen = true
}

async function finalizeReport() {
    state.modalError = {}
    try {
        const response = await citizenReportService.finalizeReport(
            state.viewReport?.uuid ?? state.selectedReport?.uuid
        )
        if (response?.data) {
            state.viewReport = response.data
            successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.finalizedSuccessfully')}.`)
            fetchReports()
        }
    } catch (error: any) {
        state.modalError = error
    }
    state.modal.isFinalizeOpen = false
}

function openDeleteConfirmation(report: any) {
    state.selectedReport = report
    state.modal.isDeleteOpen = true
}

async function deleteReport() {
    state.error = {}
    try {
        await citizenReportService.deleteReport(state.selectedReport.uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.reportSuccessfullyDeleted')}.`)
        state.modal.isDeleteOpen = false
        state.modal.isViewOpen = false
        fetchReports()
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
