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
                                    <td width="20%">
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
                                    <td width="20%">
                                        <span>{{ expense?.file_name_src }}</span>
                                    </td>
                                    <td width="10%">
                                        <span class="truncate">
                                            {{ formatDateTimeToReadable(expense?.created_at) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip :text="$t('employees.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="navigateTo(`/drive/expenses/${expense?.uuid}`)">
                                                    <Icon name="ph:eye" class="size-4" />
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

                <DialogConfirmation :isModalOpen="state.modal.isDeleteExpenseOpen"
                    :message="$t('expense.confirmation.deleteExpenseConfirmation')"
                    @close="state.modal.isDeleteExpenseOpen = false" @confirm="deleteDocument" />
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
const { formatDateTimeToReadable } = useDatetimeFormatter()
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
        { name: 'expenses.table.receipt', isTranslateName: true },
        { name: 'expenses.table.date', isTranslateName: true, sorter: true, key: 'created_at' },
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

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
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

// async function downloadFile(document: any) {
//     state.error = {}
//     state.isTableLoading = true
//     try {
//         const documentUuid = document?.uuid
//         const response = await documentService.downloadFile(documentUuid)
//         if (response) {
//             saveAs(response, document?.name)
//         }
//     } catch (error: any) {
//         state.error = error
//     }
//     state.isTableLoading = false
// }

function triggerFileInput() {
    documentFile.value.click()
}

async function uploadFile(event: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid as any
        const files = event.target.files

        if (!files || files.length === 0) return

        const params = new FormData()
        params.append('type', 'file')
        params.append('is_admin_access', 'false')

        // Append all files with the same key, e.g., files[]
        for (const file of files) {
            params.append('files[]', file)
        }

        if (folderUuid) {
            params.append('folder_uuid', folderUuid)
        }
        const response = await documentService.saveFileFolder(params)
        if (response?.data) {
            resetFileInput()
            fetchDocuments()
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    state.isPageLoading = false
}

const resetFileInput = () => {
    if (documentFile.value) {
        documentFile.value.value = null
    }
}

async function viewDirectory(document: any) {
    currentTablePage = 1
    await navigateTo(`/drive?folder_uuid=${document.uuid}`)
}

function editDocument(document: any) {
    state.selectedDocument = document
    state.modal.isEditDocumentOpen = true
}

function viewDocumentAccess(document: any) {
    state.selectedDocument = document
    state.modal.isViewAccessOpen = true
}

function confirmDocumentArchiving(document: any) {
    state.selectedDocument = document
    state.modal.isArchiveDocumentOpen = true
}

async function archiveDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = state.selectedDocument?.uuid
        const response = await documentService.archiveUnarchiveDocument(documentUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.documentSuccessfullyArchived')}.`)
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function moveFileConfirmation(document: any) {
    state.selectedDocument = document
    state.modal.isMoveFileOpen = true
}

function deleteDirectoryConfirmation(document: any) {
    state.selectedDocument = document
    state.modal.isDeleteDirectoryOpen = true
}

function deleteFileConfirmation(document: any) {
    state.selectedDocument = document
    state.modal.isDeleteFileOpen = true
}

async function deleteDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await documentService.deleteDocument(state.selectedDocument.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchDocuments()
            if (state.selectedDocument.type === 'folder') {
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.deletedFolderSuccessfully')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.deletedFileSuccessfully')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>