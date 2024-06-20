<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.employees') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('employees.employees') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/employees/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employees.newEmployee') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.employees"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.employees?.data?.length === 0))">
                                <tr v-for="(employee, index) in state.employees?.data" :key="index">
                                    <td width="25%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="employee?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
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
                                                @click="navigateTo(`/employees/edit/${employee.uuid}`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('employees.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md">
                                                <Icon name="ph:chat-circle" class="size-4" />
                                                {{ $t('employees.table.actions.message') }}
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
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/EmployeeService'

const runtimeConfig = useRuntimeConfig()
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
    dataFilter: [],
    employees: [],
    error: [],
    isTableLoading: false,
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
    state.error = []
    try {
        const params = {
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchEmployees()
}
</script>