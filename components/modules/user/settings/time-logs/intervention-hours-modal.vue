<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.interventionHours.interventionHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="mt-6 flex items-center gap-x-2 justify-end">
                    <button class="flex items-center gap-x-1 text-sm text-primary group"
                        @click="state.modal.isFilterDutyScheduleOpen = true">
                        <Icon name="ic:outline-filter-list"
                            class="text-primary w-6 h-6 group-hover:text-primary-700" />
                        <span class="group-hover:text-primary-700">
                            {{ $t('filter') }}
                        </span>
                    </button>
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isDownloadInterventionHoursOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.interventionHours.download.download') }}
                    </FormButton>
                </div>
                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.interventionHours"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.interventionHours?.data?.length === 0))">
                                <tr v-for="(inteventionHours, index) in state.interventionHours?.data" :key="index">
                                    <td width="15%">
                                        {{ inteventionHours?.citizen?.firstname + ' ' + inteventionHours?.citizen?.lastname }}
                                    </td>
                                    <td width="15%">
                                        {{ inteventionHours?.date_time_start ?
                                            formatDateTimeToReadable(inteventionHours?.date_time_start) : '' }}
                                    </td>
                                    <td width="15%">
                                        {{ inteventionHours?.date_time_end ?
                                            formatDateTimeToReadable(inteventionHours?.date_time_end) : '' }}
                                    </td>
                                    <td width="20%">
                                        {{ inteventionHours?.note }}
                                    </td>
                                    <td width="10%">
                                        <div class="truncate">
                                            {{ formatNumber(language.locale.value, inteventionHours?.total_hours) }}
                                            <Badge type="primary" class="text-xxs"
                                                v-if="inteventionHours?.is_from_duty_schedule">
                                                {{ $t('citizens.interventionHours.table.fromDutySchedule') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <div v-if="inteventionHours?.is_transportation" class="rounded-xl bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold text-center w-fit">{{ $t('citizens.interventionHours.table.transport') }}</div>
                                        <div v-else class="rounded-xl bg-teal-100 text-tertiary-800 px-2 py-1 text-xs font-semibold text-center w-fit">{{ $t('citizens.interventionHours.table.work') }}</div>
                                    </td>
                                    <td width="20%">
                                        {{ inteventionHours?.user?.firstname + ' ' + inteventionHours?.user?.lastname }}
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewInterventionHourLog(inteventionHours)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editInterventionHours(inteventionHours)"
                                                v-if="inteventionHours?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteInterventionHoursConfirmation(inteventionHours)"
                                                v-if="inteventionHours?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.interventionHours" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenInterventionHoursModalNew :isModalOpen="state.modal.isAddInterventionHoursOpen"
                    @close="state.modal.isAddInterventionHoursOpen = false"
                    @refreshInterventionHours="refreshInterventionHours()" />
                <ModulesUserCitizenInterventionHoursModalEdit :isModalOpen="state.modal.isEditInterventionHoursOpen"
                    :selectedInterventionHours="state.selectedInterventionHours"
                    @close="state.modal.isEditInterventionHoursOpen = false"
                    @refreshInterventionHours="refreshInterventionHours()" />
                <ModulesUserSettingsTimeLogsInterventionHoursDownloadModal
                    :isModalOpen="state.modal.isDownloadInterventionHoursOpen"
                    @close="state.modal.isDownloadInterventionHoursOpen = false" />
                <ModulesUserCitizenInterventionHoursModalDateRange :isModalOpen="state.modal.isTimeAccountDateRangeOpen"
                    :dateRange="state.timeAccountFilter.formDateRange"
                    @close="state.modal.isTimeAccountDateRangeOpen = false" @filterDate="filterByDate" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteInterventionHoursOpen"
                    :message="$t('citizens.interventionHours.table.confirmation.deleteInterventionHoursConfirmation') + '?'"
                    @close="state.modal.isDeleteInterventionHoursOpen = false" @confirm="deleteInterventionHours" />
                <ModulesUserCitizenInterventionHoursModalViewLog
                    :selectedCareHour="state.selectedInterventionHours"
                    :isModalOpen="state.modal.isViewInterventionHourLogOpen" @close="state.modal.isViewInterventionHourLogOpen = false" />
                <ModulesUserSettingsTimeLogsInterventionHoursModalFilter @setFilter="setFilter"
                    :isModalOpen="state.modal.isFilterDutyScheduleOpen" @close="state.modal.isFilterDutyScheduleOpen = false" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
// import { useCitizenStore } from '@/store/citizen'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'refreshCitizenDetails'])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.interventionHours.table.citizen', isTranslateName: true, sorter: true},
        { name: 'citizens.interventionHours.table.datetimeStart', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'citizens.interventionHours.table.datetimeEnd', isTranslateName: true, sorter: true, key: 'date_time_end' },
        { name: 'citizens.interventionHours.table.note', isTranslateName: true, },
        { name: 'citizens.interventionHours.table.totalHours', isTranslateName: true, },
        { name: 'citizens.interventionHours.table.type', isTranslateName: true, key: 'is_transportation' },
        { name: 'citizens.interventionHours.table.createdBy', isTranslateName: true, },
        { name: '' },
    ],
    contributionMargin: {} as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isContributionMarginLoading: false,
    isTimeAccountLoading: false,
    isTableLoading: false,
    filter: {
        department_uuids: [],
        citizen_uuids: [],
        user_uuids: [],
        is_transportation: '' as any,
        start_date: '',
        end_date: '',
    },
    modal: {
        isAddInterventionHoursOpen: false,
        isDeleteInterventionHoursOpen: false,
        isDownloadInterventionHoursOpen: false,
        isEditInterventionHoursOpen: false,
        isTimeAccountDateRangeOpen: false,
        isViewInterventionHourLogOpen: false,
        isFilterDutyScheduleOpen: false,
    },
    interventionHours: [] as any,
    selectedInterventionHours: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    timeAccount: {} as any,
    timeAccountFilter: {
        formDateRange: {
            date_time_start: moment().startOf('month').format('YYYY-MM-DD'),
            date_time_end: moment().endOf('month').format('YYYY-MM-DD'),
        }
    },
})

