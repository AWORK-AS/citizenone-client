<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.timeLogs.timeLogs')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="mt-6 flex items-center gap-x-2 justify-end">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="openInterventionHoursModal">
                        <Icon name="ph:clock" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.interventionHours.interventionHours') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isAddNewTimeLogOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('timeLogs.newTimeLog') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isDownloadTimeLogsOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('timeLogs.download.download') }}
                    </FormButton>
                </div>
                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.timeLogs"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.timeLogs?.data?.length === 0))">
                                <tr v-for="(log, index) in state.timeLogs?.data" :key="index">
                                    <td width="20%">
                                        <span class="truncate">
                                            {{ formatDateTimeToReadable(log?.created_at) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate" v-if="log?.date_time_start">
                                            {{ formatDateTimeToReadable(log?.date_time_start) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate" v-if="log?.date_time_end">
                                            {{ formatDateTimeToReadable(log?.date_time_end) }}
                                        </span>
                                    </td>
                                    <td width="10%">
                                        <Badge type="primary" class="w-fit truncate"
                                            v-if="log?.status === 'cancelled_by_citizen'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.cancelledByCitizen') }}
                                            </p>
                                        </Badge>
                                        <Badge type="primary" class="w-fit truncate"
                                            v-if="log?.status === 'cancelled_by_employee'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.cancelledByEmployee') }}
                                            </p>
                                        </Badge>
                                        <Badge type="primary" class="w-fit truncate" v-if="log?.status === 'completed'">
                                            <p class="text-xxs">
                                                {{ $t('timeLogs.table.status.completed') }}
                                            </p>
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <span>{{ log?.remarks }}</span>
                                    </td>
                                    <td width="5%">
                                        <span>{{ log?.time_summary }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewTimeLog(log)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('timeLogs.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editTimeLog(log)" v-if="log?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('timeLogs.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="confirmTimeLogDeletion(log)" v-if="log?.is_deletable">
                                                <Icon name="heroicons:trash" class="size-4" />
                                                {{ $t('timeLogs.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.timeLogs" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenTimeLogsModalNew :isModalOpen="state.modal.isAddNewTimeLogOpen"
                    :citizenUuid="props.citizenUuid" @close="state.modal.isAddNewTimeLogOpen = false"
                    @refreshTimeLogs="fetchTimeLogs" />
                <ModulesUserCitizenTimeLogsModalEdit :isModalOpen="state.modal.isEditTimeLogOpen"
                    :citizenUuid="props.citizenUuid" :selectedTimeLog="state.selectedTimeLog"
                    @close="state.modal.isEditTimeLogOpen = false" @refreshTimeLogs="fetchTimeLogs" />
                <ModulesUserTimeRegistrationModalDownload :isModalOpen="state.modal.isDownloadTimeLogsOpen"
                    @close="state.modal.isDownloadTimeLogsOpen = false" />
                <ModulesUserTimeRegistrationModalViewLog :isModalOpen="state.modal.isViewTimeLogOpen"
                    :selectedTimeLog="state.selectedTimeLog" @close="state.modal.isViewTimeLogOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteTimeLogConfirmationOpen"
                    :message="`${$t('timeLogs.table.confirmation.deleteTimeLogConfirmation')}?`"
                    @close="state.modal.isDeleteTimeLogConfirmationOpen = false" @confirm="deleteTimeLog" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenTimeLogService } from '@/components/api/user/CitizenTimeLogService'
import { timeLogService } from '@/components/api/user/TimeLogService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
})

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'openInterventionHours'])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'timeLogs.table.createdAt', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'timeLogs.table.dateTimeStart', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'timeLogs.table.dateTimeEnd', isTranslateName: true, sorter: true, key: 'date_time_end' },
        { name: 'timeLogs.table.status.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: 'timeLogs.table.remarks', isTranslateName: true, },
        { name: 'timeLogs.table.summary', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddNewTimeLogOpen: false,
        isDeleteTimeLogConfirmationOpen: false,
        isDownloadTimeLogsOpen: false,
        isEditTimeLogOpen: false,
        isViewTimeLogOpen: false
    },
    timeLogs: [] as any,
    selectedTimeLog: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

function openInterventionHoursModal() {
    emit('openInterventionHours')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchTimeLogs()
    }
})

async function fetchTimeLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: props.citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await citizenTimeLogService.getWalletsPerCitizen(props.citizenUuid, params)
        if (response) {
            state.timeLogs = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchTimeLogs()
}

function next() {
    currentTablePage++
    fetchTimeLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchTimeLogs()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTimeLogs()
}

function viewTimeLog(log: any) {
    state.selectedTimeLog = log
    state.modal.isViewTimeLogOpen = true
}

function editTimeLog(log: any) {
    state.selectedTimeLog = log
    state.modal.isEditTimeLogOpen = true
}

function confirmTimeLogDeletion(log: any) {
    state.selectedTimeLog = log
    state.modal.isDeleteTimeLogConfirmationOpen = true
}

async function deleteTimeLog() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await timeLogService.deleteTimeLog(state.selectedTimeLog.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchTimeLogs()
            successAlert(`${t('alert.success')}!`, `${t('timeLogs.table.alert.timeLogSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
