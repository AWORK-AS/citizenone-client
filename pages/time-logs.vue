<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('timeLogs.timeLogs') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('timeLogs.timeLogs') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.logs" :isLoading="state.isTableLoading"
                        :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                            <tr v-for="(log, index) in state.logs?.data" :key="index">
                                <td width="25%">
                                    <span>{{ formatDateTimeToReadable(log?.created_at) }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ formatTimeToReadable(log?.time_in) }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ log?.time_out && formatTimeToReadable(log?.time_out) }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ log?.time_summary }}</span>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.logs" @previous="previous" @next="next" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { timeLogService } from '@/components/api/TimeLogService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'timeLogs.table.createdAt', sorter: true, key: 'created_at' },
        { name: 'timeLogs.table.timein' },
        { name: 'timeLogs.table.timeout' },
        { name: 'timeLogs.table.summary' },
    ],
    error: {} as Error,
    isTableLoading: false,
    logs: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchActivityLogs()
})

async function fetchActivityLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await timeLogService.getTimeLogs(params)
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

function formatDateTimeToReadable(datetime: string) {
    return moment(datetime).format('DD. MMM YYYY HH:mm:ss')
}

function formatTimeToReadable(time: string) {
    return moment(time, "HH:mm:ss A").format('hh:mm:ss A')
}
</script>