<template>
    <h3 class="text-primary text-base font-medium py-2">
        {{ $t('overview.scheduleSlots') }}
    </h3>
    <div>
        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-6 pb-7 pl-6 mr-1">
            {{ state.scheduleSlots?.data?.length }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { scheduleSlotService } from '@/components/api/user/ScheduleSlotService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    } as any,
})

const departmentStore = useDepartmentStore()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.scheduleSlots.table.departments', isTranslateName: true, },
        { name: 'dutySchedules.scheduleSlots.table.shiftType', isTranslateName: true, },
        { name: 'dutySchedules.scheduleSlots.table.jobTitles', isTranslateName: true, },
        { name: 'dutySchedules.scheduleSlots.table.dateTimeStart', isTranslateName: true, },
        { name: 'dutySchedules.scheduleSlots.table.dateTimeEnd', isTranslateName: true, },
        { name: 'dutySchedules.scheduleSlots.table.numberOfShifts', isTranslateName: true, },
        { name: '' },

    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddNewScheduleSlotOpen: false,
        isEditScheduleSlotOpen: false,
        isDeleteScheduleSlotOpen: false,
        isViewScheduleSlotRequestersOpen: false,
    },
    scheduleSlots: [] as any,
    selectedScheduleSlot: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.dateRange, () => {
    fetchScheduleSlots()
}, { deep: true })

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchScheduleSlots()
    }
})

onMounted(() => {
    fetchScheduleSlots()
})

async function fetchScheduleSlots() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            date_start: props.dateRange.start_date,
            date_end: props.dateRange.end_date,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await dailyOverviewService.getScheduleSlots(params)
        if (response) {
            state.scheduleSlots = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchScheduleSlots()
}

function next() {
    currentTablePage++
    fetchScheduleSlots()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchScheduleSlots()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchScheduleSlots()
}

function viewScheduleSlotRequesters(slot: any) {
    state.selectedScheduleSlot = slot
    state.modal.isViewScheduleSlotRequestersOpen = true
}

function editScheduleSlot(slot: any) {
    state.selectedScheduleSlot = slot
    state.modal.isEditScheduleSlotOpen = true
}

function confirmScheduleSlotDeletion(slot: any) {
    state.selectedScheduleSlot = slot
    state.modal.isDeleteScheduleSlotOpen = true
}

async function deleteScheduleSlot() {
    state.error = {}
    state.isTableLoading = true
    try {
        const scheduleSlotUuid = state.selectedScheduleSlot.uuid
        const response = await scheduleSlotService.deleteScheduleSlot(scheduleSlotUuid)
        if (response) {
            fetchScheduleSlots()
            emit('refreshDutySchedules')
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleSlots.alert.scheduleSlotSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>