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
                    <div class="flex flex-wrap items-center justify-end gap-3">
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
                            <input type="file" ref="documentFile" @change="uploadFile" class="hidden" multiple />
                        </LoadingSpinner>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isViewFolderStructureOpen = true">
                            <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('folderStructure.folderStructure') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isCreateTemplateOpen = true">
                            <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('drive.createTemplate.createTemplate') }}
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
                                            <Tooltip :text="$t('drive.form.forAdministratorsOnly')"
                                                class="flex items-center" v-if="document?.is_admin_access">
                                                <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                            </Tooltip>
                                            <span class="truncate">{{ document?.name }}</span>
                                        </div>
                                        <span v-else class="flex items-center gap-x-1">
                                            <Icon name="ph:folder-notch-open-light" class="size-6" />
                                            <Tooltip :text="$t('drive.form.forAdministratorsOnly')"
                                                class="flex items-center" v-if="document?.is_admin_access">
                                                <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                            </Tooltip>
                                            <span class="truncate">{{ document?.name }}</span>
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <p class="truncate">
                                            {{ document?.user?.firstname + ' ' + document?.user?.lastname }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate">
                                            {{ formatDateTimeToReadable(document?.created_at) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate">
                                            {{ document?.updated_at && formatDateTimeToReadable(document?.updated_at) }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('drive.table.actions.view')"
                                                v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDirectory(document)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.move')"
                                                v-if="document?.type === 'file'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="moveFileConfirmation(document)">
                                                    <Icon name="ph:arrows-out" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.access')"
                                                v-if="isAdmin(userStore.getUser?.roles)">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDocumentAccess(document)">
                                                    <Icon name="ph:lock" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.archive')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="confirmDocumentArchiving(document)">
                                                    <Icon name="ph:archive-light" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.delete')"
                                                v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="deleteDirectoryConfirmation(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.delete')" v-else>
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="deleteFileConfirmation(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.documents" @previous="previous" @next="next" />
                </div>
                <ModulesUserDocumentModalNewDirectory :isModalOpen="state.modal.isAddDirectoryOpen"
                    @close="state.modal.isAddDirectoryOpen = false" @refreshDocuments="fetchDocuments" />
                <ModulesUserDocumentModalEditDocument :isModalOpen="state.modal.isEditDocumentOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isEditDocumentOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesUserDocumentAccessModalView :isModalOpen="state.modal.isViewAccessOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isViewAccessOpen = false" />
                <ModulesUserDocumentModalMoveFile :isModalOpen="state.modal.isMoveFileOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isMoveFileOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesUserDocumentFolderStructureModalFolderStructures
                    :isModalOpen="state.modal.isViewFolderStructureOpen"
                    @close="state.modal.isViewFolderStructureOpen = false" />

                <ModulesUserDocumentStatusTemplateModalNew :isModalOpen="state.modal.isCreateTemplateOpen"
                    @close="state.modal.isCreateTemplateOpen = false" />

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
import { documentService } from '@/components/api/user/DocumentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

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
]

const state = reactive({
    columnHeaders: [
        { name: 'drive.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'drive.table.owner', isTranslateName: true, },
        { name: 'drive.table.dateCreated', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'drive.table.lastModified', isTranslateName: true, sorter: true, key: 'updated_at' },
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
        isCreateTemplateOpen: false,
        isDeleteDirectoryOpen: false,
        isDeleteFileOpen: false,
        isEditDocumentOpen: false,
        isMoveFileOpen: false,
        isUpgradeStorageOpen: false,
        isUploadFileOpen: false,
        isViewAccessOpen: false,
        isViewFolderStructureOpen: false,
    },
    selectedDocument: {} as any,
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