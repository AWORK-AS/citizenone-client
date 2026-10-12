<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedEmployees') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.tabs.archived') }}</template>

            <ModulesUserSettingsArchiveSubTab id="archived" class="mt-5" />

            <div class="mt-10">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <TableSearch @search="handleSearch" />
                        <label class="flex items-center gap-x-2 text-sm text-gray-700 cursor-pointer">
                            <FormSwitch :value="state.onlyDeletable" :label="$t('archived.table.readyForDeletion')"
                                @toggleSwitch="toggleDeletable" />
                            {{ $t('archived.table.readyForDeletion') }}
                        </label>
                    </div>
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.employees"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.employees?.data?.length === 0))">
                                <tr v-for="(employee, index) in state.employees?.data" :key="index">
                                    <td width="20%">
                                        <p>
                                            {{ formatDateToReadable(employee?.date_archived) }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="employee?.profile_image ?? avatarUrl(`${employee?.firstname + ' ' + employee?.lastname}`)"
                                                class="rounded-full w-11" />
                                            <span>{{ employee?.firstname }} {{ employee?.lastname }}</span>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <span>{{ employee?.email }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ employee?.phone }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-center gap-x-2" v-for="(role, index) in employee?.roles"
                                            :key="index">
                                            <span>{{ role.name }}</span>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span v-if="employee?.employee_detail?.termination_date">
                                            {{ formatDateToReadable(employee.employee_detail.termination_date) }}
                                        </span>
                                    </td>
                                    <td width="10%">
                                        <div v-if="employee?.employee_detail?.deletable_from" class="space-y-1">
                                            <span>{{ formatDateToReadable(employee.employee_detail.deletable_from) }}</span>
                                            <Badge v-if="employee.employee_detail.is_deletable" type="active"
                                                data-testid="can-be-deleted-badge">
                                                {{ $t('archived.table.canBeDeleted') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="confirmEmployeeUnarchiving(employee)">
                                                <Icon name="mdi:archive-cancel-outline" class="size-4" />
                                                {{ $t('archived.table.actions.unarchive') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="confirmEmployeeDeletion(employee)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('archived.table.actions.delete') }}
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
            <DialogConfirmation :isModalOpen="state.modal.isUnarchiveEmployeeOpen"
                :message="$t('archived.confirmation.unarchiveEmployee') + '?'"
                @close="state.modal.isUnarchiveEmployeeOpen = false" @confirm="unarchiveEmployee" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteEmployeeOpen"
                :message="$t('archived.confirmation.deleteEmployee')"
                @close="state.modal.isDeleteEmployeeOpen = false" @confirm="deleteEmployee" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/user/EmployeeService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'settings.tabs.archived',
        translate: true,
        href: '/settings/archived/employees',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'archived.table.date', isTranslateName: true, },
        { name: 'employees.table.name', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'employees.table.email', isTranslateName: true, sorter: true, key: 'email' },
        { name: 'employees.table.phone', isTranslateName: true, sorter: true, key: 'phone' },
        { name: 'employees.table.role', isTranslateName: true, },
        { name: 'archived.table.lastWorkingDay', isTranslateName: true, sorter: true, key: 'termination_date' },
        { name: 'archived.table.canBeDeletedFrom', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    onlyDeletable: false,
    employees: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isUnarchiveEmployeeOpen: false,
        isDeleteEmployeeOpen: false,
    },
    selectedEmployee: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchArchivedEmployees()
    }
})

onMounted(() => {
    // The reminder email and bell item link here with ?filter=deletable.
    state.onlyDeletable = useRoute().query.filter === 'deletable'
    fetchArchivedEmployees()
})

function toggleDeletable() {
    state.onlyDeletable = !state.onlyDeletable
    currentTablePage = 1
    navigateTo({ query: state.onlyDeletable ? { filter: 'deletable' } : {} }, { replace: true })
    fetchArchivedEmployees()
}

async function fetchArchivedEmployees() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...(state.onlyDeletable ? { filter: 'deletable' } : {}),
        }
        const response = await employeeService.getArchivedEmployees(params)
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
    fetchArchivedEmployees()
}

function next() {
    currentTablePage++
    fetchArchivedEmployees()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchArchivedEmployees()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchArchivedEmployees()
}

function confirmEmployeeUnarchiving(employee: any) {
    state.selectedEmployee = employee
    state.modal.isUnarchiveEmployeeOpen = true
}

async function unarchiveEmployee() {
    state.error = {}
    state.isTableLoading = true
    try {
        const employeeUuid = state.selectedEmployee?.uuid
        const response = await employeeService.archiveEmployee(employeeUuid, false)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('archived.alert.employeeSuccessfullyUnarchive')}.`)
            fetchArchivedEmployees()
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'You have no available user license.') {
            navigateTo(`/subscription?error=${error?.message}`)
        } else if (error?.message === 'Du har ingen tilgængelige brugerlicenser til at oprette en ny medarbejder.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isTableLoading = false
}

function confirmEmployeeDeletion(employee: any) {
    state.selectedEmployee = employee
    state.modal.isDeleteEmployeeOpen = true
}

async function deleteEmployee() {
    state.error = {}
    state.isTableLoading = true
    try {
        const employeeUuid = state.selectedEmployee?.uuid
        await employeeService.permanentlyDeleteEmployee(employeeUuid)
        successAlert(`${t('alert.success')}!`, `${t('archived.alert.employeeSuccessfullyDeleted')}.`)
        fetchArchivedEmployees()
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>