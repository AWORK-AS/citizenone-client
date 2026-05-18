<template>
    <div>
        <Modal size="4xl"
            :title="`${$t('dutySchedules.extraHours.extraHours')} - ${props.selectedEmployee?.firstname} ${props.selectedEmployee?.lastname}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-between items-center mb-5">
                        <div class="flex flex-col md:flex-row gap-x-1 flex-wrap font-medium">
                            {{ $t('dutySchedules.extraHours.extraHours') }}:
                            <span :class="[
                                state.extraHours?.extra_hours > 0 ? 'text-green-700' : 'text-red-700',
                            ]">
                                {{
                                    formatNumber(language.locale.value, state.extraHours?.extra_hours || 0)
                                }}
                            </span>
                            <button class="w-fit text-xs text-primary hover:text-primary-700 hover:underline"
                                @click="state.modal.isExtraHoursDateRangeOpen = true">
                                ({{ formatDateToReadable(state.shiftDateRange.formDateRange.start_date) }} -
                                {{ formatDateToReadable(state.shiftDateRange.formDateRange.end_date) }})
                            </button>
                        </div>
                        <FormButton buttonStyle="action" @click="state.modal.isAddNewExtraHoursOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ isAtLeast('Admin') ?
                                $t('dutySchedules.extraHours.newExtraHours') :
                                $t('dutySchedules.extraHours.newExtraHoursRequest') }}
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
                                        <td width="20%">
                                            <p class="truncate">
                                                {{ formatDateToReadable(extraHours?.date) }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <span v-if="extraHours.extra_hours_type === 'add'">
                                                {{ $t('dutySchedules.extraHours.table.type.add') }}
                                            </span>
                                            <span v-if="extraHours.extra_hours_type === 'deduct'">
                                                {{ $t('dutySchedules.extraHours.table.type.deduct') }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <div class="text-xxs flex flex-wrap gap-1">
                                                <span v-for="(tag, index) in extraHours?.tags" :key=index
                                                    class="bg-primary px-2 py-1 text-white rounded-md">
                                                    {{ tag?.tag }}
                                                </span>
                                            </div>
                                        </td>
                                        <td width="15%">
                                            <p>
                                                {{ formatNumber(language.locale.value, extraHours?.extra_hours) }}
                                            </p>
                                        </td>
                                        <td width="15%">
                                            <p>
                                                {{ extraHours?.note }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <p class="truncate">
                                                {{
                                                    extraHours?.departments?.length ?
                                                        extraHours.departments.map((d: any) => d.name).join(', ') : '-'
                                                }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <p class="truncate">
                                                {{ extraHours?.creator?.firstname }} {{ extraHours?.creator?.lastname ?? '' }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <span v-if="extraHours?.extra_hours_status === 'pending'">
                                                {{ $t('dutySchedules.extraHours.table.status.pending') }}
                                            </span>
                                            <span v-if="extraHours?.extra_hours_status === 'approved'">
                                                {{ $t('dutySchedules.extraHours.table.status.approved') }}
                                            </span>
                                            <span v-if="extraHours?.extra_hours_status === 'rejected'">
                                                {{ $t('dutySchedules.extraHours.table.status.rejected') }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip :text="$t('dutySchedules.extraHours.table.actions.edit')"
                                                    @click="editExtraHours(extraHours)"
                                                    v-if="isAtLeast('Admin') || ['pending'].includes(extraHours?.extra_hours_status)">
                                                    <FormButton type=" button" buttonStyle="action">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.extraHours.table.actions.approve')"
                                                    @click="confirmApproveExtraHoursRequest(extraHours)"
                                                    v-if="isAtLeast('Admin') && extraHours?.extra_hours_status === 'pending'"">
                                                    <FormButton type=" button" buttonStyle="success">
                                                    <Icon name="ph:check" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.extraHours.table.actions.reject')"
                                                    @click="confirmRejectExtraHoursRequest(extraHours)"
                                                    v-if="isAtLeast('Admin') && extraHours?.extra_hours_status === 'pending'"">
                                                    <FormButton type=" button" buttonStyle="danger">
                                                    <Icon name="ph:x" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('dutySchedules.extraHours.table.actions.delete')"
                                                    @click="confirmDeleteExtraHours(extraHours)"
                                                    v-if="isAtLeast('Admin') ||
                                                        (!isAtLeast('Admin') && ['pending'].includes(extraHours?.extra_hours_status))">
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
                        <Pagination :data="state.extraHours" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserDutyScheduleModalShiftDateRange :isModalOpen="state.modal.isExtraHoursDateRangeOpen"
                    :dateRange="state.shiftDateRange" @close="state.modal.isExtraHoursDateRangeOpen = false"
                    @filterDate="filterExtraHoursByDateRange" />
                <ModulesUserDutyScheduleExtraHoursModalNew :isModalOpen="state.modal.isAddNewExtraHoursOpen"
                    :selectedEmployee="props.selectedEmployee" @close="state.modal.isAddNewExtraHoursOpen = false"
                    @refreshExtraHours="fetchExtraHours" @refreshDutySchedules="emit('refreshDutySchedules')" />
                <ModulesUserDutyScheduleExtraHoursModalEdit :isModalOpen="state.modal.isEditExtraHoursOpen"
                    :selectedEmployee="props.selectedEmployee"
                    :selectedExtraHoursRequest="state.selectedExtraHoursRequest"
                    @close="state.modal.isEditExtraHoursOpen = false" @refreshExtraHours="fetchExtraHours"
                    @refreshDutySchedules="emit('refreshDutySchedules')" />
                <DialogConfirmation :isModalOpen="state.modal.isApproveRequest"
                    :message="$t('dutySchedules.extraHours.table.confirmation.approveExtraHoursConfirmation') + '?'"
                    @close="state.modal.isApproveRequest = false" @confirm="approveExtraHoursRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isRejectRequest"
                    :message="$t('dutySchedules.extraHours.table.confirmation.rejectExtraHoursConfirmation') + '?'"
                    @close="state.modal.isRejectRequest = false" @confirm="rejectExtraHoursRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteExtraHoursOpen"
                    :message="$t('dutySchedules.extraHours.table.confirmation.deleteExtraHoursConfirmation') + '?'"
                    @close="state.modal.isDeleteExtraHoursOpen = false" @confirm="deleteExtraHours" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { extraHoursService } from '@/components/api/user/ExtraHoursService'
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

const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.extraHours.table.date', isTranslateName: true, sorter: true, key: 'date' },
        { name: 'dutySchedules.extraHours.table.type.type', isTranslateName: true, sorter: true, key: 'extra_hours_type' },
        { name: 'dutySchedules.extraHours.table.tags', isTranslateName: true },
        { name: 'dutySchedules.extraHours.table.hours', isTranslateName: true, sorter: true, key: 'extra_hours' },
        { name: 'dutySchedules.extraHours.table.note', isTranslateName: true, },
        { name: 'dutySchedules.extraHours.table.department', isTranslateName: true },
        { name: 'dutySchedules.extraHours.table.createdBy', isTranslateName: true },
        { name: 'dutySchedules.extraHours.table.status.status', isTranslateName: true, sorter: true, key: 'extra_hours_status' },
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
        isDeleteExtraHoursOpen: false,
        isEditExtraHoursOpen: false,
        isExtraHoursDateRangeOpen: false,
        isRejectRequest: false,
    },
    extraHours: [] as any,
    selectedExtraHoursRequest: [] as any,
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
            start_date: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            end_date: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
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

function filterExtraHoursByDateRange(formDateRange: any) {
    state.shiftDateRange.formDateRange.start_date = formDateRange?.[0]
    state.shiftDateRange.formDateRange.end_date = formDateRange?.[1]
    fetchExtraHours()
}


function editExtraHours(extraHours: any) {
    state.selectedExtraHoursRequest = extraHours
    state.modal.isEditExtraHoursOpen = true
}

function confirmApproveExtraHoursRequest(extraHours: any) {
    state.selectedExtraHoursRequest = extraHours
    state.modal.isApproveRequest = true
}

async function approveExtraHoursRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const extraHoursUuid = state.selectedExtraHoursRequest.uuid
        const response = await extraHoursService.approveExtraHour(extraHoursUuid)
        if (response) {
            fetchExtraHours()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.table.alert.extraHoursSuccessfullyApproved')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmRejectExtraHoursRequest(extraHours: any) {
    state.selectedExtraHoursRequest = extraHours
    state.modal.isRejectRequest = true
}

async function rejectExtraHoursRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const extraHoursUuid = state.selectedExtraHoursRequest.uuid
        const response = await extraHoursService.rejectExtraHour(extraHoursUuid)
        if (response) {
            fetchExtraHours()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.table.alert.extraHoursSuccessfullyRejected')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmDeleteExtraHours(extraHours: any) {
    state.selectedExtraHoursRequest = extraHours
    state.modal.isDeleteExtraHoursOpen = true
}

async function deleteExtraHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const extraHoursUuid = state.selectedExtraHoursRequest.uuid
        const response = await extraHoursService.deleteExtraHour(extraHoursUuid)
        if (response) {
            fetchExtraHours()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.table.alert.extraHoursSuccessfullyDeleted')}.`)
            emit('refreshDutySchedules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>