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
                <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                    <div class="flex items-center gap-x-1">
                        <span>{{ $t('entriesPerPage') }}:</span>
                        <select class="focus:outline-none bg-transparent" @change="changePageLength"
                            id="employeesPageLength">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/employees/new')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('employees.newEmployee') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isInviteEmployeeOpen = true">
                            <Icon name="ph:envelope" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('employees.inviteEmployee') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isImportEmployeesOpen = true">
                            <Icon name="ph:file-arrow-up" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('employees.importEmployees.importEmployees') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-lg" @click="exportEmployees">
                            <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('employees.exportEmployees') }}
                        </FormButton>
                    </div>
                </div>
                <div class="space-y-5">
                    <div v-if="state.error?.message && state.error.message.length > 0">
                        <div v-if="state?.error?.message === 'There are not enough Secure Mail licenses available.' || state?.error?.message === 'Der er ikke nok Sikker Mail licenser tilgængelige.'"
                            @click="navigateTo('/apps')" class="cursor-pointer">
                            <div class="flex items-center px-4 py-3 mb-4 rounded-lg bg-red-100 text-black">
                                <div>
                                    <svg class="flex-shrink-0 w-5 h-5 text-red-700 dark:text-red-800"
                                        fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                                <div class="ml-3 text-sm font-medium text-red-700">
                                    {{ state.error?.message }}
                                    <span>
                                        {{ $t('employees.table.alert.secureMailLicenseInstruction') }}.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Alert type="danger" :text="state?.error?.message" v-else />
                    </div>
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.employees"
                            :isLoading="state.isTableLoading" :sortData="employeeStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.employees?.data?.length === 0))">
                                <tr v-for="(employee, index) in state.employees?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <div class="relative">
                                                <img :src="employee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                                                    class="h-11 w-11 rounded-full bg-gray-50 object-cover" />
                                                <div :class="[
                                                    employee?.is_online ? 'bg-green-500' : 'bg-red-700',
                                                    'w-3 h-3 rounded-full absolute left-0 top-0 border-1 border-white'
                                                ]">
                                                </div>
                                            </div>
                                            <span>
                                                {{ employee?.firstname }} {{ employee?.lastname }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <span>{{ employee?.email }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ employee?.phone }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-center gap-x-2" v-for="(role, index) in employee?.roles"
                                            :key="index">
                                            <span v-if="role.name === 'Admin'">
                                                {{ $t('employees.table.admin') }}
                                            </span>
                                            <span v-else-if="role.name === 'User'">
                                                {{ $t('employees.table.user') }}
                                            </span>
                                            <span v-else>
                                                {{ role?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip :text="$t('employees.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/employees/${employee.uuid}/view-details`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('employees.table.actions.edit')"
                                                v-if="employee?.is_editable">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/employees/${employee.uuid}/edit`)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('employees.table.actions.message')"
                                                v-if="userStore.getUser?.id !== employee?.id">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="messageEmployee(employee)">
                                                    <Icon name="ph:chat-circle" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('employees.table.actions.calendar')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/calendar?employee_uuid=${employee?.uuid}`)">
                                                    <Icon name="ph:calendar-blank" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="employee?.has_secure_mail_access ?
                                                $t('employees.table.actions.removeSecureMailAccess') :
                                                $t('employees.table.actions.giveSecureMail')"
                                                v-if="userStore.getUser?.is_secure_mail_active && !employee?.has_secure_mail_access">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="giveRemoveSecureMailAccess(employee)">
                                                    <Icon name="ph:envelope-open" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('employees.table.actions.giveAIAccess')"
                                                v-if="userStore.getUser?.has_ai_access && !employee?.has_ai_access">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="giveAIAccessConfirmation(employee)">
                                                    <Icon name="ic:round-accessibility" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('employees.table.actions.giveBookingAccess')"
                                                v-if="userStore.getUser?.has_booking_app_access && !employee?.has_booking_app_access">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="giveBookingAccessConfirmation(employee)">
                                                    <Icon name="ph:calendar-check" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.employees" @previous="previous" @next="next" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isGiveAIAccessOpen"
                :message="$t('employees.table.confirmation.aiAccessConfirmation') + '?'"
                @close="state.modal.isGiveAIAccessOpen = false" @confirm="giveAIAccess" />
            <DialogConfirmation :isModalOpen="state.modal.isGiveBookingAccessOpen"
                :message="$t('employees.table.confirmation.bookingAccessConfirmation') + '?'"
                @close="state.modal.isGiveBookingAccessOpen = false" @confirm="giveBookingAccess" />

            <ModulesUserEmployeeInviteModalNew :isModalOpen="state.modal.isInviteEmployeeOpen"
                @close="state.modal.isInviteEmployeeOpen = false" @refreshEmployees="fetchEmployees" />
            <ModulesUserEmployeeModalImport :isModalOpen="state.modal.isImportEmployeesOpen"
                @close="state.modal.isImportEmployeesOpen = false" />

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
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'employees.table.name', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'employees.table.email', isTranslateName: true, sorter: true, key: 'email' },
        { name: 'employees.table.phone', isTranslateName: true, sorter: true, key: 'phone' },
        { name: 'employees.table.role', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    employees: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isImportEmployeesOpen: false,
        isInviteEmployeeOpen: false,
        isGiveAIAccessOpen: false,
        isGiveBookingAccessOpen: false,
        isGuidedTourEmployeesOpen: false,
    },
    selectedEmployee: {} as any,
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
            page: employeeStore.getCurrentPageNumber,
            page_length: employeeStore.getCurrentPageLength,
            sortField: employeeStore.getSortData.sortField,
            sortOrder: employeeStore.getSortData.sortOrder,
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
    const currentTablePage = employeeStore.getCurrentPageNumber - 1
    employeeStore.setCurrentPageNumber(currentTablePage)
    fetchEmployees()
}

function next() {
    const currentTablePage = employeeStore.getCurrentPageNumber + 1
    employeeStore.setCurrentPageNumber(currentTablePage)
    fetchEmployees()
}

function sort(sortingData: any) {
    employeeStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    employeeStore.setSortData(sortField, sortOrder)
    fetchEmployees()
}

function handleSearch(value: any) {
    employeeStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchEmployees()
}

function changePageLength(event: any) {
    employeeStore.setCurrentPageNumber(1)
    employeeStore.setCurrentPageLength(event.target.value)
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

function giveAIAccessConfirmation(employee: any) {
    state.selectedEmployee = employee
    state.modal.isGiveAIAccessOpen = true
}

async function giveAIAccess() {
    state.error = {}
    state.isTableLoading = true
    try {
        const employeeUuid = state.selectedEmployee?.uuid
        const response = await employeeService.toggleAILicense(employeeUuid)
        if (response.data) {
            if (response.data?.has_ai_access) {
                successAlert(`${t('alert.success')}!`, `${t('employees.table.alert.aIAccessGranted')}.`)
            }
            fetchEmployees()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function giveBookingAccessConfirmation(employee: any) {
    state.selectedEmployee = employee
    state.modal.isGiveBookingAccessOpen = true
}

async function giveBookingAccess() {
    state.error = {}
    state.isTableLoading = true
    try {
        const employeeUuid = state.selectedEmployee?.uuid
        const response = await employeeService.toggleBookingLicense(employeeUuid)
        if (response.data) {
            if (response.data?.has_booking_app_access) {
                successAlert(`${t('alert.success')}!`, `${t('employees.table.alert.bookingAccessGranted')}.`)
            }
            fetchEmployees()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function exportEmployees() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await employeeService.exportEmployees(params)
        if (response) {
            saveAs(response, `${t('employees.employees')}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>