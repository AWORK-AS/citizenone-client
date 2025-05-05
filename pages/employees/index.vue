<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.employees') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.employees') }}</template>
            <template #guided-tour>
                <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                    <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                </Tooltip>
            </template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/employees/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employees.newEmployee') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.employees"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.employees?.data?.length === 0))">
                                <tr v-for="(employee, index) in state.employees?.data" :key="index">
                                    <td width="25%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                                                class="h-11 w-11 rounded-full bg-gray-50 object-cover" />
                                            <span>{{ employee?.firstname }} {{ employee?.lastname }}</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <span>{{ employee?.email }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ employee?.phone }}</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-center gap-x-2" v-for="(role, index) in employee?.roles"
                                            :key="index">
                                            <span>{{ role.name }}</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/employees/${employee.uuid}/view`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('employees.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/employees/${employee.uuid}/edit`)"
                                                v-if="employee?.is_editable">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('employees.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="messageEmployee(employee)"
                                                v-if="userStore.getUser?.id !== employee?.id">
                                                <Icon name="ph:chat-circle" class="size-4" />
                                                {{ $t('employees.table.actions.message') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/calendar?employee_uuid=${employee?.uuid}`)">
                                                <Icon name="ph:calendar-blank" class="size-4" />
                                                {{ $t('employees.table.actions.calendar') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="giveRemoveSecureMailAccess(employee)"
                                                v-if="userStore.getUser?.is_secure_mail_active">
                                                <Icon name="ph:x" class="size-4"
                                                    v-if="employee?.has_secure_mail_access" />
                                                <Icon name="ph:check" class="size-4" v-else />
                                                <span v-if="employee?.has_secure_mail_access">
                                                    {{ $t('employees.table.actions.removeSecureMailAccess') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('employees.table.actions.giveSecureMailAccess') }}
                                                </span>
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.employees" @previous="previous" @next="next" />
                </div>
            </div>

            <!-- Darkening overlay -->
            <div class="fixed inset-0 bg-black bg-opacity-70 z-40 sm:hidden md:block lg:block"
                v-if="state.modal.isGuidedTourEmployeesOpen"></div>
            <ModulesUserGuidedTourModalEmployees v-if="state.modal.isGuidedTourEmployeesOpen"
                :isModalOpen="state.modal.isGuidedTourEmployeesOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourEmployeesOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/user/EmployeeService'
import { useDepartmentStore } from '@/store/department'
import { useEmployeeStore } from '@/store/employee'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
]

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: 'email' },
        { column: 'phone' },
    ],
    columnHeaders: [
        { name: 'employees.table.name', sorter: true, key: 'firstname' },
        { name: 'employees.table.email', sorter: true, key: 'email' },
        { name: 'employees.table.phone', sorter: true, key: 'phone' },
        { name: 'employees.table.role' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    employees: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isGuidedTourEmployeesOpen: false,
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchEmployees()
    }
})

onMounted(() => {
    fetchEmployees()
})

function openGuidedTour() {
    state.modal.isGuidedTourEmployeesOpen = true
}

async function fetchEmployees() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await employeeService.getEmployees(params)
        if (response) {
            state.employees = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchEmployees()
}

function next() {
    currentTablePage++
    fetchEmployees()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchEmployees()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchEmployees()
}

function messageEmployee(employee: any) {
    employeeStore.setSelectedEmployee(employee)
    navigateTo(`/messages?user_uuid=${employee.uuid}`)
}

async function giveRemoveSecureMailAccess(employee: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const employeeUuid = employee?.uuid
        const response = await employeeService.toggleSecureMailLicense(employeeUuid)
        if (response.data) {
            if (response.data?.has_secure_mail_access) {
                successAlert(`${t('alert.success')}!`, `${t('employees.table.alert.secureMailAccessGranted')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('employees.table.alert.secureMailAccessRemoved')}.`)
            }
            fetchEmployees()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>