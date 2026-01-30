<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('expenses.expenses') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('expenses.expenses') }}</template>

            <div class="space-y-5">
                <div class="mt-8 flex flex-col md:flex-row justify-between gap-3">
                    <div class="flex items-center justify-end md:justify-start gap-x-3">
                        
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-3">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isAddExpenseOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('expenses.addNewExpense') }}
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
                                        <span>{{ expense?.amount }}</span>
                                    </td>
                                    <td width="10%">
                                        <div v-if="expense?.is_reimbursed" class="rounded-xl bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold text-center w-fit">{{ $t('expenses.table.reimbursed') }}</div>
                                        <div v-else class="rounded-xl bg-red-100 text-red-800 px-2 py-1 text-xs font-semibold text-center w-fit">{{ $t('expenses.table.pending') }}</div>
                                    </td>
                                    <td width="15%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="expense?.file_url" @click="downloadFile(expense?.file_url)">
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
                                            <Tooltip :text="$t('expenses.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewExpense(expense)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('expenses.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editExpense(expense)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('expenses.table.actions.delete')">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="deleteExpenseConfirmation(expense)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('expenses.table.actions.unreimburse')" v-if="expense?.is_reimbursed && isAdmin(userStore?.user?.roles)">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="unReimburse(expense)">
                                                    <Icon name="ph:x" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('expenses.table.actions.reimburse')" v-if="!expense?.is_reimbursed && isAdmin(userStore?.user?.roles)">
                                                <FormButton type="button" buttonStyle="success" class="rounded-md"
                                                    @click="reimburse(expense)">
                                                    <Icon name="ph:check" class="size-4" />
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

                <ModulesUserDocumentExpenseModalView :isModalOpen="state.modal.isViewExpenseOpen"
                    :selectedExpense="state.selectedExpense" @editExpense="editExpense(state.selectedExpense)"
                    @close="state.modal.isViewExpenseOpen = false" />
                <ModulesUserDocumentExpenseModalNew :isModalOpen="state.modal.isAddExpenseOpen"
                    @close="state.modal.isAddExpenseOpen = false" @refreshExpenses="fetchExpenses" />
                <ModulesUserDocumentExpenseModalEdit :isModalOpen="state.modal.isEditExpenseOpen"
                    :selectedExpense="state.selectedExpense"
                    @close="state.modal.isEditExpenseOpen = false" @refreshExpenses="fetchExpenses" />
                    
                <DialogConfirmation :isModalOpen="state.modal.isDeleteExpenseOpen"
                    :message="$t('expenses.confirmation.deleteExpenseConfirmation')"
                    @close="state.modal.isDeleteExpenseOpen = false" @confirm="deleteExpense" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import { expenseService } from '@/components/api/user/ExpenseService'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const userStore = useUserStore() as any
const { t } = useI18n()
const router = useRouter()
const documentFile = ref(null) as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'drive.companyDocuments',
        translate: true,
        href: '/drive',
    },
    {
        name: 'drive.expenses',
        translate: true,
        href: '/drive/expenses',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'expenses.table.employee', isTranslateName: true, sorter: true },
        { name: 'expenses.table.name', isTranslateName: true, },
        { name: 'expenses.table.category', isTranslateName: true, sorter: true, },
        { name: 'expenses.table.amount', isTranslateName: true, sorter: true, },
        { name: 'expenses.table.status', isTranslateName: true, sorter: true, },
        { name: 'expenses.table.receipt', isTranslateName: true },
        { name: 'expenses.table.date', isTranslateName: true, sorter: true, key: 'expense_date' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    expenses: [] as any,
    modal: {
       isDeleteExpenseOpen: false,
       isAddExpenseOpen: false,
       isEditExpenseOpen: false,
       isViewExpenseOpen: false,
    },
    selectedExpense: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchExpenses()
})


function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

async function fetchExpenses(folderUuid: any = null) {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await expenseService.getExpenses(params)
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


function downloadFile(fileUrl: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = '';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function viewExpense(expense: any) {
    state.selectedExpense = expense
    state.modal.isViewExpenseOpen = true
}

function editExpense(expense: any) {
    state.selectedExpense = {
        id: expense.id,
        uuid: expense.uuid,
        name: expense.name,
        expense_category_uuid: expense.category?.uuid,
        description: expense.description,
        expense_date: expense.expense_date,
        amount: expense.amount,
        receipt: {
            name: expense.file_name_src,
            url: expense.file_url,
            size: expense.size,
        }
    }
    state.modal.isEditExpenseOpen = true
}

function deleteExpenseConfirmation(expense: any) {
    state.selectedExpense = expense
    state.modal.isDeleteExpenseOpen = true
}

async function deleteExpense() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await expenseService.deleteExpense(state.selectedExpense.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchExpenses()
            successAlert(`${t('alert.success')}!`, `${t('expenses.table.alert.expenseSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function reimburse(expense: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        let params = {
            is_reimbursed: true
        }
        const response = await expenseService.reimburseExpense(expense.uuid, params)
        if (response?.data) {
            fetchExpenses()
            successAlert(`${t('alert.success')}!`, `${t('expenses.table.alert.expenseSuccessfullyReimbursed')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function unReimburse(expense: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await expenseService.unReimburseExpense(expense.uuid)
        if (response?.data) {
            fetchExpenses()
            successAlert(`${t('alert.success')}!`, `${t('expenses.table.alert.expenseSuccessfullyUnreimbursed')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>