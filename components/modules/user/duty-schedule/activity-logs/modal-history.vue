<template>
    <div>
        <Modal size="3xl" :title="$t('dutySchedules.activityLogs')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.logs"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                                    <tr v-for="(log, index) in state.logs?.data" :key="index">
                                        <td width="25%">
                                            <span>{{ formatDateTimeToReadable(log?.created_at) }}</span>
                                        </td>
                                        <td width="25%">
                                            <span>{{ log?.causer?.firstname + ' ' + log?.causer?.lastname }}</span>
                                        </td>
                                        <td width="50%">
                                            <ModulesUserActivityLogsDescription :description="log?.description" />
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.logs" @previous="previous" @next="next" />
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const { formatDateTimeToReadable } = useDatetimeFormatter()
let currentTablePage = 1
const emit = defineEmits(['close'])

const state = reactive({
    columnHeaders: [
        { name: 'activityLogs.table.createdAt', sorter: true, key: 'created_at' },
        { name: 'activityLogs.table.user' },
        { name: 'activityLogs.table.description' },
    ],
    error: {} as Error,
    isTableLoading: false,
    logs: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchActivityLogs()
    }
})

function closeModal() {
    emit('close')
}

async function fetchActivityLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder
        }
        const response = await dutyScheduleService.getDutySchedulesActivityLogs(params)
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
    fetchActivityLogs()
}

function next() {
    currentTablePage++
    fetchActivityLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchActivityLogs()
}
</script>