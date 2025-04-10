<template>
    <div>
        <Modal size="lg" :title="$t('dutySchedules.requesters.requesters')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.requesters"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.requesters?.data?.length === 0))">
                                <tr v-for="(requester, index) in state.requesters?.data" :key="index">
                                    <td width="50%">
                                        <span>
                                            {{ requester?.user?.firstname }}
                                            {{ requester?.user?.lastname }}
                                        </span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="success" class="rounded-md"
                                                @click="confirmRequestApproval(requester)">
                                                <Icon name="ph:check" class="size-4" />
                                                {{ $t('dutySchedules.requesters.table.actions.approve') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                @click="confirmRequestDisapproval(requester)">
                                                <Icon name="ph:x" class="size-4" />
                                                {{ $t('dutySchedules.requesters.table.actions.disapprove') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.requesters" @previous="previous" @next="next" />
                </div>
                <DialogConfirmation :isModalOpen="state.modal.isApproveRequestConfirmationOpen"
                    :message="$t('dutySchedules.requesters.confirmation.approveConfirmation') + '?'"
                    @close="state.modal.isApproveRequestConfirmationOpen = false" @confirm="approveRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isDisapproveRequestConfirmationOpen"
                    :message="$t('dutySchedules.requesters.confirmation.disapproveConfirmation') + '?'"
                    @close="state.modal.isDisapproveRequestConfirmationOpen = false" @confirm="disapproveRequest" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { scheduleSlotService } from '@/components/api/user/ScheduleSlotService'
import { scheduleGrabberService } from '@/components/api/user/ScheduleGrabberService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedScheduleSlot: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshScheduleSlotAndDutySchedules'])
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'dutySchedules.requesters.table.name' },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isApproveRequestConfirmationOpen: false,
        isDisapproveRequestConfirmationOpen: false,
    },
    requesters: [] as any,
    selectedRequester: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: Boolean) => {
    if (isModalOpen) {
        state.error = {}
        fetchScheduleSlotsRequesters()
    }
})

function closeModal() {
    emit('close')
}

function refreshScheduleSlotAndDutySchedules() {
    emit('refreshScheduleSlotAndDutySchedules')
}

async function fetchScheduleSlotsRequesters() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedScheduleSlotUuid = props.selectedScheduleSlot?.uuid
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder
        }
        const response = await scheduleSlotService.getScheduleSlotsRequesters(selectedScheduleSlotUuid, params)
        if (response) {
            state.requesters = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchScheduleSlotsRequesters()
}

function next() {
    currentTablePage++
    fetchScheduleSlotsRequesters()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchScheduleSlotsRequesters()
}

function confirmRequestApproval(requester: any) {
    state.selectedRequester = requester
    state.modal.isApproveRequestConfirmationOpen = true
}

async function approveRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            slot_grabber_uuid: state.selectedRequester?.uuid
        }
        const response = await scheduleGrabberService.approveRequest(params)
        if (response) {
            fetchScheduleSlotsRequesters()
            refreshScheduleSlotAndDutySchedules()
            state.modal.isApproveRequestConfirmationOpen = false
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.requesters.table.alert.requestApprovedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmRequestDisapproval(requester: any) {
    state.selectedRequester = requester
    state.modal.isDisapproveRequestConfirmationOpen = true
}

async function disapproveRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            slot_grabber_uuid: state.selectedRequester?.uuid
        }
        const response = await scheduleGrabberService.disapproveRequest(params)
        if (response) {
            fetchScheduleSlotsRequesters()
            refreshScheduleSlotAndDutySchedules()
            state.modal.isDisapproveRequestConfirmationOpen = false
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.requesters.table.alert.requestDisapprovedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>