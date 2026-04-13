<template>
    <div>
        <Modal size="4xl"
            :title="`${$t('dutySchedules.scheduleRequests.requests')} (${formatDateToReadable(props?.selectedDate)}) - ${props.selectedEmployee?.firstname} ${props.selectedEmployee?.lastname}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.scheduleRequests"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.scheduleRequests?.data?.length === 0))">
                                    <tr v-for="(request, index) in state.scheduleRequests?.data" :key="index">
                                        <td width="15%">
                                            <p>
                                                {{ request?.recipient?.firstname + ' ' + request?.recipient?.lastname }}
                                            </p>
                                        </td>
                                        <td width="20%">
                                            <p>
                                                {{ language.locale.value === 'en' ? request?.schedule?.shift?.en_name :
                                                    request?.schedule?.shift?.dk_name }}
                                            </p>
                                        </td>
                                        <td width="20%">
                                            <span>
                                                {{ moment(request?.schedule?.time_in, "HH:mm").format('HH:mm') }}
                                            </span> -
                                            <span>
                                                {{ moment(request?.schedule?.time_out, "HH:mm").format('HH:mm') }}
                                            </span>
                                        </td>
                                        <td width="25%">
                                            <span>{{ request?.note }}</span>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="confirmApproveScheduleRequest(request)">
                                                    <Icon name="ph:check" class="size-4" />
                                                    {{
                                                        $t('dutySchedules.scheduleRequests.swapSchedule.table.actions.approve')
                                                    }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="confirmDispproveScheduleRequest(request)">
                                                    <Icon name="ph:x" class="size-4" />
                                                    {{
                                                        $t('dutySchedules.scheduleRequests.swapSchedule.table.actions.disapprove')
                                                    }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.scheduleRequests" @previous="previous" @next="next" />
                    </div>
                </div>
                <DialogConfirmation :isModalOpen="state.modal.isApproveRequest"
                    :message="$t('dutySchedules.scheduleRequests.swapSchedule.table.confirmation.approveConfirmation') + '?'"
                    @close="state.modal.isApproveRequest = false" @confirm="approveScheduleRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isDisapproveRequest"
                    :message="$t('dutySchedules.scheduleRequests.swapSchedule.table.confirmation.disapproveConfirmation') + '?'"
                    @close="state.modal.isDisapproveRequest = false" @confirm="rejectScheduleRequest" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { shiftSwapRequestService } from '@/components/api/user/ShiftSwapRequestService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDate: {
        type: String,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDutySchedules'])

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.scheduleRequests.swapSchedule.table.assignee', isTranslateName: true, },
        { name: 'dutySchedules.scheduleRequests.swapSchedule.table.shiftType', isTranslateName: true, },
        { name: 'dutySchedules.scheduleRequests.swapSchedule.table.schedule', isTranslateName: true, },
        { name: 'dutySchedules.scheduleRequests.swapSchedule.table.note', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isApproveRequest: false,
        isDisapproveRequest: false,
    },
    scheduleRequests: [] as any,
    selectedScheduleRequest: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: Boolean) => {
    if (isModalOpen) {
        state.error = {}
        fetchScheduleRequests()
    }
})

function closeModal() {
    emit('close')
}

async function fetchScheduleRequests() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            date: props.selectedDate,
            user_uuid: props.selectedEmployee?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await shiftSwapRequestService.getScheduleSwapRequests(params)
        if (response) {
            state.scheduleRequests = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchScheduleRequests()
}

function next() {
    currentTablePage++
    fetchScheduleRequests()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchScheduleRequests()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchScheduleRequests()
}

function confirmApproveScheduleRequest(request: any) {
    state.selectedScheduleRequest = request
    state.modal.isApproveRequest = true
}

async function approveScheduleRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const scheduleRequestUuid = state.selectedScheduleRequest.uuid
        const response = await shiftSwapRequestService.approveScheduleSwapRequest(scheduleRequestUuid)
        if (response) {
            fetchScheduleRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleRequests.swapSchedule.table.alert.requestSuccessfullyApproved')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmDispproveScheduleRequest(request: any) {
    state.selectedScheduleRequest = request
    state.modal.isDisapproveRequest = true
}

async function rejectScheduleRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const scheduleRequestUuid = state.selectedScheduleRequest.uuid
        const response = await shiftSwapRequestService.rejectScheduleSwapRequest(scheduleRequestUuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleRequests.swapSchedule.table.alert.requestSuccessfullyDisapproved')}.`)
            fetchScheduleRequests()
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>