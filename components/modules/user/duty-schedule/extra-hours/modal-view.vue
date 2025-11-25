<template>
    <div>
        <Modal size="4xl"
            :title="`${$t('dutySchedules.extraHours.extraHours')} - ${props.selectedEmployee?.firstname} ${props.selectedEmployee?.lastname}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddNewExtraHoursOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.extraHours.newExtraHours') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.extraHours"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.extraHours?.data?.length === 0))">
                                    <tr v-for="(extraHours, index) in state.extraHours?.data" :key="index">
                                        <td width="15%">
                                            <p>
                                                {{ formatDateToReadable(extraHours?.date) }}
                                            </p>
                                        </td>
                                        <td width="20%">
                                            <span v-if="extraHours.type === 'add'">
                                                {{ $t('dutySchedules.extraHours.table.type.add') }}
                                            </span>
                                            <span v-if="extraHours.type === 'deduct'">
                                                {{ $t('dutySchedules.extraHours.table.type.deduct') }}
                                            </span>
                                        </td>
                                        <td width="20%">
                                            <p>
                                                {{ formatNumber(language.locale.value, extraHours?.hours) }}
                                            </p>
                                        </td>
                                        <td width="25%">
                                            <p>
                                                {{ extraHours?.note }}
                                            </p>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="confirmApproveScheduleRequest(extraHours)">
                                                    <Icon name="ph:check" class="size-4" />
                                                    {{
                                                        $t('dutySchedules.extraHours.changeTime.table.actions.approve')
                                                    }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="confirmDispproveScheduleRequest(extraHours)">
                                                    <Icon name="ph:x" class="size-4" />
                                                    {{
                                                        $t('dutySchedules.extraHours.changeTime.table.actions.disapprove')
                                                    }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.extraHours" @previous="previous" @next="next" />
                    </div>
                </div>
                <DialogConfirmation :isModalOpen="state.modal.isApproveRequest"
                    :message="$t('dutySchedules.extraHours.table.confirmation.approveExtraHoursConfirmation') + '?'"
                    @close="state.modal.isApproveRequest = false" @confirm="approveScheduleRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isRejectRequest"
                    :message="$t('dutySchedules.extraHours.table.confirmation.rejectExtraHoursConfirmation') + '?'"
                    @close="state.modal.isRejectRequest = false" @confirm="rejectScheduleRequest" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { extraHoursService } from '@/components/api/user/ExtraHoursService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useNumberFormatter } from '@/composables/numberFormatter'
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

const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.extraHours.table.date' },
        { name: 'dutySchedules.extraHours.table.type.type' },
        { name: 'dutySchedules.extraHours.table.hours' },
        { name: 'dutySchedules.extraHours.table.note' },
        { name: 'dutySchedules.extraHours.table.status' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddNewExtraHoursOpen: false,
        isApproveRequest: false,
        isEditExtraHoursOpen: false,
        isRejectRequest: false,
    },
    extraHours: [] as any,
    selectedExtraHoursRequest: [] as any,
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: Boolean) => {
    if (isModalOpen) {
        state.error = {}
        fetchExtraHours()
    }
})

function closeModal() {
    emit('close')
}

async function fetchExtraHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await extraHoursService.getExtraHours(params)
        if (response) {
            state.extraHours = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchExtraHours()
}

function next() {
    currentTablePage++
    fetchExtraHours()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchExtraHours()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchExtraHours()
}

function confirmApproveScheduleRequest(request: any) {
    state.selectedExtraHoursRequest = request
    state.modal.isApproveRequest = true
}

async function approveScheduleRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const extraHoursUuid = state.selectedExtraHoursRequest.uuid
        const response = await extraHoursService.approveExtraHour(extraHoursUuid)
        if (response) {
            fetchExtraHours()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.alert.extraHoursSuccessfullyApproved')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmDispproveScheduleRequest(request: any) {
    state.selectedExtraHoursRequest = request
    state.modal.isRejectRequest = true
}

async function rejectScheduleRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const extraHoursUuid = state.selectedExtraHoursRequest.uuid
        const response = await extraHoursService.rejectExtraHour(extraHoursUuid)
        if (response) {
            fetchExtraHours()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.alert.extraHoursSuccessfullyRejected')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>