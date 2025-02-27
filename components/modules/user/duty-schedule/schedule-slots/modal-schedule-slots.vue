<template>
    <div>
        <Modal size="4xl"
            :title="$t('dutySchedules.scheduleSlots.scheduleSlots') + ' (' + formatDateToReadable(props?.selectedDay?.fullDate) + ')'"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
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
                                <template #body
                                    v-if="!(state.isTableLoading || (state.scheduleSlots?.data?.length === 0))">
                                    <tr v-for="(slot, index) in state.scheduleSlots?.data" :key="index">
                                        <td width="15%">
                                            <span v-if="slot?.shift_type === 'regular_shift'">
                                                {{ $t('dutySchedules.shifts.regularShift') }}
                                            </span>
                                            <span v-if="slot?.shift_type === 'sleeping_night_shift'">
                                                {{ $t('dutySchedules.shifts.sleepingNightShift') }}
                                            </span>
                                            <span v-if="slot?.shift_type === 'awake_night_shift'">
                                                {{ $t('dutySchedules.shifts.awakeNightShift') }}
                                            </span>
                                            <span v-if="slot?.shift_type === 'sick_leave'">
                                                {{ $t('dutySchedules.shifts.sickLeave') }}
                                            </span>
                                            <span v-if="slot?.shift_type === 'vacation_leave'">
                                                {{ $t('dutySchedules.shifts.vacationLeave') }}
                                            </span>
                                        </td>
                                        <td width="20%">
                                            <span>{{ slot?.job?.title }}</span>
                                            <div class="flex flex-wrap gap-1">
                                                <div v-for="(job_specialty, index) in slot?.schedule_specialties"
                                                    :key="index">
                                                    <p class="text-xxs bg-primary text-white p-1 rounded-md">
                                                        {{ job_specialty?.title }}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td width="20%">
                                            <span>{{ moment(slot?.time_in, "HH:mm").format('HH:mm') }}</span> -
                                            <span>{{ moment(slot?.time_out, "HH:mm").format('HH:mm') }}</span>
                                        </td>
                                        <td width="5%">
                                            <span>{{ slot?.available_slots }}</span>
                                        </td>
                                        <td width="40%">
                                            <div class="flex items-end gap-2">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewScheduleSlotRequesters(slot)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                    {{ $t('dutySchedules.scheduleSlots.table.actions.viewRequesters') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editScheduleSlot(slot)">
                                                    <Icon name="ph:pencil" class="size-4" />
                                                    {{ $t('dutySchedules.scheduleSlots.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="confirmScheduleSlotDeletion(slot)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                    {{ $t('dutySchedules.scheduleSlots.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.scheduleSlots" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserDutyScheduleScheduleSlotsModalRequesters
                    :isModalOpen="state.modal.isViewScheduleSlotRequestersOpen"
                    :selectedScheduleSlot="state.selectedScheduleSlot"
                    @close="state.modal.isViewScheduleSlotRequestersOpen = false"
                    @refreshScheduleSlotAndDutySchedules="fetchScheduleSlotsAndDutySchedules" />
                <ModulesUserDutyScheduleScheduleSlotsModalNewScheduleSlot
                    :isModalOpen="state.modal.isAddNewScheduleSlotOpen" :selectedDay="props.selectedDay"
                    @close="state.modal.isAddNewScheduleSlotOpen = false" @refreshScheduleSlot="fetchScheduleSlots" />
                <ModulesUserDutyScheduleScheduleSlotsModalEditScheduleSlot
                    :isModalOpen="state.modal.isEditScheduleSlotOpen" :selectedScheduleSlot="state.selectedScheduleSlot"
                    @close="state.modal.isEditScheduleSlotOpen = false" @refreshScheduleSlot="fetchScheduleSlots" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleSlotOpen"
                    :message="$t('dutySchedules.scheduleSlots.confirmation.requestConfirmation') + '?'"
                    @close="state.modal.isDeleteScheduleSlotOpen = false" @confirm="deleteScheduleSlot" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { scheduleSlotService } from '@/components/api/ScheduleSlotService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDay: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDutySchedules'])

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'shift_type' },
        { column: 'available_slots' },
    ],
    columnHeaders: [
        { name: 'dutySchedules.scheduleSlots.table.shiftType' },
        { name: 'dutySchedules.scheduleSlots.table.jobTitle' },
        { name: 'dutySchedules.scheduleSlots.table.time' },
        { name: 'dutySchedules.scheduleSlots.table.numberOfShifts' },
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

watch(() => props.isModalOpen, (isModalOpen: Boolean) => {
    if (isModalOpen) {
        state.error = {}
        fetchScheduleSlots()
    }
})

function closeModal() {
    emit('close')
}

function fetchScheduleSlotsAndDutySchedules() {
    fetchScheduleSlots()
    emit('refreshDutySchedules')
}

async function fetchScheduleSlots() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            date_start: moment(props.selectedDay?.fullDate).format('YYYY-MM-DD'),
            date_end: moment(props.selectedDay?.fullDate).format('YYYY-MM-DD'),
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await scheduleSlotService.getScheduleSlots(params)
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
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleSlots.alert.scheduleSlotSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>