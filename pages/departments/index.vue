<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('departments.departments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('departments.departments') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/departments/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('departments.newDepartment') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.departments"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.departments?.data?.length === 0))">
                                <tr v-for="(department, index) in state.departments?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ department?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/departments/edit/${department.uuid}`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('departments.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.departments" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/DepartmentService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'departments.table.name', sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: [],
    departments: [],
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchDepartments()
})

async function fetchDepartments() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await departmentService.getDepartments(params)
        if (response) {
            state.departments = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchDepartments()
}

function next() {
    currentTablePage++
    fetchDepartments()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchDepartments()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchDepartments()
}
</script>