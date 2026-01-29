<template>
    <h3 class="text-primary text-base font-medium py-2">
        {{ $t('overview.scheduleSlots') }}
    </h3>
    <div>
        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-6 pb-7 pl-6 mr-1">
            <div class="flex justify-end items-center mb-5">
                <FormButton buttonStyle="action" class="rounded-lg"
                    @click="state.modal.isAddNewScheduleSlotOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('dutySchedules.scheduleSlots.offerNewTime') }}
                </FormButton>
            </div>
            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <TableSearch @search="handleSearch" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.scheduleSlots"
                        :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.scheduleSlots?.data?.length === 0))">
                            <tr v-for="(slot, index) in state.scheduleSlots?.data" :key="index">
                                <td width="15%">
                                    <div class="text-xxs flex flex-wrap gap-1">
                                        <span v-for="(department, index) in slot?.departments" :key=index
                                            class="bg-primary px-2 py-1 text-white rounded-md">
                                            {{ department?.name }}
                                        </span>
                                    </div>
                                </td>
                                <td width="20%">
                                    <p class="truncate">
                                        {{ language.locale.value === 'en' ? slot?.shift?.en_name :
                                            slot?.shift?.dk_name }}
                                    </p>
                                </td>
                                <td width="30%">
                                    <div class="space-y-1 w-full">
                                        <div v-for="(job_title, index) in slot?.job_titles" :key="index">
                                            <span>{{ job_title?.title }}</span>
                                            <div class="flex gap-1">
                                                <div v-for="(speciality, index) in job_title?.specialties" :key="index">
                                                    <p class="truncate text-xxs bg-primary text-white p-1 rounded-md">
                                                        {{ speciality?.job_specialty?.title }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td width="10%">
                                    <div class="truncate">
                                        <span>{{ formatDateTimeToReadable(slot?.date_time_start) }}</span>
                                    </div>
                                </td>
                                <td width="10%">
                                    <div class="truncate">
                                        <span>{{ formatDateTimeToReadable(slot?.date_time_end) }}</span>
                                    </div>
                                </td>
                                <td width="10%">
                                    <p>
                                        {{ slot?.available_slots }}
                                    </p>
                                </td>
                                <td width="10%">
                                    <div class="flex items-end gap-2">
                                        <Tooltip :text="$t('dutySchedules.scheduleSlots.table.actions.viewRequesters')">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewScheduleSlotRequesters(slot)">
                                                <Icon name="ph:eye" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('dutySchedules.scheduleSlots.table.actions.edit')">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editScheduleSlot(slot)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('dutySchedules.scheduleSlots.table.actions.delete')">
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="confirmScheduleSlotDeletion(slot)">
                                                <Icon name="ph:trash" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.scheduleSlots" @previous="previous" @next="next" />
            </div>
        </div>
        <ModulesUserDutyScheduleScheduleSlotsModalRequesters :isModalOpen="state.modal.isViewScheduleSlotRequestersOpen"
            :selectedScheduleSlot="state.selectedScheduleSlot"
            @close="state.modal.isViewScheduleSlotRequestersOpen = false" />
        <ModulesUserDutyScheduleScheduleSlotsModalNewScheduleSlot :isModalOpen="state.modal.isAddNewScheduleSlotOpen"
            :selectedDay="props.dateRange" @close="state.modal.isAddNewScheduleSlotOpen = false"
            @refreshScheduleSlot="fetchScheduleSlots" />
        <ModulesUserDutyScheduleScheduleSlotsModalEditScheduleSlot :isModalOpen="state.modal.isEditScheduleSlotOpen"
            :selectedScheduleSlot="state.selectedScheduleSlot" @close="state.modal.isEditScheduleSlotOpen = false"
            @refreshScheduleSlot="fetchScheduleSlots" />
        <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleSlotOpen"
            :message="$t('dutySchedules.scheduleSlots.confirmation.requestConfirmation') + '?'"
            @close="state.modal.isDeleteScheduleSlotOpen = false" @confirm="deleteScheduleSlot" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
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
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
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

onMounted(() => {
    fetchScheduleSlots()
})

async function fetchScheduleSlots() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            date_start: props.dateRange.end_date,
            date_end: props.dateRange.start_date,
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