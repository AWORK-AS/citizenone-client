<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizenReports.reports') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizenReports.reports') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="flex justify-between items-center mb-2">
                        <button
                            class="flex items-center gap-1.5 outline-none rounded-md text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 text-gray-600"
                            @click="state.modal.isFilterOpen = true">
                            <Icon name="ic:outline-filter-list" class="h-4 w-4" />
                            {{ $t('filter') }}
                            <span v-if="activeFilterCount > 0"
                                class="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                                {{ activeFilterCount }}
                            </span>
                        </button>
                        <FormButton buttonStyle="action" @click="navigateTo('/reports/new')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizenReports.newReport') }}
                        </FormButton>
                    </div>
                    <TableSearch @search="handleSearch" />

                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.reports"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.reports?.data?.length === 0))">
                                <tr v-for="(report, index) in state.reports?.data" :key="index">
                                    <td width="30%">
                                        <span>{{ report?.title }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ report?.citizen ? `${report.citizen.firstname} ${report.citizen.lastname}` : '-' }}</span>
                                    </td>
                                    <td width="15%">
                                        <Badge :type="report?.status === 'finalized' ? 'active' : 'inactive'" class="w-fit">
                                            {{ report?.status === 'finalized'
                                                ? $t('citizenReports.finalized')
                                                : $t('citizenReports.draft') }}
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <span>{{ report?.case_type?.name ?? '-' }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/reports/${report.uuid}/view-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizenReports.table.actions.view') }}
                                            </FormButton>
                                            <FormButton v-if="report?.status === 'draft'" type="button"
                                                buttonStyle="action"
                                                @click="navigateTo(`/reports/${report.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizenReports.table.actions.edit') }}
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
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('citizenReports.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteOpen = false"
                @confirm="deleteReport" />

            <Modal size="sm" :title="$t('filter')" :show="state.modal.isFilterOpen"
                @close="state.modal.isFilterOpen = false">
                <template #modal-body>
                    <form @submit.prevent="applyFilter()">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="filter_status" :label="$t('citizenReports.table.status')" />
                                <FormSelect id="filter_status" name="filter_status" :options="statusOptions"
                                    v-model="state.filterForm.status" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="filter_case_type_uuid"
                                    :label="$t('citizenReports.form.agreementType')" />
                                <FormSelect id="filter_case_type_uuid" name="filter_case_type_uuid"
                                    :options="state.options.caseTypes"
                                    v-model="state.filterForm.case_type_uuid" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel"
                                    @click="state.modal.isFilterOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('filter') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenReportService } from '@/components/api/user/CitizenReportService'
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'citizenReports.reports', translate: true, href: '/reports' },
]

const statusOptions = computed(() => [
    { value: '', label: t('all') },
    { value: 'draft', label: t('citizenReports.draft') },
    { value: 'finalized', label: t('citizenReports.finalized') },
])

const state = reactive({
    columnHeaders: [
        { name: 'citizenReports.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'citizens.citizens', isTranslateName: true, sorter: false, key: 'citizen' },
        { name: 'citizenReports.table.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: 'citizenReports.table.agreementType', isTranslateName: true, sorter: false, key: 'case_type_uuid' },
        { name: '' },
    ],
    options: {
        caseTypes: [] as any[],
    },
    dataFilter: {
        search: [] as any,
        status: '',
        case_type_uuid: '',
    },
    filterForm: {
        status: '',
        case_type_uuid: '',
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteOpen: false,
        isFilterOpen: false,
    },
    reports: [] as any,
    selectedReport: null as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

const activeFilterCount = computed(() => {
    let count = 0
    if (state.dataFilter.status) count++
    if (state.dataFilter.case_type_uuid) count++
    return count
})

onMounted(() => {
    fetchReports()
    fetchCaseTypes()
})

watch(() => state.modal.isFilterOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.filterForm.status = state.dataFilter.status
        state.filterForm.case_type_uuid = state.dataFilter.case_type_uuid
    }
})

async function fetchReports() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        if (state.dataFilter.search?.length) params.search = state.dataFilter.search
        if (state.dataFilter.status) params.status = state.dataFilter.status
        if (state.dataFilter.case_type_uuid) params.case_type_uuid = state.dataFilter.case_type_uuid
        const response = await citizenReportService.getReports(params)
        if (response) {
            state.reports = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchReports()
}

function applyFilter() {
    state.dataFilter.status = state.filterForm.status
    state.dataFilter.case_type_uuid = state.filterForm.case_type_uuid
    state.modal.isFilterOpen = false
    currentTablePage = 1
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

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchReports()
}

function openDeleteConfirmation(report: any) {
    state.selectedReport = report
    state.modal.isDeleteOpen = true
}

async function deleteReport() {
    state.error = {}
    state.isTableLoading = true
    try {
        await citizenReportService.deleteReport(state.selectedReport.uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizenReports.alert.reportSuccessfullyDeleted')}.`)
        state.modal.isDeleteOpen = false
        fetchReports()
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchCaseTypes() {
    try {
        const response = await employmentService.getAllCaseTypes()
        if (response?.data) {
            state.options.caseTypes = [
                { value: '', label: t('all') },
                ...response.data.map((c: any) => ({ value: c.uuid, label: c.name })),
            ]
        }
    } catch {}
}
</script>
