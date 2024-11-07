<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedEmployees') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('archived.tabs.archivedEmployees') }}</template>

            <ModulesSettingsTab />

            <ModulesArchivedTab class="mt-5" />

            <div class="mt-10">
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
                                                class="rounded-full w-11" />
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
                                                @click="confirmEmployeeUnarchiving(employee)">
                                                <Icon name="mdi:archive-cancel-outline" class="size-4" />
                                                {{ $t('archived.table.actions.unarchive') }}
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
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/EmployeeService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useDepartmentStore } from '@/store/department'
import { useEmployeeStore } from '@/store/employee'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

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
        isUnarchiveEmployeeOpen: false,
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
    fetchArchivedEmployees()
})

async function fetchArchivedEmployees() {
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
    state.dataFilter.search = value
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
        const response = await employeeService.archiveEmployee(employeeUuid)
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
</script>