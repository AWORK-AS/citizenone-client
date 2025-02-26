<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('drive.companyDocuments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('drive.companyDocuments') }}</template>

            <div class="space-y-5">
                <div class="mt-8 flex flex-col md:flex-row justify-between gap-3">
                    <div class="flex items-center justify-end md:justify-start gap-x-3">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="navigateToExternalLink('https://drive.google.com/drive/u/0/home')">
                            <Icon name="mdi:google-drive" class="h-4 w-4" aria-hidden="true" />
                            Google Drive
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="navigateToExternalLink('https://onedrive.live.com/')">
                            <Icon name="mdi:microsoft-onedrive" class="h-4 w-4" aria-hidden="true" />
                            OneDrive
                        </FormButton>
                    </div>
                    <div class="flex justify-end items-center gap-x-3">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isAddDirectoryOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('drive.createNewFolder') }}
                        </FormButton>
                        <LoadingSpinner :isActive="state.isPageLoading">
                            <FormButton buttonStyle="action" class="rounded-md" @click="triggerFileInput">
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.uploadFile') }}
                            </FormButton>
                            <input type="file" ref="documentFile" @change="uploadFile" class="hidden" />
                        </LoadingSpinner>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isViewFolderStructureOpen = true">
                            <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('folderStructure.folderStructure') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <!-- <div class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                            @click="$router.back()" v-if="router?.currentRoute?.value?.query?.folder_uuid">
                            <Icon name="ph:arrow-left" size="16" class="text-black" />
                            <span class="text-sm">{{ $t('back') }}</span>
                        </div> -->
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
                                                {{ $t('drive.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editDocument(document)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('drive.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmDocumentArchiving(document)">
                                                <Icon name="ph:archive-light" class="size-4" />
                                                {{ $t('drive.table.actions.archive') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                v-if="document?.type === 'file'"
                                                @click="moveFileConfirmation(document)">
                                                <Icon name="ph:arrows-out" class="size-4" />
                                                {{ $t('drive.table.actions.move') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                v-if="document?.type === 'folder'"
                                                @click="deleteDirectoryConfirmation(document)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('drive.table.actions.delete') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md" v-else
                                                @click="deleteFileConfirmation(document)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('drive.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.documents" @previous="previous" @next="next" />
                </div>
                <ModulesDocumentModalNewDirectory :isModalOpen="state.modal.isAddDirectoryOpen"
                    @close="state.modal.isAddDirectoryOpen = false" @refreshDocuments="fetchDocuments" />
                <ModulesDocumentModalEditDocument :isModalOpen="state.modal.isEditDocumentOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isEditDocumentOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesDocumentModalMoveFile :isModalOpen="state.modal.isMoveFileOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isMoveFileOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesDocumentFolderStructureModalFolderStructures
                    :isModalOpen="state.modal.isViewFolderStructureOpen"
                    @close="state.modal.isViewFolderStructureOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isArchiveDocumentOpen"
                    :message="$t('drive.confirmation.archiveConfirmation') + '?'"
                    @close="state.modal.isArchiveDocumentOpen = false" @confirm="archiveDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteDirectoryOpen"
                    :message="$t('drive.confirmation.deleteFolderConfirmation') + '?'"
                    @close="state.modal.isDeleteDirectoryOpen = false" @confirm="deleteDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteFileOpen"
                    :message="$t('drive.confirmation.deleteFileConfirmation') + '?'"
                    @close="state.modal.isDeleteFileOpen = false" @confirm="deleteDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen" :title="$t('drive.upgradeStorage')"
                    :message="state.error?.message + ' ' + $t('drive.confirmation.upgradeStorageConfirmation') + '?'"
                    @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { documentService } from '@/components/api/DocumentService'
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
        name: 'drive.companyDocuments',
        translate: true,
        href: '/drive',
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
        const response = await documentService.getFileFolders(params)
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