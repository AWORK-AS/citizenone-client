<template>
    <div>
        <Modal size="4xl"
            :title="`${$t('dutySchedules.compensatoryTimeRequests.compensatoryTimeRequests')} - ${props.selectedEmployee?.firstname} ${props.selectedEmployee?.lastname}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.compensatoryTimeRequests"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.compensatoryTimeRequests?.data?.length === 0))">
                                    <tr v-for="(compensatoryTimeRequest, index) in state.compensatoryTimeRequests?.data"
                                        :key="index">
                                        <td width="18%">
                                            <p class="truncate">
                                                {{ formatDateTimeToReadable(compensatoryTimeRequest?.schedule?.date_time_start) }}
                                            </p>
                                        </td>
                                        <td width="18%">
                                            <p class="truncate">
                                                {{ formatDateTimeToReadable(compensatoryTimeRequest?.schedule?.date_time_end) }}
                                            </p>
                                        </td>
                                        <td width="12%">
                                            <p class="truncate">
                                                {{ formatNumber(language.locale.value, compensatoryTimeRequest?.hours) }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <span v-if="compensatoryTimeRequest?.status === 'pending'">
                                                {{ $t('dutySchedules.compensatoryTimeRequests.table.status.pending') }}
                                            </span>
                                            <span v-if="compensatoryTimeRequest?.status === 'approved'">
                                                {{ $t('dutySchedules.compensatoryTimeRequests.table.status.approved') }}
                                            </span>
                                            <span v-if="compensatoryTimeRequest?.status === 'declined'">
                                                {{ $t('dutySchedules.compensatoryTimeRequests.table.status.declined') }}
                                            </span>
                                            <span v-if="compensatoryTimeRequest?.status === 'withdrawn'">
                                                {{ $t('dutySchedules.compensatoryTimeRequests.table.status.withdrawn') }}
                                            </span>
                                            <span v-if="compensatoryTimeRequest?.status === 'reversed'">
                                                {{ $t('dutySchedules.compensatoryTimeRequests.table.status.reversed') }}
                                            </span>
                                        </td>
                                        <td width="12%">
                                            <p class="truncate" v-if="compensatoryTimeRequest?.decline_comment">
                                                {{ compensatoryTimeRequest?.decline_comment }}
                                            </p>
                                        </td>
                                        <td width="25%">
                                            <div class="flex items-end gap-2">
                                                <template
                                                    v-if="compensatoryTimeRequest?.status === 'pending' && canApprove">
                                                    <Tooltip
                                                        :text="$t('dutySchedules.compensatoryTimeRequests.table.actions.approve')"
                                                        @click="confirmApprove(compensatoryTimeRequest)">
                                                        <FormButton
                                                            :aria-label="$t('dutySchedules.compensatoryTimeRequests.table.actions.approve')"
                                                            type="button" buttonStyle="success">
                                                            <Icon name="ph:check" class="size-4" />
                                                        </FormButton>
                                                    </Tooltip>
                                                    <Tooltip
                                                        :text="$t('dutySchedules.compensatoryTimeRequests.table.actions.decline')"
                                                        @click="confirmDecline(compensatoryTimeRequest)">
                                                        <FormButton
                                                            :aria-label="$t('dutySchedules.compensatoryTimeRequests.table.actions.decline')"
                                                            type="button" buttonStyle="danger">
                                                            <Icon name="ph:x" class="size-4" />
                                                        </FormButton>
                                                    </Tooltip>
                                                </template>
                                                <Tooltip
                                                    :text="$t('dutySchedules.compensatoryTimeRequests.table.actions.withdraw')"
                                                    v-if="compensatoryTimeRequest?.status === 'pending' && userStore.getUser?.uuid === props.selectedEmployee?.uuid"
                                                    @click="confirmWithdraw(compensatoryTimeRequest)">
                                                    <FormButton
                                                        :aria-label="$t('dutySchedules.compensatoryTimeRequests.table.actions.withdraw')"
                                                        type="button" buttonStyle="danger">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip
                                                    :text="$t('dutySchedules.compensatoryTimeRequests.table.actions.reverse')"
                                                    v-if="compensatoryTimeRequest?.status === 'approved' && canApprove"
                                                    @click="confirmReverse(compensatoryTimeRequest)">
                                                    <FormButton
                                                        :aria-label="$t('dutySchedules.compensatoryTimeRequests.table.actions.reverse')"
                                                        type="button" buttonStyle="cancel">
                                                        <Icon name="ph:arrow-counter-clockwise" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.compensatoryTimeRequests" @previous="previous" @next="next" />
                    </div>
                </div>
                <DialogConfirmation :isModalOpen="state.modal.isApprove"
                    :message="$t('dutySchedules.compensatoryTimeRequests.table.confirmation.approveConfirmation') + '?'"
                    @close="state.modal.isApprove = false" @confirm="approve" />
                <DialogConfirmation :isModalOpen="state.modal.isDecline"
                    :message="$t('dutySchedules.compensatoryTimeRequests.table.confirmation.declineConfirmation') + '?'"
                    @close="state.modal.isDecline = false" @confirm="decline">
                    <template #extra>
                        <label class="mt-4 block text-sm font-medium text-gray-700">
                            {{ $t('dutySchedules.compensatoryTimeRequests.table.confirmation.declineComment') }}
                        </label>
                        <textarea v-model="state.comment" rows="3"
                            :placeholder="$t('dutySchedules.compensatoryTimeRequests.table.confirmation.declineCommentPlaceholder')"
                            class="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-palette-green focus:ring-palette-green" />
                    </template>
                </DialogConfirmation>
                <DialogConfirmation :isModalOpen="state.modal.isWithdraw"
                    :message="$t('dutySchedules.compensatoryTimeRequests.table.confirmation.withdrawConfirmation') + '?'"
                    @close="state.modal.isWithdraw = false" @confirm="withdraw" />
                <DialogConfirmation :isModalOpen="state.modal.isReverse"
                    :message="$t('dutySchedules.compensatoryTimeRequests.table.confirmation.reverseConfirmation') + '?'"
                    @close="state.modal.isReverse = false" @confirm="reverse">
                    <template #extra>
                        <label class="mt-4 block text-sm font-medium text-gray-700">
                            {{ $t('dutySchedules.compensatoryTimeRequests.table.confirmation.reverseComment') }}
                        </label>
                        <textarea v-model="state.comment" rows="3"
                            :placeholder="$t('dutySchedules.compensatoryTimeRequests.table.confirmation.reverseCommentPlaceholder')"
                            class="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-palette-green focus:ring-palette-green" />
                    </template>
                </DialogConfirmation>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { compensatoryTimeRequestService } from '@/components/api/user/CompensatoryTimeRequestService'
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

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const { isAtLeast, can } = usePermissions()
const userStore = useUserStore() as any
let currentTablePage = 1

const canApprove = computed(() => isAtLeast('Admin') || can('approve_compensatory_time_request'))

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.compensatoryTimeRequests.table.dateTimeStart', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'dutySchedules.compensatoryTimeRequests.table.dateTimeEnd', isTranslateName: true },
        { name: 'dutySchedules.compensatoryTimeRequests.table.hours', isTranslateName: true },
        { name: 'dutySchedules.compensatoryTimeRequests.table.status.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: 'dutySchedules.compensatoryTimeRequests.table.declineComment', isTranslateName: true },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isApprove: false,
        isDecline: false,
        isWithdraw: false,
        isReverse: false,
    },
    compensatoryTimeRequests: [] as any,
    selectedCompensatoryTimeRequest: {} as any,
    comment: '',
    sortData: {
        sortField: 'created_at',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        fetchCompensatoryTimeRequests()
    }
})

