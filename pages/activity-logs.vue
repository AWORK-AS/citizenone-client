<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('activityLogs.activityLogs') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('activityLogs.activityLogs') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.logs" :isLoading="state.isTableLoading"
                        :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                            <tr v-for="(log, index) in state.logs?.data" :key="index">
                                <td width="50%">
                                    <span>{{ formatDateTimeToReadable(log?.created_at) }}</span>
                                </td>
                                <td width="50%">
                                    <span>{{ log?.description }}</span>
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
import { activityLogService } from '@/components/api/ActivityLogService'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'activityLogs.table.createdAt', sorter: true, key: 'created_at' },
        { name: 'activityLogs.table.description' },
    ],
    dataFilter: [],
    error: [],
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
    state.isTableLoading = true
    state.error = []
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await activityLogService.getActivityLogs(params)
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
    return moment(datetime).format('DD MMM, YYYY hh:mm:ss A')
}
</script>