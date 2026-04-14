<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employeeGroups.employeeGroups') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employeeGroups.employeeGroups') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/employee-groups/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employeeGroups.newEmployeeGroup') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.employeeGroups"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.employeeGroups?.data?.length === 0))">
                                <tr v-for="(employeeGroup, index) in state.employeeGroups?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ employeeGroup?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/employee-groups/${employeeGroup.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('employeeGroups.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteEmployeeGroupConfirmation(employeeGroup)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('employeeGroups.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.employeeGroups" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteEmployeeGroupOpen"
                :message="$t('employeeGroups.table.confirmation.deleteEmployeeGroupConfirmation') + '?'"
                @close="state.modal.isDeleteEmployeeGroupOpen = false" @confirm="deleteEmployeeGroup" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'employeeGroups.employeeGroups',
        translate: true,
        href: '/settings/employee-groups',
    },
]

const state = reactive({
    employeeGroups: [] as any,
    columnHeaders: [
        { name: 'employeeGroups.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteEmployeeGroupOpen: false,
    },
    selectedEmployeeGroup: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchEmployeeGroups()
})

async function fetchEmployeeGroups() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await employeeGroupService.getEmployeeGroups(params)
        if (response) {
            state.employeeGroups = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchEmployeeGroups()
}

function next() {
    currentTablePage++
    fetchEmployeeGroups()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchEmployeeGroups()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchEmployeeGroups()
}

function deleteEmployeeGroupConfirmation(employeeGroup: any) {
    state.selectedEmployeeGroup = employeeGroup
    state.modal.isDeleteEmployeeGroupOpen = true
}

async function deleteEmployeeGroup() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employeeGroupService.deleteEmployeeGroup(state.selectedEmployeeGroup.uuid)
        fetchEmployeeGroups()
        successAlert(`${t('alert.success')}!`, `${t('employeeGroups.table.alert.employeeGroupSuccessfullyDeleted')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>