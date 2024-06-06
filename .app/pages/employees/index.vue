<template>
    <div>

        <Head>
            <Title>Employees - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <TairoContentWrapper>
            <template #right>
                <BaseButton color="primary" shape="full" @click="navigateTo('employees/new')">
                    <Icon name="lucide:plus" class="h-4 w-4" />
                    <span>New Employee</span>
                </BaseButton>
            </template>
            <div class="space-y-3">
                <BaseMessage color="danger" icon v-if="state.error" :message="state.error?.message" />
                <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                    @handleFilter="handleFilter" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.employees"
                        :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.employees?.data?.length === 0))">
                            <tr v-for="(employee, index) in state.employees?.data" :key="index">
                                <td width="20%">
                                    <div class="flex items-center gap-x-2">
                                        <BaseAvatar
                                            :src="`https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=${employee?.firstname + ' ' + employee?.lastname}`"
                                            rounded="full" size="sm" />
                                        <span>{{ employee?.firstname }} {{ employee?.lastname }}</span>
                                    </div>
                                </td>
                                <td width="20%">
                                    <span>{{ employee?.email }}</span>
                                </td>
                                <td width="20%">
                                    <span>{{ employee?.phone }}</span>
                                </td>
                                <td width="20%">
                                    <div class="flex items-center gap-x-2" v-for="(role, index) in employee?.roles"
                                        :key="index">
                                        <span>{{ role.name }}</span>
                                    </div>
                                </td>
                                <td width="20%">
                                    <div class="flex items-end gap-2">
                                        <BaseButtonIcon rounded="md" data-nui-tooltip="Edit employee record"
                                            :to="`/employees/edit/${employee.uuid}`">
                                            <Icon name="ph:pencil-simple" class="size-5 text-sky-500" />
                                        </BaseButtonIcon>
                                    </div>
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
        </TairoContentWrapper>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/EmployeeService'

definePageMeta({
    layout: 'user',
    title: 'Employees',
})

const runtimeConfig = useRuntimeConfig()
const isModalNoteOpen = ref(false)
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: 'phone' },
        { column: 'email' },
    ],
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'firstname' },
        { name: 'Email', sorter: true, key: 'email' },
        { name: 'Phone', sorter: true, key: 'phone' },
        { name: 'Role' },
        { name: '' },
    ],
    dataFilter: [],
    employees: [],
    error: null,
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
    state.error = null
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