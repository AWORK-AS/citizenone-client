<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('expenseCategories.expenseCategories') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('expenseCategories.expenseCategories') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/expense-categories/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('expenseCategories.addNewExpenseCategory') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.expenseCategories"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.expenseCategories?.data?.length === 0))">
                                <tr v-for="(expenseCategory, index) in state.expenseCategories?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ expenseCategory?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/expense-categories/${expenseCategory.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('expenseCategories.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteExpenseCategoryConfirmation(expenseCategory)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('expenseCategories.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.expenseCategories" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteExpenseCategoryOpen"
                :message="$t('expenseCategories.table.confirmation.deleteExpenseCategoryConfirmation')"
                @close="state.modal.isDeleteExpenseCategoryOpen = false" @confirm="deleteExpenseCategory" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { expenseCategoryService } from '@/components/api/user/ExpenseCategoryService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'expenseCategories.expenseCategories',
        translate: true,
        href: '/settings/expense-categories',
    },
]

const state = reactive({
    expenseCategories: [] as any,
    columnHeaders: [
        { name: 'expenseCategories.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteExpenseCategoryOpen: false,
    },
    selectedExpenseCategory: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchExpenseCategories()
})

async function fetchExpenseCategories() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await expenseCategoryService.getExpenseCategories(params)
        if (response) {
            state.expenseCategories = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchExpenseCategories()
}

function next() {
    currentTablePage++
    fetchExpenseCategories()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchExpenseCategories()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchExpenseCategories()
}

function deleteExpenseCategoryConfirmation(expenseCategory: any) {
    state.selectedExpenseCategory = expenseCategory
    state.modal.isDeleteExpenseCategoryOpen = true
}

async function deleteExpenseCategory() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await expenseCategoryService.deleteExpenseCategory(state.selectedExpenseCategory.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchExpenseCategories()
            successAlert(`${t('alert.success')}!`, `${t('expenseCategories.table.alert.expenseCategorySuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>