<template>
    <div class="relative">
        <div class="h-full">
            <div class="table-responsive">
                <Table :columnHeaders="state.columnHeaders" :data="state.employees" :isLoading="state.isTableLoading"
                    :sortData="state.sortData" @sort="sort">
                    <template #body v-if="!(state.isTableLoading || (state.employees?.data?.length === 0))">
                        <tr v-for="(employee, index) in state.employees?.data" :key="index">
                            <td width="20%">
                                <span>{{ employee?.firstname }} {{ employee?.lastname }}</span>
                            </td>
                            <td width="15%">
                                <span>{{ employee?.email }}</span>
                            </td>
                            <td width="20%">
                                <span>{{ employee?.phone }}</span>
                            </td>
                            <td width="10%">
                                <span>{{ employee?.birthday }}</span>
                            </td>
                            <td width="15%">
                                <div class="flex gap-x-2">
                                    <span v-for="(role, index) in employee.roles" :key="index">
                                        {{ role.name }}
                                    </span>
                                </div>
                            </td>
                            <td width="10%">

                            </td>
                        </tr>
                    </template>
                </Table>
            </div>
            <Pagination :data="state.employees" @previous="previous" @next="next" />
            <div v-if="!state.employees?.data">
                <BasePlaceholderPage title="No data available" subtitle="There is no data to show you right now.">
                    <template #image>
                        <img class="block dark:hidden"
                            src="/img/illustrations/placeholders/flat/placeholder-projects.svg"
                            alt="Placeholder image" />
                        <img class="hidden dark:block"
                            src="/img/illustrations/placeholders/flat/placeholder-projects-dark.svg"
                            alt="Placeholder image" />
                    </template>
                </BasePlaceholderPage>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/EmployeeService'

definePageMeta({
    layout: 'user',
    title: 'Employees',
})

let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'firstname' },
        { name: 'Email', sorter: true, key: 'email' },
        { name: 'Phone', sorter: true, key: 'phone' },
        { name: 'Birthday', sorter: true, key: 'birthday' },
        { name: 'Role' },
        { name: '' },
    ],
    error: null,
    isTableLoading: false,
    employees: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchEmployees()
})

async function fetchEmployees() {
    state.isTableLoading = true
    state.error = null
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
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
</script>