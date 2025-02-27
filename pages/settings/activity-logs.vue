<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('activityLogs.activityLogs') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('activityLogs.activityLogs') }}</template>

            <ModulesUserSettingsTab />

            <div class="mt-10 space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="table-responsive">
                    <Table :columnHeaders="filteredColumnHeaders" :data="state.logs" :isLoading="state.isTableLoading"
                        :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                            <tr v-for="(log, index) in state.logs?.data" :key="index">
                                <td :width="isUserLoggedInAdmin ? '20%' : '50%'">
                                    <span>{{ formatDateTimeToReadable(log?.created_at) }}</span>
                                </td>
                                <td width="20%" v-if="isUserLoggedInAdmin">
                                    <span>{{ log?.causer?.firstname + ' ' + log?.causer?.lastname }}</span>
                                </td>
                                <td :width="isUserLoggedInAdmin ? '30%' : '40%'">
                                    <ModulesUserActivityLogsDescription :description="log?.description" />
                                </td>
                                <td width="10%">
                                    <span>{{ log?.properties?.ip_address }}</span>
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { activityLogService } from '@/components/api/user/ActivityLogService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const userStore = useUserStore() as any
const isUserLoggedInAdmin = userStore.getUser?.roles.some((role: any) => role.name === 'Admin')
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'activityLogs.activityLogs',
        translate: true,
        href: '/settings/activity-logs',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'activityLogs.table.createdAt', sorter: true, key: 'created_at' },
        { name: 'activityLogs.table.user' },
        { name: 'activityLogs.table.description' },
        { name: 'activityLogs.table.ipAddress' },
    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    logs: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

// Define the condition for 'activityLogs.table.user'
const isUserColumnVisible = computed(() => {
    const userLoggedIn = isUserLoggedInAdmin
    return userLoggedIn
})

// Filter column headers based on the condition
const filteredColumnHeaders = computed(() => {
    return state.columnHeaders.filter((column) => {
        if (column.name === 'activityLogs.table.user') {
            return isUserColumnVisible.value
        }
        return true
    })
})

onMounted(() => {
    fetchActivityLogs()
})

async function fetchActivityLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        if (isUserLoggedInAdmin) {
            const params = {
                page: currentTablePage,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
            }
            const response = await activityLogService.getActivityLogs(params)
            if (response) {
                state.logs = response
            }
        } else {
            const params = {
                page: currentTablePage,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
            }
            const response = await activityLogService.getActivityLogPerUser(params)
            if (response) {
                state.logs = response
            }
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