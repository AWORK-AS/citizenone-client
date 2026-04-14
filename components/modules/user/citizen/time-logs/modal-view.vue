<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.timeLogs.timeLogs')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <button class="text-sm text-primary hover:text-primary-700 hover:underline"
                        @click="state.modal.isTimeLogSummaryDateRangeOpen = true">
                        {{ $t('citizens.interventionHours.timeAccount.date') }}:
                        {{ formatDateToReadable(state.timeLogSummaryFilter.formDateRange.date_start) }} -
                        {{ formatDateToReadable(state.timeLogSummaryFilter.formDateRange.date_end) }}
                    </button>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LoadingSpinner :isActive="state.isTimeLogSummaryLoading">
                            <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.timeAccount') }}
                                </p>
                                <p class="text-sm">
                                    {{ state.timeLogSummary?.data?.total_hours || 0 }}
                                </p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isTimeLogSummaryLoading">
                            <div :class="[
                                state.timeLogSummary?.data?.daily_flag === 1 && 'border-orange-400',
                                state.timeLogSummary?.data?.daily_flag === 2 && 'border-secondary',
                                state.timeLogSummary?.data?.daily_flag === 3 && 'border-red-600',
                                'border-l-4 shadow-md rounded-md px-4 py-3'
                            ]">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.dailyAllocation') }}
                                    ({{ formatNumber(language.locale.value,
                                        citizenStore.getSelectedCitizen?.allocated_daily_hours) }})
                                </p>
                                <p :class="[
                                    state.timeLogSummary?.data?.daily_flag === 1 && 'text-orange-400',
                                    state.timeLogSummary?.data?.daily_flag === 2 && 'text-secondary',
                                    state.timeLogSummary?.data?.daily_flag === 3 && 'text-red-600',
                                    'text-sm'
                                ]">
                                    {{ state.timeLogSummary?.data?.daily ?? '-' }}
                                </p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isTimeLogSummaryLoading">
                            <div :class="[
                                state.timeLogSummary?.data?.weekly_flag === 1 && 'border-orange-400',
                                state.timeLogSummary?.data?.weekly_flag === 2 && 'border-secondary',
                                state.timeLogSummary?.data?.weekly_flag === 3 && 'border-red-600',
                                'border-l-4 shadow-md rounded-md px-4 py-3'
                            ]">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.weeklyAllocation') }}
                                    ({{ formatNumber(language.locale.value,
                                        citizenStore.getSelectedCitizen?.allocated_weekly_hours) }})
                                </p>
                                <p :class="[
                                    state.timeLogSummary?.data?.weekly_flag === 1 && 'text-orange-400',
                                    state.timeLogSummary?.data?.weekly_flag === 2 && 'text-secondary',
                                    state.timeLogSummary?.data?.weekly_flag === 3 && 'text-red-600',
                                    'text-sm'
                                ]">
                                    {{ state.timeLogSummary?.data?.weekly ?? '-' }}
                                </p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isTimeLogSummaryLoading">
                            <div :class="[
                                state.timeLogSummary?.data?.monthly_flag === 1 && 'border-orange-400',
                                state.timeLogSummary?.data?.monthly_flag === 2 && 'border-secondary',
                                state.timeLogSummary?.data?.monthly_flag === 3 && 'border-red-600',
                                'border-l-4 shadow-md rounded-md px-4 py-3'
                            ]">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.monthlyAllocation') }}
                                    ({{ formatNumber(language.locale.value,
                                        citizenStore.getSelectedCitizen?.allocated_monthly_hours) }})
                                </p>
                                <p :class="[
                                    state.timeLogSummary?.data?.monthly_flag === 1 && 'text-orange-400',
                                    state.timeLogSummary?.data?.monthly_flag === 2 && 'text-secondary',
                                    state.timeLogSummary?.data?.monthly_flag === 3 && 'text-red-600',
                                    'text-sm'
                                ]">
                                    {{ state.timeLogSummary?.data?.monthly ?? '-' }}
                                </p>
                            </div>
                        </LoadingSpinner>
                    </div>
                </div>
                <div class="mt-6 flex items-center gap-x-2 justify-end">
                    <FormButton buttonStyle="action" @click="openInterventionHoursModal">
                        <Icon name="ph:clock" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.interventionHours.interventionHours') }}
                    </FormButton>
                    <FormButton buttonStyle="action" @click="state.modal.isAddNewTimeLogOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('timeLogs.newTimeLog') }}
                    </FormButton>
                    <FormButton buttonStyle="action" @click="state.modal.isDownloadTimeLogsOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('timeLogs.download.download') }}
                    </FormButton>
                </div>
                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.timeLogs"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.timeLogs?.data?.length === 0))">
                                <tr v-for="(log, index) in state.timeLogs?.data" :key="index">
                                    <td width="20%">
                                        <span class="truncate">
                                            {{ formatDateTimeToReadable(log?.created_at) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate" v-if="log?.date_time_start">
                                            {{ formatDateTimeToReadable(log?.date_time_start) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate" v-if="log?.date_time_end">
                                            {{ formatDateTimeToReadable(log?.date_time_end) }}
                                        </span>
                                    </td>
                                    <td width="10%">
                                        <Badge type="primary" class="w-fit truncate"
                                            v-if="log?.status === 'cancelled_by_citizen'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.cancelledByCitizen') }}
                                            </p>
                                        </Badge>
                                        <Badge type="primary" class="w-fit truncate"
                                            v-if="log?.status === 'cancelled_by_employee'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.cancelledByEmployee') }}
                                            </p>
                                        </Badge>
                                        <Badge type="primary" class="w-fit truncate" v-if="log?.status === 'completed'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.completed') }}
                                            </p>
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <span>{{ log?.remarks }}</span>
                                    </td>
                                    <td width="5%">
                                        <span>{{ log?.time_summary }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" @click="viewTimeLog(log)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('timeLogs.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" @click="editTimeLog(log)"
                                                v-if="log?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('timeLogs.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="confirmTimeLogDeletion(log)" v-if="log?.is_deletable">
                                                <Icon name="heroicons:trash" class="size-4" />
                                                {{ $t('timeLogs.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.timeLogs" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenTimeLogsModalNew :isModalOpen="state.modal.isAddNewTimeLogOpen"
                    :citizenUuid="props.citizenUuid" @close="state.modal.isAddNewTimeLogOpen = false"
                    @refreshTimeLogs="fetchTimeLogs" />
                <ModulesUserCitizenTimeLogsModalEdit :isModalOpen="state.modal.isEditTimeLogOpen"
                    :citizenUuid="props.citizenUuid" :selectedTimeLog="state.selectedTimeLog"
                    @close="state.modal.isEditTimeLogOpen = false" @refreshTimeLogs="fetchTimeLogs" />
                <ModulesUserCitizenTimeLogsModalDownload :isModalOpen="state.modal.isDownloadTimeLogsOpen"
                    :citizenUuid="props.citizenUuid" @close="state.modal.isDownloadTimeLogsOpen = false" />
                <ModulesUserTimeRegistrationModalViewLog :isModalOpen="state.modal.isViewTimeLogOpen"
                    :selectedTimeLog="state.selectedTimeLog" @close="state.modal.isViewTimeLogOpen = false" />
                <ModulesUserCitizenTimeLogsModalDateRange :isModalOpen="state.modal.isTimeLogSummaryDateRangeOpen"
                    :dateRange="state.timeLogSummaryFilter.formDateRange"
                    @close="state.modal.isTimeLogSummaryDateRangeOpen = false"
                    @filterDate="filterTimeLogSummaryByDate" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteTimeLogConfirmationOpen"
                    :message="`${$t('timeLogs.table.confirmation.deleteTimeLogConfirmation')}?`"
                    @close="state.modal.isDeleteTimeLogConfirmationOpen = false" @confirm="deleteTimeLog" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenTimeLogService } from '@/components/api/user/CitizenTimeLogService'
import { timeLogService } from '@/components/api/user/TimeLogService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useCitizenStore } from '@/store/citizen'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
})

const citizenStore = useCitizenStore() as any
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const { t } = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'openInterventionHours'])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'timeLogs.table.createdAt', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'timeLogs.table.dateTimeStart', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'timeLogs.table.dateTimeEnd', isTranslateName: true, sorter: true, key: 'date_time_end' },
        { name: 'timeLogs.table.status.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: 'timeLogs.table.remarks', isTranslateName: true, },
        { name: 'timeLogs.table.summary', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    isTimeLogSummaryLoading: false,
    modal: {
        isAddNewTimeLogOpen: false,
        isDeleteTimeLogConfirmationOpen: false,
        isDownloadTimeLogsOpen: false,
        isEditTimeLogOpen: false,
        isViewTimeLogOpen: false,
        isTimeLogSummaryDateRangeOpen: false,
    },
    timeLogs: [] as any,
    selectedTimeLog: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    timeLogSummary: {} as any,
    timeLogSummaryFilter: {
        formDateRange: {
            date_start: moment().startOf('month').format('YYYY-MM-DD'),
            date_end: moment().endOf('month').format('YYYY-MM-DD'),
        }
    },
})

function closeModal() {
    emit('close')
}

function openInterventionHoursModal() {
    emit('openInterventionHours')
}

async function fetchTimeLogSummary() {
    state.error = {}
    state.isTimeLogSummaryLoading = true
    try {
        const params = {
            date_start: state.timeLogSummaryFilter.formDateRange.date_start,
            date_end: state.timeLogSummaryFilter.formDateRange.date_end,
        }
        const response = await citizenTimeLogService.timeLogSummary(props.citizenUuid, params)
        if (response) {
            state.timeLogSummary = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTimeLogSummaryLoading = false
}

function filterTimeLogSummaryByDate(formDateRange: any) {
    state.timeLogSummaryFilter.formDateRange.date_start = formDateRange.date_start
    state.timeLogSummaryFilter.formDateRange.date_end = formDateRange.date_end
    fetchTimeLogSummary()
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchTimeLogSummary()
        fetchTimeLogs()
    }
})

async function fetchTimeLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: props.citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await citizenTimeLogService.getWalletsPerCitizen(props.citizenUuid, params)
        if (response) {
            state.timeLogs = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchTimeLogs()
}

function next() {
    currentTablePage++
    fetchTimeLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchTimeLogs()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTimeLogs()
}

function viewTimeLog(log: any) {
    state.selectedTimeLog = log
    state.modal.isViewTimeLogOpen = true
}

function editTimeLog(log: any) {
    state.selectedTimeLog = log
    state.modal.isEditTimeLogOpen = true
}

function confirmTimeLogDeletion(log: any) {
    state.selectedTimeLog = log
    state.modal.isDeleteTimeLogConfirmationOpen = true
}

async function deleteTimeLog() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await timeLogService.deleteTimeLog(state.selectedTimeLog.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchTimeLogs()
            successAlert(`${t('alert.success')}!`, `${t('timeLogs.table.alert.timeLogSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
