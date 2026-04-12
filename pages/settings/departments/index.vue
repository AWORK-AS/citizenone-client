<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('departments.departments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('departments.departments') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/departments/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('departments.newDepartment') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.departments"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.departments?.data?.length === 0))">
                                <tr v-for="(department, index) in state.departments?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ department?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <span :style="{ backgroundColor: department?.color }"
                                            class="inline-block w-8 h-8 rounded" />
                                    </td>
                                    <td width="30%">
                                        <div class="flex gap-1">
                                            <div v-for="(shift, index) in department?.shifts" :key="index">
                                                <p class="truncate text-xs bg-primary text-white px-2 py-1 rounded-md">
                                                    {{
                                                        language.locale.value === 'en' ? shift?.en_name : shift?.dk_name
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/departments/${department.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('departments.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteDepartmentConfirmation(department)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('departments.table.actions.delete') }}
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
            <DialogConfirmation :isModalOpen="state.modal.isDeleteDepartmentOpen"
                :message="$t('departments.table.confirmation.deleteDepartmentConfirmation') + '?'"
                @close="state.modal.isDeleteDepartmentOpen = false" @confirm="deleteDepartment" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'departments.departments',
        translate: true,
        href: '/settings/departments',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'departments.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'departments.table.color', isTranslateName: true, },
        { name: 'departments.table.shiftTypes', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    departments: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteDepartmentOpen: false,
    },
    selectedDepartment: {} as any,
    sortData: {
        sortField: 'name',
        sortOrder: 'ascend',
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDepartments()
}

function deleteDepartmentConfirmation(department: any) {
    state.selectedDepartment = department
    state.modal.isDeleteDepartmentOpen = true
}

async function deleteDepartment() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await departmentService.deleteDepartment(state.selectedDepartment.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchDepartments()
            successAlert(`${t('alert.success')}!`, `${t('departments.table.alert.departmentSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>