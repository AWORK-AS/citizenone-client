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

            <div class="mt-10 space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <!-- Admins only: narrow the company log to access changes, one employee or one role.
                     The filters live in the URL, so a link opens straight on the narrowed list. -->
                <div v-if="isUserLoggedInAdmin" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="space-y-1">
                        <FormLabel for="activity_log_kind" :label="$t('activityLogs.filters.kind')" />
                        <FormSelect id="activity_log_kind" :options="kindOptions" :canClear="false"
                            :canDeselect="false" v-model="state.filters.kind" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="activity_log_employee" :label="$t('activityLogs.filters.employee')" />
                        <FormSelect id="activity_log_employee" :options="state.employeeOptions" :searchable="true"
                            :placeholder="$t('activityLogs.filters.allEmployees')"
                            v-model="state.filters.employee" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="activity_log_role" :label="$t('activityLogs.filters.role')" />
                        <FormSelect id="activity_log_role" :options="state.roleOptions" :searchable="true"
                            :placeholder="$t('activityLogs.filters.allRoles')"
                            v-model="state.filters.role" />
                    </div>
                </div>
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
                                    <ModulesUserActivityLogsAccessChange v-if="log?.log_name === 'access'" :log="log" />
                                    <ModulesUserActivityLogsDescription v-else :description="log?.description ?? ''" />
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
import { useI18n } from 'vue-i18n'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { activityLogService } from '@/components/api/user/ActivityLogService'
import { roleService } from '@/components/api/user/RoleService'
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const userStore = useUserStore() as any
const { isAtLeast } = usePermissions()
const isUserLoggedInAdmin = isAtLeast('Admin')
let currentTablePage = 1

function queryValue(value: unknown): string | null {
    const first = Array.isArray(value) ? value[0] : value
    return typeof first === 'string' && first.trim() !== '' ? first.trim() : null
}

const breadcrumbLinks = [
    {
        name: 'activityLogs.activityLogs',
        translate: true,
        href: '/settings/activity-logs',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'activityLogs.table.createdAt', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'activityLogs.table.user', isTranslateName: true, },
        { name: 'activityLogs.table.description', isTranslateName: true, },
        { name: 'activityLogs.table.ipAddress', isTranslateName: true, },
    ],
    dataFilter: [],
    // Read from the URL before the first fetch, so a filtered link never loads the whole log.
    filters: {
        kind: (isUserLoggedInAdmin && queryValue(route.query.kind) === 'access' ? 'access' : 'all') as string,
        employee: (isUserLoggedInAdmin ? queryValue(route.query.employee) : null) as string | null,
        role: (isUserLoggedInAdmin ? queryValue(route.query.role) : null) as string | null,
    },
    employeeOptions: [] as { value: string, label: string }[],
    roleOptions: [] as { value: string, label: string }[],
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

const kindOptions = computed(() => [
    { value: 'all', label: t('activityLogs.filters.allKinds') },
    { value: 'access', label: t('activityLogs.filters.access') },
])

watch(() => ({ ...state.filters }), applyFilters)

onMounted(() => {
    if (isUserLoggedInAdmin) {
        fetchFilterOptions()
    }
    fetchActivityLogs()
})

async function fetchFilterOptions() {
    try {
        const [employees, roles] = await Promise.all([
            userService.getAllUsers({}),
            roleService.getAllRoles(),
        ])
        state.employeeOptions = (employees?.data ?? [])
            .filter((employee: any) => employee?.uuid && employee.uuid !== 'all-employees')
            .map((employee: any) => ({ value: employee.uuid, label: `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim() }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label))
        state.roleOptions = (roles?.data ?? [])
            .filter((role: any) => role?.id)
            .map((role: any) => ({ value: String(role.id), label: role.name }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label))
    } catch (error: any) {
        // The log works without the filter lists; leave them empty.
    }
}

function filterParams() {
    if (!isUserLoggedInAdmin) return {}
    const params: Record<string, string> = {}
    if (state.filters.kind === 'access') params.kind = 'access'
    if (state.filters.employee) params.employee = state.filters.employee
    if (state.filters.role) params.role = state.filters.role
    return params
}

function applyFilters() {
    currentTablePage = 1
    router.replace({ query: filterParams() })
    fetchActivityLogs()
}

async function fetchActivityLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        if (isUserLoggedInAdmin) {
            const params = {
                page: currentTablePage,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
                ...filterParams(),
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