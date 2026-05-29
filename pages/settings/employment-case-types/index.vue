<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.caseTypes.caseTypes') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.caseTypes.caseTypes') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/employment-case-types/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employment.caseTypes.addNewCaseType') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.caseTypes"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.caseTypes?.data?.length === 0))">
                                <tr v-for="(caseType, index) in state.caseTypes?.data" :key="index">
                                    <td width="30%">
                                        <span>{{ caseType?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ caseType?.description }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ caseType?.sort_order }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ caseType?.is_active ? $t('yes') : $t('no') }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/employment-case-types/${caseType.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('employment.caseTypes.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteCaseTypeConfirmation(caseType)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('employment.caseTypes.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.caseTypes" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('employment.caseTypes.table.confirmation.deleteCaseTypeConfirmation')"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteCaseType" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentCaseTypeService } from '@/components/api/user/EmploymentService'
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
        name: 'employment.caseTypes.caseTypes',
        translate: true,
        href: '/settings/employment-case-types',
    },
]

const state = reactive({
    caseTypes: [] as any,
    columnHeaders: [
        { name: 'employment.caseTypes.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'employment.caseTypes.table.description', isTranslateName: true, sorter: false, key: 'description' },
        { name: 'employment.caseTypes.table.sortOrder', isTranslateName: true, sorter: true, key: 'sort_order' },
        { name: 'employment.caseTypes.table.active', isTranslateName: true, sorter: false, key: 'is_active' },
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
    selectedCaseType: {} as any,
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
    fetchCaseTypes()
})

async function fetchCaseTypes() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await employmentCaseTypeService.getCaseTypes(params)
        if (response) {
            state.caseTypes = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCaseTypes()
}

function next() {
    currentTablePage++
    fetchCaseTypes()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCaseTypes()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCaseTypes()
}

function deleteCaseTypeConfirmation(caseType: any) {
    state.selectedCaseType = caseType
    state.modal.isDeleteOpen = true
}

async function deleteCaseType() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentCaseTypeService.deleteCaseType(state.selectedCaseType.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchCaseTypes()
            successAlert(`${t('alert.success')}!`, `${t('employment.caseTypes.table.alert.caseTypeSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
