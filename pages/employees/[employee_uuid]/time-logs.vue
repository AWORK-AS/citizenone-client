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
                                        <span>{{ log?.time_in }}</span>
                                    </td>
                                    <td width="25%">
                                        <span>{{ log?.time_out }}</span>
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
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { employeeService } from '@/components/api/user/EmployeeService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
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
        { name: 'timeLogs.table.timein', isTranslateName: true, },
        { name: 'timeLogs.table.timeout', isTranslateName: true, },
        { name: 'timeLogs.table.summary', isTranslateName: true, },
    ],
    error: {} as Error,
    isTableLoading: false,
    logs: [] as any,
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
        const response = await employeeService.getEmployeeTimeLogs(params)
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
</script>