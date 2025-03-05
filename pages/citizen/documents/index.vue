<template>
    <div>
        <NuxtLayout name="citizen">

            <Head>
                <Title>{{ $t('citizens.documents.documents') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('citizens.documents.documents') }}</template>

            <div class="space-y-5">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.documents"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.documents?.data?.length === 0))">
                                <tr v-for="(document, index) in state.documents?.data" :key="index">
                                    <td width="25%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="document?.file_url" @click="downloadFile(document)">
                                            <Icon name="ph:file" class="size-6" />
                                            <span>{{ document?.name }}</span>
                                        </div>
                                        <span v-else class="flex items-center gap-x-1">
                                            <div>
                                                <Icon name="ph:folder-notch-open-light" class="size-6" />
                                            </div>
                                            <span>{{ document?.name }}</span>
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ document?.user?.firstname }}</span>
                                        <span>{{ document?.user?.lastname }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ formatDateTimeToReadable(document?.created_at) }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>
                                            {{ document?.updated_at && formatDateTimeToReadable(document?.updated_at) }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewDirectory(document)" v-if="document?.type === 'folder'">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.documents.table.actions.view') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.documents" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { documentService } from '@/components/api/citizen/DocumentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const documentFile = ref(null) as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.documents.documents',
        translate: true,
        href: '/citizen/documents',
    },
]

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'drive.table.name', sorter: true, key: 'name' },
        { name: 'drive.table.owner' },
        { name: 'drive.table.dateCreated', sorter: true, key: 'created_at' },
        { name: 'drive.table.lastModified', sorter: true, key: 'updated_at' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    documents: [] as any,
    modal: {
        isAddDirectoryOpen: false,
        isArchiveDocumentOpen: false,
        isDeleteDirectoryOpen: false,
        isDeleteFileOpen: false,
        isEditDocumentOpen: false,
        isMoveFileOpen: false,
        isUpgradeStorageOpen: false,
        isUploadFileOpen: false,
        isViewFolderStructureOpen: false,
    },
    selectedDocument: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchDocuments()
})

watch(() => router?.currentRoute?.value?.query, (newParams, oldParams) => {
    handleRouteChange()
}, { deep: true })

const handleRouteChange = () => {
    fetchDocuments()
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

async function fetchDocuments(folderUuid: any = null) {
    state.error = {}
    state.isTableLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...(folderUuid && { folder_uuid: folderUuid }),
        }
        const response = await documentService.getDocuments(params)
        if (response) {
            state.documents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchDocuments()
}

function next() {
    currentTablePage++
    fetchDocuments()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchDocuments()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDocuments()
}

async function downloadFile(document: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = document?.uuid
        const response = await documentService.downloadFile(documentUuid)
        if (response) {
            saveAs(response, document?.name)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function triggerFileInput() {
    documentFile.value.click()
}

async function uploadFile(event: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid as any
        let params = new FormData()
        params.append('type', 'file')
        params.append('is_admin_access', 'false')
        params.append('file', event.target.files[0])
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
    await navigateTo(`/drive?folder_uuid=${document.uuid}`)
}

function editDocument(document: any) {
    state.selectedDocument = document
    state.modal.isEditDocumentOpen = true
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