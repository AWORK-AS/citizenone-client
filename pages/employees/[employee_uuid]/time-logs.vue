<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.timeLogs') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.timeLogs') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserEmployeeTabs />

                <div class="mt-10 space-y-5">
                    <div class="flex flex-wrap items-center justify-end gap-3">
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
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.logs" :isLoading="state.isTableLoading"
                            :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                                <tr v-for="(log, index) in state.logs?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ formatDateTimeToReadable(log?.created_at) }}</span>
                                    </td>
                                    <td width="20%">
                                        <span v-if="log?.date_time_start">
                                            {{ formatDateTimeToReadable(log?.date_time_start) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span v-if="log?.date_time_end">
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
                    <Pagination :data="state.logs" @previous="previous" @next="next" />
                </div>
            </div>
            <ModulesUserTimeRegistrationModalDownload :isModalOpen="state.modal.isDownloadTimeLogsOpen"
                @close="state.modal.isDownloadTimeLogsOpen = false" />
            <ModulesUserTimeRegistrationModalNew :isModalOpen="state.modal.isAddNewTimeLogOpen"
                @close="state.modal.isAddNewTimeLogOpen = false" />
            <ModulesUserTimeRegistrationModalEdit :isModalOpen="state.modal.isEditTimeLogOpen"
                :selectedTimeLog="state.selectedTimeLog" @close="state.modal.isEditTimeLogOpen = false" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteTimeLogConfirmationOpen"
                :message="`${$t('timeLogs.table.confirmation.deleteTimeLogConfirmation')}?`"
                @close="state.modal.isDeleteTimeLogConfirmationOpen = false" @confirm="deleteTimeLog" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { timeLogService } from '@/components/api/user/TimeLogService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'employees.timeLogs',
        translate: true,
        href: `/employees/${employeeUuid}/time-logs`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'timeLogs.table.createdAt', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'timeLogs.table.dateTimeStart', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'timeLogs.table.dateTimeEnd', isTranslateName: true, sorter: true, key: 'date_time_end' },
        { name: 'timeLogs.table.status.status', isTranslateName: true, },
        { name: 'timeLogs.table.remarks', isTranslateName: true, },
        { name: 'timeLogs.table.summary', isTranslateName: true, },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    logs: [] as any,
    modal: {
        isAddNewTimeLogOpen: false,
        isDownloadTimeLogsOpen: false,
        isEditTimeLogOpen: false,
        isDeleteTimeLogConfirmationOpen: false,
    },
    selectedTimeLog: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchTimeLogs()
})

async function fetchTimeLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await timeLogService.getEmployeeTimeLogs(employeeUuid, params)
        if (response) {
            state.logs = response
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