function closeModal() {
    emit('close')
}

async function fetchCompensatoryTimeRequests() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await compensatoryTimeRequestService.getCompensatoryTimeRequests(params)
        if (response) {
            state.compensatoryTimeRequests = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCompensatoryTimeRequests()
}

function next() {
    currentTablePage++
    fetchCompensatoryTimeRequests()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCompensatoryTimeRequests()
}

function confirmApprove(compensatoryTimeRequest: any) {
    state.selectedCompensatoryTimeRequest = compensatoryTimeRequest
    state.modal.isApprove = true
}

async function approve() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await compensatoryTimeRequestService.approveCompensatoryTimeRequest(state.selectedCompensatoryTimeRequest.uuid)
        if (response) {
            state.modal.isApprove = false
            fetchCompensatoryTimeRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.compensatoryTimeRequests.table.alert.successfullyApproved')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
        state.modal.isApprove = false
    }
    state.isTableLoading = false
}

function confirmDecline(compensatoryTimeRequest: any) {
    state.selectedCompensatoryTimeRequest = compensatoryTimeRequest
    state.comment = ''
    state.modal.isDecline = true
}

async function decline() {
    state.error = {}
    state.isTableLoading = true
    try {
        const comment = state.comment?.trim() || undefined
        const response = await compensatoryTimeRequestService.declineCompensatoryTimeRequest(state.selectedCompensatoryTimeRequest.uuid, comment)
        if (response) {
            state.comment = ''
            fetchCompensatoryTimeRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.compensatoryTimeRequests.table.alert.successfullyDeclined')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmWithdraw(compensatoryTimeRequest: any) {
    state.selectedCompensatoryTimeRequest = compensatoryTimeRequest
    state.modal.isWithdraw = true
}

async function withdraw() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await compensatoryTimeRequestService.withdrawCompensatoryTimeRequest(state.selectedCompensatoryTimeRequest.uuid)
        if (response) {
            state.modal.isWithdraw = false
            fetchCompensatoryTimeRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.compensatoryTimeRequests.table.alert.successfullyWithdrawn')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
        state.modal.isWithdraw = false
    }
    state.isTableLoading = false
}

function confirmReverse(compensatoryTimeRequest: any) {
    state.selectedCompensatoryTimeRequest = compensatoryTimeRequest
    state.comment = ''
    state.modal.isReverse = true
}

async function reverse() {
    state.error = {}
    state.isTableLoading = true
    try {
        const comment = state.comment?.trim() || undefined
        const response = await compensatoryTimeRequestService.reverseCompensatoryTimeRequest(state.selectedCompensatoryTimeRequest.uuid, comment)
        if (response) {
            state.modal.isReverse = false
            state.comment = ''
            fetchCompensatoryTimeRequests()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.compensatoryTimeRequests.table.alert.successfullyReversed')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
        state.modal.isReverse = false
    }
    state.isTableLoading = false
}
</script>
