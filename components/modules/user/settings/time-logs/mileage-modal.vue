<template>
    <div>
        <Modal size="4xl" :title="$t('mileageLog.mileageLog')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <LoadingSpinner :isActive="state.isSummaryLoading">
                        <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                            <p class="text-xs">{{ $t('mileageLog.summary.totalKmAllEmployees') }}</p>
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

                <div class="mt-6 flex items-center gap-x-2 justify-end">
                    <button class="flex items-center gap-x-1 text-sm text-primary group"
                        @click="state.modal.isFilterOpen = true">
                        <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                        <span class="group-hover:text-primary-700">{{ $t('filter') }}</span>
                    </button>
                    <FormButton buttonStyle="action" @click="state.modal.isDownloadOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('mileageLog.download.download') }}
                    </FormButton>
                </div>
                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.mileageLogs"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.mileageLogs?.data?.length === 0))">
                                <tr v-for="(log, index) in state.mileageLogs?.data" :key="index">
                                    <td width="15%">
                                        {{ log?.user?.firstname }} {{ log?.user?.lastname }}
                                    </td>
                                    <td width="15%">
                                        <span class="truncate" v-if="log?.date_time_start">
                                            {{ formatDateTimeToReadable(log?.date_time_start) }}
                                        </span>
                                    </td>
                                    <td width="30%">
                                        <span class="truncate">{{ routeSummary(log) }}</span>
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
                                        <FormButton type="button" buttonStyle="action" @click="viewMileageLog(log)">
                                            <Icon name="ph:eye" class="size-4" />
                                            {{ $t('mileageLog.table.actions.view') }}
                                        </FormButton>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.mileageLogs" @previous="previous" @next="next" />
                </div>

                <ModulesUserMileageLogModalView :isModalOpen="state.modal.isViewOpen"
                    :selectedMileageLog="state.selectedMileageLog" @close="state.modal.isViewOpen = false" />
                <ModulesUserMileageLogModalFilter type="all" :isModalOpen="state.modal.isFilterOpen"
                    @close="state.modal.isFilterOpen = false" @setFilter="setFilter" />
                <ModulesUserMileageLogDownloadModal :isModalOpen="state.modal.isDownloadOpen"
                    :filters="state.filter" @close="state.modal.isDownloadOpen = false" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { mileageLogService } from '@/components/api/user/MileageLogService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'mileageLog.table.employee', isTranslateName: true, },
        { name: 'mileageLog.table.date', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'mileageLog.table.route', isTranslateName: true, },
        { name: 'mileageLog.table.distance', isTranslateName: true, },
        { name: 'mileageLog.table.citizen', isTranslateName: true, },
        { name: '' },
    ],
    error: {} as Error,
    filter: {
        department_uuids: [],
        employee_uuids: [],
        citizen_link: '' as any,
        start_date: '',
        end_date: '',
    },
    isSummaryLoading: false,
    isTableLoading: false,
    mileageLogs: [] as any,
    modal: {
        isDownloadOpen: false,
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

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchMileageLogs()
        fetchSummary()
    }
})

function routeSummary(log: any) {
    const middle = (log?.stops ?? []).slice().sort((a: any, b: any) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))
    const addresses = [log?.start_address, ...middle.map((s: any) => s.address), log?.end_address].filter(Boolean)
    return addresses.join(' → ')
}

function buildFilterParams() {
    const params = {} as any

    if (state.filter.department_uuids?.length > 0) {
        params.department_uuids = Array(state.filter.department_uuids)
    }
    if (state.filter.employee_uuids?.length > 0) {
        params.user_uuids = Array(state.filter.employee_uuids)
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

        const response = await mileageLogService.getAllMileageLogs(params)
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
    state.filter.department_uuids = filter.department_uuids
    state.filter.employee_uuids = filter.employee_uuids
    state.filter.citizen_link = filter.citizen_link
    state.filter.start_date = filter.date_range?.[0]
    state.filter.end_date = filter.date_range?.[1]
    fetchMileageLogs()
    fetchSummary()
}

function viewMileageLog(log: any) {
    state.selectedMileageLog = log
    state.modal.isViewOpen = true
}
</script>
