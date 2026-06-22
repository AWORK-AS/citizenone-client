<template>
    <div>
        <Modal size="4xl"
            :title="`${$t('dutySchedules.leaveRequests.leaveRequests')} - ${props.selectedEmployee?.firstname} ${props.selectedEmployee?.lastname}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-between items-center mb-5">
                        <div class="flex flex-col md:flex-row gap-x-1 flex-wrap font-medium">
                            <button
                                class="flex items-center gap-x-1 w-fit text-xs text-primary hover:text-primary-700 hover:underline"
                                @click="state.modal.isLeaveRequestDateRangeOpen = true">
                                <Icon name="ic:outline-filter-list"
                                    class="text-primary w-6 h-6 group-hover:text-primary-700" />
                                ({{ formatDateToReadable(state.shiftDateRange.formDateRange.start_date) }} -
                                {{ formatDateToReadable(state.shiftDateRange.formDateRange.end_date) }})
                            </button>
                        </div>
                        <FormButton buttonStyle="action" @click="state.modal.isAddNewLeaveRequestOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.leaveRequests.newLeaveRequest') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.leaveRequests"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.leaveRequests?.data?.length === 0))">
                                    <tr v-for="(leaveRequests, index) in state.leaveRequests?.data" :key="index">
                                        <td width="20%">
                                            <p class="truncate">
                                                {{ formatDateTimeToReadable(leaveRequests?.date_time_start) }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <p class="truncate">
                                                {{ formatDateTimeToReadable(leaveRequests?.date_time_end) }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <p v-if="leaveRequests?.type === 'sick_leave'">
                                                {{ $t('dutySchedules.leaveRequests.table.type.sickLeave') }}
                                            </p>
                                            <p v-if="leaveRequests?.type === 'vacation_leave'">
                                                {{ $t('dutySchedules.leaveRequests.table.type.vacationLeave') }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <p>
                                                {{ leaveRequests?.note }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <span v-if="leaveRequests?.extra_hours_status === 'pending'">
                                                {{ $t('dutySchedules.leaveRequests.table.status.pending') }}
                                            </span>
                                            <span v-if="leaveRequests?.extra_hours_status === 'approved'">
                                                {{ $t('dutySchedules.leaveRequests.table.status.approved') }}
                                            </span>
                                            <span v-if="leaveRequests?.extra_hours_status === 'rejected'">
                                                {{ $t('dutySchedules.leaveRequests.table.status.rejected') }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip :text="$t('dutySchedules.leaveRequests.table.actions.edit')"
                                                    @click="editLeaveRequest(leaveRequests)"
                                                    v-if="isAtLeast('Admin') || ['pending'].includes(leaveRequests?.status)">
                                                    <FormButton type=" button" buttonStyle="action">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.leaveRequests.table.actions.approve')"
                                                    @click="confirmApproveLeaveRequestRequest(leaveRequests)"
                                                    v-if="isAtLeast('Admin') && leaveRequests?.status === 'pending'"">
                                                    <FormButton type=" button" buttonStyle="success">
                                                    <Icon name="ph:check" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.leaveRequests.table.actions.reject')"
                                                    @click="confirmRejectLeaveRequestRequest(leaveRequests)"
                                                    v-if="isAtLeast('Admin') && leaveRequests?.status === 'pending'"">
                                                    <FormButton type=" button" buttonStyle="danger">
                                                    <Icon name="ph:x" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.leaveRequests.table.actions.delete')"
                                                    @click="confirmDeleteLeaveRequest(leaveRequests)"
                                                    v-if="isAtLeast('Admin') ||
                                                        (!isAtLeast('Admin') && ['pending'].includes(leaveRequests?.status))">
                                                    <FormButton type="button" buttonStyle="danger">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.leaveRequests" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isLeaveRequestDateRangeOpen"
                    :dateRange="state.shiftDateRange" @close="state.modal.isLeaveRequestDateRangeOpen = false"
                    @filterDate="filterLeaveRequestByDateRange" />
                <ModulesUserDutyScheduleLeaveRequestsModalNew :isModalOpen="state.modal.isAddNewLeaveRequestOpen"
                    :selectedEmployee="props.selectedEmployee" @close="state.modal.isAddNewLeaveRequestOpen = false"
                    @refreshLeaveRequests="fetchLeaveRequests" @refreshDutySchedules="emit('refreshDutySchedules')" />
                <ModulesUserDutyScheduleLeaveRequestsModalEdit :isModalOpen="state.modal.isEditLeaveRequestOpen"
                    :selectedEmployee="props.selectedEmployee" :selectedLeaveRequest="state.selectedLeaveRequest"
                    @close="state.modal.isEditLeaveRequestOpen = false" @refreshLeaveRequests="fetchLeaveRequests"
                    @refreshDutySchedules="emit('refreshDutySchedules')" />
                <DialogConfirmation :isModalOpen="state.modal.isApproveRequest"
                    :message="$t('dutySchedules.leaveRequests.table.confirmation.approveLeaveRequestConfirmation') + '?'"
                    @close="state.modal.isApproveRequest = false" @confirm="approveLeaveRequestRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isRejectRequest"
                    :message="$t('dutySchedules.leaveRequests.table.confirmation.rejectLeaveRequestConfirmation') + '?'"
                    @close="state.modal.isRejectRequest = false" @confirm="rejectLeaveRequestRequest">
                    <template #extra>
                        <label class="mt-4 block text-sm font-medium text-gray-700">
                            {{ $t('dutySchedules.leaveRequests.table.confirmation.rejectComment') }}
                        </label>
                        <textarea v-model="state.rejectComment" rows="3"
                            :placeholder="$t('dutySchedules.leaveRequests.table.confirmation.rejectCommentPlaceholder')"
                            class="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-palette-green focus:ring-palette-green" />
                    </template>
                </DialogConfirmation>
                <DialogConfirmation :isModalOpen="state.modal.isDeleteLeaveRequestOpen"
                    :message="$t('dutySchedules.leaveRequests.table.confirmation.deleteLeaveRequestConfirmation') + '?'"
                    @close="state.modal.isDeleteLeaveRequestOpen = false" @confirm="deleteLeaveRequest" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { leaveRequestService } from '@/components/api/user/LeaveRequestService'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDutySchedules'])

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.leaveRequests.table.dateTimeStart', isTranslateName: true, sorter: true, key: 'date' },
        { name: 'dutySchedules.leaveRequests.table.dateTimeEnd', isTranslateName: true, sorter: true, key: 'extra_hours_type' },
        { name: 'dutySchedules.leaveRequests.table.leaveType', isTranslateName: true },
        { name: 'dutySchedules.leaveRequests.table.note', isTranslateName: true, },
        { name: 'dutySchedules.leaveRequests.table.status.status', isTranslateName: true, sorter: true, key: 'extra_hours_status' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddNewLeaveRequestOpen: false,
        isApproveRequest: false,
        isDeleteLeaveRequestOpen: false,
        isEditLeaveRequestOpen: false,
        isLeaveRequestDateRangeOpen: false,
        isRejectRequest: false,
    },
    leaveRequests: [] as any,
    selectedLeaveRequest: [] as any,
    rejectComment: '',
    shiftDateRange: {
        formDateRange: {
            start_date: moment().startOf('week').add(1, 'day'),
            end_date: moment().startOf('week').add(7, 'day'),
        },
    } as any,
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: Boolean) => {
    if (isModalOpen) {
        state.error = {}
        fetchLeaveRequests()
    }
})

function closeModal() {
    emit('close')
}

async function fetchLeaveRequests() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            start_date: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            end_date: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            ...state.dataFilter
        }
        const response = await leaveRequestService.getLeaveRequests(params)
        if (response) {
            state.leaveRequests = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchLeaveRequests()
}

function next() {
    currentTablePage++
    fetchLeaveRequests()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchLeaveRequests()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchLeaveRequests()
}

function filterLeaveRequestByDateRange(formDateRange: any) {
    state.shiftDateRange.formDateRange.start_date = formDateRange?.[0]
    state.shiftDateRange.formDateRange.end_date = formDateRange?.[1]
    fetchLeaveRequests()
}


function editLeaveRequest(leaveRequests: any) {
    state.selectedLeaveRequest = leaveRequests
    state.modal.isEditLeaveRequestOpen = true
}

function confirmApproveLeaveRequestRequest(leaveRequests: any) {
    state.selectedLeaveRequest = leaveRequests
    state.modal.isApproveRequest = true
}

async function approveLeaveRequestRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const leaveRequestsUuid = state.selectedLeaveRequest.uuid
        const response = await leaveRequestService.approveLeaveRequest(leaveRequestsUuid)
        if (response) {
            fetchLeaveRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.leaveRequests.table.alert.leaveRequestsSuccessfullyApproved')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmRejectLeaveRequestRequest(leaveRequests: any) {
    state.selectedLeaveRequest = leaveRequests
    state.rejectComment = ''
    state.modal.isRejectRequest = true
}

async function rejectLeaveRequestRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const leaveRequestsUuid = state.selectedLeaveRequest.uuid
        const comment = state.rejectComment?.trim() || undefined
        const response = await leaveRequestService.rejectLeaveRequest(leaveRequestsUuid, comment)
        if (response) {
            state.rejectComment = ''
            fetchLeaveRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.leaveRequests.table.alert.leaveRequestsSuccessfullyRejected')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmDeleteLeaveRequest(leaveRequests: any) {
    state.selectedLeaveRequest = leaveRequests
    state.modal.isDeleteLeaveRequestOpen = true
}

async function deleteLeaveRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const leaveRequestsUuid = state.selectedLeaveRequest.uuid
        const response = await leaveRequestService.deleteLeaveRequest(leaveRequestsUuid)
        if (response) {
            fetchLeaveRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.leaveRequests.table.alert.leaveRequestsSuccessfullyDeleted')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>