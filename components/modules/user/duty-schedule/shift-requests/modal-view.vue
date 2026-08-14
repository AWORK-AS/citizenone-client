<template>
    <div>
        <Modal size="4xl"
            :title="`${$t('dutySchedules.shiftRequests.shiftRequests')} - ${props.selectedEmployee?.firstname} ${props.selectedEmployee?.lastname}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5"
                        v-if="userStore.getUser?.uuid === props.selectedEmployee?.uuid">
                        <FormButton buttonStyle="action" @click="state.modal.isAddNewShiftRequestOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.shiftRequests.newShiftRequest') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.shiftRequests"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.shiftRequests?.data?.length === 0))">
                                    <tr v-for="(shiftRequest, index) in state.shiftRequests?.data" :key="index">
                                        <td width="15%">
                                            <p class="truncate">
                                                {{ formatDateToReadable(shiftRequest?.date) }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <p class="truncate">
                                                {{ formatDateTimeToReadable(shiftRequest?.date_time_start) }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <p class="truncate">
                                                {{ formatDateTimeToReadable(shiftRequest?.date_time_end) }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <p class="truncate">
                                                {{ shiftRequest?.shift_type?.dk_name }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <p>
                                                {{ shiftRequest?.note }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <span v-if="shiftRequest?.status === 'pending'">
                                                {{ $t('dutySchedules.shiftRequests.table.status.pending') }}
                                            </span>
                                            <span v-if="shiftRequest?.status === 'approved'">
                                                {{ $t('dutySchedules.shiftRequests.table.status.approved') }}
                                            </span>
                                            <span v-if="shiftRequest?.status === 'rejected'">
                                                {{ $t('dutySchedules.shiftRequests.table.status.rejected') }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <div class="flex items-end gap-2" v-if="isAtLeast('Admin') && shiftRequest?.status === 'pending'">
                                                <Tooltip :text="$t('dutySchedules.shiftRequests.table.actions.approve')"
                                                    @click="confirmApproveShiftRequest(shiftRequest)">
                                                    <FormButton :aria-label="$t('dutySchedules.shiftRequests.table.actions.approve')" type="button" buttonStyle="success">
                                                        <Icon name="ph:check" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.shiftRequests.table.actions.reject')"
                                                    @click="confirmRejectShiftRequest(shiftRequest)">
                                                    <FormButton :aria-label="$t('dutySchedules.shiftRequests.table.actions.reject')" type="button" buttonStyle="danger">
                                                        <Icon name="ph:x" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.shiftRequests" @previous="previous" @next="next" />
                    </div>
                </div>
                <DialogConfirmation :isModalOpen="state.modal.isApproveRequest"
                    :message="$t('dutySchedules.shiftRequests.table.confirmation.approveShiftRequestConfirmation') + '?'"
                    @close="state.modal.isApproveRequest = false" @confirm="approveShiftRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isRejectRequest"
                    :message="$t('dutySchedules.shiftRequests.table.confirmation.rejectShiftRequestConfirmation') + '?'"
                    @close="state.modal.isRejectRequest = false" @confirm="rejectShiftRequest">
                    <template #extra>
                        <label class="mt-4 block text-sm font-medium text-gray-700">
                            {{ $t('dutySchedules.shiftRequests.table.confirmation.rejectComment') }}
                        </label>
                        <textarea v-model="state.rejectComment" rows="3"
                            :placeholder="$t('dutySchedules.shiftRequests.table.confirmation.rejectCommentPlaceholder')"
                            class="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-palette-green focus:ring-palette-green" />
                    </template>
                </DialogConfirmation>
                <ModulesUserDutyScheduleShiftRequestsModalNew :isModalOpen="state.modal.isAddNewShiftRequestOpen"
                    @close="state.modal.isAddNewShiftRequestOpen = false" @refreshDutySchedules="fetchShiftRequests(); emit('refreshDutySchedules')" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { shiftRequestService } from '@/components/api/user/ShiftRequestService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
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
const { successAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast } = usePermissions()
const userStore = useUserStore() as any
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.shiftRequests.table.date', isTranslateName: true, sorter: true, key: 'date' },
        { name: 'dutySchedules.shiftRequests.table.dateTimeStart', isTranslateName: true },
        { name: 'dutySchedules.shiftRequests.table.dateTimeEnd', isTranslateName: true },
        { name: 'dutySchedules.shiftRequests.table.shiftType', isTranslateName: true },
        { name: 'dutySchedules.shiftRequests.table.note', isTranslateName: true },
        { name: 'dutySchedules.shiftRequests.table.status.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddNewShiftRequestOpen: false,
        isApproveRequest: false,
        isRejectRequest: false,
    },
    shiftRequests: [] as any,
    selectedShiftRequest: {} as any,
    rejectComment: '',
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: Boolean) => {
    if (isModalOpen) {
        state.error = {}
        fetchShiftRequests()
    }
})

function closeModal() {
    emit('close')
}

async function fetchShiftRequests() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await shiftRequestService.getShiftRequests(params)
        if (response) {
            state.shiftRequests = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchShiftRequests()
}

function next() {
    currentTablePage++
    fetchShiftRequests()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchShiftRequests()
}

function confirmApproveShiftRequest(shiftRequest: any) {
    state.selectedShiftRequest = shiftRequest
    state.modal.isApproveRequest = true
}

async function approveShiftRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await shiftRequestService.approveShiftRequest(state.selectedShiftRequest.uuid)
        if (response) {
            state.modal.isApproveRequest = false
            fetchShiftRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.shiftRequests.table.alert.shiftRequestSuccessfullyApproved')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmRejectShiftRequest(shiftRequest: any) {
    state.selectedShiftRequest = shiftRequest
    state.rejectComment = ''
    state.modal.isRejectRequest = true
}

async function rejectShiftRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const comment = state.rejectComment?.trim() || undefined
        const response = await shiftRequestService.rejectShiftRequest(state.selectedShiftRequest.uuid, comment)
        if (response) {
            state.rejectComment = ''
            fetchShiftRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.shiftRequests.table.alert.shiftRequestSuccessfullyRejected')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
