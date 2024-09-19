<template>
    <div>
        <Modal size="3xl"
            :title="$t('dutySchedules.scheduleSlots.scheduleSlots') + ' (' + formatDateToReadable(props?.selectedDay?.fullDate) + ')'"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddNewScheduleSlotOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.scheduleSlots.newScheduleSlot') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                            @handleFilter="handleFilter" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.scheduleSlots"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.scheduleSlots?.data?.length === 0))">
                                    <tr v-for="(slot, index) in state.scheduleSlots?.data" :key="index">
                                        <td width="15%">
                                            <span>{{ slot?.shift_type }}</span>
                                        </td>
                                        <td width="15%">
                                            <span>{{ slot?.job?.title }}</span>
                                        </td>
                                        <td width="15%">
                                            <span>{{ slot?.time_in }}</span>
                                        </td>
                                        <td width="15%">
                                            <span>{{ slot?.time_out }}</span>
                                        </td>
                                        <td width="10%">
                                            <span>{{ slot?.available_slots }}</span>
                                        </td>
                                        <td width="10%">
                                            <Badge :type="slot?.is_active ? 'active' : 'primary'">
                                                <p class="text-xs">
                                                    {{
                                                        slot?.is_active ?
                                                            $t('dutySchedules.scheduleSlots.table.active') :
                                                            $t('dutySchedules.scheduleSlots.table.inactive')
                                                    }}
                                                </p>
                                            </Badge>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editScheduleSlot(slot)">
                                                    <Icon name="ph:pencil" class="size-4" />
                                                    {{ $t('employees.table.actions.edit') }}
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
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { scheduleSlotService } from '@/components/api/ScheduleSlotService'
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
const emit = defineEmits(['close'])

const { formatDateToReadable } = useDatetimeFormatter()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'shift_type' },
        { column: 'available_slots' },
    ],
    columnHeaders: [
        { name: 'dutySchedules.scheduleSlots.table.shiftType' },
        { name: 'dutySchedules.scheduleSlots.table.jobTitle' },
        { name: 'dutySchedules.scheduleSlots.table.timeIn' },
        { name: 'dutySchedules.scheduleSlots.table.timeOut' },
        { name: 'dutySchedules.scheduleSlots.table.availableSlots' },
        { name: 'dutySchedules.scheduleSlots.table.status' },
        { name: '' },

    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddNewScheduleSlotOpen: false,
        isEditScheduleSlotOpen: false,
        isDeleteScheduleSlotOpen: false,
    },
    scheduleSlots: [] as any,
    selectedScheduleSlot: [],
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

async function fetchScheduleSlots() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            date_from: moment(props.selectedDay?.fullDate).format('YYYY-MM-DD'),
            date_to: moment(props.selectedDay?.fullDate).format('YYYY-MM-DD'),
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchScheduleSlots()
}

function editScheduleSlot(slot: any) {
    state.selectedScheduleSlot = slot
    state.modal.isEditScheduleSlotOpen = true
}
</script>