function closeModal() {
    emit('close')
}

function refreshInterventionHours() {
    fetchInterventionHours()
    emit('refreshCitizenDetails')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchInterventionHours()
    }
})

function filterByDate(formDateRange: any) {
    state.timeAccountFilter.formDateRange.date_time_start = formDateRange.date_time_start
    state.timeAccountFilter.formDateRange.date_time_end = formDateRange.date_time_end
    
    fetchInterventionHours()
}

async function fetchInterventionHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        } as any

        if (state.filter.department_uuids?.length > 0) {
            params.department_uuids = Array(state.filter.department_uuids)
        }
        if (state.filter.citizen_uuids?.length > 0) {
            params.citizen_uuids = Array(state.filter.citizen_uuids)
        }
        if (state.filter.user_uuids?.length > 0) {
            params.user_uuids = Array(state.filter.user_uuids)
        }
        if (state.filter.is_transportation !== '') {
            params.is_transportation = state.filter.is_transportation
        }
        if (state.filter.start_date && state.filter.end_date) {
            params.start_date = state.filter.start_date
            params.end_date = state.filter.end_date
        }
        
        const response = await interventionHoursService.getAllInterventionHours(params)
        if (response) {
            state.interventionHours = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchInterventionHours()
}

function next() {
    currentTablePage++
    fetchInterventionHours()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchInterventionHours()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInterventionHours()
}

function viewInterventionHourLog(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isViewInterventionHourLogOpen = true
}

function editInterventionHours(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isEditInterventionHoursOpen = true
}

function deleteInterventionHoursConfirmation(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isDeleteInterventionHoursOpen = true
}

async function deleteInterventionHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const interventionHoursUuid = state.selectedInterventionHours.uuid
        const response = await interventionHoursService.deleteInterventionHours(interventionHoursUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('citizens.interventionHours.table.alert.interventionHoursSuccessfullyDeleted')}.`)
            refreshInterventionHours()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function setFilter(filter: any) {
    state.filter.department_uuids = filter.department_uuids
    state.filter.citizen_uuids = filter.citizen_uuids
    state.filter.user_uuids = filter.employee_uuids
    state.filter.is_transportation = filter.employment_status.includes('transport') ? true : filter.employment_status.includes('work') ? false : ''
    state.filter.start_date = filter.date_range?.[0]
    state.filter.end_date = filter.date_range?.[1]

    fetchInterventionHours()
}
</script>