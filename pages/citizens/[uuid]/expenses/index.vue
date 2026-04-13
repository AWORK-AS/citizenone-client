<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.expenses.expenses') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.expenses.expenses') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />
                <ModulesUserCitizenWalletTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="action" @click="state.modal.isAddExpenseOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.expenses.newExpense') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.expenses"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.expenses?.data?.length === 0))">
                                <tr v-for="(expense, index) in state.expenses?.data" :key="index">
                                    <td width="15%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="expense?.user?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${expense?.user?.firstname + ' ' + expense?.user?.lastname}`"
                                                class="h-11 w-11 rounded-full bg-gray-50 object-cover" />
                                            <span>
                                                {{ expense?.user?.firstname }} {{ expense?.user?.lastname }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span>{{ expense?.name }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ expense?.category?.name }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ formatNumber(locale, expense?.amount_raw) }}</span>
                                    </td>
                                    <td width="10%">
                                        <div v-if="expense?.status === 'reimbursed'"
                                            class="rounded-xl bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                            {{ $t('citizens.expenses.table.reimbursed') }}</div>
                                        <div v-else-if="expense?.status === 'pending'"
                                            class="rounded-xl bg-amber-100 text-amber-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                            {{ $t('citizens.expenses.table.pending') }}</div>
                                        <div v-else-if="expense?.status === 'rejected'"
                                            class="rounded-xl bg-red-100 text-red-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                            {{ $t('citizens.expenses.table.rejected') }}</div>
                                    </td>
                                    <td width="15%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="expense?.file_url" @click="downloadReceipt(expense)">
                                            <Icon name="ph:file" class="size-6" />
                                            <span class="truncate">{{ expense?.file_name_src }}</span>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span class="truncate">
                                            {{ formatDateToReadable(expense?.expense_date) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip :text="$t('citizens.expenses.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="viewExpense(expense)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.expenses.table.actions.edit')"
                                                v-if="expense?.status === 'pending'">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="editExpense(expense)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.expenses.table.actions.reject')"
                                                v-if="expense?.status !== 'reimbursed' && expense?.status !== 'rejected'">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="rejectExpenseConfirmation(expense)">
                                                    <Icon name="ph:file-x-duotone" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.expenses.table.actions.reimburse')"
                                                v-if="expense?.status !== 'reimbursed' && expense?.status !== 'rejected'">
                                                <FormButton type="button" buttonStyle="success"
                                                    @click="reimburse(expense)">
                                                    <Icon name="ph:check" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.expenses.table.actions.delete')"
                                                v-if="expense?.status !== 'pending'">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteExpenseConfirmation(expense)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.expenses" @previous="previous" @next="next" />
                </div>

                <ModulesUserCitizenExpenseModalView :isModalOpen="state.modal.isViewExpenseOpen"
                    :selectedExpense="state.selectedExpense" @editExpense="editExpense(state.selectedExpense)"
                    @close="state.modal.isViewExpenseOpen = false" />
                <ModulesUserCitizenExpenseModalNew :isModalOpen="state.modal.isAddExpenseOpen"
                    :citizenUuid="citizenUuid" @close="state.modal.isAddExpenseOpen = false"
                    @refreshExpenses="fetchExpenses" />
                <ModulesUserCitizenExpenseModalEdit :isModalOpen="state.modal.isEditExpenseOpen"
                    :selectedExpense="state.selectedExpense" @close="state.modal.isEditExpenseOpen = false"
                    @refreshExpenses="fetchExpenses" />

                <DialogConfirmation :isModalOpen="state.modal.isDeleteExpenseOpen"
                    :message="$t('citizens.expenses.confirmation.deleteConfirmation')"
                    @close="state.modal.isDeleteExpenseOpen = false" @confirm="deleteExpense" />
                <DialogConfirmation :isModalOpen="state.modal.isRejectExpenseOpen"
                    :message="$t('citizens.expenses.confirmation.rejectConfirmation')"
                    @close="state.modal.isRejectExpenseOpen = false" @confirm="rejectExpense" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenExpenseService } from '@/components/api/user/CitizenExpenseService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { successAlert } = useAlert()
const { t, locale } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'citizens.expenses.expenses',
        translate: true,
        href: `/citizens/${citizenUuid}/expenses`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.expenses.table.employee', isTranslateName: true, sorter: false },
        { name: 'citizens.expenses.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'citizens.expenses.table.category', isTranslateName: true, sorter: false },
        { name: 'citizens.expenses.table.amount', isTranslateName: true, sorter: true, key: 'amount' },
        { name: 'citizens.expenses.table.status', isTranslateName: true, sorter: false },
        { name: 'citizens.expenses.table.receipt', isTranslateName: true, sorter: false },
        { name: 'citizens.expenses.table.date', isTranslateName: true, sorter: true, key: 'expense_date' },
        { name: '' },
    ],
    expenses: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    modal: {
        isAddExpenseOpen: false,
        isDeleteExpenseOpen: false,
        isEditExpenseOpen: false,
        isViewExpenseOpen: false,
        isRejectExpenseOpen: false,
    },
    selectedExpense: {} as any,
    sortData: {
        sortField: 'expense_date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchExpenses()
})

async function fetchExpenses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await citizenExpenseService.getExpenses(params)
        if (response) {
            state.expenses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchExpenses()
}

function next() {
    currentTablePage++
    fetchExpenses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchExpenses()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchExpenses()
}

function viewExpense(expense: any) {
    state.selectedExpense = expense
    state.modal.isViewExpenseOpen = true
}

function editExpense(expense: any) {
    console.log('Selected Expense for Edit:', expense) // Debug log to check the expense data
    state.selectedExpense = {
        id: expense.id,
        uuid: expense.uuid,
        name: expense.name,
        expense_category_uuid: expense.category?.uuid,
        citizen_uuid: expense?.citizen?.uuid || citizenUuid,
        description: expense.description,
        expense_date: expense.expense_date,
        amount: expense.amount_raw,
        receipt: {
            name: expense.file_name_src,
            url: expense.file_url,
            size: expense.size,
        }
    }
    state.modal.isEditExpenseOpen = true
}

function rejectExpenseConfirmation(expense: any) {
    state.selectedExpense = expense
    state.modal.isRejectExpenseOpen = true
}

async function rejectExpense() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenExpenseService.rejectExpense(state.selectedExpense.uuid)
        if (response?.data) {
            state.modal.isRejectExpenseOpen = false
            fetchExpenses()
            successAlert(`${t('alert.success')}!`, `${t('citizens.expenses.alert.expenseRejected')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function deleteExpenseConfirmation(expense: any) {
    state.selectedExpense = expense
    state.modal.isDeleteExpenseOpen = true
}

async function deleteExpense() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenExpenseService.deleteExpense(state.selectedExpense.uuid)
        if (response?.message) {
            state.modal.isDeleteExpenseOpen = false
            fetchExpenses()
            successAlert(`${t('alert.success')}!`, `${t('citizens.expenses.alert.deletedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function downloadReceipt(expense: any) {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await citizenExpenseService.downloadReceipt(expense.uuid)
        if (response) {
            saveAs(response, expense?.file_name_src || 'receipt')
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the download.'
    }
    state.isPageLoading = false
}

async function reimburse(expense: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        let params = {
            is_reimbursed: true
        }
        const response = await citizenExpenseService.reimburseExpense(expense.uuid, params)
        if (response?.data) {
            fetchExpenses()
            successAlert(`${t('alert.success')}!`, `${t('citizens.expenses.alert.expenseReimbursed')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
