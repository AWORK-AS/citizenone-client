<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mileageLog.mileageLog') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('mileageLog.mileageLog') }}</template>

            <ModulesUserSettingsTab />

            <div class="mt-10 space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <LoadingSpinner :isActive="state.isSummaryLoading">
                        <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                            <p class="text-xs">{{ $t('mileageLog.summary.totalKm') }}</p>
                            <p class="text-sm">{{ formatNumber(language.locale.value, state.summary?.data?.total_kilometers || 0) }} km</p>
                        </div>
                    </LoadingSpinner>
                    <LoadingSpinner :isActive="state.isSummaryLoading">
                        <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                            <p class="text-xs">{{ $t('mileageLog.summary.totalTrips') }}</p>
                            <p class="text-sm">{{ state.summary?.data?.total_trips || 0 }}</p>
                        </div>
                    </LoadingSpinner>
                </div>

                <LoadingSpinner :isActive="state.isSummaryLoading">
                    <div class="rounded-md ring-1 ring-gray-200" v-if="canFilterByEmployee && employeeSummaries.length > 0">
                        <p class="px-4 pt-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {{ $t('mileageLog.summary.byEmployee') }}
                        </p>
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead>
                                    <tr class="text-xs text-gray-500 uppercase tracking-wide">
                                        <th class="text-left px-4 py-2">{{ $t('mileageLog.table.employee') }}</th>
                                        <th class="text-right px-4 py-2">{{ $t('mileageLog.summary.totalKm') }}</th>
                                        <th class="text-right px-4 py-2">{{ $t('mileageLog.summary.totalTrips') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="employee in employeeSummaries" :key="employee.user_uuid"
                                        class="border-t border-gray-100">
                                        <td class="px-4 py-2">{{ employee.firstname }} {{ employee.lastname }}</td>
                                        <td class="px-4 py-2 text-right">
                                            {{ formatNumber(language.locale.value, employee.total_kilometers) }} km
                                        </td>
                                        <td class="px-4 py-2 text-right">{{ employee.total_trips }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </LoadingSpinner>

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-3">
                        <button class="flex items-center gap-x-1 text-sm text-primary group"
                            @click="state.modal.isFilterOpen = true">
                            <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                            <span class="group-hover:text-primary-700">{{ $t('filter') }}</span>
                        </button>
                        <span class="text-sm text-gray-500">
                            {{ state.filter.start_date && state.filter.end_date
                                ? `${formatDateToReadable(state.filter.start_date)} - ${formatDateToReadable(state.filter.end_date)}`
                                : $t('mileageLog.summary.allTime') }}
                        </span>
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-3">
                        <FormButton buttonStyle="action" @click="state.modal.isDownloadOpen = true">
                            <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('mileageLog.download.download') }}
                        </FormButton>
                        <FormButton buttonStyle="action" @click="state.modal.isAddNewOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('mileageLog.newTrip') }}
                        </FormButton>
                    </div>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="table-responsive">
                    <Table :columnHeaders="columnHeaders" :data="state.mileageLogs" :isLoading="state.isTableLoading"
                        :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.mileageLogs?.data?.length === 0))">
                            <tr v-for="(log, index) in state.mileageLogs?.data" :key="index">
                                <td width="15%" v-if="canFilterByEmployee">
                                    {{ log?.user?.firstname }} {{ log?.user?.lastname }}
                                </td>
                                <td width="15%">
                                    <span class="truncate" v-if="log?.date_time_start">
                                        {{ formatDateTimeToReadable(log?.date_time_start) }}
                                    </span>
                                </td>
                                <td width="30%">
                                    <span class="block truncate max-w-xs" :title="routeSummary(log)">{{ routeSummary(log) }}</span>
                                </td>
                                <td width="10%">
                                    {{ formatNumber(language.locale.value, log?.kilometers) }} km
                                </td>
                                <td width="15%">
                                    <div v-if="log?.citizen"
                                        class="rounded-xl bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                        {{ log?.citizen?.firstname }} {{ log?.citizen?.lastname }}
                                    </div>
                                    <div v-else
                                        class="rounded-xl bg-teal-100 text-tertiary-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                        {{ $t('mileageLog.filter.notLinked') }}
                                    </div>
                                </td>
                                <td width="15%">
                                    <div class="flex items-end gap-2">
                                        <FormButton type="button" buttonStyle="action" @click="viewMileageLog(log)">
                                            <Icon name="ph:eye" class="size-4" />
                                            {{ $t('mileageLog.table.actions.view') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action" @click="editMileageLog(log)"
                                            v-if="log?.is_editable">
                                            <Icon name="ph:pencil-simple" class="size-4" />
                                            {{ $t('mileageLog.table.actions.edit') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="danger"
                                            @click="confirmMileageLogDeletion(log)" v-if="log?.is_deletable">
                                            <Icon name="heroicons:trash" class="size-4" />
                                            {{ $t('mileageLog.table.actions.delete') }}
                                        </FormButton>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.mileageLogs" @previous="previous" @next="next" />

                <ModulesUserMileageLogModalNew :isModalOpen="state.modal.isAddNewOpen"
                    @close="state.modal.isAddNewOpen = false" @refreshMileageLog="fetchMileageLogs" />
                <ModulesUserMileageLogModalEdit :isModalOpen="state.modal.isEditOpen"
                    :selectedMileageLog="state.selectedMileageLog" @close="state.modal.isEditOpen = false"
                    @refreshMileageLog="fetchMileageLogs" />
                <ModulesUserMileageLogModalView :isModalOpen="state.modal.isViewOpen"
                    :selectedMileageLog="state.selectedMileageLog" @close="state.modal.isViewOpen = false" />
                <ModulesUserMileageLogModalFilter :type="canFilterByEmployee ? 'all' : 'self'"
                    :isModalOpen="state.modal.isFilterOpen" @close="state.modal.isFilterOpen = false"
                    @setFilter="setFilter" />
                <ModulesUserMileageLogDownloadModal :isModalOpen="state.modal.isDownloadOpen"
                    :filters="state.filter" @close="state.modal.isDownloadOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                    :message="`${$t('mileageLog.table.confirmation.deleteTripConfirmation')}?`"
                    @close="state.modal.isDeleteOpen = false" @confirm="deleteMileageLog" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { mileageLogService } from '@/components/api/user/MileageLogService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable, formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const { t } = useI18n()
const { successAlert } = useAlert()
const { isAtLeast } = usePermissions()
// Admins/Managers get company-wide data on this page already (the backend
// scopes it), so let them filter/attribute it by department and employee
// too, matching the all-employees report's filter fields.
const canFilterByEmployee = isAtLeast('Manager')
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'mileageLog.mileageLog',
        translate: true,
        href: '/settings/mileage-log',
    },
]

const columnHeaders = computed(() => [
    ...(canFilterByEmployee ? [{ name: 'mileageLog.table.employee', isTranslateName: true }] : []),
    { name: 'mileageLog.table.date', isTranslateName: true, sorter: true, key: 'date_time_start' },
    { name: 'mileageLog.table.route', isTranslateName: true, },
    { name: 'mileageLog.table.distance', isTranslateName: true, },
    { name: 'mileageLog.table.citizen', isTranslateName: true, },
    { name: '' },
])

const state = reactive({
    error: {} as Error,
    filter: {
        department_uuids: [] as any,
        employee_uuids: [] as any,
        citizen_link: '' as any,
        // Defaults to no date bound ("all time"). The table and summary
        // tiles share this one filter, so whatever range is picked here
        // (or left empty) applies to both.
        start_date: '',
        end_date: '',
    },
    isSummaryLoading: false,
    isTableLoading: false,
    mileageLogs: [] as any,
    modal: {
        isAddNewOpen: false,
        isDeleteOpen: false,
        isDownloadOpen: false,
        isEditOpen: false,
        isFilterOpen: false,
        isViewOpen: false,
    },
    selectedMileageLog: {} as any,
    sortData: {
        sortField: 'date_time_start',
        sortOrder: 'descend',
    },
    summary: {} as any,
})

onMounted(() => {
    fetchMileageLogs()
    fetchSummary()
})

const employeeSummaries = computed(() => {
    const employees = state.summary?.data?.employees ?? []
    return [...employees].sort((a: any, b: any) => Number(b.total_kilometers) - Number(a.total_kilometers))
})

function routeSummary(log: any) {
    const middle = (log?.stops ?? []).slice().sort((a: any, b: any) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))
    const addresses = [log?.start_address, ...middle.map((s: any) => s.address), log?.end_address].filter(Boolean)
    return addresses.join(' → ')
}

function buildFilterParams() {
    const params = {} as any

    if (canFilterByEmployee) {
        if (state.filter.department_uuids?.length > 0) {
            params.department_uuids = Array(state.filter.department_uuids)
        }
        if (state.filter.employee_uuids?.length > 0) {
            params.user_uuids = Array(state.filter.employee_uuids)
        }
    }
    if (state.filter.citizen_link === 'linked') {
        params.has_citizen = true
    } else if (state.filter.citizen_link === 'unlinked') {
        params.has_citizen = false
    }
    if (state.filter.start_date && state.filter.end_date) {
        params.start_date = state.filter.start_date
        params.end_date = state.filter.end_date
    }

    return params
}

async function fetchMileageLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...buildFilterParams(),
        }

        const response = await mileageLogService.getMileageLog(params)
        if (response) {
            state.mileageLogs = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchSummary() {
    state.isSummaryLoading = true
    try {
        const response = await mileageLogService.getMileageSummary(buildFilterParams())
        if (response) {
            state.summary = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSummaryLoading = false
}

function previous() {
    currentTablePage--
    fetchMileageLogs()
}

function next() {
    currentTablePage++
    fetchMileageLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchMileageLogs()
}

function setFilter(filter: any) {
    if (canFilterByEmployee) {
        state.filter.department_uuids = filter.department_uuids
        state.filter.employee_uuids = filter.employee_uuids
    }
    state.filter.citizen_link = filter.citizen_link
    state.filter.start_date = filter.date_range?.length === 2 ? filter.date_range[0] : ''
    state.filter.end_date = filter.date_range?.length === 2 ? filter.date_range[1] : ''
    fetchMileageLogs()
    fetchSummary()
}

function viewMileageLog(log: any) {
    state.selectedMileageLog = log
    state.modal.isViewOpen = true
}

function editMileageLog(log: any) {
    state.selectedMileageLog = log
    state.modal.isEditOpen = true
}

function confirmMileageLogDeletion(log: any) {
    state.selectedMileageLog = log
    state.modal.isDeleteOpen = true
}

async function deleteMileageLog() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await mileageLogService.deleteMileageLog(state.selectedMileageLog.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchMileageLogs()
            fetchSummary()
            successAlert(`${t('alert.success')}!`, `${t('mileageLog.table.alert.tripSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
