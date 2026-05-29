<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.statusTypes.statusTypes') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.statusTypes.statusTypes') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/employment-status-types/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employment.statusTypes.addNewStatusType') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.statusTypes"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.statusTypes?.data?.length === 0))">
                                <tr v-for="(statusType, index) in state.statusTypes?.data" :key="index">
                                    <td width="30%">
                                        <span>{{ statusType?.name }}</span>
                                    </td>
                                    <td width="15%">
                                        <span v-if="statusType?.color"
                                            :style="{ backgroundColor: statusType.color }"
                                            class="inline-block w-6 h-6 rounded" />
                                    </td>
                                    <td width="15%">
                                        <span>{{ statusType?.sort_order }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ statusType?.is_active ? $t('yes') : $t('no') }}</span>
                                    </td>
                                    <td width="25%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/employment-status-types/${statusType.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('employment.statusTypes.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteStatusTypeConfirmation(statusType)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('employment.statusTypes.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.statusTypes" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('employment.statusTypes.table.confirmation.deleteStatusTypeConfirmation')"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteStatusType" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentStatusTypeService } from '@/components/api/user/EmploymentService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'employment.statusTypes.statusTypes',
        translate: true,
        href: '/settings/employment-status-types',
    },
]

const state = reactive({
    statusTypes: [] as any,
    columnHeaders: [
        { name: 'employment.statusTypes.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'employment.statusTypes.table.color', isTranslateName: true, sorter: false, key: 'color' },
        { name: 'employment.statusTypes.table.sortOrder', isTranslateName: true, sorter: true, key: 'sort_order' },
        { name: 'employment.statusTypes.table.active', isTranslateName: true, sorter: false, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteOpen: false,
    },
    selectedStatusType: {} as any,
    sortData: {
        sortField: 'sort_order',
        sortOrder: 'ascend',
    },
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/settings/expense-categories')
        return
    }
    fetchStatusTypes()
})

async function fetchStatusTypes() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await employmentStatusTypeService.getStatusTypes(params)
        if (response) {
            state.statusTypes = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchStatusTypes()
}

function next() {
    currentTablePage++
    fetchStatusTypes()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchStatusTypes()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchStatusTypes()
}

function deleteStatusTypeConfirmation(statusType: any) {
    state.selectedStatusType = statusType
    state.modal.isDeleteOpen = true
}

async function deleteStatusType() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentStatusTypeService.deleteStatusType(state.selectedStatusType.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchStatusTypes()
            successAlert(`${t('alert.success')}!`, `${t('employment.statusTypes.table.alert.statusTypeSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
